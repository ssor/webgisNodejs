var _          = require('underscore');
// var EventProxy = require('eventproxy');
var Car = require('./defCar');
var Q = require('q');


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

	carListResBack(req.session.username)
	.then(function(_carlist){
		res.send(JSON.stringify(_carlist));
	}).catch(function(err){
		console.log('error <= carList'.error);
		res.send('');
	});
};

exports.carListForClient = function(req, res){
	var username = req.body.token;
	
	carListResBack(username)
	.then(function(_carlist){
		res.send(JSON.stringify(_carlist));
	}).catch(function(err){
		console.log('error <= carListForClient'.error);
		console.dir(err);
		res.send('');	
	});
}
function carListResBack(_userName){
	var selector = {owner: _userName};
	if(_userName == 'admin'){
		selector = {};
	}
	return cardbFind(selector)
	.then(function(_carlist){
		return (cardbFind({}))
		.then(function(_mapList){
			var carsInfoReturn = _.map(_carlist, function(_car){
				var bagageList = _.findWhere(_mapList, {carID: _car.carID});
				var bagageBinded = (_.size(bagageList) > 0);		
				// var bagageBinded = false;	
				return {carID: _car.carID, carType: _car.carType, note: _car.note, timeStamp: _car.timeStamp, bagageBinded: bagageBinded};
			});
			// console.dir(carsInfoReturn);
			return carsInfoReturn;				
		})
	});
	return;		
}
exports.carTypeList = function(req, res){
	res.send(JSON.stringify(getCarTypeList()));
};
exports.getCarTypeList 				= getCarTypeList;
exports.getCarListOfSpecifiedUser   = getCarListOfSpecifiedUser;
exports.getCarList 					= getCarList;
//****************************************************
// function getCarBagageMap(_ep){
// 	bagagedb.find({}, _ep.doneLater('getCarBagageMapOver'));
// };
function getCarList(_user){
	var selector = {owner: _user};
	if(_user == 'admin'){
		selector = {};
	}	
	return cardbFind(selector);
}
function getCarListOfSpecifiedUser(_user, _ep){
	var selector = {owner: _user};
	if(_user == 'admin'){
		selector = {};
	}
	cardb.find(selector, _ep.doneLater('getCarListOver'));
}
function getCarTypeList(){
	var list = [];
	list.push({typeCode: '01', typeName: '小面包车'});
	list.push({typeCode: '02', typeName: '厢式货车'});
	return list;
};





