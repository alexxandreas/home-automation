
(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ControlPanelAlertCtrl', ControlPanelAlertCtrl);

    ControlPanelAlertCtrl.$inject = [
        '$scope',
        '$mdDialog'
    ];

    function ControlPanelAlertCtrl(
        $scope,
        $mdDialog
    ) {
        
        // $scope.hide = function() {
        //   $mdDialog.hide();
        // };
    
        // $scope.cancel = function() {
        //   $mdDialog.cancel();
        // };
    
        // $scope.answer = function(answer) {
        //   $mdDialog.hide(answer);
        // };
        
        $scope.ok = function(){
            $mdDialog.hide();
        }
        
    }

}());