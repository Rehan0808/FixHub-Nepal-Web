import { Router } from "express";
import {
  createUser,
  getUsers,
  getOneUser,
  updateOneUser,
  deleteOneUser,
  promoteUserToAdmin,
} from "../../controllers/admin/usermanagement";
import { authenticateUser, isAdmin } from "../../middlewares/authorizedUser";

const router = Router();

router.get("/", authenticateUser as any, isAdmin as any, getUsers);
router.get("/:id", authenticateUser as any, isAdmin as any, getOneUser);
router.post("/create", authenticateUser as any, isAdmin as any, createUser);
router.put("/:id", authenticateUser as any, isAdmin as any, updateOneUser);
router.delete("/:id", authenticateUser as any, isAdmin as any, deleteOneUser);
router.put("/:id/promote", authenticateUser as any, isAdmin as any, promoteUserToAdmin);

export default router;
