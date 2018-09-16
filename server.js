/*
http://localhost:3000/main.html
*/

//Cntl+C to stop server

var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var  app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser

//read routes modules
var routes = require('./routes/index');

//some logger middleware functions
function methodLogger(request, response, next){
		   console.log("LOGIN");
		   console.log("*******************");
		   console.log("METODO: " + request.method);
		   console.log("URL:" + request.url);
		   next();
}
function headerLogger(request, response, next){
		   console.log("Headers:");
           for(k in request.headers) console.log(k);
		   next();
}

//register middleware with dispatcher
//middleware
app.use(routes.authenticate); //authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

//routes
app.get('/main.html', routes.main);
app.get('/agregarPersonas.html', routes.agregarpersonas);
app.get('/uploadToDatabase/*', routes.uploadToDatabase);


//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)}
})
