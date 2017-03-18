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
        $scope.panels = [{
            title: '1dfasdf'
        }, {
            title: '2vth`sga'
        }, {
            title: '3aljfa;siof'
        }]
        
        $scope.activePanel = $scope.panels[0];
        
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
    
    
        function loadPanels(){
            $http.get('/mha/modules/WebApp/api/panel').then(function(response){
                var a = response;
                
            }, function(response){
                //$q.reject(response);
            });
            
        }
    }

}());