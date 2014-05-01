var Datastore  = require('nedb');
// var cardb      = new Datastore({ filename: 'car.db', autoload: true });
var _          = require('underscore');
var EventProxy = require('eventproxy');
var timeFormater = require('./timeFormat').getCurrentTime;
var carModule = require('./car');
// var Car = require('./defCar');
/*
 * GET users listing.
 */
// var localEP = new EventProxy();

var carTypeImageMap = [];
carTypeImageMap['01'] = 'normalCar.png';
carTypeImageMap['02'] = 'truck.png';


// initialCarPointDB 和 initiallatestCarPointList 有先后顺序
globalEP.once('initialCarPointDB', initialCarPointDB);
globalEP.once('initiallatestCarPointList', initiallatestCarPointList);
// initialCarPointDB();
globalEP.tail('insertCarPoint', function(_info){
	// _info = {carID: '', point: _}
	var dbInfo = _.findWhere(carPointDBList, {carID: _info.carID});
	if(dbInfo != null){
		dbInfo.db.insert(_info.point, function(err, _point){
			if(err){
				console.log('db error when insert point'.error);
			}
		});
	}
});

exports.index = function(req, res){
	var localEP = new EventProxy();
	localEP.once('getCarListOver', function(_cars){
		var cars = [];
		_.each(_cars, function(_car){
			_car.img = carTypeImageMap[_car.carType];
			_car.mainText = _car.carID;
			_car.subText = '配送中';
		});
		var content = JSON.stringify(_cars);
		res.render('mobileIndex', { _title: '车辆监控客户端', _carList: content});	
	});
	carModule.getCarListOfSpecifiedUser('admin', localEP);
	// carModule.getCarListOfSpecifiedUser(req.session.username, localEP);
	return;	
	// var cars = [];
	// cars.push({carID: 'xcar1', img: 'truck.png', mainText: 'xcar1', subText: '配送中', carType: '02'});
	// cars.push({carID: 'JP-0002', img: 'truck.png', mainText: 'JP-0002', subText: '配送中', carType: '02'});
	// cars.push({carID: 'car1', img: 'normalCar.png', mainText: 'car1', subText: '空车', carType: '01'});
	// var content = JSON.stringify(cars);
	// res.render('mobileIndex', { _title: '车辆监控客户端', _carList: content, carID: null});	
};
exports.uploadgps = function(req, res){
	var carID = req.params.carID;
	res.render('uploadgps', {carID: carID});
};
exports.carList = function(req, res){
	var cars = [];
	cars.push(new Car('car1', '小面包车', '最常用的一种车'));
	res.send(JSON.stringify(cars));
  // res.send("respond with a resource");
};
exports.postgps = function(req, res){
	// console.dir(req.accepted);
	// console.log(req.get('Content-Type'));
	// console.dir(req.body);
	var body = req.body;
	var id = body.carID;
	var Lat = body.Latitude;
	var Lng = body.Longitude;
    var sogouLongitude = body.sogouLongitude;
    var sogouLatitude = body.sogouLatitude;
	console.log("id: " + id + " lat: " + Lat + " lng: " + Lng + ' ' + sogouLatitude + ' ' + sogouLongitude);
	var point = _.findWhere(latestCarPointList, {carID: id});
	if(point == null){
		var latestPoint = {carID: id, lat: Lat, lng: Lng, timeStamp: timeFormater(), sogouLongitude: sogouLongitude, sogouLatitude: sogouLatitude};
		latestCarPointList.push(latestPoint);
		point = latestPoint;
	}else{
		point.lat = Lat;
		point.lng = Lng;
		point.sogouLatitude = sogouLatitude;
		point.sogouLongitude = sogouLongitude;
		point.timeStamp = timeFormater();
	}
	// latestCarPointList = _.reject(latestCarPointList, function(_point){
	// 	return _point.carID == latestPoint.carID;
	// });
	globalEP.emit('insertCarPoint', {carID: id, point: point});
	// ep.emit('insertCarPoint', {carID: id, point: latestPoint});
	res.send('ok');
	return;
};
exports.getgps = function(req, res){
	var carID = req.body.carID;
	console.log((carID + ' request gps').info);
	var latestPoint = _.findWhere(latestCarPointList, {carID: carID});
	if(latestPoint == null){
		res.send('');
	}else{
		res.send(JSON.stringify(latestPoint));
	}
	return;
};
exports.startReplayingView = function(req, res){
	res.render('startReplaying');
}
exports.setRoutePara = function(req, res){

	res.render('setRoutePara');
	return;
	// var id = 'xcar2';
	// localEP.once('getPointListFromDBOver', function(pointList){
	// 	pointList = _.sortBy(pointList, function(_point){return _point.timeStamp;});
	// 	console.dir(pointList);
	// 	if(_.size(pointList) > 0){
	// 		console.log('latestPoint =>');
	// 		console.dir(pointList[_.size(pointList) - 1]);
	// 		console.log('earliestPoint =>');
	// 		console.dir(pointList[0]);			
	// 	}
	// 	res.send('');
	// });
	// getPointListFromDB(id, {timeStamp: {$lte: '2014-04-09', $gte: '2014-04-08 21:00:43'}}, localEP);

};
exports.postRoutePara = function(req, res){
	var carID = req.body.carID;
	if(carID == null){
		console.log('carID is not in para'.error);
		res.send('error');
		return;
	}
	console.log(('car ' + carID + ' set route para').info);
	var dateStart = req.body.dateStart;
	var dateEnd = req.body.dateEnd;
	console.log('route time from ' + dateStart + ' => ' + dateEnd);
	req.session.carID = carID;
	req.session.dateStart = dateStart;
	req.session.dateEnd = dateEnd;
	res.send('ok');
}
exports.getRoutePointList = function(req, res){
	var id = req.session.carID;
	var dateStart = req.session.dateStart;
	var dateEnd = req.session.dateEnd;

	var localEP = new EventProxy();
	localEP.once('getPointListFromDBOver', function(pointList){
		pointList = _.sortBy(pointList, function(_point){return _point.timeStamp;});
		console.dir(pointList);
		if(_.size(pointList) > 0){
			console.log('latestPoint =>');
			console.dir(pointList[_.size(pointList) - 1]);
			console.log('earliestPoint =>');
			console.dir(pointList[0]);
			res.send(JSON.stringify(pointList));
		}else{
			res.send('');			
		}
	});
	localEP.fail(function(err){
		res.send('');			
	});
	getPointListFromDB(id, {timeStamp: {$lte: dateEnd, $gte: dateStart}}, localEP);	
};
function getPointListFromDB(_carID, _selector, _ep){
	var dbInfo = _.findWhere(carPointDBList, {carID: _carID});
	if(dbInfo != null){
		dbInfo.db.find(_selector, _ep.doneLater('getPointListFromDBOver'));
		// dbInfo.db.find(_selector, function(err, _points){
		// 	if(err){
		// 		_ep.emit('getPointListFromDBOver', []);
		// 	}
		// 	_ep.emit('getPointListFromDBOver', _points);
		// })
	}else{
		_ep.emitLater('getPointListFromDBOver', []);
	}
}
function initialCarPointDB(){
	var localEP = new EventProxy();

	localEP.once('getCarListOver', function(_cars){
		console.log('initialCarPointDB ...'.info);
		// console.dir(_cars);
		carPointDBList = _.map(_cars, function(_car){
			return {carID: _car.carID, db: new Datastore({ filename: 'carPointdb_'+ _car.carID +'.db', autoload: true })}
		});
		globalEP.emitLater('initiallatestCarPointList', carPointDBList);
	});
	carModule.getCarListOfSpecifiedUser('admin', localEP);
}
function initiallatestCarPointList(_carPointDBList){
	console.log('initiallatestCarPointList ...'.info);

	_.each(_carPointDBList, function(_dbInfo){
		// console.log(_dbInfo.carID);
		var localEP = new EventProxy();
		var date = new Date();
		date.setDate(date.getDate() - LATEST_POINT_INTERVAL);
		dateStart = date.format('yyyy-MM-dd hh:mm:ss'.info);
		// console.log(('latestPoint start from ' + dateStart).info);
		getPointListFromDB(_dbInfo.carID, {timeStamp: {$gte: dateStart}}, localEP);	
		localEP.once('getPointListFromDBOver', function(pointList){
			if(_.size(pointList) > 0){
				pointList = _.sortBy(pointList, function(_point){return _point.timeStamp;});
				// console.dir(pointList);
				if(_.size(pointList) > 0){
					// console.log('latestPoint =>'.info);
					var point = pointList[_.size(pointList) - 1];
					point.imageName = 'rt.png';
					// console.dir(point);
					latestCarPointList.push(point);
				}			
			}
		});
	});
}











