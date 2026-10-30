import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as US from "./user.service.js";

const router = Router();
router.post("/signup", US.signup);
router.post("/login", US.login);
router.patch("/", auth, US.updateUser);
router.delete("/", auth, US.deleteUser);
router.get("/", auth, US.getUser);

export default router;
