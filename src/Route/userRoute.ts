const exprss = require('express')
import {  PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../config";
const bcrypt = require('bcrypt');
const user = exprss.Router();
const jwt = require('jsonwebtoken')

enum STATUS_CODE {
    SUCCESS = 200,
    ERROR = 500,
    BADREQ = 400,
    NOTFOUND = 404,
    UNAUTHORIZED = 403,
}

user.post('/signup', async (req: any, res: any) => {
    const prisma = new PrismaClient();
    try {
        // Check if the user already exists
        const isUserExist = await prisma.user.findFirst({
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
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword,
                name: req.body.name
            }
        });

        // Sign JWT token with user ID and username
        const token = jwt.sign(newUser.id, JWT_SECRET);

        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "User created successfully",
            token: token,
            data: newUser
        });
    } catch (error:any) {
        console.error(error);
        return res.status(STATUS_CODE.ERROR).json({
            msg: 'Internal server error',
            error: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
});

user.post('/signin', async (req: any, res: any) => {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst({
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
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({
                msg: "Incorrect password, please try again",
            });
        }

        // Sign JWT token
        const token = jwt.sign(user.id , JWT_SECRET);

        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Login successful",
            token: token,
            data: user
        });

    } catch (error:any) {
        console.error(error);
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error",
            error: error.message 
        });
    } finally {
        await prisma.$disconnect();
    }
});

module.exports = user;