const express      = require('express');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('express-session');

const app  = express();
const port = process.env.PORT || 3000;

const mongoose      = require('mongoose');
const BD            = require('./app/models/MonitoriaApiModel');
const mongoURI      = require('./app/config/config').uriMongo;
//const mongoURILocal = require('./app/config/config').uriMongoLocal;

//  mongoose instance connection url connection
mongoose.connect(mongoURI, function(err) {
//mongoose.connect(mongoURILocal, function(err) {
  if (err) {
    console.log('Erro de conexão: ', err);
  }
  else {
    console.log('Conexão com Mongo estabelecidade com sucesso!');
  }
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Conexão via mongoose com erro: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Conexão via mongoose encerrada'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose desconectado por encerramento do servidor'); 
    process.exit(0); 
  }); 
}); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: "TESTE", resave: false, saveUninitialized: true}));

app.set('views', [__dirname + '/app/views',
                  __dirname + '/app/views/index', 
                  __dirname + '/app/views/adm',
                  __dirname + '/app/views/edicao',
                  __dirname + '/app/views/atividades',
                  __dirname + '/app/views/relatorios']);
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');    // Setamos que nossa engine será o ejs

var routesAPI = require('./app/routes/MonitoriaApiRoutes');
var routesADM = require('./app/routes/admRoutes'); 

routesAPI(app);
routesADM(app);

app.listen(port);

console.log('Monitoria Ufla RESTful API servindo na porta: ' + port);
