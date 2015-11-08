var _ = require('lodash'),
    glob = require('glob'),
    q = require('q');

var Model = function(options) {
    this.modelPath = (options && options.modelPath) ? options.modelPath : __dirname + '/../app/models/';
    this.models = {};

};

Model.prototype.getModelName = function(modelName) {
    return _.capitalize(modelName);
};

Model.prototype.getModels = function() {

    var defer = q.defer();

    // Autoload Models
    glob(this.modelPath + '*', function (err, files) {

        if(err) {
            return err;
        }

        _.forEach(files, function(filePath) {
            var chunks = filePath.split('/'),
                fileName = chunks[chunks.length - 1],
                modelName = fileName.split('.')[0];

            this.models[this.getModelName(modelName)] = require(this.modelPath + modelName);
        }.bind(this));

        defer.resolve(this.models);

    }.bind(this));

    return defer.promise;

};

module.exports = Model;