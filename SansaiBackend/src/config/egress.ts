import http from "http";
import https from "https";
import { URL } from "url";
import { env } from "./env";
import { logger } from "./logger";

// A list of allowed outbound hostnames
const defaultAllowedDomains = [
  "oauth2.googleapis.com",
  "www.googleapis.com",
  "accounts.google.com",
  "api.cloudinary.com",
  "res.cloudinary.com",
  "api.razorpay.com",
];

const envAllowed = env.allowedOutboundDomains || [];
const allowedDomains = new Set(
  [...defaultAllowedDomains, ...envAllowed].map((d) => d.toLowerCase().trim())
);

export const isDomainAllowed = (host: string): boolean => {
  const normalizedHost = host.toLowerCase().trim();

  // Allow localhost/loopback for local services
  if (
    normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost === "::1"
  ) {
    return true;
  }

  // Exact match
  if (allowedDomains.has(normalizedHost)) {
    return true;
  }

  // Subdomain match (e.g. *.googleapis.com or *.cloudinary.com)
  for (const allowed of allowedDomains) {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.substring(1); // e.g. ".googleapis.com"
      if (normalizedHost.endsWith(suffix) || normalizedHost === allowed.substring(2)) {
        return true;
      }
    }
  }

  return false;
};

// Helper to extract hostname from http/https request arguments
function getHostname(options: any, arg2?: any): string | null {
  if (typeof options === "string") {
    try {
      return new URL(options).hostname;
    } catch {
      return null;
    }
  }
  if (options instanceof URL) {
    return options.hostname;
  }
  if (options && typeof options === "object") {
    // If first argument is string/URL and second is options
    if (arg2 && (typeof options === "string" || options instanceof URL)) {
      try {
        return new URL(options.toString()).hostname;
      } catch {
        return null;
      }
    }
    // options object
    if (options.hostname) return options.hostname;
    if (options.host) {
      return options.host.split(":")[0];
    }
    // Node.js http request defaults to localhost if host/hostname is omitted
    return "localhost";
  }
  return null;
}

// 1. Patch http.request
const originalHttpRequest = http.request;
http.request = function (options: any, ...args: any[]): http.ClientRequest {
  const host = getHostname(options, args[0]);
  if (host && !isDomainAllowed(host)) {
    logger.error({ host }, "Outbound HTTP request blocked to unknown URL");
    throw new Error(`Outbound HTTP request to ${host} is blocked for security reasons.`);
  }
  return (originalHttpRequest as any).apply(this, [options, ...args]);
};

// 2. Patch http.get
const originalHttpGet = http.get;
http.get = function (options: any, ...args: any[]): http.ClientRequest {
  const host = getHostname(options, args[0]);
  if (host && !isDomainAllowed(host)) {
    logger.error({ host }, "Outbound HTTP GET request blocked to unknown URL");
    throw new Error(`Outbound HTTP request to ${host} is blocked for security reasons.`);
  }
  return (originalHttpGet as any).apply(this, [options, ...args]);
};

// 3. Patch https.request
const originalHttpsRequest = https.request;
https.request = function (options: any, ...args: any[]): http.ClientRequest {
  const host = getHostname(options, args[0]);
  if (host && !isDomainAllowed(host)) {
    logger.error({ host }, "Outbound HTTPS request blocked to unknown URL");
    throw new Error(`Outbound HTTPS request to ${host} is blocked for security reasons.`);
  }
  return (originalHttpsRequest as any).apply(this, [options, ...args]);
};

// 4. Patch https.get
const originalHttpsGet = https.get;
https.get = function (options: any, ...args: any[]): http.ClientRequest {
  const host = getHostname(options, args[0]);
  if (host && !isDomainAllowed(host)) {
    logger.error({ host }, "Outbound HTTPS GET request blocked to unknown URL");
    throw new Error(`Outbound HTTPS request to ${host} is blocked for security reasons.`);
  }
  return (originalHttpsGet as any).apply(this, [options, ...args]);
};

// 5. Patch global fetch (Node.js 18+)
const originalFetch = globalThis.fetch;
if (originalFetch) {
  globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlString = "";
    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.href;
    } else if (input && typeof input === "object" && "url" in input) {
      urlString = input.url;
    }

    try {
      const url = new URL(urlString);
      if (!isDomainAllowed(url.hostname)) {
        logger.error({ host: url.hostname, url: urlString }, "Outbound fetch request blocked to unknown URL");
        return Promise.reject(new Error(`Outbound request to ${url.hostname} is blocked for security reasons.`));
      }
    } catch (err) {
      logger.error({ err, url: urlString }, "Error parsing fetch URL, request blocked");
      return Promise.reject(new Error("Outbound request blocked due to invalid or malformed URL."));
    }

    return originalFetch.call(this, input, init);
  };
}

logger.info("🛡️ Outbound egress filtering activated");
