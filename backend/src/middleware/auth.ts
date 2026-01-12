import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return res.status(401).json({ error: "missing_token" });

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "change-me";
    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload?.role !== "admin") {
      return res.status(403).json({ error: "forbidden" });
    }

    (req as any).admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
