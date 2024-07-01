import { PrismaClient } from "@prisma/client";
const exp = require('express')
const stock = exp.Router();
import { authMiddleware } from "../Middleware/index";

enum STATUS_CODE {
    SUCCESS = 200,
    ERROR = 500,
    BADREQ = 400,
    NOTFOUND = 404,
    NOTPERMISSIOON = 403,
}

stock.get('/get-allentry', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient()

    try {
        const response = await prisma.trade.findMany({
            where: {
                userId: req.userId
            },
        });

        if (response.length == 0) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            })
        }
        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "successfully",
            data: response,
        })

    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error, Please try again!",
            error: error
        })
    } finally {
        await prisma.$disconnect()
    }
})

stock.post('/add-stockEntry', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient();

    try {
        const response = await prisma.trade.create({
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
        })

        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "New entry created successfully",
            data: response
        })

    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        })
    } finally {
        await prisma.$disconnect();
    }
})



stock.put('/update-stockEntry', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient();

    try {
        const isEntryExist = await prisma.trade.findUnique({
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

        const updateData: any = {};
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'id') {
                updateData[key] = req.body[key];
            }
        });

        const response = await prisma.trade.update({
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
    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error",
            error: error
        });
    } finally {
        await prisma.$disconnect();
    }
});


stock.delete('/delete-stockEntry', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient()

    try {
        const isEntryexist = await prisma.trade.findUnique({
            where: {
                id: req.body.id,
                userId: req.get('userId')
            }
        })

        if (isEntryexist == null) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            })
        }
        const response = await prisma.trade.delete({
            where: {
                id: req.body.id,
                userId: req.get('userId')
            }
        })

        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Entry deleted successfully",
            data: response
        })


    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        })
    } finally {
        await prisma.$disconnect();
    }
})

stock.get('/find-stockEntry/:id', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient()

    try {
        const isEntryexist = await prisma.trade.findFirst({
            where: {
                id: Number(req.params.id),
                userId: req.userId
            }
        })
        if (isEntryexist == null) {
            return res.status(STATUS_CODE.NOTFOUND).json({
                msg: "Nothing found, Please try again!"
            })
        }

        return res.status(STATUS_CODE.SUCCESS).json({
            msg: "Entry find successfully",
            data: isEntryexist
        })
    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: `Internal server error`,
            error: error
        })
    } finally {
        await prisma.$disconnect();
    }
})


stock.get('/statistics', authMiddleware, async (req: any, res: any) => {
    const prisma = new PrismaClient();

    try {
        const trades = await prisma.trade.findMany({
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
            } else if (trade.winlossdraw === "LOSS") {
                stats[region].totalLoss += trade.pnl;
                stats[region].lossCount++;
                if (trade.pnl < stats[region].minLoss) {
                    stats[region].minLoss = trade.pnl;
                }
            }
            stats[region].brokerage += trade.brokerage;
        });

        const calculateStats = (regionStats: any) => {
            const winPercentage = ((regionStats.winCount / (regionStats.winCount + regionStats.lossCount)) * 100).toFixed(0);
            const lossPercentage = ((regionStats.lossCount / (regionStats.winCount + regionStats.lossCount)) * 100).toFixed(0);
            const totalPnl = (regionStats.totalProfit - regionStats.totalLoss) - regionStats.brokerage;
            const winRatio = `${regionStats.winCount}/${regionStats.totalTrades}`;

            return {
                totalPnl,
                winPercentage,
                lossPercentage,
                winRatio,
                ...regionStats,
                minLoss: regionStats.minLoss === Infinity ? 0 : regionStats.minLoss,
            };
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
    } catch (error) {
        return res.status(STATUS_CODE.ERROR).json({
            msg: "Internal server error, Please try again!",
            error: error,
        });
    } finally {
        await prisma.$disconnect();
    }
});


module.exports = stock;