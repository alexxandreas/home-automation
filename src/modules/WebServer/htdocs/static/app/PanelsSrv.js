(function () {
    "use strict";
    angular.module('WebApp')
        .factory('PanelsSrv', PanelsSrv);

    // инициализируем сервис
    //angular.module('WebApp').run(['PanelsSrv', function(ApiSrv) {  }]);
    
    PanelsSrv.$inject = [
        '$http',
        '$rootScope'
    ];
    
    /**
     * events: PanelsSrv.loaded
     */
    function PanelsSrv(
        $http,
        $rootScope
    ) {
        
        
        function reload(){
            return $http.get('/mha/modules/WebServer/api/panels').then(function(response){
                $rootScope.$broadcast('PanelsSrv.loaded', response.data);
                return response.data;
            });
        }
        
        var me = {
            reload: reload
        };
        
        return me;
    }
}());