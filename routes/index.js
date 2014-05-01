
var Datastore  = require('nedb');
var _          = require('underscore');
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
		userModule.validateUser(user, pwd)
		.then(function(_result){
			if(_result == true){
				res.send('ok');
			}else{
				res.send('error');
			}
		}).catch(function(){
			res.send('error');
		});

		// globalEP.once('validateUser', function(_result){
		// 	if(_result){
		// 		req.session.nickname = "普通用户";
		// 		res.send('ok');
		// 	}else{
		// 		console.log('登录错误'.error);
		// 		res.send('error');
		// 	}
		// });
		// userModule.validateUser(user, pwd, globalEP);
	} 
};
exports.right = function(req, res){
	res.render('right');
};
exports.left = function(req, res){
	if(req.session.username == "admin"){
		res.render('left_admin');
	}else{
		res.render('left');
	}
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
	bagageModule.getBindedCarID(bagageID)
	.then(function(_carID){
		if(_carID == null){
			res.render('errorPage');
		}else{
			res.render('startBagageMnting', {bagageID: bagageID, carID: _carID});
		}
	}).catch(function(error){
		res.render('errorPage');
	})
	
	// var localEP = new EventProxy();
	// bagageModule.getBindedCarID(bagageID, localEP);
	// localEP.once('getBindedCarIDOver', function(_carID){
	// 	res.render('startBagageMnting', {bagageID: bagageID, carID: _carID});
	// });
}
exports.errorPage = function(req, res){
	res.render('errorPage');
}

//*********************************************************
