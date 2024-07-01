"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const config_1 = require("../config");
const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const decodedToken = yield jwt.verify(token, config_1.JWT_SECRET);
            if (!decodedToken) {
                return res.status(401).json({ msg: "Invalid token. Please log in again." });
            }
            req.userId = Number(decodedToken); // Set userId in request for further middleware or route handlers
            yield next();
        }
        catch (error) {
            console.error("Authentication error:", error);
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ msg: "Token has expired. Please log in again." });
            }
            return res.status(401).json({ msg: "Authentication failed" });
        }
    });
}
exports.authMiddleware = authMiddleware;
