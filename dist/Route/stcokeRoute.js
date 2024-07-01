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
const client_1 = require("@prisma/client");
const exp = require('express');
const stock = exp.Router();
const index_1 = require("../Middleware/index");
var STATUS_CODE;
(function (STATUS_CODE) {
    STATUS_CODE[STATUS_CODE["SUCCESS"] = 200] = "SUCCESS";
    STATUS_CODE[STATUS_CODE["ERROR"] = 500] = "ERROR";
    STATUS_CODE[STATUS_CODE["BADREQ"] = 400] = "BADREQ";
    STATUS_CODE[STATUS_CODE["NOTFOUND"] = 404] = "NOTFOUND";
    STATUS_CODE[STATUS_CODE["NOTPERMISSIOON"] = 403] = "NOTPERMISSIOON";
})(STATUS_CODE || (STATUS_CODE = {}));
stock.get('/get-allentry', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const response = yield prisma.trade.findMany({
            where: {
                userId: req.userId
            },
        });
        if (response.length == 0) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            });
        }
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "successfully",
            data: response,
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error, Please try again!",
            error: error
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
stock.post('/add-stockEntry', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const response = yield prisma.trade.create({
            data: {
                contract: req.body.contract,
                entryTimeFrame: req.body.entryTimeFrame,
                entryReason: req.body.entryReason,
                exitReason: req.body.exitReason,
                description: req.body.description,
                pnl: req.body.pnl,
                winlossdraw: req.body.winlossdraw,
                image: req.body.image,
                region: req.body.region,
                userId: req.userId,
                brokerage: req.body.brokerage
            }
        });
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "New entry created successfully",
            data: response
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
stock.put('/update-stockEntry', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const isEntryExist = yield prisma.trade.findUnique({
            where: {
                id: req.body.id,
                userId: req.userId
            }
        });
        if (!isEntryExist) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            });
        }
        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'id') {
                updateData[key] = req.body[key];
            }
        });
        const response = yield prisma.trade.update({
            data: updateData,
            where: {
                id: req.body.id,
                userId: req.userId
            }
        });
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Entry updated successfully",
            data: response
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error",
            error: error
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
stock.delete('/delete-stockEntry', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const isEntryexist = yield prisma.trade.findUnique({
            where: {
                id: req.body.id,
                userId: req.get('userId')
            }
        });
        if (isEntryexist == null) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            });
        }
        const response = yield prisma.trade.delete({
            where: {
                id: req.body.id,
                userId: req.get('userId')
            }
        });
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Entry deleted successfully",
            data: response
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
stock.get('/find-stockEntry/:id', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const isEntryexist = yield prisma.trade.findFirst({
            where: {
                id: Number(req.params.id),
                userId: req.userId
            }
        });
        if (isEntryexist == null) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            });
        }
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Entry find successfully",
            data: isEntryexist
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
stock.get('/statistics', index_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const trades = yield prisma.trade.findMany({
            where: {
                userId: req.userId,
            },
        });
        if (trades.length === 0) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!",
            });
        }
        let stats = {
            IND: {
                totalProfit: 0,
                totalLoss: 0,
                winCount: 0,
                lossCount: 0,
                maxProfit: 0,
                minLoss: Infinity,
                brokerage: 0,
                totalTrades: 0,
            },
            FRX: {
                totalProfit: 0,
                totalLoss: 0,
                winCount: 0,
                lossCount: 0,
                maxProfit: 0,
                minLoss: Infinity,
                brokerage: 0,
                totalTrades: 0,
            },
        };
        trades.forEach(trade => {
            const region = trade.region === "FOREX" ? "FRX" : "IND";
            stats[region].totalTrades++;
            if (trade.winlossdraw === "WIN") {
                stats[region].totalProfit += trade.pnl;
                stats[region].winCount++;
                if (trade.pnl > stats[region].maxProfit) {
                    stats[region].maxProfit = trade.pnl;
                }
            }
            else if (trade.winlossdraw === "LOSS") {
                stats[region].totalLoss += trade.pnl;
                stats[region].lossCount++;
                if (trade.pnl < stats[region].minLoss) {
                    stats[region].minLoss = trade.pnl;
                }
            }
            stats[region].brokerage += trade.brokerage;
        });
        const calculateStats = (regionStats) => {
            const winPercentage = ((regionStats.winCount / (regionStats.winCount + regionStats.lossCount)) * 100).toFixed(0);
            const lossPercentage = ((regionStats.lossCount / (regionStats.winCount + regionStats.lossCount)) * 100).toFixed(0);
            const totalPnl = (regionStats.totalProfit - regionStats.totalLoss) - regionStats.brokerage;
            const winRatio = `${regionStats.winCount}/${regionStats.totalTrades}`;
            return Object.assign(Object.assign({ totalPnl,
                winPercentage,
                lossPercentage,
                winRatio }, regionStats), { minLoss: regionStats.minLoss === Infinity ? 0 : regionStats.minLoss });
        };
        const IND_stats = calculateStats(stats.IND);
        const FRX_stats = calculateStats(stats.FRX);
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Successfully retrieved statistics",
            data: {
                IND: IND_stats,
                FRX: FRX_stats,
            },
        });
    }
    catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error, Please try again!",
            error: error,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
module.exports = stock;
