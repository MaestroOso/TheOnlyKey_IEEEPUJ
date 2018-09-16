/*
Assignment 4 - Oscar Castelblanco
Based on code provided by prof. Lou Nel
*/

var url = require('url');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/users.db');
var dbInfo = new sqlite3.Database('data/segmentacion.db');
var dbRetos = new sqlite3.Database('data/segmentacion.db');
var dbRetosCumplidos = new sqlite3.Database('data/segmentacion.db');
var dbPremios = new sqlite3.Database('data/segmentacion.db');
var username ="";
var password ="";

exports.authenticate = function (request, response, next){
    /*
	Middleware to do BASIC http 401 authentication
	*/
  var auth = request.headers.authorization;
	if(!auth){
		response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
        response.writeHead(401, {'Content-Type': 'text/html'});
		console.log('No authorization found, send 401.');
 		response.end();
	}
	else{
	    console.log("Authorization Header: " + auth);
        //decode authorization header
        var tmp = auth.split(' ');

		     // create a buffer and tell it the data coming in is base64
        var buf = new Buffer(tmp[1], 'base64');

        // read it back out as a string
		    var plain_auth = buf.toString();
        console.log("Decoded Authorization ", plain_auth);

        //extract the userid and password as separate strings
        var credentials = plain_auth.split(':');      // split on a ':'
        username = credentials[0];
        password = credentials[1];
        console.log("User: ", username);
        console.log("Password: ", password);

		var authorized = false;
		//check database users table for user
		db.all("SELECT ID, PASSWORD FROM VIRTUAL_USER", function(err, rows){
		for(var i=0; i<rows.length; i++){
          console.log("Yo encontre: " + rows[i].ID);
		      if(rows[i].ID == username & rows[i].PASSWORD == password) authorized = true;
		}
		if(authorized == false){
 	 	   //we had an authorization header by the user:password is not valid
		   response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
           response.writeHead(401, {'Content-Type': 'text/html'});
		   console.log('No authorization found, send 401.');
 		   response.end();
		}
        else
		  next();
		});
	}

}
function addHeader(request, response){
        // about.html
        var title = 'Programa de Puntos:';
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('<!DOCTYPE html>');
        response.write('<html><head><title>About</title></head>' + '<body>');
        response.write('<h1>' +  title + '</h1>');
		    response.write('<hr>');
}

function addFooter(request, response){
 		response.write('<hr>');
		response.write('<h3>' +  'Scotia Bank' + '</h3>');
        response.write('</body></html>');

}

/** Function to parse url **/
function parseURL(request, response){
	var parseQuery = true; //parseQueryStringIfTrue
    var slashHost = true; //slashDenoteHostIfTrue
    var urlObj = url.parse(request.url, parseQuery , slashHost );
    console.log('path:');
    console.log(urlObj.path);
    console.log('query:');
    console.log(urlObj.query);
    //for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
	return urlObj;

}

exports.agregarpersonas = function(request, response){
  response.render('agregarpersonas',{
    nombre:"nombre",
  });
}

/* Route of main.html
  Render the index.hbs with the parameters*/
exports.main = function (request, response){
      var usuario_nombre="", usuario_tier="", usuario_experiencia="", usuario_puntosActuales="", usuario_id="", usuario_siguienteTier="";
      var usuario_multiplicador="";
      var query = "SELECT ID, NOMBRE, TIER_ACTUAL, EXPERIENCIA, PUNTOS, GRUPO_ACTUAL, MULTIPLICADOR FROM USUARIO WHERE ID="+username;

      dbInfo.all(query, function(err, rows){

        usuario_nombre = rows[0].NOMBRE;
        usuario_tier = rows[0].TIER_ACTUAL;
        usuario_experiencia = rows[0].EXPERIENCIA;
        usuario_puntosActuales = rows[0].PUNTOS;
        usuario_id = rows[0].ID;
        usuario_siguienteTier =1000 - usuario_puntosActuales;
        usuario_multiplicador = rows[0].MULTIPLICADOR;

        var queryInfoRetoTG = "SELECT NOMBRE, ID, DESCRIPCION, TIPO, NUMERO_TIPO, PUNTOS FROM RETO WHERE "+
        "TIER_ASOCIADO=" +usuario_tier  +" AND GRUPO_ASOCIADO=" + rows[0].GRUPO_ACTUAL + " ORDER BY TIPO DESC";

        console.log("***\n" + queryInfoRetoTG);

        dbRetos.all(queryInfoRetoTG, function(err, rowsRetos){
            var usuario_desafioM1="", usuario_desafioM2="", usuario_desafioM3="", usuario_desafioM4="", usuario_desafioS1="";
            var reto_M1="", reto_M2="", reto_M3="", reto_M4="", reto_S1="";
            var cump_M1="", cump_M2="", cump_M3="", cump_M4="";

            usuario_desafioM1 = rowsRetos[0].NOMBRE;
            usuario_desafioM2 = rowsRetos[1].NOMBRE;
            usuario_desafioM3 = rowsRetos[2].NOMBRE;
            usuario_desafioM4 = rowsRetos[3].NOMBRE;
            usuario_desafioS1 = rowsRetos[4].NOMBRE;
            usuario_desafioM1_DESC = rowsRetos[0].DESCRIPCION;
            usuario_desafioM2_DESC = rowsRetos[1].DESCRIPCION;
            usuario_desafioM3_DESC = rowsRetos[2].DESCRIPCION;
            usuario_desafioM4_DESC = rowsRetos[3].DESCRIPCION;
            usuario_desafioS1_DESC = rowsRetos[4].DESCRIPCION;
            reto_M1 = rowsRetos[0].ID;
            reto_M2 = rowsRetos[1].ID;
            reto_M3= rowsRetos[2].ID;
            reto_M4 = rowsRetos[3].ID;
            reto_S1 = rowsRetos[4].ID;

            var queryInfoRetoCumplido = "SELECT ID_RETO, STATUS FROM RETOS_USUARIO WHERE ID_USUARIO = "+
            usuario_id + " AND (ID_RETO = " + reto_M1 + " OR ID_RETO = "+ reto_M2 + " OR ID_RETO = " +
            reto_M3 + " OR ID_RETO = " + reto_M4 + ") ORDER BY ID_RETO";
            dbRetosCumplidos.all(queryInfoRetoCumplido, function(err, rowsRetosCumplidos){
                var usuario_retosCumplidos = 0;
                console.log(rowsRetosCumplidos[0].STATUS + " " + rowsRetosCumplidos[1].STATUS + " " + rowsRetosCumplidos[2].STATUS + " " + rowsRetosCumplidos[3].STATUS);
                cump_M1 = rowsRetosCumplidos[0].STATUS;
                cump_M2 = rowsRetosCumplidos[1].STATUS;
                cump_M3 = rowsRetosCumplidos[2].STATUS;
                cump_M4 = rowsRetosCumplidos[3].STATUS;
                for(i = 0; i<rowsRetosCumplidos.length; i++){
                  if(rowsRetosCumplidos[i].STATUS == "1"){
                    usuario_retosCumplidos+=25;
                  }
                }

                var queryPremio = "SELECT NOMBRE, DESCRIPCION, IMAGEN FROM PREMIO WHERE "+
                "TIER_ASOCIADO=" +usuario_tier  +" AND GRUPO_ASOCIADO=2 ORDER BY TIER_ASOCIADO DESC";

                dbPremios.all(queryPremio, function(err, rowsPremios){
                  var usuario_premio1="", usuario_premio2="", usuario_premio3="", usuario_premio4="";
                  usuario_premio1 = rowsPremios[0].IMAGEN;
                  usuario_premio2 = rowsPremios[1].IMAGEN;
                  usuario_premio3 = rowsPremios[2].IMAGEN;
                  usuario_premio4 = rowsPremios[3].IMAGEN;
                  response.render('main',
                  {
                    nombre: usuario_nombre,
                    tier: usuario_tier,
                    puntosT: usuario_experiencia,
                    puntosA: usuario_puntosActuales,
                    puntosST: usuario_siguienteTier,
                    Multiplicador: usuario_multiplicador,
                    desafioM1: usuario_desafioM1,
                    desafioM2: usuario_desafioM2,
                    desafioM3: usuario_desafioM3,
                    desafioM4: usuario_desafioM4,
                    desafioM1_DES: usuario_desafioM1_DESC,
                    desafioM2_DES: usuario_desafioM2_DESC,
                    desafioM3_DES: usuario_desafioM3_DESC,
                    desafioM4_DES: usuario_desafioM4_DESC,
                    desafiosS: usuario_desafioS1,
                    desafiosS_DES: usuario_desafioS1_DESC,
                    retosCumplidos: usuario_retosCumplidos,
                    premio_1: usuario_premio1,
                    premio_2: usuario_premio2,
                    premio_3: usuario_premio3,
                    premio_4: usuario_premio4,
                    cumplidoM1: cump_M1,
                    cumplidoM2: cump_M2,
                    cumplidoM3: cump_M3,
                    cumplidoM4: cump_M4,
                  });
                });
            });
        });
     });
}

exports.uploadToDatabase = function(request, response){

	    var urlObj = parseURL(request, response);
      var information = urlObj.path; //expected form: /recipes/235
      console.log(information);

		//   var sql = "SELECT id, recipe_name, spices, contributor, category, description, source, rating, ingredients, directions FROM recipes WHERE id=" + recipeID;
    //     console.log("GET RECIPES DETAILS: " + recipeID );
    //   /*Render the web page with the results*/
		// db.all(sql, function(err, rows){
		//   let recipe = rows[0];
    //
		//   console.log('Recipe Details');
		//   console.log(recipe);
 	      response.render('uploadToDatabase', {title: 'Success:'});
		//});

}
