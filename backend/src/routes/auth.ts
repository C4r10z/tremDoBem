import { Router } from "express";
import { createAdminToken } from "../middleware/admin";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { user, pass } = req.body as { user?: string; pass?: string };

  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

  if (!user || !pass) {
    return res.status(400).json({ error: "missing_user_or_pass" });
  }

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = createAdminToken(user);
  return res.json({ token, user });
});
