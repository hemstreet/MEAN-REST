var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    port = process.env.PORT || 8080,
    router = express.Router(),
    config = require('./config/config'),
    Auth = require('./lib/Auth.js'),
    auth = new Auth(),
    _ = require('lodash'),
    Model = require('./lib/model.js'),
    modellUtil = new Model(),
    form = require('./lib/form.js');

var BASELIB = __dirname + '/lib';

app.set('models', BASELIB + '/models');

// Models
var _models = modellUtil.getModels();

_models.then(function (models) {
    mongoose.connect(config.database);
    app.use(bodyParser.urlencoded({extend: true}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(morgan('dev'));
    app.use('/', express.static(__dirname + '/app'));
    app.use('/v1/rest', router);

    app.get('/', function (req, res) {
        res.sendFile('/index.html');
    });

    router.route('/authenticate')
        .post(function (req, res) {
            models['User'].findOne({
                    "username": req.body.username
                },
                function (err, user) {
                    if (err) {
                        res.send(err);
                    }

                    if (!user) {
                        res.json({message: "Authentication failed. User not found", success: false});
                    }
                    else if (user) {
                        if (auth.verify(user.password, user.password)) {

                            var token = auth.sign(user);

                            res.send({
                                success: true,
                                message: 'Authentication successful for ' + user.username,
                                token: token
                            });
                        }
                        else {
                            res.send({message: "Authentication failed. Invalid password", success: false});
                        }
                    }
                }
            )
        });

    router.route('/signup')
        .post(function (req, res) {

            var Model = models['User'],
                model = new Model(),
                modelSchema = model.schema.paths,
                token = null;

            _.forEach(Object.keys(modelSchema), function (n) {

                if (n[0] !== '_') {
                    if (req.body[n]) {
                        model[n] = req.body[n];
                    }
                }
            });

            model.password = auth.generateHash(req.body.password);

            model.save(function (err) {
                if (err) {
                    res.send(err);
                }

                token = auth.sign(user);

                res.json({
                    success: true,
                    message: "User Created",
                    model: model,
                    token: token
                });
            })

        });

    router.use(function (req, res, next) {

        console.log(req.cookies[config.token.name]);
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies[config.token.name];

        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Failure to authenticate token'
                    });
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });

    // :model/create
    // :model/edit/:_id
    // :model/update/:_id
    // :model/delete/:_id
    // :model/view/:_id
    // :model/list

    router.route('/:model/:_id')
        .get(function (req, res) {
            var modelName = modellUtil.getModelName(req.params.model);

            models[modelName].findById(req.params._id, function (err, entry) {
                if (err) {
                    res.send(err);
                }

                res.json(entry);
            })
        })
        .put(function (req, res) {
            var modelName = modellUtil.getModelName(req.params.model);

            models[modelName].findById(req.params._id, function (err, entry) {
                if (err) {
                    res.send(err);
                }

                entry.save(function (err) {
                    if (err) {
                        res.send(err);
                    }

                    res.json({
                        success: true,
                        message: model + " Updated",
                        entry: entry
                    });
                })
            })
        })
        .delete(function (req, res) {
            var modelName = modellUtil.getModelName(req.params.model),
                Model = models[modelName];

            Model.findById(req.params._id, function (err, entry) {
                Model.remove({
                    _id: req.params._id
                }, function (err) {
                    if (err) {
                        res.send(err);
                    }

                    res.json({
                        success: true,
                        message: model + " Deleted"
                    });
                });
            });
        });

    router.route('/:model')

        .post(function (req, res) {

            var modelName = modellUtil.getModelName(req.params.model),
                Model = models[modelName];

            var model = new Model(),
                modelSchema = model.schema.paths;

            _.forEach(Object.keys(modelSchema), function (n) {

                if (n[0] !== '_') {
                    if (req.body[n]) {
                        model[n] = req.body[n];
                    }
                }
            });

            model.save(function (err) {
                if (err) {
                    res.send(err);
                }

                res.json({
                    success: true,
                    message: modelName + " Created",
                    model: model
                });
            })
        })

        .get(function (req, res) {
            var modelName = modellUtil.getModelName(req.params.model);

            models[modelName].find(function (err, entries) {
                if (err) {
                    res.send(err);
                }

                res.json(entries);
            });
        });

    app.listen(port);

    console.log('REST server listening on port', port);
});
