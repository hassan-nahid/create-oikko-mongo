import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();




router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
// Get current user profile
router.get("/me",
    checkAuth(...Object.values(Role)),
    UserController.getMe)

export const UserRoutes = router;