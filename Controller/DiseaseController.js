var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");
var diseaseDao = require("../DataAccess/DiseaseDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    // get disease
    apiRouter.get("/getAllDiseases", async function (req, res) {
        try {
            var diseases;
            var listDisease = [];
            diseases = await diseaseDao.getAllDisease();
            for (var i in diseases) {
                var disease = diseases[i];
                if (disease.isActive == Const.ACTIVATION) {
                    listDisease.push(disease);
                }
            }
            res.json(utils.responseSuccess(listDisease));
            logger.successLog("getAllDiseases");
        } catch (error) {
            logger.log(error);
            logger.failLog("getAllDiseases", error);
            res.json(utils.responseFailure(Const.GetDiseaseListFailure));
        }
    });
    // update disease
    apiRouter.post("/update", async function (req, res) {
        var diseaseName = req.body.diseaseName;
        var isActive = req.body.isActive;
        try {
            var resultInfo = await diseaseDao.getDiseaseInfo(req.body.diseaseID);
            if (!resultInfo) {
                res.json(utils.responseFailure("Disease is not exist"));
                logger.failLog("updateDisease", new Error("Disease is not exist"));
                return;
            } else {
                if (isNaN(isActive)) {
                    isActive = undefined;
                }
                var resultUpdate = await diseaseDao.updateDisease(req.body.diseaseID, diseaseName, isActive);
                res.json(utils.responseSuccess(resultUpdate));
                logger.successLog("updateDisease");
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.failLog("updateDisease", err);
            logger.log(err);
        }
    });
    // create disease
    apiRouter.post("/create", async function (req, res) {
        try {
            var diseaseName = req.body.diseaseName;
            if (!diseaseName) {
                res.json(utils.responseFailure("Vui lòng nhập tên bệnh"));
                logger.failLog("createDisease", new Error("Please enter disease name"));
                return;
            }
            var json = { "diseaseName": diseaseName };
            var resultInfo = await baseDAO.findByProperties(db.Disease, json);
            if (resultInfo.length > 0) {
                if (resultInfo[0].isActive == Const.DEACTIVATION) {
                    var changeActive = Const.ACTIVATION;
                    await diseaseDao.updateDisease(resultInfo[0].diseaseID, undefined, changeActive);
                    res.json(utils.responseSuccess("Tạo mới bệnh thành công"));
                    logger.successLog("createDisease");
                    return;
                }
                res.json(utils.responseFailure("Bệnh đã tồn tại trong hệ thống"));
                logger.failLog("createDisease", new Error("Disease is exist"));
                return;
            }
            await diseaseDao.createDisease(diseaseName);
            res.json(utils.responseSuccess("Tạo mới bệnh thành công"));
            logger.successLog("createDisease");
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.failLog("createDisease", err);
            logger.log(err);
        }
    });
    return apiRouter;
};