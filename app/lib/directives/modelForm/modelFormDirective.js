angular.module('restServer').directive('modelForm', ['httpService', function (httpService) {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            modelData: '=',
            action: '='
        },
        templateUrl: './lib/directives/modelForm/modelForm.html',
        controller: function ($scope) {
            $scope.submitForm = function () {
                var options = {
                    _id: $scope.model._id,
                    modelName: $scope.model.modelName,
                    data: $scope.model.formData
                };

                httpService[$scope.action](options)
                    .then(function(response) {
                        $scope.response = response.data.message;
                    }, function(err) {
                        $scope.response = err
                    });
            };
        }
    }
}]);