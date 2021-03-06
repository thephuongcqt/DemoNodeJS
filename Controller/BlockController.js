var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var blockDAO = require("../DataAccess/BlockDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    // get block phone number
    apiRouter.get("/getBlock", async function (req, res) {
        try {
            var results = await getBlock(req.query.clinicUsername)
            res.json(utils.responseSuccess(results));
            logger.successLog("getBlock");
        }
        catch (err) {
            res.json(utils.responseFailure(err));
            logger.failLog("getBlock", error);
            logger.log(err);
        }
    });
    //block phone number
    apiRouter.post("/blockNumber", async function (req, res) {
        var clinicUsername = req.body.clinicUsername;
        var phoneNumber = req.body.phoneNumber;
        var isBlock = req.body.isBlock;
        try {
            var blockNumber;
            if (isNaN(isBlock)) {
                res.json(utils.responseFailure("isBlock must be integer"));
            } else {
                var resultBlock = await blockDAO.getBlockNumber(clinicUsername, phoneNumber);
                if (resultBlock.length == 0) {
                    blockNumber = await blockDAO.addBlock(clinicUsername, phoneNumber);
                } else {
                    blockNumber = await blockDAO.updateBlock(clinicUsername, phoneNumber, isBlock);
                }
                res.json(utils.responseSuccess(blockNumber));
                logger.successLog("blockNumber");
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err));
            logger.failLog("blockNumber", err);
            logger.log(err);
        }
    });

    return apiRouter;
};
function getBlock(clinicUsername) {
    return new Promise((resolve, reject) => {
        blockDAO.getAllBlock(clinicUsername)
            .then(function (results) {
                resolve(results);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}