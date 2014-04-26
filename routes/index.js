
var Datastore  = require('nedb');
// var planetdb      = new Datastore({ filename: 'planet.db', autoload: true });
var _          = require('underscore');
var EventProxy = require('eventproxy');
var authorize = require('./authorize');
var userModule = require('./user');
var carModule = require('./car');
var bagageModule = require('./bagage');
var checkMemoryModule = require('./checkMemory');
require('./saveCarPosImg');
//************************************************************************************

globalEP.emitLater('initialCarPointDB');
// setInterval(checkMemoryModule.checkMemory, 1000);

exports.versionIndex = function(req, res){
	res.render('version');
}

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
	return;
}

exports.index = function(req, res){
	if(req.session.username != null){
		console.log(req.session.username + ' has view this page ' + req.views + ' times');
	}else{
		console.log('you have not viewed this page');
	}
	res.render('index', {title:'EPC公共信息管理系统', _system_name:'EPC公共信息管理系统', _company:'北京科技发展有限公司'});
}
exports.checkLogin = function(req, res){
	// console.dir(req.session);
	var user = req.body.username;
	var pwd  = req.body.password;
	if(req.session.username == null){
		req.session.username = user;
		req.session.views = 1;
	}else{
		req.session.views ++;
	}

	console.log(('user: ' + user).data);
	console.log(('pwd : ' + pwd).data);
	if(user == 'admin' && pwd == '111'){
		req.session.nickname = "管理员";
		res.send('ok');
	}else{
		globalEP.once('validateUser', function(_result){
			if(_result){
				req.session.nickname = "普通用户";
				res.send('ok');
			}else{
				console.log('登录错误'.error);
				res.send('error');
			}
		});
		userModule.validateUser(user, pwd, globalEP);
	} 
};
exports.right = function(req, res){
	res.render('right');
};
exports.left = function(req, res){
	res.render('left');
};
exports.top = function(req, res){
	res.render('top', {nickname: req.session.nickname});
};
exports.main = function(req, res){
	authorize.authorize(req, res);
	// console.dir(req.session);
	if(req.session.views) req.session.views ++;
	if(req.session.username != null){
		console.log(req.session.username + ' has view this page ' + req.session.views + ' times');
	}
	// else{
	// 	console.log('you have not viewed this page');
	// 	res.redirect('../');
	// }	
	res.render('main');
};
exports.chooseCarToMnt = function(req, res){
	res.render('chooseCarToMnt', {_carTypes: JSON.stringify(carModule.getCarTypeList())});
}
exports.startMnting = function(req, res){
	console.log('startMnting : ' + req.params.carID);
	res.render('startMnting', {carID: req.params.carID});
}
exports.startBagageMnting = function(req, res){
	var bagageID = req.params.bagageID;
	console.log('startBagageMnting : ' + bagageID);
	var localEP = new EventProxy();
	bagageModule.getBindedCarID(bagageID, localEP);
	localEP.once('getBindedCarIDOver', function(_carID){
		res.render('startBagageMnting', {bagageID: bagageID, carID: _carID});
	});
}
//************************************************************************************
// just test
// createExampleCollection();
function createExampleCollection(){
	planetdb.insert({ _id: 'id1', planet: 'Mars', system: 'solar', inhabited: false, satellites: ['Phobos', 'Deimos'] });
	planetdb.insert({ _id: 'id2', planet: 'Earth', system: 'solar', inhabited: true, humans: { genders: 2, eyes: true } });
	planetdb.insert({ _id: 'id3', planet: 'Jupiter', system: 'solar', inhabited: false });
	planetdb.insert({ _id: 'id4', planet: 'Omicron Persei 8', system: 'futurama', inhabited: true, humans: { genders: 7 } });
	planetdb.insert({ _id: 'id5', completeData: { planets: [ { name: 'Earth', number: 3 }, { name: 'Mars', number: 2 }, { name: 'Pluton', number: 9 } ] } });
}
function showTestInfo(){

	// Finding all planets in the solar system
	planetdb.find({ system: 'solar' }, function (err, docs) {
	  console.log('docs is an array containing documents Mars, Earth, Jupiter'.info);
	  console.dir(docs);
	  // If no document is found, docs is equal to []
	});

	// Finding all planets whose name contain the substring 'ar' using a regular expression
	planetdb.find({ planet: /ar/ }, function (err, docs) {
	  console.log('docs contains Mars and Earth'.info);
	  console.dir(docs);
	});

	// Finding all inhabited planets in the solar system
	planetdb.find({ system: 'solar', inhabited: true }, function (err, docs) {
	  console.log('docs is an array containing document Earth only'.info);
	  console.dir(docs);
	});

	// Use the dot-notation to match fields in subdocuments
	planetdb.find({ "humans.genders": 2 }, function (err, docs) {
	  console.log('docs contains Earth'.info);
	  console.dir(docs);
	});

	// Use the dot-notation to navigate arrays of subdocuments
	planetdb.find({ "completeData.planets.name": "Mars" }, function (err, docs) {
	  console.log('docs contains document 5'.info);
	  console.dir(docs);
	});

	planetdb.find({ "completeData.planets.name": "Jupiter" }, function (err, docs) {
	  console.log('docs is empty'.info);
	  console.dir(docs);
	});

	planetdb.find({ "completeData.planets.0.name": "Earth" }, function (err, docs) {
	  console.log('docs contains document 5'.info);
	  console.dir(docs);
	  // If we had tested against "Mars" docs would be empty because we are matching against a specific array element
	});


	// You can also deep-compare objects. Don't confuse this with dot-notation!
	planetdb.find({ humans: { genders: 2 } }, function (err, docs) {
	  console.log('docs is empty, because { genders: 2 } is not equal to { genders: 2, eyes: true }'.info);
	  console.dir(docs);
	});

	planetdb.find({}, function (err, docs) {
		console.log('Find all documents in the collection'.info);
		console.dir(docs);
	});

	// The same rules apply when you want to only find one document
	planetdb.findOne({ _id: 'id1' }, function (err, doc) {
	  // doc is the document Mars
	  // If no document is found, doc is null
	});
}

//************************************************************************************
exports.indexAPI = function(req, res){
	res.render('indexAPI', {title:'API Test'});
}

exports.overview = function(req, res){
	res.render('overview');
};
exports.epclistIndex = function(req, res){
	var ep = EventProxy.create('listTypeInfoOver', function(_docs){
		console.dir(_docs);
		var docs = _.map(_docs, function(_doc){
			return {typeCode: _doc.typeCode, typeName: _doc.typeName};
		});
		res.render('epclistIndex', {_itemTypes: JSON.stringify(docs)});
		// res.send(JSON.stringify(docs));
	});
	ep.fail(function(_err){
		console.log('get type info list failed');
		res.send('failed');
	});

	typeInfoDB.find({}, ep.done('listTypeInfoOver'));

};
exports.epclist = function(req, res){
	var ep = EventProxy.create('allEpc', function(_docs){
		console.dir(_docs);
		var docs = _.map(_docs, function(_doc){
			return {epc: _doc.epc, itemType: _doc.itemType};
		});
		res.send(JSON.stringify(docs));
	});
	ep.fail(function(_err){
		res.send('error');
	});

	epcdb.find({}, ep.done('allEpc'));

};

exports.typelistIndex = function(req, res){
	res.render('typelistIndex');
};
exports.addTypeInfo = function(req, res){
	var raw = req.rawBody;
	var typeInfoObj = JSON.parse(raw);
	var typeInfoNew = new TypeInfo(typeInfoObj.typeCode, typeInfoObj.typeName, typeInfoObj.des);

	var ep = EventProxy.create('insertOK', function(_newDoc){
		// res.send(JSON.stringify(_newDoc));
		res.send('ok');
	});
	ep.all('findAllDocs', function(_docs){
		if(_.size(_docs) <= 0){
			typeInfoDB.insert(typeInfoNew, ep.done('insertOK'));
		}else{
			// res.send('duplicated');
			typeInfoDB.update({typeCode: typeInfoObj.typeCode}, {$set:{typeName: typeInfoObj.typeName, des: typeInfoObj.des}}, ep.done('insertOK'));
		}
	});
	ep.all('validateOK', function(_typeInfoNew){
		typeInfoDB.find({typeCode: typeInfoNew.typeCode}, ep.done('findAllDocs'));
	});
	ep.fail(function(_err){
		res.send('error');
	});

	typeInfoNew.validateTypeInfo(ep.done('validateOK'));

};
exports.listTypeInfo = function(req, res){
	console.log('listTypeInfo => ');
	var ep = EventProxy.create('listTypeInfoOver', function(_docs){
		console.dir(_docs);
		var docs = _.map(_docs, function(_doc){
			return {typeCode: _doc.typeCode, typeName: _doc.typeName, des: _doc.des};
		});
		res.send(JSON.stringify(docs));
	});
	ep.fail(function(_err){
		console.log('get type info list failed');
		res.send('failed');
	});

	typeInfoDB.find({}, ep.done('listTypeInfoOver'));

};
exports.addTestTypeInfo = function(req, res){
	var types = [(new TypeInfo('01', 'XBox', 'XBOX是由世界最大的电脑软件公司微软所开发，并早在2001年就开始销售的该公司第一代家用游戏主机，其性能相当于索尼的PS2。Xbox Live是Xbox及其后的第二代占据现市场主流的Xbox360专用的多用户在线对战平台。')), 
				 (new TypeInfo('02', 'MAC电脑', 'MAC（Macintosh,苹果电脑)。中国大陆曾使用“麦金托什”这个译名，但近期此称呼非常罕见，大陆的北京麦金塔用户会也已将电脑名改为“麦金塔”。大陆居民有时候也将麦金塔称为“苹果机'))];

	var ep = new EventProxy();
	ep.after('addTestTypeInfoOver', _.size(types), function(_newDocs){
		console.log('addTestTypeInfo =>');
		console.dir(_newDocs);
		res.send('ok');
	});

	_.each(types, function(_type){
		typeInfoDB.insert(_type, ep.done('addTestTypeInfoOver'));
	});

}
exports.removeAllTypeInfo = function(req, res){
	var ep = EventProxy.create('removeAllTypeInfo', function(_numRemoved){
		console.log(_numRemoved + ' Type Info removed!');
		res.send('ok');
	});
	ep.fail(function(_err){
		console.dir(_err);
	});
	//默认非多项删除
	typeInfoDB.remove({}, {multi: true}, ep.done('removeAllTypeInfo'));
}
exports.removeTypeInfo = function(req, res){
	var raw = req.rawBody;
	var typeInfoObj = JSON.parse(raw);
	console.log('removeTypeInfo => ');
	console.dir(typeInfoObj);

	var ep = EventProxy.create('removeTypeOver', function(_newDoc){
		res.send('ok');
	});
	ep.fail(function(_err){
		console.log('get type info list failed');
		res.send('failed');
	});
	
	ep.all('findAllDocs', function(_docs){
		if(_.size(_docs) <= 0){
			res.send('error');
		}else{
			typeInfoDB.remove({typeCode: typeInfoObj.typeCode}, ep.done('removeTypeOver'));
		}
	});
	typeInfoDB.find({typeCode: typeInfoObj.typeCode}, ep.done('findAllDocs'));

};
exports.addEpc = function(req, res){
	var raw = req.rawBody;
	var epcObj = JSON.parse(raw);
	console.log('addEpc => ');
	console.dir(epcObj);

	var epcNew = new Epc(epcObj.epc, epcObj.itemType);

	var ep = EventProxy.create('insertOK', function(_newDoc){
		res.send('ok');
		// res.send(JSON.stringify(_newDoc));
	});
	ep.all('findAllDocs', function(_docs){
		if(_.size(_docs) <= 0){
			epcdb.insert(epcNew, ep.done('insertOK'));
		}else{
			res.send('duplicated');
		}
	});
	ep.all('validateOK', function(_epcNew){
		epcdb.find({epc: _epcNew.epc}, ep.done('findAllDocs'));
	});
	ep.fail(function(_err){
		res.send('error');
	});
	epcNew.validateEpc(ep.done('validateOK'));

};
exports.listEpc = function(req, res){
	var ep = EventProxy.create('allEpc', function(_docs){
		console.dir(_docs);
		var docs = _.map(_docs, function(_doc){
			return {epc: _doc.epc, itemType: _doc.itemType};
		});
		res.send(JSON.stringify(docs));
	});
	ep.fail(function(_err){
		res.send('error');
	});

	epcdb.find({}, ep.done('allEpc'));

};
exports.removeAllEpc = function(req, res){
	var ep = EventProxy.create('removeAllEpc', function(_numRemoved){
		console.log(_numRemoved + ' EPC removed!');
		res.send('ok');
	});
	ep.fail(function(_err){
		console.dir(_err);
		res.send('error');
	});
	//默认非多项删除
	epcdb.remove({}, {multi: true}, ep.done('removeAllEpc'));	
};
exports.removeEpc = function(req, res){
	var raw = req.rawBody;
	var epcObj = JSON.parse(raw);
	console.log('removeEpc => ');
	console.dir(epcObj);

	var ep = EventProxy.create('removeDocOver', function(_newDoc){
		res.send('ok');
	});
	ep.all('findAllDocs', function(_docs){
		if(_.size(_docs) <= 0){
			res.send('error');
		}else{
			epcdb.remove({epc: epcObj.epc}, ep.done('removeDocOver'));
		}
	});
	epcdb.find({epc: epcObj.epc}, ep.done('findAllDocs'));
};
exports.addTestEpc = function(req, res){
	// insertSomething();
	var epclist = [(new Epc('909603F01234000001010203', '01')), 
					(new Epc('AD94240019F7AD9151001004', '01')), 
					(new Epc('AD94240019F7900000101002', '02'))];

	var ep = new EventProxy();
	ep.after('insertOK', _.size(epclist), function(_newDocs){
		res.send('ok');
	});
	ep.fail(function(_err){
		res.send('error');
	});

	_.each(epclist, function(_epc){
		epcdb.insert(_epc, ep.done('insertOK'));
	});
};

//*********************************************************

exports.getgps = function(req, res){
	if(g_point == null){
		res.json({"status":"failed"});
	}else{
		res.json(g_point);
	}
};

exports.postSogouGps = function(req, res){
	var body = req.body;
	var id = body.carID;
	var sogouLat = body.Lat;
	var sogouLng = body.Lng;
	g_point = new SogouPoint(id, sogouLat, sogouLng, 'sogou');
	console.log(g_point);
	res.json({"status":"success"});
	return;
};
exports.postRawGPS = function(req, res){
	var rawBody = req.rawBody;
	console.log(rawBody);
	var gps = JSON.parse(rawBody);
	console.log(gps);
	if(gps.type == 'sogou'){
		g_point = new SogouPoint(gps.carID, gps.Lat, gps.Lng, 'sogou');
	}
	else if(gps.type == "standard"){
		g_point = new SogouPoint(gps.carID, gps.Lat, gps.Lng, 'standard');
	}else if(gps.type == "end"){
		g_point = null;
	}
	return;
};
exports.test = function(req, res){
	res.render('test');
};
exports.editpoint = function(req, res){
	res.render('editpoint');
};
exports.exportPoints = function(req, res){
	// var filename = 'a.txt';
	// res.set('Content-Type', 'text/plain');
	// res.set('Content-Disposition: attachment; filename="'+ filename +'"');
	console.log(req.body.type);
	console.log(req.body.data);

	var json = {status:'success', content:"some things!"};
	res.json(json);
	return;
}