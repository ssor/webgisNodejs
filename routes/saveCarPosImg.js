var http = require("http");
var fs = require("fs");
var _  = require('underscore');
var fs = require('fs');
var fs_extended = require("fs-extended");

var timeFormater = require('./timeFormat').getCurrentTime;

exports.downloadMap = downloadMap;

var downloadMapTaskList = [];

setInterval(doTask, 2000);
setInterval(deleteTempFile, 1000 * MIN_INTERVAL_FOR_REFRESH_CAR_POSITION_MAP * 2);


globalEP.tail('startDownloadMapImage', function(para){
    var d = new Date();
    if(((d.getTime() - para.point.downloadTimeStamp)/1000 > MIN_INTERVAL_FOR_REFRESH_CAR_POSITION_MAP) || para.point.downloadTimeStamp == null){
        addNewTaskToDownloadMapTaskList(para);
    }else{
        console.log((timeFormater() + '  ' + para.carID + ' has recently updated map !').data);
    }
});

//该车的位置图片下载完成后，替换原来的默认图片
globalEP.tail('downloadMapOk', function(para){
    var latestPoint = _.findWhere(latestCarPointList, {carID: para.carID});
    if(latestPoint != null){
        latestPoint.imageName = para.imageName;
        latestPoint.downloadTimeStamp = para.downloadTimeStamp;
    }
});

//当使用的缓存文件被删除的时候，需要将该车的位置图片改为默认
globalEP.tail('eventTempFileDeleted', function(_name){
    var latestPoint = _.findWhere(latestCarPointList, {imageName: _name});
    if(latestPoint != null){
        console.log((latestPoint.carID + ' has been reset!').data);
        latestPoint.imageName = "rt.png";
        latestPoint.downloadTimeStamp = null;
    }
})

function addNewTaskToDownloadMapTaskList(para){
    var taskExists = _.findWhere(downloadMapTaskList, {carID: para.carID});
    if(taskExists == null){
        console.log((timeFormater() + '  add a task : ' + para.carID).data);
        // console.dir(para);
        downloadMapTaskList.push(para);
    }
}
function doTask(){
    if(downloadMapTaskList.length > 0){
        var task = downloadMapTaskList.splice(0, 1)[0];
        console.log((timeFormater() + '  do a task : ' + task.carID).data);
        // console.dir(task);
        downloadMap(task.point, task.label, task.carID);
    }
}
function deleteTempFile(){
    var d = new Date();
    var timeStamp = (d.getTime() - 20 * 1000) + '';
    var path = "./public/Image/carPos";
    try{
        if(fs.existsSync(path)){
            var allFiles = fs.readdirSync(path);
            // console.dir(allFiles);
            _.each(allFiles, function(_pic){
                if(_pic != "rt.png"){
                    var date = parseFileNameToDate(_pic);
                    // console.log(_pic + ' date => ' + date);
                    if(date <= timeStamp){
                        globalEP.emit('eventTempFileDeleted', _pic);//缓存文件被删除，通知使用该文件的部分处理这个变化
                        fs_extended.deleteFileSync(path + "/" + _pic);
                        console.log((_pic + " has been deleted").data);
                    }                
                }
            });         
        }          
    }catch(err){
        console.log('error happends when delete temp files!!'.error);
    }
  
}
function parseFileNameToDate(_name){
    // xcar2_map_1398251640515.png
    var last_Index = _name.lastIndexOf("_");
    var lastDotIndex = _name.lastIndexOf(".");
    return _name.substring(last_Index + 1, lastDotIndex);
}
// http://api.go2map.com/engine/api/static/image+{'points':'116.36620044708252,39.96220463653672',height:'450','width':550,'zoom':9,'center':'116.36620044708252,39.96220463653672',labels:'搜狐网络大厦',pss:'S1756',city:'北京'}.png
function downloadMap(_point, _label, _carID){
    var d = new Date();
    var imageName = _carID + "_map_" + d.getTime() + ".png";
    var url = "http://api.go2map.com/engine/api/static/image+{'points':'";
    var point = _point.lng + "," + _point.lat; 
    url += point;  
    url += "',height:'341','width':512,'zoom':11,'center':'"+ point +"',labels:'" + _label + "',pss:'S1756'}.png";
    // console.log(url.info);
    http.get(url, function(res){
        var imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

        res.on("data", function(chunk){
            imgData+=chunk;
        });

        res.on("end", function(){
            fs.writeFile("./public/Image/carPos/" + imageName, imgData, "binary", function(err){
                if(err){
                    console.log("down fail".error);
                    return;
                }
                console.log((timeFormater() +  " down success for car: " + _carID).data);
                globalEP.emit('downloadMapOk', {imageName: imageName, carID: _carID, downloadTimeStamp: d.getTime()});
            });
        });
    });
}
