var Datastore  = require('nedb');
var _          = require('underscore');
var EventProxy = require('eventproxy');
var async = require('async');
var authorize = require('./authorize');

/*
 * GET users listing.
 */

exports.validateUser = function(_id, _pwd, _ep){
	console.log('validateUser => ' + _id + '  ' + _pwd);
	userdb.findOne({userID: _id, password: _pwd}, function(err, _user){
		if(err) {
			console.log('validateUser db error'.error)
			_ep.emit('validateUser', false);
		}
		if(_user == null) {
			console.log(('no user named ' + _id).warn);
			_ep.emit('validateUser', false);
		}
		_ep.emit('validateUser', true);
	});
	return;
}

exports.index = function(req, res){

	res.render('userIndex');
};
exports.postNewPassword = function(req, res){
	var user = req.session.username;
	if(user == null || user == undefined){
		console.log('not yet login'.error);
	    res.send('error');
	    return;
	}
	var crtPwd = req.body.currentPassword;
	var newPwd = req.body.newpassword;
	async.waterfall([
			function(cb){
				userdb.findOne({userID: user, password: crtPwd}, function(err, _user){
					if(err) {
						console.log('userdb error when findOne'.error);
						cb(err, null);
					}
					if(_user == null) {
						console.log(('user ' + user + '\' pwd not correct').warn);
						cb('pwd not correct', false);
					}
					cb(null, true);
				});
			},
			function(result, cb){
				//更新user新密码
				userdb.update({userID: user}, { $set: { password: newPwd } }, function(err, _user){
					if(err) {
						console.log('userdb error when update'.error);
						cb(err, null);
					}
					cb(null, true);//已经更新密码					
				});
			}
		], function(err, result){
		if(err != null || !result){
			console.log('result: '.error, result);
		    console.log('err: '.error, err);
		    res.send('error');
		    return;
		}
		res.send('ok');
	});
};
exports.changePassword = function(req, res){
	console.log(('current user :' + req.session.username).data);
	// authorize.authorize(req, res);

	res.render('changepwd');
};
exports.resetpwd = function(req, res){
	var user = req.body.userID;
	if(user == null || user == undefined){
		console.log('user not selected'.error);
	    res.send('error');
	    return;
	}
	userdb.update({userID: user}, { $set: { password: "123" } }, function(err, _user){
		if(err) {
			console.log('userdb error when update'.error);
		    res.send('error');
		    return;
		}
		res.send('ok');
	});		
}
exports.deleteUser = function(req, res){
	var userID = req.body.userID;
	console.log('deleteUser => ' + userID);
	userdb.remove({userID: userID}, {multi: true}, function(err, numRemoved){
		if(err){
			console.log(('some error happends when remove user ' + userID).error);
			res.send('error');
			return;
		}
		if(numRemoved > 0){
			res.send('ok');
			console.log(('remove user ' + userID + ' ok').info);
			return;
		}
	});
	// res.send('ok');
};
exports.addUser = function(req, res){
	var userID = req.body.userID;
	var userName = req.body.userName;
	var email = req.body.email;
	console.log(('addUser => ' + userID + '  ' + req.body.userName).info);
	userdb.findOne({userID: userID}, function(err, doc){
		if(err != null){
			console.log('some error happends when find user!'.error);
			res.send('error');
			return;
		}
		if(doc != null){
			res.send('duplicated');
			return;
		}else{
			userdb.insert(new User(userID, '123', userName, email, 'normal'), function(err, newDoc){
				if(err){
					console.log('some error happends when addUser!'.error);
					res.send('error');return;
				} 
				console.log(('add user ' + userID + '  ok').info);
				res.send('ok');
				return;
			});
		}
	});
};
exports.list = function(req, res){
	if(req.session.username == null){
		res.send(''); return;
	}	
	userdb.find({}, function(err, users){
		console.dir(users);
		res.send(JSON.stringify(users));
	});
	return;
	var users = [];
	users.push(new User('user1', 'username1', '11@22'));
	res.send(JSON.stringify(users));
  // res.send("respond with a resource");
};

function User(_id, _password, _name, _email, _type){
	this.userID = _id;
	this.password = _password;
	this.userName = _name;
	this.email = _email;
	this.type = _type;
}