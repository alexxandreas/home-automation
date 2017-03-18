(function () {
    "use strict";
    angular.module('WebApp')
        .controller('BodyCtrl', BodyCtrl);

    BodyCtrl.$inject = [
        '$scope',
        '$http'
    ];

    function BodyCtrl(
        $scope,
        $http
    ) {
        loadPanels();
       
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        function loadPanels(){
            $http.get('/mha/modules/WebApp/api/panels').then(function(response){
                $scope.panels = response.data;
            }, function(response){
                //$q.reject(response);
            });
            
        }
    }

}());