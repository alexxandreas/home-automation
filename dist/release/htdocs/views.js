angular.module("Views", []).run(["$templateCache", function($templateCache) {$templateCache.put("/views/DeviceStorage/htdocs/DeviceStorage.html","<div layout=\"column\" layout-align=\"start stretch\"\n    ng-controller=DeviceStorageCtrl>\n    DeviceStorage\n    <div ng-repeat=\"(key, device) in devices\">\n        <span>{{key}}</span>&nbsp;\n        <span>{{device.id}}</span>&nbsp;\n        <span>{{device.level}}</span>&nbsp;\n        <span>{{device.lastLevelChange}}</span>&nbsp;\n    </div>\n</div>");}]);