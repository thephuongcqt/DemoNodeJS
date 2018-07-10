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
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetDiseaseListFailure));
        }
    });
    // update disease
    apiRouter.post("/update", async function (req, res) {
        var diseasesName = req.body.diseasesName;
        var isActive = req.body.isActive;
        try {
            var resultInfo = await diseaseDao.getDiseaseInfo(req.body.diseasesID);
            if (!resultInfo) {
                res.json(utils.responseFailure("Disease is not exist"));
            } else {
                if (isNaN(isActive)) {
                    isActive = undefined;
                }
                var resultUpdate = await diseaseDao.updateDisease(req.body.diseasesID, diseasesName, isActive);
                res.json(utils.responseSuccess(resultUpdate));
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    // create disease
    apiRouter.post("/create", async function (req, res) {
        try {
            var diseasesName = req.body.diseasesName;
            if (!diseasesName) {
                res.json(utils.responseFailure("Vui lòng nhập tên bệnh"));
                return;
            }
            var json = { "diseasesName": diseasesName };
            var resultInfo = await baseDAO.findByProperties(db.DiseasesName, json);
            if (resultInfo.length > 0) {
                if (resultInfo[0].isActive == Const.DEACTIVATION) {
                    var changeActive = Const.ACTIVATION;
                    await diseaseDao.updateDisease(resultInfo[0].diseasesID, undefined, changeActive);
                    res.json(utils.responseSuccess("Tạo mới bệnh thành công"));
                    return;
                }
                res.json(utils.responseFailure("Bệnh đã tồn tại trong hệ thống"));
                return;
            }
            await diseaseDao.createDisease(diseasesName);
            res.json(utils.responseSuccess("Tạo mới bệnh thành công"));
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    return apiRouter;
};