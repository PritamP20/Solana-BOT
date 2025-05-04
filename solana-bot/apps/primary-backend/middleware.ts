import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY ?? `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvu9uJbdnhF2+K3W3pA6W
DT4w/1lCf//IJPCgbWFxqWbbBU+SWDpEkNvSE5qhL3IGgcnBQXT2Bx5Dp9wAFCMp
CkKXeg9QH2peFN+t3RC0U7EbE3wjGJ5F8CYkTnYOEEV5dj0/8EUM1hTSEU9V94cb
mjfkKwdmG4QNbV9mI2SispTQk4y6YPNwjUDlVNu7ApndDkv1oBIvppb2DsiCnieU
R0XXSOHUfom3pxBKw8C4rjU9sPEscXmtxsXcDAjbqZmdsbfKkYO+admpDwAY3GPO
s//ahqHQgzjeb4sE/1F4E5Uj6SvOYGyLMJ2etbMIHWubtDxivU4EkeCyR/K52KTc
swIDAQAB
-----END PUBLIC KEY-----`;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // Bearer token
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = jwt.verify(token, JWT_PUBLIC_KEY!, {
    algorithms: ["RS256"],
  });

  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const userId = (decoded as any).sub;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.userId = userId;
  next();
}