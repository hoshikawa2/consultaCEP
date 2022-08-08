const express = require('express');
const router = express.Router();
const axios = require("axios");

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
    var client = redis.createClient("6379", "141.148.39.105");
    client.auth("P@ssw0rd");
    client.on('connect', function() {

        //zipkin
        ctxImpl.scoped(() => {
            tracer.recordServiceName('REDIS conectado');
        });

        console.log('REDIS conectado');
    });

    client.get(req.query.cep, function(err, reply) {
        if (reply != null) {

            console.log('Resposta via REDIS');

            //zipkin
            ctxImpl.scoped(() => {
                tracer.recordServiceName('Resposta via REDIS');
            });

            console.log(reply);
            //Canarian OK POD
            res.send(JSON.parse(reply));
            //Canarian NOK POD
            //res.send(reply);
            res.end();

        } else {
            const url = "https://viacep.com.br/ws/" + req.query.cep + "/json/";

            axios.get(url).then(function(resposta) {
                res.send(resposta.data);
                res.end();
                console.log('Consultou VIACEP');
                console.log(resposta.data);

                //zipkin
                ctxImpl.scoped(() => {
                    tracer.recordServiceName('Consultou VIACEP');
                });

                client.set(req.query.cep, JSON.stringify(resposta.data));
            })
        }
    });

});

module.exports = router;
