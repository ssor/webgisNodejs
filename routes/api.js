// api
/*
URL:
	http://localhost:9002/addBagageCarBinding
说明：
	添加单号与车辆的绑定
header: 
	Content-Type: application/json; charset=UTF-8
content example:
	{"carID":"xcar2", "bagageID": "b001", "note": "n111", "token": "demo"}
参数说明：
	token:用户识别标识；carID:车辆编号；bagageID:单号；note:备注说明
返回：
	返回 ok 表示操作成功，其它返回表示失败


URL:
	http://localhost:9002/removeBagageCarBindingForClient
说明：
	删除单号与车辆的绑定
header: 
	Content-Type: application/json; charset=UTF-8
content example:
	{"carID":"xcar2", "bagageID": "b001", "token": "demo"}
参数说明：
	token:用户识别标识
返回：
	返回 ok 表示操作成功，其它返回表示失败


URL:
	http://localhost:9002/carListForClient
说明：
	查询用户所有车辆
header: 
	Content-Type: application/json; charset=UTF-8
content example:
	{"token": "demo"}
参数说明：
	token:用户识别标识
返回：
类似于如下结构的数据	
[{"carID":"xcar2","carType":"02","note":"22","timeStamp":"2014-04-08 19:13:39","bagageBinded":true}]


URL:
	http://localhost:9002/gerBagageRecord
说明：
	查询单号绑定记录
header: 
	Content-Type: application/json; charset=UTF-8
content example:
	{"bagageID": "b001"}



*/
