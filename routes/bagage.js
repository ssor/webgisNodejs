
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


	// var localEP = new EventProxy();
	// localEP.fail(function(error){
	// 	res.send('error');
	// 	return;
	// })
	// bagagedb.find(selector, localEP.doneLater('getBagageOver'));
	// localEP.once('getBagageOver', function(_bagages){
	// 	// console.log('getBagageOver...'.info);
	// 	// console.dir(_bagages);
	// 	if(_.size(_bagages) <= 0){
	// 		res.send('failed');return;
	// 	}else{
	// 		res.send('ok');
	// 	}
	// });
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


	// var localEP = new EventProxy();
	// getBindedCarID(bagageID, localEP);
	// localEP.once('getBindedCarIDOver', function(_carID){
	// 	console.log(('bagageID '+ bagageID +' bind car ' + _carID).info);
	// 	if(_carID == null){
	// 		res.send('');
	// 		return;
	// 	}
	// 	// console.dir(latestCarPointList);
	// 	var latestPoint = _.findWhere(latestCarPointList, {carID: _carID});
	// 	if(latestPoint == null){
	// 		console.log('no point for ' + _carID);
	// 		res.send('');return;
	// 	}else{
	// 		if(latestPoint.sogouLongitude != null){
	// 			console.log('emit startDownloadMapImage...'.info);
	// 			globalEP.emit('startDownloadMapImage', {point: {lng: latestPoint.sogouLongitude, lat: latestPoint.sogouLatitude, downloadTimeStamp: latestPoint.downloadTimeStamp}, label: _carID, carID: _carID});
	// 		}
	// 		res.send(JSON.stringify(latestPoint));
	// 	}		
	// });
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


	// localEP.once('getBagageListOver',function(_bagageList){
	// 	var bagageList = _.map(_bagageList, function(_bagage){
	// 		return {bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, note: _bagage.note, carID: _bagage.carID};
	// 	});
	// 	res.send(JSON.stringify(bagageList));
	// });
	// localEP.fail(function(err){
	// 	res.send('');
	// });	
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

	// var localEP = new EventProxy();
	// bagagedb.find(selector, localEP.doneLater('getBagageListOver'));

	// localEP.once('getBagageListOver',function(_bagageList){
	// 	var bagageList = _.map(_bagageList, function(_bagage){
	// 		return {bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, note: _bagage.note, carID: _bagage.carID};
	// 	});
	// 	res.send(JSON.stringify(bagageList));
	// });
	// localEP.fail(function(err){
	// 	res.send('');
	// });		
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
	// globalEP.emitLater('newBagage', {carID: id, bagageID: bagageID, data: newBagage, res: res});
	// res.send('ok');
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
	var removedBagage = {bagageID: bagageID, timeStamp: timeFormater(), owner: owner, carID: id};
	// console.log('removedBagage => '.info);
	// console.dir(removedBagage);
	_removeBagageCarBinding(req, res, removedBagage);
}
exports.removeBagageCarBindingForClient = function(req, res){
	//移除单号不需要绑定车辆的编号
	var body = req.body;
	var id = body.carID;
	var bagageID = body.bagageID;	
	var owner = body.token;
	if(owner == null || bagageID == null || bagageID.length <= 0){
		res.send('error');
		return;
	}		
	var removedBagage = {bagageID: bagageID, timeStamp: timeFormater(), owner: owner, carID: id};
	// console.log('removedBagage => '.info);
	// console.dir(removedBagage);
	_removeBagageCarBinding(req, res, removedBagage);
}
function _removeBagageCarBinding(req, res, removedBagage){
	bagagedbRemove({bagageID: removedBagage.bagageID, owner: removedBagage.owner})
	.then(function(_numRemoved){
		if(_numRemoved > 0){
			console.log('removeBagageCarBindingFromDB ok !'.data);
			var record = {carID: removedBagage.carID, bagageID: removedBagage.bagageID, timeStamp: removedBagage.timeStamp, owner: removedBagage.owner};
			record.event = "unbindBagageAndCar";
			return bagageRecordDBInsert(record)
				.then(function(_record){
					console.log('insertBagageCarBindingRecord2DB ok!'.data);
					res.send('ok');			
				})
			// res.send('ok');			
		}else{
			console.log('no such bagageID to remove!!'.error);
			res.send('noSuchData');
		}
	}).catch(function(error){
		console.log('error <= removeBagageCarBinding'.error);
		res.send('error');
	})
	return;	
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

	// bagagedb.find({bagageID: _bagageID}, function(err, _list){
	// 	if(err) _ep.emitLater('getBindedCarIDOver', null);
	// 	if(_.size(_list) <= 0) _ep.emitLater('getBindedCarIDOver', null);
	// 	else _ep.emitLater('getBindedCarIDOver', _list[0].carID);
	// });
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

	// var localEP = new EventProxy();
	// localEP.fail(function(err){
	// 	console.log('insertBagageCarBinding2DB error'.error);
	// 	_bagage.res.send('error');
	// });

	// bagagedb.find({bagageID: _bagage.bagageID}, localEP.doneLater('getBagageWithBagageID'));
	// localEP.once('getBagageWithBagageID', function(_list){
	// 	if(_.size(_list) > 0){
	// 		console.log('this bagage already exits!'.error);
	// 		_bagage.res.send('duplicated');
	// 	}else{
	// 		bagagedb.insert(_bagage.data, localEP.doneLater('insertBagageCarBinding2DBOver'));
	// 	}
	// });
	// localEP.once('insertBagageCarBinding2DBOver', function(_b){
	// 	console.log('insert a bagage to db ok!'.data);
	// 	//将绑定记录添加到数据库中
	// 	_b.event = "bindBagageAndCar";
	// 	globalEP.emitLater('eventInsertBagageCarBindingRecord2DB', _b);
	// 	_bagage.res.send('ok');
	// });
}

//******************************************************





