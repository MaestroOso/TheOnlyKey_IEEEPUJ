var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/segmentacion.db');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const wml_credentials = new Map();

// NOTE: you must manually construct wml_credentials hash map below using information retrieved
// from your IBM Cloud Watson Machine Learning Service instance

wml_credentials.set("url", "https://us-south.ml.cloud.ibm.com");
wml_credentials.set("username", "1b9e8ad7-39e8-407d-b448-bce0900c4c42");
wml_credentials.set("password", "4f681423-e0fb-46cd-bc07-44a981ea1e5b");

function apiGet(url, username, password, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	const tokenHeader = "Basic " + btoa((username + ":" + password));
	const tokenUrl = url + "/v3/identity/token";

	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("GET", tokenUrl);
	oReq.setRequestHeader("Authorization", tokenHeader);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send();
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}

apiGet(wml_credentials.get("url"),
	wml_credentials.get("username"),
	wml_credentials.get("password"),
	function (res) {
        let parsedGetResponse;
        try {
            parsedGetResponse = JSON.parse(this.responseText);
        } catch(ex) {
            // TODO: handle parsing exception
        }
        if (parsedGetResponse && parsedGetResponse.token) {
            const token = parsedGetResponse.token
            const wmlToken = "Bearer " + token;

            id_usuario = '190290390'; //Id del usuario a actualizar
            arregloDatos = [1, 1, 4, 1]; //Ultimo grupo de compras del usuario
			const payload = '{"fields": ["COMPRA 1", "COMPRA 2", "COMPRA 3", "COMPRA 4"], "values": [' + arregloDatos +']}';
			const scoring_url = "https://us-south.ml.cloud.ibm.com/v3/wml_instances/672d12e7-4c6c-4433-afeb-eb9bfb411bd9/deployments/dd178df6-cbfe-4edb-b6fd-10b405909cc3/online";

            apiPost(scoring_url, wmlToken, payload, function (resp) {
                let parsedPostResponse;
                try {
                    parsedPostResponse = JSON.parse(this.responseText);
                } catch (ex) {
                    // TODO: handle parsing exception
                }
                console.log("Scoring response");
                console.log(parsedPostResponse);

                //INSERTAR A LA BASE DE DATOS
                var queryT = "UPDATE USUARIO SET GRUPO WHERE ID=" + id_usuario +";";
                db.all(queryT, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });

            }, function (error) {
                console.log(error);
            });
        } else {
            console.log("Failed to retrieve Bearer token");
        }
	}, function (err) {
		console.log(err);
	});
