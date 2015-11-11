angular.module('restServer').directive('modelList', [function() {
    return {
        restrict: 'E',
        scope: {
            models: '=',
            controller: '=',
            modelName: '='
        },
        templateUrl: './lib/directives/modelList/modelList.html'
    }
}]);