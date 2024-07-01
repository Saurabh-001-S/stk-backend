import { JWT_SECRET } from "../config";
const jwt = require('jsonwebtoken');

export async function authMiddleware(req: any, res: any, next: any) {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({ msg: "Authorization header is missing" });
        }

        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(401).json({ msg: "Invalid authorization format. Format should be 'Bearer token'" });
        }

        const token = tokenParts[1];
        const decodedToken = await jwt.verify(token, JWT_SECRET);
        
        if (!decodedToken) {
            return res.status(401).json({ msg: "Invalid token. Please log in again." });
        }

        req.userId = Number(decodedToken); // Set userId in request for further middleware or route handlers
        await next();
    } catch (error) {
        console.error("Authentication error:", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ msg: "Token has expired. Please log in again." });
        }
        return res.status(401).json({ msg: "Authentication failed" });
    }
}
