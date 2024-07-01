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
const exprss = require('express');
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const bcrypt = require('bcrypt');
const user = exprss.Router();
const jwt = require('jsonwebtoken');
var STATUS_CODE;
(function (STATUS_CODE) {
    STATUS_CODE[STATUS_CODE["SUCCESS"] = 200] = "SUCCESS";
    STATUS_CODE[STATUS_CODE["ERROR"] = 500] = "ERROR";
    STATUS_CODE[STATUS_CODE["BADREQ"] = 400] = "BADREQ";
    STATUS_CODE[STATUS_CODE["NOTFOUND"] = 404] = "NOTFOUND";
    STATUS_CODE[STATUS_CODE["UNAUTHORIZED"] = 403] = "UNAUTHORIZED";
})(STATUS_CODE || (STATUS_CODE = {}));
user.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        // Check if the user already exists
        const isUserExist = yield prisma.user.findFirst({
            where: {
                username: req.body.username
            }
        });
        if (isUserExist) {
            return res.status(STATUS_CODE.BADREQ).json({
                msg: "User already exists. Please choose a different username.",
            });
        }
        // Hash the password before storing it
        const hashedPassword = yield bcrypt.hash(req.body.password, 10);
        // Create the user
        const newUser = yield prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword,
                name: req.body.name
            }
        });
        // Sign JWT token with user ID and username
        const token = jwt.sign(newUser.id, config_1.JWT_SECRET);
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "User created successfully",
            token: token,
            data: newUser
        });
    }
    catch (error) {
        console.error(error);
        return res.status(STATUS_CODE.ERROR).json({
            msg: 'Internal server error',
            error: error.message
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
user.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const user = yield prisma.user.findFirst({
            where: {
                username: req.body.username
            }
        });
        if (!user) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "User not found, please try agian!",
            });
        }
        // Compare password hash
        const isPasswordMatch = yield bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({
                msg: "Incorrect password, please try again",
            });
        }
        // Sign JWT token
        const token = jwt.sign(user.id, config_1.JWT_SECRET);
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Login successful",
            token: token,
            data: user
        });
    }
    catch (error) {
        console.error(error);
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error",
            error: error.message
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
module.exports = user;
