(function () {
    "use strict";
    angular.module('WebApp')
        .filter('trustAsHtmlFltr', TrustAsHtmlFltr);

   
    TrustAsHtmlFltr.$inject = ['$sce'];
    
    function TrustAsHtmlFltr($sce){
        return function trustAsHtml(value){
            return $sce.trustAsHtml(value);
        }
    }
    
    
}());