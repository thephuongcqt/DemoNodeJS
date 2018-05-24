module.exports = function(app, express){
    var apiRouter = express.Router();

    apiRouter.get("/Voice", function(req, res){
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        const response = new VoiceResponse();
        response.play('https://firebasestorage.googleapis.com/v0/b/chatfirebase-1e377.appspot.com/o/Welcome.mp3?alt=media&token=6914df70-85d3-4ea4-9ce0-edf4516ea353');
        res.end(response.toString());
    });

    return apiRouter;
};