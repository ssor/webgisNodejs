var _          = require('underscore');
var EventProxy = require('eventproxy');
var Car = require('./defCar');

// var localEP = new EventProxy();

exports.index = function(req, res){
	res.render('carIndex', {_carTypes: JSON.stringify(getCarTypeList())});
};

exports.deleteCar = function(req, res){
	var carID = req.body.carID;
	console.log('deleteCarID => ' + carID);
	cardb.remove({carID: carID}, function(err, numRemoved){
		if(err){
			console.log(('some error happended while remove car ' + carID).error);
			res.send('error');
			return;
		}
		if(numRemoved > 0){
			console.log(('remove car ' + carID + ' ok').info);
			res.send('ok');
			return;
		}
	});
};
exports.addCar = function(req, res){
	if(req.session.username == null){
		res.send('error'); return;
	}
	var carID = req.body.carID;
	var carType = req.body.carType;
	var note = req.body.note;
	console.log(('addCarID => ' + carID + '  ' + carType + '  ' + note).info);
	cardb.findOne({carID: carID}, function(err, car){
		if(err){
			console.log(('error while find car ' + carID + ' in db').error);
			res.send('error');
			return;
		}
		if(car != null){
			console.log((carID + ' already in db').info);
			res.send('duplicated');
			return;
		}
		cardb.insert(new Car(carID, carType, note, req.session.username), function(err, _newCar){
			if(err){
				console.log(('error while insert new car to db').error);
				res.send('error');
				return;
			}
			res.send('ok');
			console.log(('add new car ' + carID + ' ok').info);
			return;
		});
	});
};
exports.carList = function(req, res){
	if(req.session.username == null) {
		console.log('no login yet'.error);
		res.send('');return;
	}
	var localEP = new EventProxy();
	getCarListOfSpecifiedUser(req.session.username, localEP);
	getCarBagageMap(localEP);

	localEP.all('getCarListOver', 'getCarBagageMapOver', function(_carlist, _mapList){
		var carsInfoReturn = _.map(_carlist, function(_car){
			var bagageList = _.findWhere(_mapList, {carID: _car.carID});
			var bagageBinded = (_.size(bagageList) > 0);
			return {carID: _car.carID, carType: _car.carType, note: _car.note, timeStamp: _car.timeStamp, bagageBinded: bagageBinded};
		});
		console.dir(carsInfoReturn);
		res.send(JSON.stringify(carsInfoReturn));
	})
	localEP.fail(function(err){
		res.send('');
	});
	// var selector = {owner: req.session.username};
	// if(req.session.username == 'admin'){
	// 	selector = {};
	// }
	// cardb.find(selector, function(err, _cars){
	// 	if(err){
	// 		res.send('');			
	// 	}
	// 	var cars = _.map(_cars, function(_car){
	// 		return {carID: _car.carID, carType: _car.carType, note: _car.note, timeStamp: _car.timeStamp};
	// 	});
	// 	res.send(JSON.stringify(cars));
	// });
	return;
};
exports.carTypeList = function(req, res){
	res.send(JSON.stringify(getCarTypeList()));
};
exports.getCarTypeList = getCarTypeList;
exports.getCarListOfSpecifiedUser = getCarListOfSpecifiedUser;
//****************************************************
function getCarBagageMap(_ep){
	bagagedb.find({}, _ep.doneLater('getCarBagageMapOver'));
};
function getCarListOfSpecifiedUser(_user, _ep){
	var selector = {owner: _user};
	if(_user == 'admin'){
		selector = {};
	}
	cardb.find(selector, _ep.doneLater('getCarListOver'));
	// cardb.find(selector, function(err, _cars){
	// 	if(err){
	// 		_ep.emitLater('getCarListOver', []);			
	// 	}
	// 	var cars = _.map(_cars, function(_car){
	// 		return {carID: _car.carID, carType: _car.carType, note: _car.note, timeStamp: _car.timeStamp};
	// 	});
	// 	_ep.emitLater('getCarListOver', cars);			
	// });
}
function getCarTypeList(){
	var list = [];
	list.push({typeCode: '01', typeName: '小面包车'});
	list.push({typeCode: '02', typeName: '厢式货车'});
	return list;
};





