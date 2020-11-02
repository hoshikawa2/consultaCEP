const express = require('express');
const router = express.Router();
const axios = require("axios");

/* GET CEP */
router.get('/cep', function (req, res, next) {
    const url = "https://viacep.com.br/ws/" + req.query.cep + "/json/";

    axios.get(url).then(function(resposta) {
        res.send(resposta.data);
        res.end();
        console.log(resposta.data);
    })

});

module.exports = router;