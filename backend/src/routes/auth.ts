import { Router } from "express";
import jwt from "jsonwebtoken";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { user, pass } = req.body as { user?: string; pass?: string };

  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "123456";
  const JWT_SECRET = process.env.JWT_SECRET || "change-me";

  // Debug seguro (não imprime senha)
  // console.log("[auth] login attempt:", { user, hasPass: !!pass, envUser: ADMIN_USER });

  if (!user || !pass) {
    return res.status(400).json({ error: "missing_credentials" });
  }

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = jwt.sign({ role: "admin", user }, JWT_SECRET, { expiresIn: "7d" });

  return res.json({ token, user });
});
