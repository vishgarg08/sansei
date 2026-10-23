import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/addressController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAddressSchema,
  addressIdParamSchema,
  updateAddressSchema,
} from "../validations/address.validation";

const router = Router();

// All address routes require authentication
router.use(requireAuth);

router.post("/", validate(createAddressSchema), createAddress);
router.get("/", getAddresses);
router.patch(
  "/:id",
  validate({ params: addressIdParamSchema, body: updateAddressSchema }),
  updateAddress
);
router.delete(
  "/:id",
  validate({ params: addressIdParamSchema }),
  deleteAddress
);

export default router;
