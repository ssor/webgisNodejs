
//Todo： 添加一个内存映射，不要每次查询单号绑定的车时都要查询数据库


var _          = require('underscore');
var timeFormater = require('./timeFormat').getCurrentTime;
//******************************************************


exports.getBindedCarID = getBindedCarID;

exports.bagageLoginIndex = function(req, res){
	res.render('bagageLoginIndex');
}
exports.bagageStatusIndex = function(req, res){
	var bagageID = req.params.bagageID;
	res.render('bagageStatusIndex', {bagageID: bagageID});
}
exports.getBagageExits = function(req, res){
	var bagageID = req.params.bagageID;
	var selector = {bagageID: bagageID};

	bagagedbFind(selector)
	.then(function(_bagages){
		if(_.size(_bagages) <= 0){
			res.send('failed');return;
		}else{
			res.send('ok');
		}
	}).catch(function(error){
		console.log('error <= getBagageExits'.error)
		console.dir(error);
		res.send('error');
	})
}
exports.getBagageStatus4Weixin = function(req, res){
	var bagageID = req.params.bagageID;
	var objError = {status: 'error', message: ''};
	if(bagageID == null){
		res.send(JSON.stringify(objError));
		return;
	}
	bagagedbFind({bagageID: bagageID})
	.then(function(_list){
		if(_.size(_list) <= 0){
			// res.send(JSON.stringify(objError));
			throw new Error('noBagageID')
			return;
		} 
		else{
			var carID = _list[0].carID;
			var latestPoint = _.findWhere(latestCarPointList, {carID: carID});
			if(latestPoint == null){
				console.log('no point for ' + carID);
				// var objNoPoint = {status: 'noPoint'};
				// res.send(JSON.stringify(objNoPoint));
				throw new Error('noPoint')
				return;
			}else{
				if(latestPoint.sogouLongitude != null){
					console.log('emit startDownloadMapImage...'.info);
					globalEP.emit('startDownloadMapImage', {point: {lng: latestPoint.sogouLongitude, lat: latestPoint.sogouLatitude, downloadTimeStamp: latestPoint.downloadTimeStamp}, label: carID, carID: carID});
				}
				var objOk = {status: 'ok', bagageID: bagageID, carID: carID, timeStamp: latestPoint.timeStamp, imageName: latestPoint.imageName};
				res.send(JSON.stringify(objOk));
			}				
		} 
	}).catch(function(error){
		objError.message = error.message;
		res.send(JSON.stringify(objError));
	})	
}
exports.getBagageStatus = function(req, res){
	var bagageID = req.body.bagageID;
	//查找所在的车，之后查找该车最后的位置信息
	bagagedbFind({bagageID: bagageID})
	.then(function(_list){
		if(_.size(_list) <= 0){
			res.send('');
		} 
		else{
			var carID = _list[0].carID;
			var latestPoint = _.findWhere(latestCarPointList, {carID: carID});
			if(latestPoint == null){
				console.log('no point for ' + carID);
				res.send('');
				return;
			}else{
				if(latestPoint.sogouLongitude != null){
					console.log('emit startDownloadMapImage...'.info);
					globalEP.emit('startDownloadMapImage', {point: {lng: latestPoint.sogouLongitude, lat: latestPoint.sogouLatitude, downloadTimeStamp: latestPoint.downloadTimeStamp}, label: carID, carID: carID});
				}
				res.send(JSON.stringify(latestPoint));
			}				
		} 
	}).catch(function(error){
		console.log('error <= getBagageStatus'.error);
		console.dir(error);
		res.send('error');
	})
}
exports.index = function(req, res){
	res.render('bagageIndex');
};
exports.bagageList = function(req, res){
	var owner = req.session.username;
	if(owner == null){
		res.send('error');
		return;
	}	
	var selector = {owner: owner};
	if(owner == "admin"){
		selector = {};
	}

	bagagedbFind(selector)
	.then(function(_bagageList){
		var bagageList = _.map(_bagageList, function(_bagage){
			return {bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, note: _bagage.note, carID: _bagage.carID};
		});
		res.send(JSON.stringify(bagageList));
	}).catch(function(error){
		console.log('error <= bagageList'.error);
		res.send('error');
	})
};
exports.bagageListBindedWithCarID = function(req, res){
	var carID = req.body.carID;
	var owner = req.body.token;
	console.log(('carID: ' + carID + '  token: ' + owner).info);
	var selector = {owner: owner, carID: carID};
	bagagedbFind(selector)
	.then(function(_bagageList){
		var bagageList = _.map(_bagageList, function(_bagage){
			return {bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, note: _bagage.note, carID: _bagage.carID};
		});
		res.send(JSON.stringify(bagageList));
	}).catch(function(error){
		console.log('error <= bagageListBindedWithCarID'.error);
		console.dir(error);
		res.send('error');
	})	
}
exports.addBagageCarBinding = function(req, res){
	var body = req.body;
	var id = body.carID;
	var bagageID = body.bagageID;
	var note = body.note;
	var owner = body.token;
	if(owner == null || bagageID == null || bagageID.length <= 0 || id == null || id.length <= 0){
		res.send('error');
		return;
	}	
	var newBagage = {carID: id, bagageID: bagageID, note: note, timeStamp: timeFormater(), owner: owner};
	console.log('newBagage => '.info);
	console.dir(newBagage);
	insertBagageCarBinding2DB({carID: id, bagageID: bagageID, data: newBagage})
	.then(function(_info){
		res.send('ok');
	}).catch(function(error){
		console.log('error <= addBagageCarBinding'.error);
		res.send('error');
	})
	return;
};

exports.removeBagageCarBinding = function(req, res){
	//移除单号不需要绑定车辆的编号
	var body = req.body;
	var id = body.carID;
	var bagageID = body.bagageID;	
	var owner = req.session.username;
	if(owner == null || bagageID == null || bagageID.length <= 0){
		res.send('error');
		return;
	}		
	// var removedBagage = {bagageID: bagageID, timeStamp: timeFormater(), owner: owner, carID: id};
	// console.log('removedBagage => '.info);
	// console.dir(removedBagage);
	_removeBagageCarBinding(bagageID, owner, id)
	.then(function(){
		res.send('ok');
	})
	.catch(function(error){
		res.send(error.message);
	});
}
exports.removeBagageCarBindingForClient = function(req, res){
	//移除单号不需要绑定车辆的编号
	var body 	 = req.body;
	var id 		 = body.carID;
	var bagageID = body.bagageID;	
	var owner 	 = body.token;

	if(owner == null || bagageID == null || bagageID.length <= 0){
		res.send('error');
		return;
	}		
	// var removedBagage = {bagageID: bagageID, timeStamp: timeFormater(), owner: owner, carID: id};
	// console.log('removedBagage => '.info);
	// console.dir(removedBagage);
	_removeBagageCarBinding(bagageID, owner, id)
	.then(function(){
		res.send('ok');
	})
	.catch(function(error){
		res.send(error.message);
	});
}
function _removeBagageCarBinding(bagageID, owner, carID){
	// var removedBagage = {bagageID: bagageID, timeStamp: timeFormater(), owner: owner, carID: id};
	bagagedbRemove({bagageID: bagageID, owner: owner})
	.then(function(_numRemoved){
		if(_numRemoved > 0){
			console.log('removeBagageCarBindingFromDB ok !'.data);
			var record = {carID: carID, bagageID: bagageID, timeStamp: timeFormater(), owner: owner};
			record.event = "unbindBagageAndCar";
			return bagageRecordDBInsert(record)
				.then(function(_record){
					console.log('insertBagageCarBindingRecord2DB ok!'.data);
					// res.send('ok');	
					return _record;		
				})
		}else{
			console.log('no such bagageID to remove!!'.error);
			// res.send('noSuchData');
			throw new Error('noSuchData');
		}
	}).catch(function(error){
		console.log('error <= removeBagageCarBinding'.error);
		// res.send('error');
		throw new Error('error');
	})
}

exports.gerBagageRecord = function(req, res){
	var owner = req.session.username;
	if(owner == null){
		res.send('');
		return;
	}	
	var bagageID = req.body.bagageID;	
	bagageRecordDB.find({bagageID: bagageID}, function(err, _records){
		if(err){
			console.log('gerBagageRecord error'.error);
			res.send('');
			return;			
		}
		res.send(JSON.stringify(_records));
	});
}
function getBindedCarID(_bagageID){
	return bagagedbFind({bagageID: _bagageID})
	.then(function(_list){
		if(_.size(_list) <= 0) return null;
		else return _list[0].carID;
	});
}
function insertBagageCarBinding2DB(_bagage){
	return bagagedbFind({bagageID: _bagage.bagageID})
	.then(function(_list){
		if(_.size(_list) > 0){
			return 'duplicated';
		}else{
			return bagagedbInsert(_bagage.data)
			.then(function(_b){
				console.log('insert a bagage to db ok!'.data);
				//将绑定记录添加到数据库中
				_b.event = "bindBagageAndCar";
				return bagageRecordDBInsert(_b)
			})
			.then(function(_record){
				return 'ok';
			})
		}
	})
	return;
}

//******************************************************





