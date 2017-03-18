(function () {
    "use strict";
    angular.module('WebApp')
        .controller('BodyCtrl', BodyCtrl);

    BodyCtrl.$inject = [
        '$scope',
        '$rootScope'
    ];

    function BodyCtrl(
        $scope,
        $rootScope
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
        
    
    }

}());