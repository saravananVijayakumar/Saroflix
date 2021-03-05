const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myLogin',{ useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify:false }, function(err){
    if(!err){
        console.log("Database Connected");
    }
    else{
        console.log("Error in connecting Database ",+err);
    }
});


module.exports = {mongoose};
