const express = require('express');
const router = express.Router();
const axios = require("axios");

var redis = require('redis');

/* GET CEP */
router.get('/cep', function (req, res, next) {
    var client = redis.createClient("6379", "129.159.69.133");
    client.auth("P@ssw0rd");
    client.on('connect', function() {
        console.log('REDIS conectado');
    });

    client.get(req.query.cep, function(err, reply) {
        if (reply != null) {
            console.log('Resposta via REDIS');
            console.log(reply);
            res.send(reply);
            res.end();
        } else {
            const url = "https://viacep.com.br/ws/" + req.query.cep + "/json/";

            axios.get(url).then(function(resposta) {
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