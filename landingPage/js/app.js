var myApp = angular.module('cetakinapp', ['ngRoute', 'ui.materialize']);

myApp.controller('appCtrl', ['$http','$scope', 'fileUpload', function($http, $scope, fileUpload){
    $scope.done = false;

    var hostsUrl = "testing/hosts.json";
    // var hostsUrl = "http://printtest-1170.appspot.com/API/mvphostlist";
    $http.get(hostsUrl).then(function successCallback(response) {
        $scope.hosts = angular.fromJson(response.data);
    });
    

    $scope.uploadFile = function(){
        var file = $scope.myFile;
        var filetype = file.type;

        if (filetype!="application/pdf") {
            Materialize.toast('File bukan pdf!', 4000);
            return;
        }

        var fd = new FormData();
        if(!$scope.myColor){
            $scope.myColor = "hitam";
        }
        fd.append('file', file);
        fd.append('username',$scope.myName);
        fd.append('pewarnaan',$scope.myColor);
        fd.append('idlokasi',$scope.myLoc);
        fd.append('hp',$scope.myHP);

        var uploadUrl = "testing/upload.php"
        //var uploadUrl = "http://printtest-1170.appspot.com/API/mvpsubmitjob";
        
        var promise = fileUpload.uploadFileToUrl(fd, uploadUrl);
        $scope.loading = true;
        console.log($scope.loading);
        promise.then(function(response) {
	        if(response.success){
        		console.log(response);
	            $scope.done = response.success;
	            $scope.jobId = response.jobId;
	        }
        });        
    };
}]);

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.directive("uploadForm", function () {
    return {
        restrict: 'E',
        templateUrl: "form.html"
    };
});

myApp.directive("infoView", function () {
    return {
        restrict: 'E',
        templateUrl: "info.html"
    };
});

myApp.service('fileUpload', ['$http', '$q', function ($http, $q) {
    this.uploadFileToUrl = function(fd, uploadUrl){
        var deferred = $q.defer();
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function successCallback(rawResponse) {
            var response = angular.fromJson(rawResponse.data);
            deferred.resolve(response);
        }, function errorCallback(response) {
            console.log(response);
            deferred.resolve({status : false});        
        });
        return deferred.promise;
    }
}]);
