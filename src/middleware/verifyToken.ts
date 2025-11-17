import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";

dotenv.config();

const SECRET =process.env.SECRET;

export interface AuthRequest extends Request {
    userId?: string |jwt.JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction):void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
        return;
    };

    jwt.verify(token, SECRET as string, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: "Token no válido." });
            return;
        }
                req.userId = decoded;

        next();
    });
}