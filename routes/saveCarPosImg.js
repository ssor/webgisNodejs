var http = require("http");
var fs = require("fs");
var _  = require('underscore');

exports.downloadMap = downloadMap;

globalEP.tail('startDownloadMapImage', function(para){
    var d = new Date();
    if(((d.getTime() - para.point.downloadTimeStamp)/1000 > MIN_INTERVAL_FOR_REFRESH_CAR_POSITION_MAP) || para.point.downloadTimeStamp == null){
        downloadMap(para.point, para.label, para.carID);
    }else{
        console.log((para.carID + ' has recently updated map !').data);
    }
});
globalEP.tail('downloadMapOk', function(para){
    var latestPoint = _.findWhere(latestCarPointList, {carID: para.carID});
    if(latestPoint != null){
        latestPoint.imageName = para.imageName;
        latestPoint.downloadTimeStamp = para.downloadTimeStamp;
    }
});
// http://api.go2map.com/engine/api/static/image+{'points':'116.36620044708252,39.96220463653672',height:'450','width':550,'zoom':9,'center':'116.36620044708252,39.96220463653672',labels:'搜狐网络大厦',pss:'S1756',city:'北京'}.png
function downloadMap(_point, _label, _carID){
    var d = new Date();
    var imageName = _carID + "_map_" + d.getTime() + ".png";
    var url = "http://api.go2map.com/engine/api/static/image+{'points':'";
    var point = _point.lng + "," + _point.lat; 
    url += point;  
    url += "',height:'512','width':512,'zoom':11,'center':'"+ point +"',labels:'" + _label + "',pss:'S1756'}.png";
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
                console.log("down success".data);
                globalEP.emit('downloadMapOk', {imageName: imageName, carID: _carID, downloadTimeStamp: d.getTime()});
            });
        });
    });
}
