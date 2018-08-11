var utils = require("../Utils/Utils");
var Const = require("../Utils/Const");
var logger = require("../Utils/Logger");
var path = require('path');
var fs = require('fs');

module.exports = function (app, express) {
    apiRouter = express.Router();

    apiRouter.use("/Files", function (req, res) {
        var filePath = Const.FilePath + req.url;
        var extension = path.extname(filePath);
        var contentType = 'audio/mpeg';

        switch (extension) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
            case ".mp3":
                contentType = 'audio/mpeg';
                break;
            case ".xml":
                contentType = 'text/xml';
                break;
            default:
        }

        fs.readFile(filePath, function (error, content) {
            if (error) {
                logger.log(error);
                res.writeHead(404);
                res.end('Sorry, File not found');
                res.end();
                if (error.code == 'ENOENT') {
                    logger.log(new Error("File not found"));
                }
                else {
                    logger.log(new Error("Read file error"));
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    apiRouter.use("", function (req, res) {
        res.json({
            "success": false,
            "value": null,
            "error": "Someting went wrong!!! this is a default route"
        });
    });

    return apiRouter;
}