
carPointDBList = [];
globalEP = null;
LATEST_POINT_INTERVAL = 15;//day 计算默认最近上传点时候的最大时间间隔，超过这个时间认为最近没有上传位置数据
MIN_INTERVAL_FOR_REFRESH_CAR_POSITION_MAP = 15;//second
latestCarPointList = [];

/**
 * Module dependencies.
 */
var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
var EventProxy = require('eventproxy');
globalEP = new EventProxy();

var Q = require('q');

var Datastore  = require('nedb');
cardb      = new Datastore({ filename: 'car.db', autoload: true });

cardbFind = Q.nbind(cardb.find, cardb);
cardbfindOne = Q.nbind(cardb.findOne, cardb);

bagagedb      = new Datastore({ filename: 'bagage.db', autoload: true });

bagagedbFind = Q.nbind(bagagedb.find, bagagedb);
bagagedbRemove = Q.nbind(bagagedb.remove, bagagedb);
bagagedbInsert = Q.nbind(bagagedb.insert, bagagedb);

userdb      = new Datastore({ filename: 'user.db', autoload: true });
userdbFind = Q.nbind(userdb.find, userdb);
userdbInsert = Q.nbind(userdb.insert, userdb);
userdbRemove = Q.nbind(userdb.remove, userdb);
userdbFindOne = Q.nbind(userdb.findOne, userdb);


bagageRecordDB = new Datastore({ filename: 'bagagerecord.db', autoload: true });

bagageRecordDBInsert = Q.nbind(bagageRecordDB.insert, bagageRecordDB);

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var car = require('./routes/car');
var mobileClient = require('./routes/mobile');
var bagage = require('./routes/bagage');

var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 9002);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser()); 
app.use(express.session({secret: "andylau"}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/', routes.index);
app.get('/index', routes.index);
app.post('/checkLogin', routes.checkLogin);
app.get('/right', routes.right);
app.get('/left', routes.left);
app.get('/top', routes.top);
app.get('/main', routes.main);
app.get('/chooseCarToMnt', routes.chooseCarToMnt);
app.get('/startMnting/:carID', routes.startMnting);
app.get('/startBagageMnting/:bagageID', routes.startBagageMnting);
app.get('/logout', routes.logout);
app.get('/version', routes.versionIndex);
app.get('/errorPage', routes.errorPage);

app.post('/userList', user.list);
app.get('/userIndex', user.index);
app.post('/addUser', user.addUser);
app.post('/deleteUser', user.deleteUser);
app.get('/changePassword', user.changePassword);
app.post('/postNewPassword', user.postNewPassword);
app.post('/resetpwd', user.resetpwd);

app.post('/carList', car.carList);
app.post('/carListForClient', car.carListForClient);
app.get('/carIndex', car.index);
app.post('/addCar', car.addCar);
app.post('/deleteCar', car.deleteCar);
app.post('/carTypeList', car.carTypeList);

app.post('/bagageList', bagage.bagageList);
app.get('/bagageIndex', bagage.index);
app.post('/addBagageCarBinding', bagage.addBagageCarBinding);
app.post('/removeBagageCarBinding', bagage.removeBagageCarBinding);
app.post('/removeBagageCarBindingForClient', bagage.removeBagageCarBindingForClient);
app.post('/gerBagageRecord', bagage.gerBagageRecord);
app.get('/bagageStatusIndex/:bagageID', bagage.bagageStatusIndex);
app.post('/getBagageStatus', bagage.getBagageStatus);
app.get('/b', bagage.bagageLoginIndex);
app.get('/getBagageExits/:bagageID', bagage.getBagageExits);
app.post('/bagageListBindedWithCarID', bagage.bagageListBindedWithCarID);

// app.post('/mobileCarList', mobileClient.carList);
app.get('/mobile', mobileClient.index);
app.get('/uploadgps/:carID', mobileClient.uploadgps);
app.post('/postgps', mobileClient.postgps);
app.post('/getgps', mobileClient.getgps);
app.get('/setRoutePara', mobileClient.setRoutePara);
app.post('/postRoutePara', mobileClient.postRoutePara);
app.get('/startReplaying', mobileClient.startReplayingView);
app.get('/getRoutePointList', mobileClient.getRoutePointList);

http.createServer(app).listen(app.get('port'), function(){
  console.log('webgis server listening on port ' + app.get('port'));
});
