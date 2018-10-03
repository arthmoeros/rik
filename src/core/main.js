const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ConfigHelper = require('./config-helper');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

let helper = new ConfigHelper();

let customer = helper.getConfig('customer');

// AGREGAR RUTAS
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.use('/api', router);
app.listen(port);