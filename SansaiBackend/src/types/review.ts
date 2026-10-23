// ─── Input Types ─────────────────────────────────────────────────────────────

export type CreateReviewInput = {
  productId: number;
  rating: number;
  comment?: string;
  images?: string[]; // Array of image URLs, stored joined by comma in DB
};

export type UpdateReviewInput = {
  rating?: number;
  comment?: string;
  images?: string[];
};

// ─── Query Types ──────────────────────────────────────────────────────────────

export type ReviewListQuery = {
  page: number;
  limit: number;
  rating?: number;
  verified?: boolean;
};

export type AdminReviewListQuery = {
  page: number;
  limit: number;
  productId?: number;
  userId?: number;
  rating?: number;
  isApproved?: boolean;
  verified?: boolean;
};

// ─── Response Types ───────────────────────────────────────────────────────────

export type ReviewUserSummary = {
  id: number;
  name: string;
  profileImage: string | null;
};

export type ReviewProductSummary = {
  id: number;
  name: string;
  slug: string;
};

export type SerializedReview = {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  images: string[];
  verified: boolean;
  isApproved: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  user?: ReviewUserSummary;
  product?: ReviewProductSummary;
};

export type RatingDistribution = Record<number, number>;

export type ReviewListResult = {
  reviews: SerializedReview[];
  ratingDistribution: RatingDistribution;
  pagination: ReviewPagination;
};

export type ReviewPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
