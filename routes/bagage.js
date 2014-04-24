
//Todo： 添加一个内存映射，不要每次查询单号绑定的车时都要查询数据库


var _          = require('underscore');
var EventProxy = require('eventproxy');
var timeFormater = require('./timeFormat').getCurrentTime;

//******************************************************

globalEP.tail('newBagage', insertBagageCarBinding2DB);
globalEP.tail('eventRemoveBagage', removeBagageCarBindingFromDB);
globalEP.tail('eventInsertBagageCarBindingRecord2DB', insertBagageCarBindingRecord2DB);

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
	var localEP = new EventProxy();
	localEP.fail(function(error){
		res.send('error');
		return;
	})
	bagagedb.find(selector, localEP.doneLater('getBagageOver'));
	localEP.once('getBagageOver', function(_bagages){
		// console.log('getBagageOver...'.info);
		// console.dir(_bagages);
		if(_.size(_bagages) <= 0){
			res.send('failed');return;
		}else{
			res.send('ok');
		}
	});
}
exports.getBagageStatus = function(req, res){
	var bagageID = req.body.bagageID;
	//查找所在的车，之后查找该车最后的位置信息
	var localEP = new EventProxy();
	getBindedCarID(bagageID, localEP);
	localEP.once('getBindedCarIDOver', function(_carID){
		console.log(('bagageID '+ bagageID +' bind car ' + _carID).info);
		if(_carID == null){
			res.send('');
			return;
		}
		// console.dir(latestCarPointList);
		var latestPoint = _.findWhere(latestCarPointList, {carID: _carID});
		if(latestPoint == null){
			console.log('no point for ' + _carID);
			res.send('');return;
		}else{
			if(latestPoint.sogouLongitude != null){
				console.log('emit startDownloadMapImage...'.info);
				globalEP.emit('startDownloadMapImage', {point: {lng: latestPoint.sogouLongitude, lat: latestPoint.sogouLatitude, downloadTimeStamp: latestPoint.downloadTimeStamp}, label: _carID, carID: _carID});
			}
			res.send(JSON.stringify(latestPoint));
		}		
	});
}
exports.index = function(req, res){
	res.render('bagageIndex');
};
exports.bagageList = function(req, res){
	var localEP = new EventProxy();
	getBagageList(null, localEP);

	localEP.once('getBagageListOver',function(_bagageList){
		var bagageList = _.map(_bagageList, function(_bagage){
			return {bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, note: _bagage.note, carID: _bagage.carID};
		});
		res.send(JSON.stringify(bagageList));
	});
	localEP.fail(function(err){
		res.send('');
	});	
}
exports.addBagageCarBinding = function(req, res){
	var owner = req.session.username;
	if(owner == null){
		res.send('error');
		return;
	}	
	var body = req.body;
	var id = body.carID;
	var bagageID = body.bagageID;
	var note = body.note;
	var newBagage = {carID: id, bagageID: bagageID, note: note, timeStamp: timeFormater(), owner: owner};
	console.log('newBagage => '.info);
	console.dir(newBagage);
	globalEP.emitLater('newBagage', {carID: id, bagageID: bagageID, data: newBagage, res: res});
	// res.send('ok');
	return;
};
exports.removeBagageCarBinding = function(req, res){
	var owner = req.session.username;
	if(owner == null){
		res.send('error');
		return;
	}
	var body = req.body;
	var id = body.carID;
	var bagageID = body.bagageID;	
	var removedBagage = {carID: id, bagageID: bagageID, timeStamp: timeFormater(), owner: owner};
	console.log('removedBagage => '.info);
	console.dir(removedBagage);
	removedBagage.res = res;
	globalEP.emitLater('eventRemoveBagage', removedBagage);
	return;
}

exports.getBindedCarID = getBindedCarID;

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
function getBindedCarID(_bagageID, _ep){
	bagagedb.find({bagageID: _bagageID}, function(err, _list){
		if(err) _ep.emitLater('getBindedCarIDOver', null);
		if(_.size(_list) <= 0) _ep.emitLater('getBindedCarIDOver', null);
		else _ep.emitLater('getBindedCarIDOver', _list[0].carID);
	});
}
function insertBagageCarBinding2DB(_bagage){
	var localEP = new EventProxy();
	localEP.fail(function(err){
		console.log('insertBagageCarBinding2DB error'.error);
		_bagage.res.send('error');
	});

	bagagedb.find({carID: _bagage.carID, bagageID: _bagage.bagageID}, localEP.doneLater('getBagageWithCarIDAndBagageID'));
	localEP.once('getBagageWithCarIDAndBagageID', function(_list){
		if(_.size(_list) > 0){
			console.log('this bagage already exits!'.error);
			_bagage.res.send('duplicated');
		}else{
			bagagedb.insert(_bagage.data, localEP.doneLater('insertBagageCarBinding2DBOver'));
		}
	});
	localEP.once('insertBagageCarBinding2DBOver', function(_b){
		console.log('insert a bagage to db ok!'.data);
		//将绑定记录添加到数据库中
		_b.event = "bindBagageAndCar";
		globalEP.emitLater('eventInsertBagageCarBindingRecord2DB', _b);
		_bagage.res.send('ok');
	});
}
function removeBagageCarBindingFromDB(_bagage){
	var localEP = new EventProxy();
	localEP.fail(function(err){
		console.log('removeBagageCarBindingFromDB error'.error);
		_bagage.res.send('error');
	});
	bagagedb.remove({carID: _bagage.carID, bagageID: _bagage.bagageID}, localEP.doneLater('removeBagageCarBindingFromDBOver'));
	localEP.once('removeBagageCarBindingFromDBOver', function(_numRemoved){
		console.log('removeBagageCarBindingFromDB ok !'.data);
		var record = {carID: _bagage.carID, bagageID: _bagage.bagageID, timeStamp: _bagage.timeStamp, owner: _bagage.owner};
		record.event = "unbindBagageAndCar";
		globalEP.emit('eventInsertBagageCarBindingRecord2DB', record);
		_bagage.res.send('ok');
	})	
}
function insertBagageCarBindingRecord2DB(_newBagageRecord){
	var localEP = new EventProxy();
	localEP.fail(function(err){
		console.log('insertBagageCarBindingRecord2DB error'.error);
	});	
	bagageRecordDB.insert(_newBagageRecord, localEP.doneLater('eventInsertBagageCarBindingRecord2DBOver'));
	localEP.once('eventInsertBagageCarBindingRecord2DBOver', function(_b){
		console.log('insertBagageCarBindingRecord2DB ok!'.data);
	});
}
function getBagageList(_owner, _ep){
	if(_owner == null) _owner = 'admin';
	var selector = {owner: _owner};
	bagagedb.find(selector, _ep.doneLater('getBagageListOver'));
}
//******************************************************





