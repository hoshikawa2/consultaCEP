const express = require('express');
const router = express.Router();
const axios = require("axios");
const zipkinInstrumentationAxios = require("zipkin-instrumentation-axios");
const {Annotation, InetAddress} = require('zipkin');

var redis = require('redis');

// Zipkin -----------
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./recorder');

const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'consultaCEP';
const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
router.use(zipkinMiddleware({tracer}));

//-----------

/* GET CEP */
router.get('/cep', function (req, res, next) {
    var client = redis.createClient("6379", "193.122.166.121");
    client.auth("P@ssw0rd");
    client.on('connect', function() {
        console.log('REDIS conectado');
    });

    client.get(req.query.cep, function(err, reply) {
        if (reply != null) {
            //zipkin
            tracer.local('Resposta via REDIS', () => {
                console.log('Resposta via REDIS');
            });
            console.log(reply);
            //Canarian OK POD
            res.send(JSON.parse(reply));
            //Canarian NOK POD
            //res.send(reply);
            res.end();
        } else {
            const url = "https://viacep.com.br/ws/" + req.query.cep + "/json/";

            // Add axios instrumentation
            const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: "Consultou VIACEP" });

            //axios.get(url).then(function(resposta) {
            zipkinAxios.get(url).then(function(resposta) {
                res.send(resposta.data);
                res.end();
                console.log('Consultou VIACEP');
                console.log(resposta.data);

                client.set(req.query.cep, JSON.stringify(resposta.data));
            })
        }
    });

});

module.exports = router;
