

exports.authorize = function(req, res){
	if(req.session.username == null){
		console.log('you have not logged in'.warn);
		res.redirect('../');
		return false;
	}
	return true;
};
