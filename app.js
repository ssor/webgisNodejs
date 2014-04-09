
carPointDBList = [];


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
ep = new EventProxy();

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var car = require('./routes/car');
var mobileClient = require('./routes/mobile');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 9001);
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
app.get('/logout', routes.logout);

app.post('/userList', user.list);
app.get('/userIndex', user.index);
app.post('/addUser', user.addUser);
app.post('/deleteUser', user.deleteUser);
app.get('/changePassword', user.changePassword);
app.post('/postNewPassword', user.postNewPassword);

app.post('/carList', car.carList);
app.get('/carIndex', car.index);
app.post('/addCar', car.addCar);
app.post('/deleteCar', car.deleteCar);
app.post('/carTypeList', car.carTypeList);

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
