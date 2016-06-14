var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    router = express.Router(),
    defaults = require('../config/config'),
    Auth = require('./Auth'),
    auth = new Auth(),
    _ = require('lodash'),
    cookieParser = require('cookie-parser'),
    Model = require('./Model'),
    Db = require('./Database'),
    Search = require('./search/Search'),
    search = new Search(),
    cors = require('cors'),
    db = new Db({
        db: mongoose
    });

var Server = function(config) {
    this.config = _.extend(config, defaults);

    this.port = config.port || 3000;
    this.env = config.env || 'dev';
    this.appDefined = !!config.app;
    this.app = config.app || express();

    this.model = new Model(this.config);
    this.go();
};

Server.prototype.go = function() {

    this.model.getModels().then(function (models) {

        db.connect(this.config.database);
        this.app.use(bodyParser.urlencoded({extend: true}));
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(morgan(this.env));
        this.app.use(cors());

        this.app.use('/api/v1', router);
        this.app.use('/', express.static(__dirname + '/../app'));

        this.app.get('/', function (req, res) {
            res.sendFile('/index.html');
        });

        // Include routes
        var routeOptions = {
            router: router,
            models: models,
            auth: auth,
            _search: search, // search is a reserved word
            config: this.config
        };

        // Public routes
        require('./routes/public')(routeOptions);

        // Initialize authorization
        require('./routes/auth')(routeOptions);

        // Private routes
        require('./routes/crud')(routeOptions);
        require('./routes/model')(routeOptions);
        require('./routes/search')(routeOptions);

        if(!this.appDefined) {
            this.app.listen(this.port);
            console.log('REST server listening on port', this.port);
        }

    }.bind(this));
};

module.exports = Server;