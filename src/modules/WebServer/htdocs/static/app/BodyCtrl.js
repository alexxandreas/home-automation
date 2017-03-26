(function () {
    "use strict";
    angular.module('WebApp')
        .controller('BodyCtrl', BodyCtrl);

    BodyCtrl.$inject = [
        '$scope',
        'PanelsSrv'
    ];

    function BodyCtrl(
        $scope,
        PanelsSrv
    ) {
        $scope.$on('', function(panels){
            $scope.panels = panels;
        });
        
        PanelsSrv.reload();
        
        //loadPanels();
       
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        // function loadPanels(){
        //     $http.get('/mha/modules/WebServer/api/panels').then(function(response){
        //         $scope.panels = response.data;
        //     }, function(response){
        //         //$q.reject(response);
        //     });
            
        // }
    }

}());