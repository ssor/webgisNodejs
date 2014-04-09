
var timeFormater = require('./timeFormat').getCurrentTime;


module.exports = Car;

function Car(_id, _type, _note, _owner){
	this.carID = _id;
	this.carType = _type;
	this.note = _note;
	this.timeStamp = timeFormater();
	this.owner = _owner;
}