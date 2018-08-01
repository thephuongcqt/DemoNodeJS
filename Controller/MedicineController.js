var db = require("../DataAccess/DBUtils");
var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var baseDAO = require("../DataAccess/BaseDAO");
var logger = require("../Utils/Logger");
var medicineDao = require("../DataAccess/MedicineDAO");

module.exports = function (app, express) {
    apiRouter = express.Router();

    // get medicine
    apiRouter.get("/getAllMedicines", async function (req, res) {
        try {
            var medicines;
            var listMedicine = [];
            medicines = await medicineDao.getAllMedicine();
            for (var i in medicines) {
                var medicine = medicines[i];
                if (medicine.isActive == Const.ACTIVATION) {
                    listMedicine.push(medicine);
                }
            }
            res.json(utils.responseSuccess(listMedicine));
            logger.successLog("getAllMedicines");
        } catch (error) {
            logger.log(error);
            res.json(utils.responseFailure(Const.GetMedicineListFailure));
        }
    });
    // update medicine
    apiRouter.post("/update", async function (req, res) {
        var medicineName = req.body.medicineName;
        var unitName = req.body.unitName;
        var isActive = req.body.isActive;
        try {
            var resultInfo = await medicineDao.getMedicineInfo(req.body.medicineID);
            if (!resultInfo) {
                res.json(utils.responseFailure("Medicine is not exist"));
            } else {
                if (isNaN(isActive)) {
                    isActive = undefined;
                }
                var resultUpdate = await medicineDao.updateMedicine(req.body.medicineID, medicineName, unitName, isActive);
                res.json(utils.responseSuccess(resultUpdate));
                logger.successLog("updateMedicine");
            }
        }
        catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    // create medicine
    apiRouter.post("/create", async function (req, res) {
        try {
            var medicineName = req.body.medicineName;
            var unitName = req.body.unitName;
            if (!medicineName) {
                res.json(utils.responseFailure("Vui lòng nhập tên thuốc"));
                return;
            }
            if (!unitName) {
                res.json(utils.responseFailure("Vui lòng nhập đơn vị thuốc"));
                return;
            }
            var json = { "medicineName": medicineName };
            var resultInfo = await baseDAO.findByProperties(db.Medicine, json);
            if (resultInfo.length > 0) {
                if (resultInfo[0].isActive == Const.DEACTIVATION) {
                    var changeActive = Const.ACTIVATION;
                    await medicineDao.updateMedicine(resultInfo[0].medicineID, undefined, undefined, changeActive);
                    res.json(utils.responseSuccess("Tạo mới thuốc thành công"));
                    logger.successLog("createMedicine");
                    return;
                }
                res.json(utils.responseFailure("Thuốc đã tồn tại trong hệ thống"));
                return;
            }
            await medicineDao.createMedicine(medicineName, unitName);
            res.json(utils.responseSuccess("Tạo mới thuốc thành công"));
            logger.successLog("createMedicine");
        } catch (err) {
            res.json(utils.responseFailure(err.message));
            logger.log(err);
        }
    });
    return apiRouter;
};