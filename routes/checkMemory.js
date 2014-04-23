var util = require('util');
var _          = require('underscore');


//假设一个应用不会在自身可控的范围内使得内存占用越来越大
//如果随着时间，内存的占用越来越大，那就说明有内存泄露
var MAX_HISTORY_YEAR = 8;
var memoryUsedHistory = [];
exports.checkMemory = function(){
	// var year = _.random(1, 100);
	// memoryUsedHistory = pushNewHistory(year, memoryUsedHistory);
	// console.log(memoryUsedHistory);
	// checkChangeTrend(memoryUsedHistory);
	var memuse = process.memoryUsage();
	// console.log(memuse);
	memoryUsedHistory = pushNewHistory(memuse.heapTotal, memoryUsedHistory);
	var trend = checkChangeTrend(memoryUsedHistory);
	if(trend == 1){
		console.log(('memory use up: ' + memuse.heapTotal).error);
	}else if(trend == -1){
		console.log(('memory use less: ' + memuse.heapTotal).info);
	}else{
		console.log('memory no change'.data);
	}
	// var usedMemPercent = memuse.heapUsed/memuse.heapTotal * 100;
	// if(memuse.heapUsed > memoryLastedUsed){
	// 	console.log(('Memory: used: ' + memuse.heapUsed + '  total: ' + memuse.heapTotal +'  percent: ' + usedMemPercent + '%  ' + (memuse.heapUsed - memoryLastedUsed) + ' ↑↑').warn);
	// }else{
	// 	console.log(('Memory: used: ' + memuse.heapUsed + '  total: ' + memuse.heapTotal + '  percent: ' + usedMemPercent + '%  ' + (memoryLastedUsed - memuse.heapUsed) + ' ↓↓').info);
	// }
	// memoryLastedUsed = memuse.heapUsed;
	// if(memoryMin > memuse.heapUsed) memoryMin = memuse.heapUsed;	
};
function checkChangeTrend(_years){
	if(_years.length >= MAX_HISTORY_YEAR){
		// console.log(_years);
		var trends = _.map(_years, function(_year, _key, _list){
			if(_key < (MAX_HISTORY_YEAR)){
				return _year < _list[_key + 1];
			}
		});
		// console.dir(trends);
		trendsRise = _.without(trends, undefined, false);
		// console.log(trendsRise.length);
		// console.dir(trendsRise);
		if(trendsRise.length > (MAX_HISTORY_YEAR)/2){
			// console.log('rising ...'.warn);
			return 1;
		}else{
			// console.log('downing...'.info);
			return -1;
		}
	}
	return 0;
}
function pushNewHistory(_year, _memoryUsedHistory){
	if(_memoryUsedHistory.length > MAX_HISTORY_YEAR){
		_memoryUsedHistory = _.rest(_memoryUsedHistory);
		_memoryUsedHistory.push(_year);
	}else{
		_memoryUsedHistory.push(_year);
	}
	return _memoryUsedHistory;	
}