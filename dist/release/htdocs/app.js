angular
	.module('WebApp', [
		'ngMaterial',
		'md.data.table',
		'Views'
	])
	/*.config(function($mdIconProvider) {
		$mdIconProvider
			.defaultIconSet('img/icons/sets/core-icons.svg', 24);
	});*/
	.config(function($mdIconProvider) {
		//$mdIconProvider.defaultFontSet('md', 'material-icons');
		//$mdIconProvider.fontSet('md', 'material-icons');
		$mdIconProvider.defaultIconSet('static/core-icons.svg', 24);
		//$mdIconProvider.fontSet('md', 'Material Icons')
		//	.defaultFontSet( 'md' );
		//$mdIconProvider.iconSet('social', 'img/icons/sets/social-icons.svg', 24);
		//$mdIconProvider.defaultIconSet('img/icons/sets/core-icons.svg', 24);
		//$mdIconProvider.fontSet('md', 'MaterialDesign-Webfont-master/fonts/materialdesignicons-webfont.woff2');
	});
	
	//.config(config)
	//.run(['smConfSrv', function (smConfSrv) {
	//	var config = window.appConfig;
	//	smConfSrv.set(config);
	//}]);

//config.$inject = ['$logProvider', '$locationProvider'];

/*function config($logProvider, $locationProvider) {
	$logProvider.debugEnabled(false);

	$locationProvider.html5Mode({enabled : true, requireBase: false});
	$locationProvider.hashPrefix('!');
}*/


(function () {
    "use strict";
    angular.module('WebApp')
        .controller('ControlPanelCtrl', ControlPanelCtrl);

    ControlPanelCtrl.$inject = [
        '$scope',
        '$rootScope',
        '$http',
        '$timeout',
        '$window',
        '$sce',
        '$mdDialog',
        'ControlPanelSrv'
    ];

    function ControlPanelCtrl(
        $scope,
        $rootScope,
        $http,
        $timeout,
        $window,
        $sce,
        $mdDialog,
        ControlPanelSrv
    ) {
        $scope.modules = {};
        
        
        
        //var reloadTimeout;
        $scope.reload = function(){
            ControlPanelSrv.reload().then(function(data){
                Object.keys(data).forEach(function(name){
                    $scope.modules[name] = angular.extend($scope.modules[name] || {}, data[name]);
                });
            })
        }
        
        
        $scope.getValueButtonClass = function(device){
            if (device.level === 0 || device.level.toString().toLowerCase() === 'off')
                return 'redButon';
            else if (device.level === 99 || device.level.toString().toLowerCase() === 'on')
                return 'greenButon';
            return 'yellowButon';
        };
        
        $scope.start = function(module){
            ControlPanelSrv
                .start(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.stop = function(module){
            ControlPanelSrv
                .stop(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.restart = function(module){
            ControlPanelSrv
                .restart(module.name)
                .then(function(data){}, function(){})
                .finally(function(){
                    $scope.reload();
                });
        };
        
        $scope.showStart = function(module){
            return !module.loaded;
        };
        
        $scope.showStop = function(module){
            return !!module.created;
        };
        
        $scope.showRestart = function(module){
            return !!module.created;
        };
        
        $scope.update = function(){
            ControlPanelSrv
                .sysUpdate()
                .then(function(data){
                    console.log(data);
                    $scope.showAlert('Обновление', data.updateResult[1]);
                }, function(response){
                    
                })
        };
        
        $scope.updateReload = function(){
            $scope.showWait();
            ControlPanelSrv
                .sysUpdateReload()
                .then(function(data){
                    $scope.hideWait();
                    console.log(data);
                    
                    $scope.showAlert('Обновление', 
                        'Обновление:\n' + 
                        data.updateResult[1] + 
                        '\n\nПерезагруженные модули:\n' + 
                        data.reloadResult.join(', ')
                    )
                    .then(function(){
                        $scope.showWait();
                        $window.location.reload();
                    });
                }, function(response){
                    $scope.hideWait();
                })
                
        };
        
        $scope.showAlert = function(title, message){
            //message = message.replace('\n', '<br>');
            // return $mdDialog.show(
            //     $mdDialog.alert()
            //         .parent(angular.element(document.querySelector('body')))
            //         .clickOutsideToClose(false)
            //         //.title(title)
            //         //.textContent(message)
            //         //.ok('OK')
                    
                    
            //         //controller: DialogController,
            //         .templateUrl: 'ControlPanelAlert.html'
            //         //parent: angular.element(document.body),
            //         //targetEvent: ev,
            //         //clickOutsideToClose:true,
            //         //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            // );
            return $mdDialog.show({
                //controller: DialogController,
                templateUrl: '/views/ControlPanel/htdocs/ControlPanelAlert.html',
                parent: angular.element(document.querySelector('body')),
                //targetEvent: ev,
                clickOutsideToClose:false,
                locals: {
                    title: title,
                    message: $sce.trustAsHtml('<pre><code>'+message+'</code></pre>')
                },
                controller: DialogController
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm b
            })
            
            function DialogController($scope, $mdDialog, title, message) {
                $scope.title = title;
                $scope.message = message;
                $scope.ok = function() {
                  $mdDialog.hide();
                }
              }
        }
        
        $scope.showWait = function(){
            $mdDialog.show({
                // controller: 'waitCtrl',
                controller: waitCtrl,
                template: '<md-dialog style="background-color:transparent;box-shadow:none">' +
                            '<div layout="row" layout-sm="column" layout-align="center center" aria-label="wait">' +
                                '<md-progress-circular md-mode="indeterminate" ></md-progress-circular>' +
                            '</div>' +
                         '</md-dialog>',
                parent: angular.element(document.body),
                clickOutsideToClose:false,
                fullscreen: false
            })
            .then(function(answer) {
            
            });
            
            function waitCtrl($rootScope, $mdDialog) {
                $rootScope.$on("hide_wait", function (event, args) {
                    $mdDialog.cancel();
                });
            }
          
        }
   
        $scope.hideWait = function(){
            $rootScope.$emit("hide_wait"); 
        }
        
        $scope.reload();
        
        
    }

}());
(function () {
    "use strict";
    angular.module('WebApp')
        .factory('ControlPanelSrv', ControlPanelSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['ControlPanelSrv', function(ApiSrv) {  }]);
    
    ControlPanelSrv.$inject = [
        '$http',
        'PanelsSrv'
    ];
    
    function ControlPanelSrv(
        $http,
        PanelsSrv
    ) {
        
        
        function reload(){
            return $http.get('modules/ControlPanel/api/modules').then(function(response){
                return response.data;
            });
        }
        
        function start(name){
            return $http.get('modules/ControlPanel/api/modules/'+name+'/start').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function stop(name){
            return $http.get('modules/ControlPanel/api/modules/'+name+'/stop').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function restart(name){
            return $http.get('modules/ControlPanel/api/modules/'+name+'/restart').then(function(response){
                return response.data;
            }).finally(function(){
                PanelsSrv.reload();
            });
        }
        
        function sysUpdate(){
            return $http.get('modules/ControlPanel/api/update').then(function(response){
                return response.data;
            });
        }
        
        function sysUpdateReload(){
            return $http.get('modules/ControlPanel/api/updateReload').then(function(response){
                return response.data;
            });
        }
        
        var me = {
            reload: reload,
            start: start, 
            stop: stop,
            restart: restart,
            sysUpdate: sysUpdate,
            sysUpdateReload: sysUpdateReload
        };
        
        return me;
    }
}());
(function () {
    "use strict";
    angular.module('WebApp')
        .controller('DeviceStorageCtrl', DeviceStorageCtrl);

    DeviceStorageCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        'DeviceStorageSrv'
    ];

    function DeviceStorageCtrl(
        $scope,
        $http,
        $timeout,
        DeviceStorageSrv
    ) {
        $scope.allDevices = {};
        
        $scope.devices = {};
        //$interval(reload, 1000);
        reload();
        
        
        var reloadTimeout;
        function reload(){
            DeviceStorageSrv.reload().then(function(data){
                data.forEach(function(dev){
                    $scope.allDevices[dev.key] = $scope.allDevices[dev.key] || {};
                    angular.extend($scope.allDevices[dev.key], dev);
                });
                $scope.devices = $scope.allDevices;
            }).finally(function(){
                if (!$scope.$$destroyed) 
                    reloadTimeout = $timeout(reload, 1000);
            })
        }
        
        $scope.getValueButtonClass = function(device){
            if (device.level === 0 || device.level.toString().toLowerCase() === 'off')
                return 'redButon';
            else if (device.level === 99 || device.level.toString().toLowerCase() === 'on')
                return 'greenButon';
            return 'yellowButon';
        }
        
        $scope.formatTime = function(ms){
            var sec = Math.round(ms/1000);
            var min = Math.trunc(sec / 60);
            var hour = Math.trunc(min / 60);
            var day = Math.trunc(hour / 24);
            var text = '';
            if (day > 0 || text) text += day + 'd ';
            if (hour > 0 || text) text += (hour % 24) + 'h ';
            if (min > 0 || text) text += (min % 60) + 'm ';
            if (sec > 0 || text) text += (sec % 60) + 's';
            return text;
        }
        
        $scope.$on("$destroy", function() {
            if (reloadTimeout) {
                $timeout.cancel(reloadTimeout);
            }
        });
        
    }

}());
(function () {
    "use strict";
    angular.module('WebApp')
        .factory('DeviceStorageSrv', DeviceStorageSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['DeviceStorageSrv', function(ApiSrv) {  }]);
    
    DeviceStorageSrv.$inject = [
        '$http',
    ];
    
    function DeviceStorageSrv(
        $http
    ) {
        
        
        function reload(){
            return $http.get('modules/DeviceStorage/api/state').then(function(response){
                return response.data;
            });
        }
        
        var me = {
            reload: reload
        };
        
        return me;
    }
}());
(function () {
    "use strict";
    angular.module('WebApp')
        .controller('RemoteConsoleCtrl', RemoteConsoleCtrl);

    RemoteConsoleCtrl.$inject = [
        '$scope',
        '$http',
        '$timeout',
        'RemoteConsoleSrv'
    ];

    function RemoteConsoleCtrl(
        $scope,
        $http,
        $timeout,
        RemoteConsoleSrv
    ) {
        
        $scope.input = "(function(){\n\n})()";
        $scope.output = "";
        $scope.status = "";
        
        RemoteConsoleSrv.getHistory().then(function(history){
            if (history.length > 0)
                $scope.input = history[history.length-1];
        });
        
        var time;
        
        $scope.keyUp = function(event){
            if (event.which==13 && event.ctrlKey) $scope.run();
        }
        
        $scope.run = function(){
            
            time = new Date().getTime();
            $scope.status = 'running...';
        	//var tnode = document.getElementById("JStiming");
            //tnode.innerHTML = "running...";
        	
            //var code = document.getElementById("JSprogram").value;
            RemoteConsoleSrv.run($scope.input).then(function(data){
                $scope.output = data;
            }, function(response){ })
            .finally(function(){
                $scope.status = ""+(new Date().getTime()-time)/1000 + ' sec';
            });
            
        	
        }
        
    }

}());


(function () {
    "use strict";
    angular.module('WebApp')
        .factory('RemoteConsoleSrv', RemoteConsoleSrv);


    // инициализируем сервис
    //angular.module('WebApp').run(['RemoteConsoleSrv', function(ApiSrv) {  }]);
    
    RemoteConsoleSrv.$inject = [
        '$http',
        '$q'
    ];
    
    function RemoteConsoleSrv(
        $http,
        $q
    ) {
        
        var history = [];
        var historyLoaded = false;
        
        function run(str){
            return $http.get('modules/RemoteConsole/api/eval/' + str).then(function(response){
                var data = JSON.stringify(response.data, null, '  ');
                history.push({
                    src: str,
                    result: data
                });
                return data;
            }, function(response){
                var data = JSON.stringify(response && response.data || response, null, '  ');
                history.push({
                    src: str,
                    result: data
                }); 
                return data;
            });
        }
        
        
        function getHistory(){
            return $q(function(resolve, reject){
                if (historyLoaded){
                    resolve(history);
                } else {
                    $http.get('modules/RemoteConsole/api/history').then(function(response){
                        history = response.data;
                        historyLoaded = true;
                        resolve(history);
                    }, function(response){
                       historyLoaded = true;
                       resolve(history);
                    })
                }
            })
        }
        
        var me = {
            run: run,
            getHistory: getHistory
        };
        
        return me;
    }
}());
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
        $scope.panels = [];
        
        $scope.$on('PanelsSrv.loaded', function(event, panels){
            $scope.panels = panels;
            if ($scope.activePanel && !$scope.panels.some(function(panel){ 
                return panel.key == $scope.activePanel.key;
            })) {
                $scope.activePanel = null;
            }
        });
        
        PanelsSrv.reload();
        
        //loadPanels();
       
        $scope.openPanel = function(panel){
            $scope.activePanel = panel;
        }
        
        // function loadPanels(){
        //     $http.get('modules/WebServer/api/panels').then(function(response){
        //         $scope.panels = response.data;
        //     }, function(response){
        //         //$q.reject(response);
        //     });
            
        // }
    }

}());
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
            return $http.get('modules/WebServer/api/panels').then(function(response){
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
/*! @license Copyright 2014 Dan Vanderkam (danvdk@gmail.com) MIT-licensed (http://opensource.org/licenses/MIT) */
!function(t){"use strict";for(var e,a,i={},r=function(){},n="memory".split(","),o="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");e=n.pop();)t[e]=t[e]||i;for(;a=o.pop();)t[a]=t[a]||r}(this.console=this.console||{}),function(){"use strict";CanvasRenderingContext2D.prototype.installPattern=function(t){if("undefined"!=typeof this.isPatternInstalled)throw"Must un-install old line pattern before installing a new one.";this.isPatternInstalled=!0;var e=[0,0],a=[],i=this.beginPath,r=this.lineTo,n=this.moveTo,o=this.stroke;this.uninstallPattern=function(){this.beginPath=i,this.lineTo=r,this.moveTo=n,this.stroke=o,this.uninstallPattern=void 0,this.isPatternInstalled=void 0},this.beginPath=function(){a=[],i.call(this)},this.moveTo=function(t,e){a.push([[t,e]]),n.call(this,t,e)},this.lineTo=function(t,e){var i=a[a.length-1];i.push([t,e])},this.stroke=function(){if(0===a.length)return void o.call(this);for(var i=0;i<a.length;i++)for(var s=a[i],l=s[0][0],h=s[0][1],p=1;p<s.length;p++){var g=s[p][0],d=s[p][1];this.save();var u=g-l,c=d-h,y=Math.sqrt(u*u+c*c),_=Math.atan2(c,u);this.translate(l,h),n.call(this,0,0),this.rotate(_);for(var v=e[0],f=0;y>f;){var x=t[v];f+=e[1]?e[1]:x,f>y?(e=[v,f-y],f=y):e=[(v+1)%t.length,0],v%2===0?r.call(this,f,0):n.call(this,f,0),v=(v+1)%t.length}this.restore(),l=g,h=d}o.call(this),a=[]}},CanvasRenderingContext2D.prototype.uninstallPattern=function(){throw"Must install a line pattern before uninstalling it."}}();var DygraphOptions=function(){return function(){"use strict";var t=function(t){this.dygraph_=t,this.yAxes_=[],this.xAxis_={},this.series_={},this.global_=this.dygraph_.attrs_,this.user_=this.dygraph_.user_attrs_||{},this.labels_=[],this.highlightSeries_=this.get("highlightSeriesOpts")||{},this.reparseSeries()};t.AXIS_STRING_MAPPINGS_={y:0,Y:0,y1:0,Y1:0,y2:1,Y2:1},t.axisToIndex_=function(e){if("string"==typeof e){if(t.AXIS_STRING_MAPPINGS_.hasOwnProperty(e))return t.AXIS_STRING_MAPPINGS_[e];throw"Unknown axis : "+e}if("number"==typeof e){if(0===e||1===e)return e;throw"Dygraphs only supports two y-axes, indexed from 0-1."}if(e)throw"Unknown axis : "+e;return 0},t.prototype.reparseSeries=function(){var e=this.get("labels");if(e){this.labels_=e.slice(1),this.yAxes_=[{series:[],options:{}}],this.xAxis_={options:{}},this.series_={};var a=!this.user_.series;if(a){for(var i=0,r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.user_[n]||{},s=0,l=o.axis;"object"==typeof l&&(s=++i,this.yAxes_[s]={series:[n],options:l}),l||this.yAxes_[0].series.push(n),this.series_[n]={idx:r,yAxis:s,options:o}}for(var r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.series_[n].options,l=o.axis;if("string"==typeof l){if(!this.series_.hasOwnProperty(l))return void console.error("Series "+n+" wants to share a y-axis with series "+l+", which does not define its own axis.");var s=this.series_[l].yAxis;this.series_[n].yAxis=s,this.yAxes_[s].series.push(n)}}}else for(var r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.user_.series[n]||{},s=t.axisToIndex_(o.axis);this.series_[n]={idx:r,yAxis:s,options:o},this.yAxes_[s]?this.yAxes_[s].series.push(n):this.yAxes_[s]={series:[n],options:{}}}var h=this.user_.axes||{};Dygraph.update(this.yAxes_[0].options,h.y||{}),this.yAxes_.length>1&&Dygraph.update(this.yAxes_[1].options,h.y2||{}),Dygraph.update(this.xAxis_.options,h.x||{})}},t.prototype.get=function(t){var e=this.getGlobalUser_(t);return null!==e?e:this.getGlobalDefault_(t)},t.prototype.getGlobalUser_=function(t){return this.user_.hasOwnProperty(t)?this.user_[t]:null},t.prototype.getGlobalDefault_=function(t){return this.global_.hasOwnProperty(t)?this.global_[t]:Dygraph.DEFAULT_ATTRS.hasOwnProperty(t)?Dygraph.DEFAULT_ATTRS[t]:null},t.prototype.getForAxis=function(t,e){var a,i;if("number"==typeof e)a=e,i=0===a?"y":"y2";else{if("y1"==e&&(e="y"),"y"==e)a=0;else if("y2"==e)a=1;else{if("x"!=e)throw"Unknown axis "+e;a=-1}i=e}var r=-1==a?this.xAxis_:this.yAxes_[a];if(r){var n=r.options;if(n.hasOwnProperty(t))return n[t]}if("x"!==e||"logscale"!==t){var o=this.getGlobalUser_(t);if(null!==o)return o}var s=Dygraph.DEFAULT_ATTRS.axes[i];return s.hasOwnProperty(t)?s[t]:this.getGlobalDefault_(t)},t.prototype.getForSeries=function(t,e){if(e===this.dygraph_.getHighlightSeries()&&this.highlightSeries_.hasOwnProperty(t))return this.highlightSeries_[t];if(!this.series_.hasOwnProperty(e))throw"Unknown series: "+e;var a=this.series_[e],i=a.options;return i.hasOwnProperty(t)?i[t]:this.getForAxis(t,a.yAxis)},t.prototype.numAxes=function(){return this.yAxes_.length},t.prototype.axisForSeries=function(t){return this.series_[t].yAxis},t.prototype.axisOptions=function(t){return this.yAxes_[t].options},t.prototype.seriesForAxis=function(t){return this.yAxes_[t].series},t.prototype.seriesNames=function(){return this.labels_};return t}()}(),DygraphLayout=function(){"use strict";var t=function(t){this.dygraph_=t,this.points=[],this.setNames=[],this.annotations=[],this.yAxes_=null,this.xTicks_=null,this.yTicks_=null};return t.prototype.addDataset=function(t,e){this.points.push(e),this.setNames.push(t)},t.prototype.getPlotArea=function(){return this.area_},t.prototype.computePlotArea=function(){var t={x:0,y:0};t.w=this.dygraph_.width_-t.x-this.dygraph_.getOption("rightGap"),t.h=this.dygraph_.height_;var e={chart_div:this.dygraph_.graphDiv,reserveSpaceLeft:function(e){var a={x:t.x,y:t.y,w:e,h:t.h};return t.x+=e,t.w-=e,a},reserveSpaceRight:function(e){var a={x:t.x+t.w-e,y:t.y,w:e,h:t.h};return t.w-=e,a},reserveSpaceTop:function(e){var a={x:t.x,y:t.y,w:t.w,h:e};return t.y+=e,t.h-=e,a},reserveSpaceBottom:function(e){var a={x:t.x,y:t.y+t.h-e,w:t.w,h:e};return t.h-=e,a},chartRect:function(){return{x:t.x,y:t.y,w:t.w,h:t.h}}};this.dygraph_.cascadeEvents_("layout",e),this.area_=t},t.prototype.setAnnotations=function(t){this.annotations=[];for(var e=this.dygraph_.getOption("xValueParser")||function(t){return t},a=0;a<t.length;a++){var i={};if(!t[a].xval&&void 0===t[a].x)return void console.error("Annotations must have an 'x' property");if(t[a].icon&&(!t[a].hasOwnProperty("width")||!t[a].hasOwnProperty("height")))return void console.error("Must set width and height when setting annotation.icon property");Dygraph.update(i,t[a]),i.xval||(i.xval=e(i.x)),this.annotations.push(i)}},t.prototype.setXTicks=function(t){this.xTicks_=t},t.prototype.setYAxes=function(t){this.yAxes_=t},t.prototype.evaluate=function(){this._xAxis={},this._evaluateLimits(),this._evaluateLineCharts(),this._evaluateLineTicks(),this._evaluateAnnotations()},t.prototype._evaluateLimits=function(){var t=this.dygraph_.xAxisRange();this._xAxis.minval=t[0],this._xAxis.maxval=t[1];var e=t[1]-t[0];this._xAxis.scale=0!==e?1/e:1,this.dygraph_.getOptionForAxis("logscale","x")&&(this._xAxis.xlogrange=Dygraph.log10(this._xAxis.maxval)-Dygraph.log10(this._xAxis.minval),this._xAxis.xlogscale=0!==this._xAxis.xlogrange?1/this._xAxis.xlogrange:1);for(var a=0;a<this.yAxes_.length;a++){var i=this.yAxes_[a];i.minyval=i.computedValueRange[0],i.maxyval=i.computedValueRange[1],i.yrange=i.maxyval-i.minyval,i.yscale=0!==i.yrange?1/i.yrange:1,this.dygraph_.getOption("logscale")&&(i.ylogrange=Dygraph.log10(i.maxyval)-Dygraph.log10(i.minyval),i.ylogscale=0!==i.ylogrange?1/i.ylogrange:1,(!isFinite(i.ylogrange)||isNaN(i.ylogrange))&&console.error("axis "+a+" of graph at "+i.g+" can't be displayed in log scale for range ["+i.minyval+" - "+i.maxyval+"]"))}},t.calcXNormal_=function(t,e,a){return a?(Dygraph.log10(t)-Dygraph.log10(e.minval))*e.xlogscale:(t-e.minval)*e.scale},t.calcYNormal_=function(t,e,a){if(a){var i=1-(Dygraph.log10(e)-Dygraph.log10(t.minyval))*t.ylogscale;return isFinite(i)?i:0/0}return 1-(e-t.minyval)*t.yscale},t.prototype._evaluateLineCharts=function(){for(var e=this.dygraph_.getOption("stackedGraph"),a=this.dygraph_.getOptionForAxis("logscale","x"),i=0;i<this.points.length;i++){for(var r=this.points[i],n=this.setNames[i],o=this.dygraph_.getOption("connectSeparatedPoints",n),s=this.dygraph_.axisPropertiesForSeries(n),l=this.dygraph_.attributes_.getForSeries("logscale",n),h=0;h<r.length;h++){var p=r[h];p.x=t.calcXNormal_(p.xval,this._xAxis,a);var g=p.yval;e&&(p.y_stacked=t.calcYNormal_(s,p.yval_stacked,l),null===g||isNaN(g)||(g=p.yval_stacked)),null===g&&(g=0/0,o||(p.yval=0/0)),p.y=t.calcYNormal_(s,g,l)}this.dygraph_.dataHandler_.onLineEvaluated(r,s,l)}},t.prototype._evaluateLineTicks=function(){var t,e,a,i;for(this.xticks=[],t=0;t<this.xTicks_.length;t++)e=this.xTicks_[t],a=e.label,i=this.dygraph_.toPercentXCoord(e.v),i>=0&&1>i&&this.xticks.push([i,a]);for(this.yticks=[],t=0;t<this.yAxes_.length;t++)for(var r=this.yAxes_[t],n=0;n<r.ticks.length;n++)e=r.ticks[n],a=e.label,i=this.dygraph_.toPercentYCoord(e.v,t),i>0&&1>=i&&this.yticks.push([t,i,a])},t.prototype._evaluateAnnotations=function(){var t,e={};for(t=0;t<this.annotations.length;t++){var a=this.annotations[t];e[a.xval+","+a.series]=a}if(this.annotated_points=[],this.annotations&&this.annotations.length)for(var i=0;i<this.points.length;i++){var r=this.points[i];for(t=0;t<r.length;t++){var n=r[t],o=n.xval+","+n.name;o in e&&(n.annotation=e[o],this.annotated_points.push(n))}}},t.prototype.removeAllDatasets=function(){delete this.points,delete this.setNames,delete this.setPointsLengths,delete this.setPointsOffsets,this.points=[],this.setNames=[],this.setPointsLengths=[],this.setPointsOffsets=[]},t}(),DygraphCanvasRenderer=function(){"use strict";var t=function(t,e,a,i){if(this.dygraph_=t,this.layout=i,this.element=e,this.elementContext=a,this.height=t.height_,this.width=t.width_,!this.isIE&&!Dygraph.isCanvasSupported(this.element))throw"Canvas is not supported.";if(this.area=i.getPlotArea(),this.dygraph_.isUsingExcanvas_)this._createIEClipArea();else if(!Dygraph.isAndroid()){var r=this.dygraph_.canvas_ctx_;r.beginPath(),r.rect(this.area.x,this.area.y,this.area.w,this.area.h),r.clip(),r=this.dygraph_.hidden_ctx_,r.beginPath(),r.rect(this.area.x,this.area.y,this.area.w,this.area.h),r.clip()}};return t.prototype.clear=function(){var t;if(this.isIE)try{this.clearDelay&&(this.clearDelay.cancel(),this.clearDelay=null),t=this.elementContext}catch(e){return}t=this.elementContext,t.clearRect(0,0,this.width,this.height)},t.prototype.render=function(){this._updatePoints(),this._renderLineChart()},t.prototype._createIEClipArea=function(){function t(t){if(0!==t.w&&0!==t.h){var i=document.createElement("div");i.className=e,i.style.backgroundColor=r,i.style.position="absolute",i.style.left=t.x+"px",i.style.top=t.y+"px",i.style.width=t.w+"px",i.style.height=t.h+"px",a.appendChild(i)}}for(var e="dygraph-clip-div",a=this.dygraph_.graphDiv,i=a.childNodes.length-1;i>=0;i--)a.childNodes[i].className==e&&a.removeChild(a.childNodes[i]);for(var r=document.bgColor,n=this.dygraph_.graphDiv;n!=document;){var o=n.currentStyle.backgroundColor;if(o&&"transparent"!=o){r=o;break}n=n.parentNode}var s=this.area;t({x:0,y:0,w:s.x,h:this.height}),t({x:s.x,y:0,w:this.width-s.x,h:s.y}),t({x:s.x+s.w,y:0,w:this.width-s.x-s.w,h:this.height}),t({x:s.x,y:s.y+s.h,w:this.width-s.x,h:this.height-s.h-s.y})},t._getIteratorPredicate=function(e){return e?t._predicateThatSkipsEmptyPoints:null},t._predicateThatSkipsEmptyPoints=function(t,e){return null!==t[e].yval},t._drawStyledLine=function(e,a,i,r,n,o,s){var l=e.dygraph,h=l.getBooleanOption("stepPlot",e.setName);Dygraph.isArrayLike(r)||(r=null);var p=l.getBooleanOption("drawGapEdgePoints",e.setName),g=e.points,d=e.setName,u=Dygraph.createIterator(g,0,g.length,t._getIteratorPredicate(l.getBooleanOption("connectSeparatedPoints",d))),c=r&&r.length>=2,y=e.drawingContext;y.save(),c&&y.installPattern(r);var _=t._drawSeries(e,u,i,s,n,p,h,a);t._drawPointsOnLine(e,_,o,a,s),c&&y.uninstallPattern(),y.restore()},t._drawSeries=function(t,e,a,i,r,n,o,s){var l,h,p=null,g=null,d=null,u=[],c=!0,y=t.drawingContext;y.beginPath(),y.strokeStyle=s,y.lineWidth=a;for(var _=e.array_,v=e.end_,f=e.predicate_,x=e.start_;v>x;x++){if(h=_[x],f){for(;v>x&&!f(_,x);)x++;if(x==v)break;h=_[x]}if(null===h.canvasy||h.canvasy!=h.canvasy)o&&null!==p&&(y.moveTo(p,g),y.lineTo(h.canvasx,g)),p=g=null;else{if(l=!1,n||!p){e.nextIdx_=x,e.next(),d=e.hasNext?e.peek.canvasy:null;var m=null===d||d!=d;l=!p&&m,n&&(!c&&!p||e.hasNext&&m)&&(l=!0)}null!==p?a&&(o&&(y.moveTo(p,g),y.lineTo(h.canvasx,g)),y.lineTo(h.canvasx,h.canvasy)):y.moveTo(h.canvasx,h.canvasy),(r||l)&&u.push([h.canvasx,h.canvasy,h.idx]),p=h.canvasx,g=h.canvasy}c=!1}return y.stroke(),u},t._drawPointsOnLine=function(t,e,a,i,r){for(var n=t.drawingContext,o=0;o<e.length;o++){var s=e[o];n.save(),a.call(t.dygraph,t.dygraph,t.setName,n,s[0],s[1],i,r,s[2]),n.restore()}},t.prototype._updatePoints=function(){for(var t=this.layout.points,e=t.length;e--;)for(var a=t[e],i=a.length;i--;){var r=a[i];r.canvasx=this.area.w*r.x+this.area.x,r.canvasy=this.area.h*r.y+this.area.y}},t.prototype._renderLineChart=function(t,e){var a,i,r=e||this.elementContext,n=this.layout.points,o=this.layout.setNames;this.colors=this.dygraph_.colorsMap_;var s=this.dygraph_.getOption("plotter"),l=s;Dygraph.isArrayLike(l)||(l=[l]);var h={};for(a=0;a<o.length;a++){i=o[a];var p=this.dygraph_.getOption("plotter",i);p!=s&&(h[i]=p)}for(a=0;a<l.length;a++)for(var g=l[a],d=a==l.length-1,u=0;u<n.length;u++)if(i=o[u],!t||i==t){var c=n[u],y=g;if(i in h){if(!d)continue;y=h[i]}var _=this.colors[i],v=this.dygraph_.getOption("strokeWidth",i);r.save(),r.strokeStyle=_,r.lineWidth=v,y({points:c,setName:i,drawingContext:r,color:_,strokeWidth:v,dygraph:this.dygraph_,axis:this.dygraph_.axisPropertiesForSeries(i),plotArea:this.area,seriesIndex:u,seriesCount:n.length,singleSeriesName:t,allSeriesPoints:n}),r.restore()}},t._Plotters={linePlotter:function(e){t._linePlotter(e)},fillPlotter:function(e){t._fillPlotter(e)},errorPlotter:function(e){t._errorPlotter(e)}},t._linePlotter=function(e){var a=e.dygraph,i=e.setName,r=e.strokeWidth,n=a.getNumericOption("strokeBorderWidth",i),o=a.getOption("drawPointCallback",i)||Dygraph.Circles.DEFAULT,s=a.getOption("strokePattern",i),l=a.getBooleanOption("drawPoints",i),h=a.getNumericOption("pointSize",i);n&&r&&t._drawStyledLine(e,a.getOption("strokeBorderColor",i),r+2*n,s,l,o,h),t._drawStyledLine(e,e.color,r,s,l,o,h)},t._errorPlotter=function(e){var a=e.dygraph,i=e.setName,r=a.getBooleanOption("errorBars")||a.getBooleanOption("customBars");if(r){var n=a.getBooleanOption("fillGraph",i);n&&console.warn("Can't use fillGraph option with error bars");var o,s=e.drawingContext,l=e.color,h=a.getNumericOption("fillAlpha",i),p=a.getBooleanOption("stepPlot",i),g=e.points,d=Dygraph.createIterator(g,0,g.length,t._getIteratorPredicate(a.getBooleanOption("connectSeparatedPoints",i))),u=0/0,c=0/0,y=[-1,-1],_=Dygraph.toRGB_(l),v="rgba("+_.r+","+_.g+","+_.b+","+h+")";s.fillStyle=v,s.beginPath();for(var f=function(t){return null===t||void 0===t||isNaN(t)};d.hasNext;){var x=d.next();!p&&f(x.y)||p&&!isNaN(c)&&f(c)?u=0/0:(o=[x.y_bottom,x.y_top],p&&(c=x.y),isNaN(o[0])&&(o[0]=x.y),isNaN(o[1])&&(o[1]=x.y),o[0]=e.plotArea.h*o[0]+e.plotArea.y,o[1]=e.plotArea.h*o[1]+e.plotArea.y,isNaN(u)||(p?(s.moveTo(u,y[0]),s.lineTo(x.canvasx,y[0]),s.lineTo(x.canvasx,y[1])):(s.moveTo(u,y[0]),s.lineTo(x.canvasx,o[0]),s.lineTo(x.canvasx,o[1])),s.lineTo(u,y[1]),s.closePath()),y=o,u=x.canvasx)}s.fill()}},t._fastCanvasProxy=function(t){var e=[],a=null,i=null,r=1,n=2,o=0,s=function(t){if(!(e.length<=1)){for(var a=e.length-1;a>0;a--){var i=e[a];if(i[0]==n){var o=e[a-1];o[1]==i[1]&&o[2]==i[2]&&e.splice(a,1)}}for(var a=0;a<e.length-1;){var i=e[a];i[0]==n&&e[a+1][0]==n?e.splice(a,1):a++}if(e.length>2&&!t){var s=0;e[0][0]==n&&s++;for(var l=null,h=null,a=s;a<e.length;a++){var i=e[a];if(i[0]==r)if(null===l&&null===h)l=a,h=a;else{var p=i[2];p<e[l][2]?l=a:p>e[h][2]&&(h=a)}}var g=e[l],d=e[h];e.splice(s,e.length-s),h>l?(e.push(g),e.push(d)):l>h?(e.push(d),e.push(g)):e.push(g)}}},l=function(a){s(a);for(var l=0,h=e.length;h>l;l++){var p=e[l];p[0]==r?t.lineTo(p[1],p[2]):p[0]==n&&t.moveTo(p[1],p[2])}e.length&&(i=e[e.length-1][1]),o+=e.length,e=[]},h=function(t,r,n){var o=Math.round(r);if(null===a||o!=a){var s=a-i>1,h=o-a>1,p=s||h;l(p),a=o}e.push([t,r,n])};return{moveTo:function(t,e){h(n,t,e)},lineTo:function(t,e){h(r,t,e)},stroke:function(){l(!0),t.stroke()},fill:function(){l(!0),t.fill()},beginPath:function(){l(!0),t.beginPath()},closePath:function(){l(!0),t.closePath()},_count:function(){return o}}},t._fillPlotter=function(e){if(!e.singleSeriesName&&0===e.seriesIndex){for(var a=e.dygraph,i=a.getLabels().slice(1),r=i.length;r>=0;r--)a.visibility()[r]||i.splice(r,1);var n=function(){for(var t=0;t<i.length;t++)if(a.getBooleanOption("fillGraph",i[t]))return!0;return!1}();if(n)for(var o,s,l=e.plotArea,h=e.allSeriesPoints,p=h.length,g=a.getNumericOption("fillAlpha"),d=a.getBooleanOption("stackedGraph"),u=a.getColors(),c={},y=function(t,e,a,i){if(t.lineTo(e,a),d)for(var r=i.length-1;r>=0;r--){var n=i[r];t.lineTo(n[0],n[1])}},_=p-1;_>=0;_--){var v=e.drawingContext,f=i[_];if(a.getBooleanOption("fillGraph",f)){var x=a.getBooleanOption("stepPlot",f),m=u[_],D=a.axisPropertiesForSeries(f),w=1+D.minyval*D.yscale;0>w?w=0:w>1&&(w=1),w=l.h*w+l.y;var A,b=h[_],T=Dygraph.createIterator(b,0,b.length,t._getIteratorPredicate(a.getBooleanOption("connectSeparatedPoints",f))),E=0/0,C=[-1,-1],L=Dygraph.toRGB_(m),P="rgba("+L.r+","+L.g+","+L.b+","+g+")";v.fillStyle=P,v.beginPath();var S,O=!0;(b.length>2*a.width_||Dygraph.FORCE_FAST_PROXY)&&(v=t._fastCanvasProxy(v));for(var M,R=[];T.hasNext;)if(M=T.next(),Dygraph.isOK(M.y)||x){if(d){if(!O&&S==M.xval)continue;O=!1,S=M.xval,o=c[M.canvasx];var F;F=void 0===o?w:s?o[0]:o,A=[M.canvasy,F],x?-1===C[0]?c[M.canvasx]=[M.canvasy,w]:c[M.canvasx]=[M.canvasy,C[0]]:c[M.canvasx]=M.canvasy}else A=isNaN(M.canvasy)&&x?[l.y+l.h,w]:[M.canvasy,w];isNaN(E)?(v.moveTo(M.canvasx,A[1]),v.lineTo(M.canvasx,A[0])):(x?(v.lineTo(M.canvasx,C[0]),v.lineTo(M.canvasx,A[0])):v.lineTo(M.canvasx,A[0]),d&&(R.push([E,C[1]]),R.push(s&&o?[M.canvasx,o[1]]:[M.canvasx,A[1]]))),C=A,E=M.canvasx}else y(v,E,C[1],R),R=[],E=0/0,null===M.y_stacked||isNaN(M.y_stacked)||(c[M.canvasx]=l.h*M.y_stacked+l.y);s=x,A&&M&&(y(v,M.canvasx,A[1],R),R=[]),v.fill()}}}},t}(),Dygraph=function(){"use strict";var t=function(t,e,a,i){this.is_initial_draw_=!0,this.readyFns_=[],void 0!==i?(console.warn("Using deprecated four-argument dygraph constructor"),this.__old_init__(t,e,a,i)):this.__init__(t,e,a)};return t.NAME="Dygraph",t.VERSION="1.1.1",t.__repr__=function(){return"["+t.NAME+" "+t.VERSION+"]"},t.toString=function(){return t.__repr__()},t.DEFAULT_ROLL_PERIOD=1,t.DEFAULT_WIDTH=480,t.DEFAULT_HEIGHT=320,t.ANIMATION_STEPS=12,t.ANIMATION_DURATION=200,t.KMB_LABELS=["K","M","B","T","Q"],t.KMG2_BIG_LABELS=["k","M","G","T","P","E","Z","Y"],t.KMG2_SMALL_LABELS=["m","u","n","p","f","a","z","y"],t.numberValueFormatter=function(e,a){var i=a("sigFigs");if(null!==i)return t.floatFormat(e,i);var r,n=a("digitsAfterDecimal"),o=a("maxNumberWidth"),s=a("labelsKMB"),l=a("labelsKMG2");if(r=0!==e&&(Math.abs(e)>=Math.pow(10,o)||Math.abs(e)<Math.pow(10,-n))?e.toExponential(n):""+t.round_(e,n),s||l){var h,p=[],g=[];s&&(h=1e3,p=t.KMB_LABELS),l&&(s&&console.warn("Setting both labelsKMB and labelsKMG2. Pick one!"),h=1024,p=t.KMG2_BIG_LABELS,g=t.KMG2_SMALL_LABELS);for(var d=Math.abs(e),u=t.pow(h,p.length),c=p.length-1;c>=0;c--,u/=h)if(d>=u){r=t.round_(e/u,n)+p[c];break}if(l){var y=String(e.toExponential()).split("e-");2===y.length&&y[1]>=3&&y[1]<=24&&(r=y[1]%3>0?t.round_(y[0]/t.pow(10,y[1]%3),n):Number(y[0]).toFixed(2),r+=g[Math.floor(y[1]/3)-1])}}return r},t.numberAxisLabelFormatter=function(e,a,i){return t.numberValueFormatter.call(this,e,i)},t.SHORT_MONTH_NAMES_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],t.dateAxisLabelFormatter=function(e,a,i){var r=i("labelsUTC"),n=r?t.DateAccessorsUTC:t.DateAccessorsLocal,o=n.getFullYear(e),s=n.getMonth(e),l=n.getDate(e),h=n.getHours(e),p=n.getMinutes(e),g=n.getSeconds(e),d=n.getSeconds(e);if(a>=t.DECADAL)return""+o;if(a>=t.MONTHLY)return t.SHORT_MONTH_NAMES_[s]+"&#160;"+o;var u=3600*h+60*p+g+.001*d;return 0===u||a>=t.DAILY?t.zeropad(l)+"&#160;"+t.SHORT_MONTH_NAMES_[s]:t.hmsString_(h,p,g)},t.dateAxisFormatter=t.dateAxisLabelFormatter,t.dateValueFormatter=function(e,a){return t.dateString_(e,a("labelsUTC"))},t.Plotters=DygraphCanvasRenderer._Plotters,t.DEFAULT_ATTRS={highlightCircleSize:3,highlightSeriesOpts:null,highlightSeriesBackgroundAlpha:.5,labelsDivWidth:250,labelsDivStyles:{},labelsSeparateLines:!1,labelsShowZeroValues:!0,labelsKMB:!1,labelsKMG2:!1,showLabelsOnHighlight:!0,digitsAfterDecimal:2,maxNumberWidth:6,sigFigs:null,strokeWidth:1,strokeBorderWidth:0,strokeBorderColor:"white",axisTickSize:3,axisLabelFontSize:14,rightGap:5,showRoller:!1,xValueParser:t.dateParser,delimiter:",",sigma:2,errorBars:!1,fractions:!1,wilsonInterval:!0,customBars:!1,fillGraph:!1,fillAlpha:.15,connectSeparatedPoints:!1,stackedGraph:!1,stackedGraphNaNFill:"all",hideOverlayOnMouseOut:!0,legend:"onmouseover",stepPlot:!1,avoidMinZero:!1,xRangePad:0,yRangePad:null,drawAxesAtZero:!1,titleHeight:28,xLabelHeight:18,yLabelWidth:18,drawXAxis:!0,drawYAxis:!0,axisLineColor:"black",axisLineWidth:.3,gridLineWidth:.3,axisLabelColor:"black",axisLabelWidth:50,drawYGrid:!0,drawXGrid:!0,gridLineColor:"rgb(128,128,128)",interactionModel:null,animatedZooms:!1,showRangeSelector:!1,rangeSelectorHeight:40,rangeSelectorPlotStrokeColor:"#808FAB",rangeSelectorPlotFillColor:"#A7B1C4",showInRangeSelector:null,plotter:[t.Plotters.fillPlotter,t.Plotters.errorPlotter,t.Plotters.linePlotter],plugins:[],axes:{x:{pixelsPerLabel:70,axisLabelWidth:60,axisLabelFormatter:t.dateAxisLabelFormatter,valueFormatter:t.dateValueFormatter,drawGrid:!0,drawAxis:!0,independentTicks:!0,ticker:null},y:{axisLabelWidth:50,pixelsPerLabel:30,valueFormatter:t.numberValueFormatter,axisLabelFormatter:t.numberAxisLabelFormatter,drawGrid:!0,drawAxis:!0,independentTicks:!0,ticker:null},y2:{axisLabelWidth:50,pixelsPerLabel:30,valueFormatter:t.numberValueFormatter,axisLabelFormatter:t.numberAxisLabelFormatter,drawAxis:!0,drawGrid:!1,independentTicks:!1,ticker:null}}},t.HORIZONTAL=1,t.VERTICAL=2,t.PLUGINS=[],t.addedAnnotationCSS=!1,t.prototype.__old_init__=function(e,a,i,r){if(null!==i){for(var n=["Date"],o=0;o<i.length;o++)n.push(i[o]);t.update(r,{labels:n})}this.__init__(e,a,r)},t.prototype.__init__=function(e,a,i){if(/MSIE/.test(navigator.userAgent)&&!window.opera&&"undefined"!=typeof G_vmlCanvasManager&&"complete"!=document.readyState){var r=this;return void setTimeout(function(){r.__init__(e,a,i)},100)}if((null===i||void 0===i)&&(i={}),i=t.mapLegacyOptions_(i),"string"==typeof e&&(e=document.getElementById(e)),!e)return void console.error("Constructing dygraph with a non-existent div!");this.isUsingExcanvas_="undefined"!=typeof G_vmlCanvasManager,this.maindiv_=e,this.file_=a,this.rollPeriod_=i.rollPeriod||t.DEFAULT_ROLL_PERIOD,this.previousVerticalX_=-1,this.fractions_=i.fractions||!1,this.dateWindow_=i.dateWindow||null,this.annotations_=[],this.zoomed_x_=!1,this.zoomed_y_=!1,e.innerHTML="",""===e.style.width&&i.width&&(e.style.width=i.width+"px"),""===e.style.height&&i.height&&(e.style.height=i.height+"px"),""===e.style.height&&0===e.clientHeight&&(e.style.height=t.DEFAULT_HEIGHT+"px",""===e.style.width&&(e.style.width=t.DEFAULT_WIDTH+"px")),this.width_=e.clientWidth||i.width||0,this.height_=e.clientHeight||i.height||0,i.stackedGraph&&(i.fillGraph=!0),this.user_attrs_={},t.update(this.user_attrs_,i),this.attrs_={},t.updateDeep(this.attrs_,t.DEFAULT_ATTRS),this.boundaryIds_=[],this.setIndexByName_={},this.datasetIndex_=[],this.registeredEvents_=[],this.eventListeners_={},this.attributes_=new DygraphOptions(this),this.createInterface_(),this.plugins_=[];for(var n=t.PLUGINS.concat(this.getOption("plugins")),o=0;o<n.length;o++){var s,l=n[o];s="undefined"!=typeof l.activate?l:new l;var h={plugin:s,events:{},options:{},pluginOptions:{}},p=s.activate(this);for(var g in p)p.hasOwnProperty(g)&&(h.events[g]=p[g]);this.plugins_.push(h)}for(var o=0;o<this.plugins_.length;o++){var d=this.plugins_[o];for(var g in d.events)if(d.events.hasOwnProperty(g)){var u=d.events[g],c=[d.plugin,u];g in this.eventListeners_?this.eventListeners_[g].push(c):this.eventListeners_[g]=[c]}}this.createDragInterface_(),this.start_()},t.prototype.cascadeEvents_=function(e,a){if(!(e in this.eventListeners_))return!1;var i={dygraph:this,cancelable:!1,defaultPrevented:!1,preventDefault:function(){if(!i.cancelable)throw"Cannot call preventDefault on non-cancelable event.";i.defaultPrevented=!0},propagationStopped:!1,stopPropagation:function(){i.propagationStopped=!0}};t.update(i,a);var r=this.eventListeners_[e];if(r)for(var n=r.length-1;n>=0;n--){var o=r[n][0],s=r[n][1];if(s.call(o,i),i.propagationStopped)break}return i.defaultPrevented},t.prototype.getPluginInstance_=function(t){for(var e=0;e<this.plugins_.length;e++){var a=this.plugins_[e];if(a.plugin instanceof t)return a.plugin}return null},t.prototype.isZoomed=function(t){if(null===t||void 0===t)return this.zoomed_x_||this.zoomed_y_;if("x"===t)return this.zoomed_x_;if("y"===t)return this.zoomed_y_;throw"axis parameter is ["+t+"] must be null, 'x' or 'y'."},t.prototype.toString=function(){var t=this.maindiv_,e=t&&t.id?t.id:t;return"[Dygraph "+e+"]"},t.prototype.attr_=function(t,e){return e?this.attributes_.getForSeries(t,e):this.attributes_.get(t)},t.prototype.getOption=function(t,e){return this.attr_(t,e)},t.prototype.getNumericOption=function(t,e){return this.getOption(t,e)},t.prototype.getStringOption=function(t,e){return this.getOption(t,e)},t.prototype.getBooleanOption=function(t,e){return this.getOption(t,e)},t.prototype.getFunctionOption=function(t,e){return this.getOption(t,e)},t.prototype.getOptionForAxis=function(t,e){return this.attributes_.getForAxis(t,e)},t.prototype.optionsViewForAxis_=function(t){var e=this;return function(a){var i=e.user_attrs_.axes;return i&&i[t]&&i[t].hasOwnProperty(a)?i[t][a]:"x"===t&&"logscale"===a?!1:"undefined"!=typeof e.user_attrs_[a]?e.user_attrs_[a]:(i=e.attrs_.axes,i&&i[t]&&i[t].hasOwnProperty(a)?i[t][a]:"y"==t&&e.axes_[0].hasOwnProperty(a)?e.axes_[0][a]:"y2"==t&&e.axes_[1].hasOwnProperty(a)?e.axes_[1][a]:e.attr_(a))}},t.prototype.rollPeriod=function(){return this.rollPeriod_},t.prototype.xAxisRange=function(){return this.dateWindow_?this.dateWindow_:this.xAxisExtremes()},t.prototype.xAxisExtremes=function(){var t=this.getNumericOption("xRangePad")/this.plotter_.area.w;if(0===this.numRows())return[0-t,1+t];var e=this.rawData_[0][0],a=this.rawData_[this.rawData_.length-1][0];if(t){var i=a-e;e-=i*t,a+=i*t}return[e,a]},t.prototype.yAxisRange=function(t){if("undefined"==typeof t&&(t=0),0>t||t>=this.axes_.length)return null;var e=this.axes_[t];return[e.computedValueRange[0],e.computedValueRange[1]]},t.prototype.yAxisRanges=function(){for(var t=[],e=0;e<this.axes_.length;e++)t.push(this.yAxisRange(e));return t},t.prototype.toDomCoords=function(t,e,a){return[this.toDomXCoord(t),this.toDomYCoord(e,a)]},t.prototype.toDomXCoord=function(t){if(null===t)return null;var e=this.plotter_.area,a=this.xAxisRange();return e.x+(t-a[0])/(a[1]-a[0])*e.w},t.prototype.toDomYCoord=function(t,e){var a=this.toPercentYCoord(t,e);if(null===a)return null;var i=this.plotter_.area;return i.y+a*i.h},t.prototype.toDataCoords=function(t,e,a){return[this.toDataXCoord(t),this.toDataYCoord(e,a)]},t.prototype.toDataXCoord=function(e){if(null===e)return null;var a=this.plotter_.area,i=this.xAxisRange();if(this.attributes_.getForAxis("logscale","x")){var r=(e-a.x)/a.w,n=t.log10(i[0]),o=t.log10(i[1]),s=n+r*(o-n),l=Math.pow(t.LOG_SCALE,s);return l}return i[0]+(e-a.x)/a.w*(i[1]-i[0])},t.prototype.toDataYCoord=function(e,a){if(null===e)return null;var i=this.plotter_.area,r=this.yAxisRange(a);if("undefined"==typeof a&&(a=0),this.attributes_.getForAxis("logscale",a)){var n=(e-i.y)/i.h,o=t.log10(r[0]),s=t.log10(r[1]),l=s-n*(s-o),h=Math.pow(t.LOG_SCALE,l);return h}return r[0]+(i.y+i.h-e)/i.h*(r[1]-r[0])},t.prototype.toPercentYCoord=function(e,a){if(null===e)return null;"undefined"==typeof a&&(a=0);var i,r=this.yAxisRange(a),n=this.attributes_.getForAxis("logscale",a);if(n){var o=t.log10(r[0]),s=t.log10(r[1]);i=(s-t.log10(e))/(s-o)}else i=(r[1]-e)/(r[1]-r[0]);return i},t.prototype.toPercentXCoord=function(e){if(null===e)return null;var a,i=this.xAxisRange(),r=this.attributes_.getForAxis("logscale","x");if(r===!0){var n=t.log10(i[0]),o=t.log10(i[1]);a=(t.log10(e)-n)/(o-n)}else a=(e-i[0])/(i[1]-i[0]);return a},t.prototype.numColumns=function(){return this.rawData_?this.rawData_[0]?this.rawData_[0].length:this.attr_("labels").length:0},t.prototype.numRows=function(){return this.rawData_?this.rawData_.length:0},t.prototype.getValue=function(t,e){return 0>t||t>this.rawData_.length?null:0>e||e>this.rawData_[t].length?null:this.rawData_[t][e]},t.prototype.createInterface_=function(){var e=this.maindiv_;this.graphDiv=document.createElement("div"),this.graphDiv.style.textAlign="left",this.graphDiv.style.position="relative",e.appendChild(this.graphDiv),this.canvas_=t.createCanvas(),this.canvas_.style.position="absolute",this.hidden_=this.createPlotKitCanvas_(this.canvas_),this.canvas_ctx_=t.getContext(this.canvas_),this.hidden_ctx_=t.getContext(this.hidden_),this.resizeElements_(),this.graphDiv.appendChild(this.hidden_),this.graphDiv.appendChild(this.canvas_),this.mouseEventElement_=this.createMouseEventElement_(),this.layout_=new DygraphLayout(this);var a=this;this.mouseMoveHandler_=function(t){a.mouseMove_(t)},this.mouseOutHandler_=function(e){var i=e.target||e.fromElement,r=e.relatedTarget||e.toElement;t.isNodeContainedBy(i,a.graphDiv)&&!t.isNodeContainedBy(r,a.graphDiv)&&a.mouseOut_(e)},this.addAndTrackEvent(window,"mouseout",this.mouseOutHandler_),this.addAndTrackEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_),this.resizeHandler_||(this.resizeHandler_=function(t){a.resize()},this.addAndTrackEvent(window,"resize",this.resizeHandler_))},t.prototype.resizeElements_=function(){this.graphDiv.style.width=this.width_+"px",this.graphDiv.style.height=this.height_+"px";var e=t.getContextPixelRatio(this.canvas_ctx_);this.canvas_.width=this.width_*e,this.canvas_.height=this.height_*e,this.canvas_.style.width=this.width_+"px",this.canvas_.style.height=this.height_+"px",1!==e&&this.canvas_ctx_.scale(e,e);var a=t.getContextPixelRatio(this.hidden_ctx_);this.hidden_.width=this.width_*a,this.hidden_.height=this.height_*a,this.hidden_.style.width=this.width_+"px",this.hidden_.style.height=this.height_+"px",1!==a&&this.hidden_ctx_.scale(a,a)},t.prototype.destroy=function(){this.canvas_ctx_.restore(),this.hidden_ctx_.restore();for(var e=this.plugins_.length-1;e>=0;e--){var a=this.plugins_.pop();a.plugin.destroy&&a.plugin.destroy()}var i=function(t){for(;t.hasChildNodes();)i(t.firstChild),t.removeChild(t.firstChild)};this.removeTrackedEvents_(),t.removeEvent(window,"mouseout",this.mouseOutHandler_),t.removeEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_),t.removeEvent(window,"resize",this.resizeHandler_),this.resizeHandler_=null,i(this.maindiv_);var r=function(t){for(var e in t)"object"==typeof t[e]&&(t[e]=null)};r(this.layout_),r(this.plotter_),r(this)},t.prototype.createPlotKitCanvas_=function(e){var a=t.createCanvas();return a.style.position="absolute",a.style.top=e.style.top,a.style.left=e.style.left,a.width=this.width_,a.height=this.height_,a.style.width=this.width_+"px",a.style.height=this.height_+"px",a},t.prototype.createMouseEventElement_=function(){if(this.isUsingExcanvas_){var t=document.createElement("div");return t.style.position="absolute",t.style.backgroundColor="white",t.style.filter="alpha(opacity=0)",t.style.width=this.width_+"px",t.style.height=this.height_+"px",this.graphDiv.appendChild(t),t}return this.canvas_},t.prototype.setColors_=function(){var e=this.getLabels(),a=e.length-1;this.colors_=[],this.colorsMap_={};for(var i=this.getNumericOption("colorSaturation")||1,r=this.getNumericOption("colorValue")||.5,n=Math.ceil(a/2),o=this.getOption("colors"),s=this.visibility(),l=0;a>l;l++)if(s[l]){
var h=e[l+1],p=this.attributes_.getForSeries("color",h);if(!p)if(o)p=o[l%o.length];else{var g=l%2?n+(l+1)/2:Math.ceil((l+1)/2),d=1*g/(1+a);p=t.hsvToRGB(d,i,r)}this.colors_.push(p),this.colorsMap_[h]=p}},t.prototype.getColors=function(){return this.colors_},t.prototype.getPropertiesForSeries=function(t){for(var e=-1,a=this.getLabels(),i=1;i<a.length;i++)if(a[i]==t){e=i;break}return-1==e?null:{name:t,column:e,visible:this.visibility()[e-1],color:this.colorsMap_[t],axis:1+this.attributes_.axisForSeries(t)}},t.prototype.createRollInterface_=function(){this.roller_||(this.roller_=document.createElement("input"),this.roller_.type="text",this.roller_.style.display="none",this.graphDiv.appendChild(this.roller_));var t=this.getBooleanOption("showRoller")?"block":"none",e=this.plotter_.area,a={position:"absolute",zIndex:10,top:e.y+e.h-25+"px",left:e.x+1+"px",display:t};this.roller_.size="2",this.roller_.value=this.rollPeriod_;for(var i in a)a.hasOwnProperty(i)&&(this.roller_.style[i]=a[i]);var r=this;this.roller_.onchange=function(){r.adjustRoll(r.roller_.value)}},t.prototype.createDragInterface_=function(){var e={isZooming:!1,isPanning:!1,is2DPan:!1,dragStartX:null,dragStartY:null,dragEndX:null,dragEndY:null,dragDirection:null,prevEndX:null,prevEndY:null,prevDragDirection:null,cancelNextDblclick:!1,initialLeftmostDate:null,xUnitsPerPixel:null,dateRange:null,px:0,py:0,boundedDates:null,boundedValues:null,tarp:new t.IFrameTarp,initializeMouseDown:function(e,a,i){e.preventDefault?e.preventDefault():(e.returnValue=!1,e.cancelBubble=!0);var r=t.findPos(a.canvas_);i.px=r.x,i.py=r.y,i.dragStartX=t.dragGetX_(e,i),i.dragStartY=t.dragGetY_(e,i),i.cancelNextDblclick=!1,i.tarp.cover()},destroy:function(){var t=this;if((t.isZooming||t.isPanning)&&(t.isZooming=!1,t.dragStartX=null,t.dragStartY=null),t.isPanning){t.isPanning=!1,t.draggingDate=null,t.dateRange=null;for(var e=0;e<i.axes_.length;e++)delete i.axes_[e].draggingValue,delete i.axes_[e].dragValueRange}t.tarp.uncover()}},a=this.getOption("interactionModel"),i=this,r=function(t){return function(a){t(a,i,e)}};for(var n in a)a.hasOwnProperty(n)&&this.addAndTrackEvent(this.mouseEventElement_,n,r(a[n]));if(!a.willDestroyContextMyself){var o=function(t){e.destroy()};this.addAndTrackEvent(document,"mouseup",o)}},t.prototype.drawZoomRect_=function(e,a,i,r,n,o,s,l){var h=this.canvas_ctx_;o==t.HORIZONTAL?h.clearRect(Math.min(a,s),this.layout_.getPlotArea().y,Math.abs(a-s),this.layout_.getPlotArea().h):o==t.VERTICAL&&h.clearRect(this.layout_.getPlotArea().x,Math.min(r,l),this.layout_.getPlotArea().w,Math.abs(r-l)),e==t.HORIZONTAL?i&&a&&(h.fillStyle="rgba(128,128,128,0.33)",h.fillRect(Math.min(a,i),this.layout_.getPlotArea().y,Math.abs(i-a),this.layout_.getPlotArea().h)):e==t.VERTICAL&&n&&r&&(h.fillStyle="rgba(128,128,128,0.33)",h.fillRect(this.layout_.getPlotArea().x,Math.min(r,n),this.layout_.getPlotArea().w,Math.abs(n-r))),this.isUsingExcanvas_&&(this.currentZoomRectArgs_=[e,a,i,r,n,0,0,0])},t.prototype.clearZoomRect_=function(){this.currentZoomRectArgs_=null,this.canvas_ctx_.clearRect(0,0,this.width_,this.height_)},t.prototype.doZoomX_=function(t,e){this.currentZoomRectArgs_=null;var a=this.toDataXCoord(t),i=this.toDataXCoord(e);this.doZoomXDates_(a,i)},t.prototype.doZoomXDates_=function(t,e){var a=this.xAxisRange(),i=[t,e];this.zoomed_x_=!0;var r=this;this.doAnimatedZoom(a,i,null,null,function(){r.getFunctionOption("zoomCallback")&&r.getFunctionOption("zoomCallback").call(r,t,e,r.yAxisRanges())})},t.prototype.doZoomY_=function(t,e){this.currentZoomRectArgs_=null;for(var a=this.yAxisRanges(),i=[],r=0;r<this.axes_.length;r++){var n=this.toDataYCoord(t,r),o=this.toDataYCoord(e,r);i.push([o,n])}this.zoomed_y_=!0;var s=this;this.doAnimatedZoom(null,null,a,i,function(){if(s.getFunctionOption("zoomCallback")){var t=s.xAxisRange();s.getFunctionOption("zoomCallback").call(s,t[0],t[1],s.yAxisRanges())}})},t.zoomAnimationFunction=function(t,e){var a=1.5;return(1-Math.pow(a,-t))/(1-Math.pow(a,-e))},t.prototype.resetZoom=function(){var t=!1,e=!1,a=!1;null!==this.dateWindow_&&(t=!0,e=!0);for(var i=0;i<this.axes_.length;i++)"undefined"!=typeof this.axes_[i].valueWindow&&null!==this.axes_[i].valueWindow&&(t=!0,a=!0);if(this.clearSelection(),t){this.zoomed_x_=!1,this.zoomed_y_=!1;var r=this.rawData_[0][0],n=this.rawData_[this.rawData_.length-1][0];if(!this.getBooleanOption("animatedZooms")){for(this.dateWindow_=null,i=0;i<this.axes_.length;i++)null!==this.axes_[i].valueWindow&&delete this.axes_[i].valueWindow;return this.drawGraph_(),void(this.getFunctionOption("zoomCallback")&&this.getFunctionOption("zoomCallback").call(this,r,n,this.yAxisRanges()))}var o=null,s=null,l=null,h=null;if(e&&(o=this.xAxisRange(),s=[r,n]),a){l=this.yAxisRanges();var p=this.gatherDatasets_(this.rolledSeries_,null),g=p.extremes;for(this.computeYAxisRanges_(g),h=[],i=0;i<this.axes_.length;i++){var d=this.axes_[i];h.push(null!==d.valueRange&&void 0!==d.valueRange?d.valueRange:d.extremeRange)}}var u=this;this.doAnimatedZoom(o,s,l,h,function(){u.dateWindow_=null;for(var t=0;t<u.axes_.length;t++)null!==u.axes_[t].valueWindow&&delete u.axes_[t].valueWindow;u.getFunctionOption("zoomCallback")&&u.getFunctionOption("zoomCallback").call(u,r,n,u.yAxisRanges())})}},t.prototype.doAnimatedZoom=function(e,a,i,r,n){var o,s,l=this.getBooleanOption("animatedZooms")?t.ANIMATION_STEPS:1,h=[],p=[];if(null!==e&&null!==a)for(o=1;l>=o;o++)s=t.zoomAnimationFunction(o,l),h[o-1]=[e[0]*(1-s)+s*a[0],e[1]*(1-s)+s*a[1]];if(null!==i&&null!==r)for(o=1;l>=o;o++){s=t.zoomAnimationFunction(o,l);for(var g=[],d=0;d<this.axes_.length;d++)g.push([i[d][0]*(1-s)+s*r[d][0],i[d][1]*(1-s)+s*r[d][1]]);p[o-1]=g}var u=this;t.repeatAndCleanup(function(t){if(p.length)for(var e=0;e<u.axes_.length;e++){var a=p[t][e];u.axes_[e].valueWindow=[a[0],a[1]]}h.length&&(u.dateWindow_=h[t]),u.drawGraph_()},l,t.ANIMATION_DURATION/l,n)},t.prototype.getArea=function(){return this.plotter_.area},t.prototype.eventToDomCoords=function(e){if(e.offsetX&&e.offsetY)return[e.offsetX,e.offsetY];var a=t.findPos(this.mouseEventElement_),i=t.pageX(e)-a.x,r=t.pageY(e)-a.y;return[i,r]},t.prototype.findClosestRow=function(e){for(var a=1/0,i=-1,r=this.layout_.points,n=0;n<r.length;n++)for(var o=r[n],s=o.length,l=0;s>l;l++){var h=o[l];if(t.isValidPoint(h,!0)){var p=Math.abs(h.canvasx-e);a>p&&(a=p,i=h.idx)}}return i},t.prototype.findClosestPoint=function(e,a){for(var i,r,n,o,s,l,h,p=1/0,g=this.layout_.points.length-1;g>=0;--g)for(var d=this.layout_.points[g],u=0;u<d.length;++u)o=d[u],t.isValidPoint(o)&&(r=o.canvasx-e,n=o.canvasy-a,i=r*r+n*n,p>i&&(p=i,s=o,l=g,h=o.idx));var c=this.layout_.setNames[l];return{row:h,seriesName:c,point:s}},t.prototype.findStackedPoint=function(e,a){for(var i,r,n=this.findClosestRow(e),o=0;o<this.layout_.points.length;++o){var s=this.getLeftBoundary_(o),l=n-s,h=this.layout_.points[o];if(!(l>=h.length)){var p=h[l];if(t.isValidPoint(p)){var g=p.canvasy;if(e>p.canvasx&&l+1<h.length){var d=h[l+1];if(t.isValidPoint(d)){var u=d.canvasx-p.canvasx;if(u>0){var c=(e-p.canvasx)/u;g+=c*(d.canvasy-p.canvasy)}}}else if(e<p.canvasx&&l>0){var y=h[l-1];if(t.isValidPoint(y)){var u=p.canvasx-y.canvasx;if(u>0){var c=(p.canvasx-e)/u;g+=c*(y.canvasy-p.canvasy)}}}(0===o||a>g)&&(i=p,r=o)}}}var _=this.layout_.setNames[r];return{row:n,seriesName:_,point:i}},t.prototype.mouseMove_=function(t){var e=this.layout_.points;if(void 0!==e&&null!==e){var a=this.eventToDomCoords(t),i=a[0],r=a[1],n=this.getOption("highlightSeriesOpts"),o=!1;if(n&&!this.isSeriesLocked()){var s;s=this.getBooleanOption("stackedGraph")?this.findStackedPoint(i,r):this.findClosestPoint(i,r),o=this.setSelection(s.row,s.seriesName)}else{var l=this.findClosestRow(i);o=this.setSelection(l)}var h=this.getFunctionOption("highlightCallback");h&&o&&h.call(this,t,this.lastx_,this.selPoints_,this.lastRow_,this.highlightSet_)}},t.prototype.getLeftBoundary_=function(t){if(this.boundaryIds_[t])return this.boundaryIds_[t][0];for(var e=0;e<this.boundaryIds_.length;e++)if(void 0!==this.boundaryIds_[e])return this.boundaryIds_[e][0];return 0},t.prototype.animateSelection_=function(e){var a=10,i=30;void 0===this.fadeLevel&&(this.fadeLevel=0),void 0===this.animateId&&(this.animateId=0);var r=this.fadeLevel,n=0>e?r:a-r;if(0>=n)return void(this.fadeLevel&&this.updateSelection_(1));var o=++this.animateId,s=this;t.repeatAndCleanup(function(t){s.animateId==o&&(s.fadeLevel+=e,0===s.fadeLevel?s.clearSelection():s.updateSelection_(s.fadeLevel/a))},n,i,function(){})},t.prototype.updateSelection_=function(e){this.cascadeEvents_("select",{selectedRow:this.lastRow_,selectedX:this.lastx_,selectedPoints:this.selPoints_});var a,i=this.canvas_ctx_;if(this.getOption("highlightSeriesOpts")){i.clearRect(0,0,this.width_,this.height_);var r=1-this.getNumericOption("highlightSeriesBackgroundAlpha");if(r){var n=!0;if(n){if(void 0===e)return void this.animateSelection_(1);r*=e}i.fillStyle="rgba(255,255,255,"+r+")",i.fillRect(0,0,this.width_,this.height_)}this.plotter_._renderLineChart(this.highlightSet_,i)}else if(this.previousVerticalX_>=0){var o=0,s=this.attr_("labels");for(a=1;a<s.length;a++){var l=this.getNumericOption("highlightCircleSize",s[a]);l>o&&(o=l)}var h=this.previousVerticalX_;i.clearRect(h-o-1,0,2*o+2,this.height_)}if(this.isUsingExcanvas_&&this.currentZoomRectArgs_&&t.prototype.drawZoomRect_.apply(this,this.currentZoomRectArgs_),this.selPoints_.length>0){var p=this.selPoints_[0].canvasx;for(i.save(),a=0;a<this.selPoints_.length;a++){var g=this.selPoints_[a];if(t.isOK(g.canvasy)){var d=this.getNumericOption("highlightCircleSize",g.name),u=this.getFunctionOption("drawHighlightPointCallback",g.name),c=this.plotter_.colors[g.name];u||(u=t.Circles.DEFAULT),i.lineWidth=this.getNumericOption("strokeWidth",g.name),i.strokeStyle=c,i.fillStyle=c,u.call(this,this,g.name,i,p,g.canvasy,c,d,g.idx)}}i.restore(),this.previousVerticalX_=p}},t.prototype.setSelection=function(t,e,a){this.selPoints_=[];var i=!1;if(t!==!1&&t>=0){t!=this.lastRow_&&(i=!0),this.lastRow_=t;for(var r=0;r<this.layout_.points.length;++r){var n=this.layout_.points[r],o=t-this.getLeftBoundary_(r);if(o<n.length&&n[o].idx==t){var s=n[o];null!==s.yval&&this.selPoints_.push(s)}else for(var l=0;l<n.length;++l){var s=n[l];if(s.idx==t){null!==s.yval&&this.selPoints_.push(s);break}}}}else this.lastRow_>=0&&(i=!0),this.lastRow_=-1;return this.selPoints_.length?this.lastx_=this.selPoints_[0].xval:this.lastx_=-1,void 0!==e&&(this.highlightSet_!==e&&(i=!0),this.highlightSet_=e),void 0!==a&&(this.lockedSet_=a),i&&this.updateSelection_(void 0),i},t.prototype.mouseOut_=function(t){this.getFunctionOption("unhighlightCallback")&&this.getFunctionOption("unhighlightCallback").call(this,t),this.getBooleanOption("hideOverlayOnMouseOut")&&!this.lockedSet_&&this.clearSelection()},t.prototype.clearSelection=function(){return this.cascadeEvents_("deselect",{}),this.lockedSet_=!1,this.fadeLevel?void this.animateSelection_(-1):(this.canvas_ctx_.clearRect(0,0,this.width_,this.height_),this.fadeLevel=0,this.selPoints_=[],this.lastx_=-1,this.lastRow_=-1,void(this.highlightSet_=null))},t.prototype.getSelection=function(){if(!this.selPoints_||this.selPoints_.length<1)return-1;for(var t=0;t<this.layout_.points.length;t++)for(var e=this.layout_.points[t],a=0;a<e.length;a++)if(e[a].x==this.selPoints_[0].x)return e[a].idx;return-1},t.prototype.getHighlightSeries=function(){return this.highlightSet_},t.prototype.isSeriesLocked=function(){return this.lockedSet_},t.prototype.loadedEvent_=function(t){this.rawData_=this.parseCSV_(t),this.cascadeDataDidUpdateEvent_(),this.predraw_()},t.prototype.addXTicks_=function(){var t;t=this.dateWindow_?[this.dateWindow_[0],this.dateWindow_[1]]:this.xAxisExtremes();var e=this.optionsViewForAxis_("x"),a=e("ticker")(t[0],t[1],this.plotter_.area.w,e,this);this.layout_.setXTicks(a)},t.prototype.getHandlerClass_=function(){var e;return e=this.attr_("dataHandler")?this.attr_("dataHandler"):this.fractions_?this.getBooleanOption("errorBars")?t.DataHandlers.FractionsBarsHandler:t.DataHandlers.DefaultFractionHandler:this.getBooleanOption("customBars")?t.DataHandlers.CustomBarsHandler:this.getBooleanOption("errorBars")?t.DataHandlers.ErrorBarsHandler:t.DataHandlers.DefaultHandler},t.prototype.predraw_=function(){var t=new Date;this.dataHandler_=new(this.getHandlerClass_()),this.layout_.computePlotArea(),this.computeYAxes_(),this.is_initial_draw_||(this.canvas_ctx_.restore(),this.hidden_ctx_.restore()),this.canvas_ctx_.save(),this.hidden_ctx_.save(),this.plotter_=new DygraphCanvasRenderer(this,this.hidden_,this.hidden_ctx_,this.layout_),this.createRollInterface_(),this.cascadeEvents_("predraw"),this.rolledSeries_=[null];for(var e=1;e<this.numColumns();e++){var a=this.dataHandler_.extractSeries(this.rawData_,e,this.attributes_);this.rollPeriod_>1&&(a=this.dataHandler_.rollingAverage(a,this.rollPeriod_,this.attributes_)),this.rolledSeries_.push(a)}this.drawGraph_();var i=new Date;this.drawingTimeMs_=i-t},t.PointType=void 0,t.stackPoints_=function(t,e,a,i){for(var r=null,n=null,o=null,s=-1,l=function(e){if(!(s>=e))for(var a=e;a<t.length;++a)if(o=null,!isNaN(t[a].yval)&&null!==t[a].yval){s=a,o=t[a];break}},h=0;h<t.length;++h){var p=t[h],g=p.xval;void 0===e[g]&&(e[g]=0);var d=p.yval;isNaN(d)||null===d?"none"==i?d=0:(l(h),d=n&&o&&"none"!=i?n.yval+(o.yval-n.yval)*((g-n.xval)/(o.xval-n.xval)):n&&"all"==i?n.yval:o&&"all"==i?o.yval:0):n=p;var u=e[g];r!=g&&(u+=d,e[g]=u),r=g,p.yval_stacked=u,u>a[1]&&(a[1]=u),u<a[0]&&(a[0]=u)}},t.prototype.gatherDatasets_=function(e,a){var i,r,n,o,s,l,h=[],p=[],g=[],d={},u=e.length-1;for(i=u;i>=1;i--)if(this.visibility()[i-1]){if(a){l=e[i];var c=a[0],y=a[1];for(n=null,o=null,r=0;r<l.length;r++)l[r][0]>=c&&null===n&&(n=r),l[r][0]<=y&&(o=r);null===n&&(n=0);for(var _=n,v=!0;v&&_>0;)_--,v=null===l[_][1];null===o&&(o=l.length-1);var f=o;for(v=!0;v&&f<l.length-1;)f++,v=null===l[f][1];_!==n&&(n=_),f!==o&&(o=f),h[i-1]=[n,o],l=l.slice(n,o+1)}else l=e[i],h[i-1]=[0,l.length-1];var x=this.attr_("labels")[i],m=this.dataHandler_.getExtremeYValues(l,a,this.getBooleanOption("stepPlot",x)),D=this.dataHandler_.seriesToPoints(l,x,h[i-1][0]);this.getBooleanOption("stackedGraph")&&(s=this.attributes_.axisForSeries(x),void 0===g[s]&&(g[s]=[]),t.stackPoints_(D,g[s],m,this.getBooleanOption("stackedGraphNaNFill"))),d[x]=m,p[i]=D}return{points:p,extremes:d,boundaryIds:h}},t.prototype.drawGraph_=function(){var t=new Date,e=this.is_initial_draw_;this.is_initial_draw_=!1,this.layout_.removeAllDatasets(),this.setColors_(),this.attrs_.pointSize=.5*this.getNumericOption("highlightCircleSize");var a=this.gatherDatasets_(this.rolledSeries_,this.dateWindow_),i=a.points,r=a.extremes;this.boundaryIds_=a.boundaryIds,this.setIndexByName_={};var n=this.attr_("labels");n.length>0&&(this.setIndexByName_[n[0]]=0);for(var o=0,s=1;s<i.length;s++)this.setIndexByName_[n[s]]=s,this.visibility()[s-1]&&(this.layout_.addDataset(n[s],i[s]),this.datasetIndex_[s]=o++);this.computeYAxisRanges_(r),this.layout_.setYAxes(this.axes_),this.addXTicks_();var l=this.zoomed_x_;if(this.zoomed_x_=l,this.layout_.evaluate(),this.renderGraph_(e),this.getStringOption("timingName")){var h=new Date;console.log(this.getStringOption("timingName")+" - drawGraph: "+(h-t)+"ms")}},t.prototype.renderGraph_=function(t){this.cascadeEvents_("clearChart"),this.plotter_.clear(),this.getFunctionOption("underlayCallback")&&this.getFunctionOption("underlayCallback").call(this,this.hidden_ctx_,this.layout_.getPlotArea(),this,this);var e={canvas:this.hidden_,drawingContext:this.hidden_ctx_};if(this.cascadeEvents_("willDrawChart",e),this.plotter_.render(),this.cascadeEvents_("didDrawChart",e),this.lastRow_=-1,this.canvas_.getContext("2d").clearRect(0,0,this.width_,this.height_),null!==this.getFunctionOption("drawCallback")&&this.getFunctionOption("drawCallback").call(this,this,t),t)for(this.readyFired_=!0;this.readyFns_.length>0;){var a=this.readyFns_.pop();a(this)}},t.prototype.computeYAxes_=function(){var e,a,i,r,n;if(void 0!==this.axes_&&this.user_attrs_.hasOwnProperty("valueRange")===!1)for(e=[],i=0;i<this.axes_.length;i++)e.push(this.axes_[i].valueWindow);for(this.axes_=[],a=0;a<this.attributes_.numAxes();a++)r={g:this},t.update(r,this.attributes_.axisOptions(a)),this.axes_[a]=r;if(n=this.attr_("valueRange"),n&&(this.axes_[0].valueRange=n),void 0!==e){var o=Math.min(e.length,this.axes_.length);for(i=0;o>i;i++)this.axes_[i].valueWindow=e[i]}for(a=0;a<this.axes_.length;a++)if(0===a)r=this.optionsViewForAxis_("y"+(a?"2":"")),n=r("valueRange"),n&&(this.axes_[a].valueRange=n);else{var s=this.user_attrs_.axes;s&&s.y2&&(n=s.y2.valueRange,n&&(this.axes_[a].valueRange=n))}},t.prototype.numAxes=function(){return this.attributes_.numAxes()},t.prototype.axisPropertiesForSeries=function(t){return this.axes_[this.attributes_.axisForSeries(t)]},t.prototype.computeYAxisRanges_=function(t){for(var e,a,i,r,n,o=function(t){return isNaN(parseFloat(t))},s=this.attributes_.numAxes(),l=0;s>l;l++){var h=this.axes_[l],p=this.attributes_.getForAxis("logscale",l),g=this.attributes_.getForAxis("includeZero",l),d=this.attributes_.getForAxis("independentTicks",l);if(i=this.attributes_.seriesForAxis(l),e=!0,r=.1,null!==this.getNumericOption("yRangePad")&&(e=!1,r=this.getNumericOption("yRangePad")/this.plotter_.area.h),0===i.length)h.extremeRange=[0,1];else{for(var u,c,y=1/0,_=-(1/0),v=0;v<i.length;v++)t.hasOwnProperty(i[v])&&(u=t[i[v]][0],null!==u&&(y=Math.min(u,y)),c=t[i[v]][1],null!==c&&(_=Math.max(c,_)));g&&!p&&(y>0&&(y=0),0>_&&(_=0)),y==1/0&&(y=0),_==-(1/0)&&(_=1),a=_-y,0===a&&(0!==_?a=Math.abs(_):(_=1,a=1));var f,x;if(p)if(e)f=_+r*a,x=y;else{var m=Math.exp(Math.log(a)*r);f=_*m,x=y/m}else f=_+r*a,x=y-r*a,e&&!this.getBooleanOption("avoidMinZero")&&(0>x&&y>=0&&(x=0),f>0&&0>=_&&(f=0));h.extremeRange=[x,f]}if(h.valueWindow)h.computedValueRange=[h.valueWindow[0],h.valueWindow[1]];else if(h.valueRange){var D=o(h.valueRange[0])?h.extremeRange[0]:h.valueRange[0],w=o(h.valueRange[1])?h.extremeRange[1]:h.valueRange[1];if(!e)if(h.logscale){var m=Math.exp(Math.log(a)*r);D*=m,w/=m}else a=w-D,D-=a*r,w+=a*r;h.computedValueRange=[D,w]}else h.computedValueRange=h.extremeRange;if(d){h.independentTicks=d;var A=this.optionsViewForAxis_("y"+(l?"2":"")),b=A("ticker");h.ticks=b(h.computedValueRange[0],h.computedValueRange[1],this.plotter_.area.h,A,this),n||(n=h)}}if(void 0===n)throw'Configuration Error: At least one axis has to have the "independentTicks" option activated.';for(var l=0;s>l;l++){var h=this.axes_[l];if(!h.independentTicks){for(var A=this.optionsViewForAxis_("y"+(l?"2":"")),b=A("ticker"),T=n.ticks,E=n.computedValueRange[1]-n.computedValueRange[0],C=h.computedValueRange[1]-h.computedValueRange[0],L=[],P=0;P<T.length;P++){var S=(T[P].v-n.computedValueRange[0])/E,O=h.computedValueRange[0]+S*C;L.push(O)}h.ticks=b(h.computedValueRange[0],h.computedValueRange[1],this.plotter_.area.h,A,this,L)}}},t.prototype.detectTypeFromString_=function(t){var e=!1,a=t.indexOf("-");a>0&&"e"!=t[a-1]&&"E"!=t[a-1]||t.indexOf("/")>=0||isNaN(parseFloat(t))?e=!0:8==t.length&&t>"19700101"&&"20371231">t&&(e=!0),this.setXAxisOptions_(e)},t.prototype.setXAxisOptions_=function(e){e?(this.attrs_.xValueParser=t.dateParser,this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter):(this.attrs_.xValueParser=function(t){return parseFloat(t)},this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter)},t.prototype.parseCSV_=function(e){var a,i,r=[],n=t.detectLineDelimiter(e),o=e.split(n||"\n"),s=this.getStringOption("delimiter");-1==o[0].indexOf(s)&&o[0].indexOf("	")>=0&&(s="	");var l=0;"labels"in this.user_attrs_||(l=1,this.attrs_.labels=o[0].split(s),this.attributes_.reparseSeries());for(var h,p=0,g=!1,d=this.attr_("labels").length,u=!1,c=l;c<o.length;c++){var y=o[c];if(p=c,0!==y.length&&"#"!=y[0]){var _=y.split(s);if(!(_.length<2)){var v=[];if(g||(this.detectTypeFromString_(_[0]),h=this.getFunctionOption("xValueParser"),g=!0),v[0]=h(_[0],this),this.fractions_)for(i=1;i<_.length;i++)a=_[i].split("/"),2!=a.length?(console.error('Expected fractional "num/den" values in CSV data but found a value \''+_[i]+"' on line "+(1+c)+" ('"+y+"') which is not of this form."),v[i]=[0,0]):v[i]=[t.parseFloat_(a[0],c,y),t.parseFloat_(a[1],c,y)];else if(this.getBooleanOption("errorBars"))for(_.length%2!=1&&console.error("Expected alternating (value, stdev.) pairs in CSV data but line "+(1+c)+" has an odd number of values ("+(_.length-1)+"): '"+y+"'"),i=1;i<_.length;i+=2)v[(i+1)/2]=[t.parseFloat_(_[i],c,y),t.parseFloat_(_[i+1],c,y)];else if(this.getBooleanOption("customBars"))for(i=1;i<_.length;i++){var f=_[i];/^ *$/.test(f)?v[i]=[null,null,null]:(a=f.split(";"),3==a.length?v[i]=[t.parseFloat_(a[0],c,y),t.parseFloat_(a[1],c,y),t.parseFloat_(a[2],c,y)]:console.warn('When using customBars, values must be either blank or "low;center;high" tuples (got "'+f+'" on line '+(1+c)))}else for(i=1;i<_.length;i++)v[i]=t.parseFloat_(_[i],c,y);if(r.length>0&&v[0]<r[r.length-1][0]&&(u=!0),v.length!=d&&console.error("Number of columns in line "+c+" ("+v.length+") does not agree with number of labels ("+d+") "+y),0===c&&this.attr_("labels")){var x=!0;for(i=0;x&&i<v.length;i++)v[i]&&(x=!1);if(x){console.warn("The dygraphs 'labels' option is set, but the first row of CSV data ('"+y+"') appears to also contain labels. Will drop the CSV labels and use the option labels.");continue}}r.push(v)}}}return u&&(console.warn("CSV is out of order; order it correctly to speed loading."),r.sort(function(t,e){return t[0]-e[0]})),r},t.prototype.parseArray_=function(e){if(0===e.length)return console.error("Can't plot empty data set"),null;if(0===e[0].length)return console.error("Data set cannot contain an empty row"),null;var a;if(null===this.attr_("labels")){for(console.warn("Using default labels. Set labels explicitly via 'labels' in the options parameter"),this.attrs_.labels=["X"],a=1;a<e[0].length;a++)this.attrs_.labels.push("Y"+a);this.attributes_.reparseSeries()}else{var i=this.attr_("labels");if(i.length!=e[0].length)return console.error("Mismatch between number of labels ("+i+") and number of columns in array ("+e[0].length+")"),null}if(t.isDateLike(e[0][0])){this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter;var r=t.clone(e);for(a=0;a<e.length;a++){if(0===r[a].length)return console.error("Row "+(1+a)+" of data is empty"),null;if(null===r[a][0]||"function"!=typeof r[a][0].getTime||isNaN(r[a][0].getTime()))return console.error("x value in row "+(1+a)+" is not a Date"),null;r[a][0]=r[a][0].getTime()}return r}return this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=t.numberAxisLabelFormatter,e},t.prototype.parseDataTable_=function(e){var a=function(t){var e=String.fromCharCode(65+t%26);for(t=Math.floor(t/26);t>0;)e=String.fromCharCode(65+(t-1)%26)+e.toLowerCase(),t=Math.floor((t-1)/26);return e},i=e.getNumberOfColumns(),r=e.getNumberOfRows(),n=e.getColumnType(0);if("date"==n||"datetime"==n)this.attrs_.xValueParser=t.dateParser,this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter;else{if("number"!=n)return console.error("only 'date', 'datetime' and 'number' types are supported for column 1 of DataTable input (Got '"+n+"')"),null;this.attrs_.xValueParser=function(t){return parseFloat(t)},this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter}var o,s,l=[],h={},p=!1;for(o=1;i>o;o++){var g=e.getColumnType(o);if("number"==g)l.push(o);else if("string"==g&&this.getBooleanOption("displayAnnotations")){var d=l[l.length-1];h.hasOwnProperty(d)?h[d].push(o):h[d]=[o],p=!0}else console.error("Only 'number' is supported as a dependent type with Gviz. 'string' is only supported if displayAnnotations is true")}var u=[e.getColumnLabel(0)];for(o=0;o<l.length;o++)u.push(e.getColumnLabel(l[o])),this.getBooleanOption("errorBars")&&(o+=1);this.attrs_.labels=u,i=u.length;var c=[],y=!1,_=[];for(o=0;r>o;o++){var v=[];if("undefined"!=typeof e.getValue(o,0)&&null!==e.getValue(o,0)){if(v.push("date"==n||"datetime"==n?e.getValue(o,0).getTime():e.getValue(o,0)),this.getBooleanOption("errorBars"))for(s=0;i-1>s;s++)v.push([e.getValue(o,1+2*s),e.getValue(o,2+2*s)]);else{for(s=0;s<l.length;s++){var f=l[s];if(v.push(e.getValue(o,f)),p&&h.hasOwnProperty(f)&&null!==e.getValue(o,h[f][0])){var x={};x.series=e.getColumnLabel(f),x.xval=v[0],x.shortText=a(_.length),x.text="";for(var m=0;m<h[f].length;m++)m&&(x.text+="\n"),x.text+=e.getValue(o,h[f][m]);_.push(x)}}for(s=0;s<v.length;s++)isFinite(v[s])||(v[s]=null)}c.length>0&&v[0]<c[c.length-1][0]&&(y=!0),c.push(v)}else console.warn("Ignoring row "+o+" of DataTable because of undefined or null first column.")}y&&(console.warn("DataTable is out of order; order it correctly to speed loading."),c.sort(function(t,e){return t[0]-e[0]})),this.rawData_=c,_.length>0&&this.setAnnotations(_,!0),this.attributes_.reparseSeries()},t.prototype.cascadeDataDidUpdateEvent_=function(){this.cascadeEvents_("dataDidUpdate",{})},t.prototype.start_=function(){var e=this.file_;if("function"==typeof e&&(e=e()),t.isArrayLike(e))this.rawData_=this.parseArray_(e),this.cascadeDataDidUpdateEvent_(),this.predraw_();else if("object"==typeof e&&"function"==typeof e.getColumnRange)this.parseDataTable_(e),this.cascadeDataDidUpdateEvent_(),this.predraw_();else if("string"==typeof e){var a=t.detectLineDelimiter(e);if(a)this.loadedEvent_(e);else{var i;i=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");var r=this;i.onreadystatechange=function(){4==i.readyState&&(200===i.status||0===i.status)&&r.loadedEvent_(i.responseText)},i.open("GET",e,!0),i.send(null)}}else console.error("Unknown data format: "+typeof e)},t.prototype.updateOptions=function(e,a){"undefined"==typeof a&&(a=!1);var i=e.file,r=t.mapLegacyOptions_(e);"rollPeriod"in r&&(this.rollPeriod_=r.rollPeriod),"dateWindow"in r&&(this.dateWindow_=r.dateWindow,"isZoomedIgnoreProgrammaticZoom"in r||(this.zoomed_x_=null!==r.dateWindow)),"valueRange"in r&&!("isZoomedIgnoreProgrammaticZoom"in r)&&(this.zoomed_y_=null!==r.valueRange);var n=t.isPixelChangingOptionList(this.attr_("labels"),r);t.updateDeep(this.user_attrs_,r),this.attributes_.reparseSeries(),i?(this.cascadeEvents_("dataWillUpdate",{}),this.file_=i,a||this.start_()):a||(n?this.predraw_():this.renderGraph_(!1))},t.mapLegacyOptions_=function(t){var e={};for(var a in t)t.hasOwnProperty(a)&&"file"!=a&&t.hasOwnProperty(a)&&(e[a]=t[a]);var i=function(t,a,i){e.axes||(e.axes={}),e.axes[t]||(e.axes[t]={}),e.axes[t][a]=i},r=function(a,r,n){"undefined"!=typeof t[a]&&(console.warn("Option "+a+" is deprecated. Use the "+n+" option for the "+r+" axis instead. (e.g. { axes : { "+r+" : { "+n+" : ... } } } (see http://dygraphs.com/per-axis.html for more information."),i(r,n,t[a]),delete e[a])};return r("xValueFormatter","x","valueFormatter"),r("pixelsPerXLabel","x","pixelsPerLabel"),r("xAxisLabelFormatter","x","axisLabelFormatter"),r("xTicker","x","ticker"),r("yValueFormatter","y","valueFormatter"),r("pixelsPerYLabel","y","pixelsPerLabel"),r("yAxisLabelFormatter","y","axisLabelFormatter"),r("yTicker","y","ticker"),r("drawXGrid","x","drawGrid"),r("drawXAxis","x","drawAxis"),r("drawYGrid","y","drawGrid"),r("drawYAxis","y","drawAxis"),r("xAxisLabelWidth","x","axisLabelWidth"),r("yAxisLabelWidth","y","axisLabelWidth"),e},t.prototype.resize=function(t,e){if(!this.resize_lock){this.resize_lock=!0,null===t!=(null===e)&&(console.warn("Dygraph.resize() should be called with zero parameters or two non-NULL parameters. Pretending it was zero."),t=e=null);var a=this.width_,i=this.height_;t?(this.maindiv_.style.width=t+"px",this.maindiv_.style.height=e+"px",this.width_=t,this.height_=e):(this.width_=this.maindiv_.clientWidth,this.height_=this.maindiv_.clientHeight),(a!=this.width_||i!=this.height_)&&(this.resizeElements_(),this.predraw_()),this.resize_lock=!1}},t.prototype.adjustRoll=function(t){this.rollPeriod_=t,this.predraw_()},t.prototype.visibility=function(){for(this.getOption("visibility")||(this.attrs_.visibility=[]);this.getOption("visibility").length<this.numColumns()-1;)this.attrs_.visibility.push(!0);return this.getOption("visibility")},t.prototype.setVisibility=function(t,e){var a=this.visibility();0>t||t>=a.length?console.warn("invalid series number in setVisibility: "+t):(a[t]=e,this.predraw_())},t.prototype.size=function(){return{width:this.width_,height:this.height_}},t.prototype.setAnnotations=function(e,a){return t.addAnnotationRule(),this.annotations_=e,this.layout_?(this.layout_.setAnnotations(this.annotations_),void(a||this.predraw_())):void console.warn("Tried to setAnnotations before dygraph was ready. Try setting them in a ready() block. See dygraphs.com/tests/annotation.html")},t.prototype.annotations=function(){return this.annotations_},t.prototype.getLabels=function(){var t=this.attr_("labels");return t?t.slice():null},t.prototype.indexFromSetName=function(t){return this.setIndexByName_[t]},t.prototype.ready=function(t){this.is_initial_draw_?this.readyFns_.push(t):t.call(this,this)},t.addAnnotationRule=function(){if(!t.addedAnnotationCSS){var e="border: 1px solid black; background-color: white; text-align: center;",a=document.createElement("style");a.type="text/css",document.getElementsByTagName("head")[0].appendChild(a);for(var i=0;i<document.styleSheets.length;i++)if(!document.styleSheets[i].disabled){var r=document.styleSheets[i];try{if(r.insertRule){var n=r.cssRules?r.cssRules.length:0;r.insertRule(".dygraphDefaultAnnotation { "+e+" }",n)}else r.addRule&&r.addRule(".dygraphDefaultAnnotation",e);return void(t.addedAnnotationCSS=!0)}catch(o){}}console.warn("Unable to add default annotation CSS rule; display may be off.")}},"object"==typeof exports&&"undefined"!=typeof module&&(module.exports=t),t}();!function(){"use strict";function t(t){var e=a.exec(t);if(!e)return null;var i=parseInt(e[1],10),r=parseInt(e[2],10),n=parseInt(e[3],10);return e[4]?{r:i,g:r,b:n,a:parseFloat(e[4])}:{r:i,g:r,b:n}}Dygraph.LOG_SCALE=10,Dygraph.LN_TEN=Math.log(Dygraph.LOG_SCALE),Dygraph.log10=function(t){return Math.log(t)/Dygraph.LN_TEN},Dygraph.DOTTED_LINE=[2,2],Dygraph.DASHED_LINE=[7,3],Dygraph.DOT_DASH_LINE=[7,2,2,2],Dygraph.getContext=function(t){return t.getContext("2d")},Dygraph.addEvent=function(t,e,a){t.addEventListener?t.addEventListener(e,a,!1):(t[e+a]=function(){a(window.event)},t.attachEvent("on"+e,t[e+a]))},Dygraph.prototype.addAndTrackEvent=function(t,e,a){Dygraph.addEvent(t,e,a),this.registeredEvents_.push({elem:t,type:e,fn:a})},Dygraph.removeEvent=function(t,e,a){if(t.removeEventListener)t.removeEventListener(e,a,!1);else{try{t.detachEvent("on"+e,t[e+a])}catch(i){}t[e+a]=null}},Dygraph.prototype.removeTrackedEvents_=function(){if(this.registeredEvents_)for(var t=0;t<this.registeredEvents_.length;t++){var e=this.registeredEvents_[t];Dygraph.removeEvent(e.elem,e.type,e.fn)}this.registeredEvents_=[]},Dygraph.cancelEvent=function(t){return t=t?t:window.event,t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.cancelBubble=!0,t.cancel=!0,t.returnValue=!1,!1},Dygraph.hsvToRGB=function(t,e,a){var i,r,n;if(0===e)i=a,r=a,n=a;else{var o=Math.floor(6*t),s=6*t-o,l=a*(1-e),h=a*(1-e*s),p=a*(1-e*(1-s));switch(o){case 1:i=h,r=a,n=l;break;case 2:i=l,r=a,n=p;break;case 3:i=l,r=h,n=a;break;case 4:i=p,r=l,n=a;break;case 5:i=a,r=l,n=h;break;case 6:case 0:i=a,r=p,n=l}}return i=Math.floor(255*i+.5),r=Math.floor(255*r+.5),n=Math.floor(255*n+.5),"rgb("+i+","+r+","+n+")"},Dygraph.findPos=function(t){var e=0,a=0;if(t.offsetParent)for(var i=t;;){var r="0",n="0";if(window.getComputedStyle){
var o=window.getComputedStyle(i,null);r=o.borderLeft||"0",n=o.borderTop||"0"}if(e+=parseInt(r,10),a+=parseInt(n,10),e+=i.offsetLeft,a+=i.offsetTop,!i.offsetParent)break;i=i.offsetParent}else t.x&&(e+=t.x),t.y&&(a+=t.y);for(;t&&t!=document.body;)e-=t.scrollLeft,a-=t.scrollTop,t=t.parentNode;return{x:e,y:a}},Dygraph.pageX=function(t){if(t.pageX)return!t.pageX||t.pageX<0?0:t.pageX;var e=document.documentElement,a=document.body;return t.clientX+(e.scrollLeft||a.scrollLeft)-(e.clientLeft||0)},Dygraph.pageY=function(t){if(t.pageY)return!t.pageY||t.pageY<0?0:t.pageY;var e=document.documentElement,a=document.body;return t.clientY+(e.scrollTop||a.scrollTop)-(e.clientTop||0)},Dygraph.dragGetX_=function(t,e){return Dygraph.pageX(t)-e.px},Dygraph.dragGetY_=function(t,e){return Dygraph.pageY(t)-e.py},Dygraph.isOK=function(t){return!!t&&!isNaN(t)},Dygraph.isValidPoint=function(t,e){return t?null===t.yval?!1:null===t.x||void 0===t.x?!1:null===t.y||void 0===t.y?!1:isNaN(t.x)||!e&&isNaN(t.y)?!1:!0:!1},Dygraph.floatFormat=function(t,e){var a=Math.min(Math.max(1,e||2),21);return Math.abs(t)<.001&&0!==t?t.toExponential(a-1):t.toPrecision(a)},Dygraph.zeropad=function(t){return 10>t?"0"+t:""+t},Dygraph.DateAccessorsLocal={getFullYear:function(t){return t.getFullYear()},getMonth:function(t){return t.getMonth()},getDate:function(t){return t.getDate()},getHours:function(t){return t.getHours()},getMinutes:function(t){return t.getMinutes()},getSeconds:function(t){return t.getSeconds()},getMilliseconds:function(t){return t.getMilliseconds()},getDay:function(t){return t.getDay()},makeDate:function(t,e,a,i,r,n,o){return new Date(t,e,a,i,r,n,o)}},Dygraph.DateAccessorsUTC={getFullYear:function(t){return t.getUTCFullYear()},getMonth:function(t){return t.getUTCMonth()},getDate:function(t){return t.getUTCDate()},getHours:function(t){return t.getUTCHours()},getMinutes:function(t){return t.getUTCMinutes()},getSeconds:function(t){return t.getUTCSeconds()},getMilliseconds:function(t){return t.getUTCMilliseconds()},getDay:function(t){return t.getUTCDay()},makeDate:function(t,e,a,i,r,n,o){return new Date(Date.UTC(t,e,a,i,r,n,o))}},Dygraph.hmsString_=function(t,e,a){var i=Dygraph.zeropad,r=i(t)+":"+i(e);return a&&(r+=":"+i(a)),r},Dygraph.dateString_=function(t,e){var a=Dygraph.zeropad,i=e?Dygraph.DateAccessorsUTC:Dygraph.DateAccessorsLocal,r=new Date(t),n=i.getFullYear(r),o=i.getMonth(r),s=i.getDate(r),l=i.getHours(r),h=i.getMinutes(r),p=i.getSeconds(r),g=""+n,d=a(o+1),u=a(s),c=3600*l+60*h+p,y=g+"/"+d+"/"+u;return c&&(y+=" "+Dygraph.hmsString_(l,h,p)),y},Dygraph.round_=function(t,e){var a=Math.pow(10,e);return Math.round(t*a)/a},Dygraph.binarySearch=function(t,e,a,i,r){if((null===i||void 0===i||null===r||void 0===r)&&(i=0,r=e.length-1),i>r)return-1;(null===a||void 0===a)&&(a=0);var n,o=function(t){return t>=0&&t<e.length},s=parseInt((i+r)/2,10),l=e[s];return l==t?s:l>t?a>0&&(n=s-1,o(n)&&e[n]<t)?s:Dygraph.binarySearch(t,e,a,i,s-1):t>l?0>a&&(n=s+1,o(n)&&e[n]>t)?s:Dygraph.binarySearch(t,e,a,s+1,r):-1},Dygraph.dateParser=function(t){var e,a;if((-1==t.search("-")||-1!=t.search("T")||-1!=t.search("Z"))&&(a=Dygraph.dateStrToMillis(t),a&&!isNaN(a)))return a;if(-1!=t.search("-")){for(e=t.replace("-","/","g");-1!=e.search("-");)e=e.replace("-","/");a=Dygraph.dateStrToMillis(e)}else 8==t.length?(e=t.substr(0,4)+"/"+t.substr(4,2)+"/"+t.substr(6,2),a=Dygraph.dateStrToMillis(e)):a=Dygraph.dateStrToMillis(t);return(!a||isNaN(a))&&console.error("Couldn't parse "+t+" as a date"),a},Dygraph.dateStrToMillis=function(t){return new Date(t).getTime()},Dygraph.update=function(t,e){if("undefined"!=typeof e&&null!==e)for(var a in e)e.hasOwnProperty(a)&&(t[a]=e[a]);return t},Dygraph.updateDeep=function(t,e){function a(t){return"object"==typeof Node?t instanceof Node:"object"==typeof t&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName}if("undefined"!=typeof e&&null!==e)for(var i in e)e.hasOwnProperty(i)&&(null===e[i]?t[i]=null:Dygraph.isArrayLike(e[i])?t[i]=e[i].slice():a(e[i])?t[i]=e[i]:"object"==typeof e[i]?(("object"!=typeof t[i]||null===t[i])&&(t[i]={}),Dygraph.updateDeep(t[i],e[i])):t[i]=e[i]);return t},Dygraph.isArrayLike=function(t){var e=typeof t;return"object"!=e&&("function"!=e||"function"!=typeof t.item)||null===t||"number"!=typeof t.length||3===t.nodeType?!1:!0},Dygraph.isDateLike=function(t){return"object"!=typeof t||null===t||"function"!=typeof t.getTime?!1:!0},Dygraph.clone=function(t){for(var e=[],a=0;a<t.length;a++)e.push(Dygraph.isArrayLike(t[a])?Dygraph.clone(t[a]):t[a]);return e},Dygraph.createCanvas=function(){var t=document.createElement("canvas"),e=/MSIE/.test(navigator.userAgent)&&!window.opera;return e&&"undefined"!=typeof G_vmlCanvasManager&&(t=G_vmlCanvasManager.initElement(t)),t},Dygraph.getContextPixelRatio=function(t){try{var e=window.devicePixelRatio,a=t.webkitBackingStorePixelRatio||t.mozBackingStorePixelRatio||t.msBackingStorePixelRatio||t.oBackingStorePixelRatio||t.backingStorePixelRatio||1;return void 0!==e?e/a:1}catch(i){return 1}},Dygraph.isAndroid=function(){return/Android/.test(navigator.userAgent)},Dygraph.Iterator=function(t,e,a,i){e=e||0,a=a||t.length,this.hasNext=!0,this.peek=null,this.start_=e,this.array_=t,this.predicate_=i,this.end_=Math.min(t.length,e+a),this.nextIdx_=e-1,this.next()},Dygraph.Iterator.prototype.next=function(){if(!this.hasNext)return null;for(var t=this.peek,e=this.nextIdx_+1,a=!1;e<this.end_;){if(!this.predicate_||this.predicate_(this.array_,e)){this.peek=this.array_[e],a=!0;break}e++}return this.nextIdx_=e,a||(this.hasNext=!1,this.peek=null),t},Dygraph.createIterator=function(t,e,a,i){return new Dygraph.Iterator(t,e,a,i)},Dygraph.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}(),Dygraph.repeatAndCleanup=function(t,e,a,i){var r,n=0,o=(new Date).getTime();if(t(n),1==e)return void i();var s=e-1;!function l(){n>=e||Dygraph.requestAnimFrame.call(window,function(){var e=(new Date).getTime(),h=e-o;r=n,n=Math.floor(h/a);var p=n-r,g=n+p>s;g||n>=s?(t(s),i()):(0!==p&&t(n),l())})}()};var e={annotationClickHandler:!0,annotationDblClickHandler:!0,annotationMouseOutHandler:!0,annotationMouseOverHandler:!0,axisLabelColor:!0,axisLineColor:!0,axisLineWidth:!0,clickCallback:!0,drawCallback:!0,drawHighlightPointCallback:!0,drawPoints:!0,drawPointCallback:!0,drawXGrid:!0,drawYGrid:!0,fillAlpha:!0,gridLineColor:!0,gridLineWidth:!0,hideOverlayOnMouseOut:!0,highlightCallback:!0,highlightCircleSize:!0,interactionModel:!0,isZoomedIgnoreProgrammaticZoom:!0,labelsDiv:!0,labelsDivStyles:!0,labelsDivWidth:!0,labelsKMB:!0,labelsKMG2:!0,labelsSeparateLines:!0,labelsShowZeroValues:!0,legend:!0,panEdgeFraction:!0,pixelsPerYLabel:!0,pointClickCallback:!0,pointSize:!0,rangeSelectorPlotFillColor:!0,rangeSelectorPlotStrokeColor:!0,showLabelsOnHighlight:!0,showRoller:!0,strokeWidth:!0,underlayCallback:!0,unhighlightCallback:!0,zoomCallback:!0};Dygraph.isPixelChangingOptionList=function(t,a){var i={};if(t)for(var r=1;r<t.length;r++)i[t[r]]=!0;var n=function(t){for(var a in t)if(t.hasOwnProperty(a)&&!e[a])return!0;return!1};for(var o in a)if(a.hasOwnProperty(o))if("highlightSeriesOpts"==o||i[o]&&!a.series){if(n(a[o]))return!0}else if("series"==o||"axes"==o){var s=a[o];for(var l in s)if(s.hasOwnProperty(l)&&n(s[l]))return!0}else if(!e[o])return!0;return!1},Dygraph.Circles={DEFAULT:function(t,e,a,i,r,n,o){a.beginPath(),a.fillStyle=n,a.arc(i,r,o,0,2*Math.PI,!1),a.fill()}},Dygraph.IFrameTarp=function(){this.tarps=[]},Dygraph.IFrameTarp.prototype.cover=function(){for(var t=document.getElementsByTagName("iframe"),e=0;e<t.length;e++){var a=t[e],i=Dygraph.findPos(a),r=i.x,n=i.y,o=a.offsetWidth,s=a.offsetHeight,l=document.createElement("div");l.style.position="absolute",l.style.left=r+"px",l.style.top=n+"px",l.style.width=o+"px",l.style.height=s+"px",l.style.zIndex=999,document.body.appendChild(l),this.tarps.push(l)}},Dygraph.IFrameTarp.prototype.uncover=function(){for(var t=0;t<this.tarps.length;t++)this.tarps[t].parentNode.removeChild(this.tarps[t]);this.tarps=[]},Dygraph.detectLineDelimiter=function(t){for(var e=0;e<t.length;e++){var a=t.charAt(e);if("\r"===a)return e+1<t.length&&"\n"===t.charAt(e+1)?"\r\n":a;if("\n"===a)return e+1<t.length&&"\r"===t.charAt(e+1)?"\n\r":a}return null},Dygraph.isNodeContainedBy=function(t,e){if(null===e||null===t)return!1;for(var a=t;a&&a!==e;)a=a.parentNode;return a===e},Dygraph.pow=function(t,e){return 0>e?1/Math.pow(t,-e):Math.pow(t,e)};var a=/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([01](?:\.\d+)?))?\)$/;Dygraph.toRGB_=function(e){var a=t(e);if(a)return a;var i=document.createElement("div");i.style.backgroundColor=e,i.style.visibility="hidden",document.body.appendChild(i);var r;return r=window.getComputedStyle?window.getComputedStyle(i,null).backgroundColor:i.currentStyle.backgroundColor,document.body.removeChild(i),t(r)},Dygraph.isCanvasSupported=function(t){var e;try{e=t||document.createElement("canvas"),e.getContext("2d")}catch(a){var i=navigator.appVersion.match(/MSIE (\d\.\d)/),r=-1!=navigator.userAgent.toLowerCase().indexOf("opera");return!i||i[1]<6||r?!1:!0}return!0},Dygraph.parseFloat_=function(t,e,a){var i=parseFloat(t);if(!isNaN(i))return i;if(/^ *$/.test(t))return null;if(/^ *nan *$/i.test(t))return 0/0;var r="Unable to parse '"+t+"' as a number";return void 0!==a&&void 0!==e&&(r+=" on line "+(1+(e||0))+" ('"+a+"') of CSV."),console.error(r),null}}(),function(){"use strict";Dygraph.GVizChart=function(t){this.container=t},Dygraph.GVizChart.prototype.draw=function(t,e){this.container.innerHTML="","undefined"!=typeof this.date_graph&&this.date_graph.destroy(),this.date_graph=new Dygraph(this.container,t,e)},Dygraph.GVizChart.prototype.setSelection=function(t){var e=!1;t.length&&(e=t[0].row),this.date_graph.setSelection(e)},Dygraph.GVizChart.prototype.getSelection=function(){var t=[],e=this.date_graph.getSelection();if(0>e)return t;for(var a=this.date_graph.layout_.points,i=0;i<a.length;++i)t.push({row:e,column:i+1});return t}}(),function(){"use strict";var t=100;Dygraph.Interaction={},Dygraph.Interaction.maybeTreatMouseOpAsClick=function(t,e,a){a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=Math.abs(a.dragEndX-a.dragStartX),r=Math.abs(a.dragEndY-a.dragStartY);2>i&&2>r&&void 0!==e.lastx_&&-1!=e.lastx_&&Dygraph.Interaction.treatMouseOpAsClick(e,t,a),a.regionWidth=i,a.regionHeight=r},Dygraph.Interaction.startPan=function(t,e,a){var i,r;a.isPanning=!0;var n=e.xAxisRange();if(e.getOptionForAxis("logscale","x")?(a.initialLeftmostDate=Dygraph.log10(n[0]),a.dateRange=Dygraph.log10(n[1])-Dygraph.log10(n[0])):(a.initialLeftmostDate=n[0],a.dateRange=n[1]-n[0]),a.xUnitsPerPixel=a.dateRange/(e.plotter_.area.w-1),e.getNumericOption("panEdgeFraction")){var o=e.width_*e.getNumericOption("panEdgeFraction"),s=e.xAxisExtremes(),l=e.toDomXCoord(s[0])-o,h=e.toDomXCoord(s[1])+o,p=e.toDataXCoord(l),g=e.toDataXCoord(h);a.boundedDates=[p,g];var d=[],u=e.height_*e.getNumericOption("panEdgeFraction");for(i=0;i<e.axes_.length;i++){r=e.axes_[i];var c=r.extremeRange,y=e.toDomYCoord(c[0],i)+u,_=e.toDomYCoord(c[1],i)-u,v=e.toDataYCoord(y,i),f=e.toDataYCoord(_,i);d[i]=[v,f]}a.boundedValues=d}for(a.is2DPan=!1,a.axes=[],i=0;i<e.axes_.length;i++){r=e.axes_[i];var x={},m=e.yAxisRange(i),D=e.attributes_.getForAxis("logscale",i);D?(x.initialTopValue=Dygraph.log10(m[1]),x.dragValueRange=Dygraph.log10(m[1])-Dygraph.log10(m[0])):(x.initialTopValue=m[1],x.dragValueRange=m[1]-m[0]),x.unitsPerPixel=x.dragValueRange/(e.plotter_.area.h-1),a.axes.push(x),(r.valueWindow||r.valueRange)&&(a.is2DPan=!0)}},Dygraph.Interaction.movePan=function(t,e,a){a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=a.initialLeftmostDate-(a.dragEndX-a.dragStartX)*a.xUnitsPerPixel;a.boundedDates&&(i=Math.max(i,a.boundedDates[0]));var r=i+a.dateRange;if(a.boundedDates&&r>a.boundedDates[1]&&(i-=r-a.boundedDates[1],r=i+a.dateRange),e.getOptionForAxis("logscale","x")?e.dateWindow_=[Math.pow(Dygraph.LOG_SCALE,i),Math.pow(Dygraph.LOG_SCALE,r)]:e.dateWindow_=[i,r],a.is2DPan)for(var n=a.dragEndY-a.dragStartY,o=0;o<e.axes_.length;o++){var s=e.axes_[o],l=a.axes[o],h=n*l.unitsPerPixel,p=a.boundedValues?a.boundedValues[o]:null,g=l.initialTopValue+h;p&&(g=Math.min(g,p[1]));var d=g-l.dragValueRange;p&&d<p[0]&&(g-=d-p[0],d=g-l.dragValueRange),e.attributes_.getForAxis("logscale",o)?s.valueWindow=[Math.pow(Dygraph.LOG_SCALE,d),Math.pow(Dygraph.LOG_SCALE,g)]:s.valueWindow=[d,g]}e.drawGraph_(!1)},Dygraph.Interaction.endPan=Dygraph.Interaction.maybeTreatMouseOpAsClick,Dygraph.Interaction.startZoom=function(t,e,a){a.isZooming=!0,a.zoomMoved=!1},Dygraph.Interaction.moveZoom=function(t,e,a){a.zoomMoved=!0,a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=Math.abs(a.dragStartX-a.dragEndX),r=Math.abs(a.dragStartY-a.dragEndY);a.dragDirection=r/2>i?Dygraph.VERTICAL:Dygraph.HORIZONTAL,e.drawZoomRect_(a.dragDirection,a.dragStartX,a.dragEndX,a.dragStartY,a.dragEndY,a.prevDragDirection,a.prevEndX,a.prevEndY),a.prevEndX=a.dragEndX,a.prevEndY=a.dragEndY,a.prevDragDirection=a.dragDirection},Dygraph.Interaction.treatMouseOpAsClick=function(t,e,a){for(var i=t.getFunctionOption("clickCallback"),r=t.getFunctionOption("pointClickCallback"),n=null,o=-1,s=Number.MAX_VALUE,l=0;l<t.selPoints_.length;l++){var h=t.selPoints_[l],p=Math.pow(h.canvasx-a.dragEndX,2)+Math.pow(h.canvasy-a.dragEndY,2);!isNaN(p)&&(-1==o||s>p)&&(s=p,o=l)}var g=t.getNumericOption("highlightCircleSize")+2;if(g*g>=s&&(n=t.selPoints_[o]),n){var d={cancelable:!0,point:n,canvasx:a.dragEndX,canvasy:a.dragEndY},u=t.cascadeEvents_("pointClick",d);if(u)return;r&&r.call(t,e,n)}var d={cancelable:!0,xval:t.lastx_,pts:t.selPoints_,canvasx:a.dragEndX,canvasy:a.dragEndY};t.cascadeEvents_("click",d)||i&&i.call(t,e,t.lastx_,t.selPoints_)},Dygraph.Interaction.endZoom=function(t,e,a){e.clearZoomRect_(),a.isZooming=!1,Dygraph.Interaction.maybeTreatMouseOpAsClick(t,e,a);var i=e.getArea();if(a.regionWidth>=10&&a.dragDirection==Dygraph.HORIZONTAL){var r=Math.min(a.dragStartX,a.dragEndX),n=Math.max(a.dragStartX,a.dragEndX);r=Math.max(r,i.x),n=Math.min(n,i.x+i.w),n>r&&e.doZoomX_(r,n),a.cancelNextDblclick=!0}else if(a.regionHeight>=10&&a.dragDirection==Dygraph.VERTICAL){var o=Math.min(a.dragStartY,a.dragEndY),s=Math.max(a.dragStartY,a.dragEndY);o=Math.max(o,i.y),s=Math.min(s,i.y+i.h),s>o&&e.doZoomY_(o,s),a.cancelNextDblclick=!0}a.dragStartX=null,a.dragStartY=null},Dygraph.Interaction.startTouch=function(t,e,a){t.preventDefault(),t.touches.length>1&&(a.startTimeForDoubleTapMs=null);for(var i=[],r=0;r<t.touches.length;r++){var n=t.touches[r];i.push({pageX:n.pageX,pageY:n.pageY,dataX:e.toDataXCoord(n.pageX),dataY:e.toDataYCoord(n.pageY)})}if(a.initialTouches=i,1==i.length)a.initialPinchCenter=i[0],a.touchDirections={x:!0,y:!0};else if(i.length>=2){a.initialPinchCenter={pageX:.5*(i[0].pageX+i[1].pageX),pageY:.5*(i[0].pageY+i[1].pageY),dataX:.5*(i[0].dataX+i[1].dataX),dataY:.5*(i[0].dataY+i[1].dataY)};var o=180/Math.PI*Math.atan2(a.initialPinchCenter.pageY-i[0].pageY,i[0].pageX-a.initialPinchCenter.pageX);o=Math.abs(o),o>90&&(o=90-o),a.touchDirections={x:67.5>o,y:o>22.5}}a.initialRange={x:e.xAxisRange(),y:e.yAxisRange()}},Dygraph.Interaction.moveTouch=function(t,e,a){a.startTimeForDoubleTapMs=null;var i,r=[];for(i=0;i<t.touches.length;i++){var n=t.touches[i];r.push({pageX:n.pageX,pageY:n.pageY})}var o,s=a.initialTouches,l=a.initialPinchCenter;o=1==r.length?r[0]:{pageX:.5*(r[0].pageX+r[1].pageX),pageY:.5*(r[0].pageY+r[1].pageY)};var h={pageX:o.pageX-l.pageX,pageY:o.pageY-l.pageY},p=a.initialRange.x[1]-a.initialRange.x[0],g=a.initialRange.y[0]-a.initialRange.y[1];h.dataX=h.pageX/e.plotter_.area.w*p,h.dataY=h.pageY/e.plotter_.area.h*g;var d,u;if(1==r.length)d=1,u=1;else if(r.length>=2){var c=s[1].pageX-l.pageX;d=(r[1].pageX-o.pageX)/c;var y=s[1].pageY-l.pageY;u=(r[1].pageY-o.pageY)/y}d=Math.min(8,Math.max(.125,d)),u=Math.min(8,Math.max(.125,u));var _=!1;if(a.touchDirections.x&&(e.dateWindow_=[l.dataX-h.dataX+(a.initialRange.x[0]-l.dataX)/d,l.dataX-h.dataX+(a.initialRange.x[1]-l.dataX)/d],_=!0),a.touchDirections.y)for(i=0;1>i;i++){var v=e.axes_[i],f=e.attributes_.getForAxis("logscale",i);f||(v.valueWindow=[l.dataY-h.dataY+(a.initialRange.y[0]-l.dataY)/u,l.dataY-h.dataY+(a.initialRange.y[1]-l.dataY)/u],_=!0)}if(e.drawGraph_(!1),_&&r.length>1&&e.getFunctionOption("zoomCallback")){var x=e.xAxisRange();e.getFunctionOption("zoomCallback").call(e,x[0],x[1],e.yAxisRanges())}},Dygraph.Interaction.endTouch=function(t,e,a){if(0!==t.touches.length)Dygraph.Interaction.startTouch(t,e,a);else if(1==t.changedTouches.length){var i=(new Date).getTime(),r=t.changedTouches[0];a.startTimeForDoubleTapMs&&i-a.startTimeForDoubleTapMs<500&&a.doubleTapX&&Math.abs(a.doubleTapX-r.screenX)<50&&a.doubleTapY&&Math.abs(a.doubleTapY-r.screenY)<50?e.resetZoom():(a.startTimeForDoubleTapMs=i,a.doubleTapX=r.screenX,a.doubleTapY=r.screenY)}};var e=function(t,e,a){return e>t?e-t:t>a?t-a:0},a=function(t,a){var i=Dygraph.findPos(a.canvas_),r={left:i.x,right:i.x+a.canvas_.offsetWidth,top:i.y,bottom:i.y+a.canvas_.offsetHeight},n={x:Dygraph.pageX(t),y:Dygraph.pageY(t)},o=e(n.x,r.left,r.right),s=e(n.y,r.top,r.bottom);return Math.max(o,s)};Dygraph.Interaction.defaultModel={mousedown:function(e,i,r){if(!e.button||2!=e.button){r.initializeMouseDown(e,i,r),e.altKey||e.shiftKey?Dygraph.startPan(e,i,r):Dygraph.startZoom(e,i,r);var n=function(e){if(r.isZooming){var n=a(e,i);t>n?Dygraph.moveZoom(e,i,r):null!==r.dragEndX&&(r.dragEndX=null,r.dragEndY=null,i.clearZoomRect_())}else r.isPanning&&Dygraph.movePan(e,i,r)},o=function(t){r.isZooming?null!==r.dragEndX?Dygraph.endZoom(t,i,r):Dygraph.Interaction.maybeTreatMouseOpAsClick(t,i,r):r.isPanning&&Dygraph.endPan(t,i,r),Dygraph.removeEvent(document,"mousemove",n),Dygraph.removeEvent(document,"mouseup",o),r.destroy()};i.addAndTrackEvent(document,"mousemove",n),i.addAndTrackEvent(document,"mouseup",o)}},willDestroyContextMyself:!0,touchstart:function(t,e,a){Dygraph.Interaction.startTouch(t,e,a)},touchmove:function(t,e,a){Dygraph.Interaction.moveTouch(t,e,a)},touchend:function(t,e,a){Dygraph.Interaction.endTouch(t,e,a)},dblclick:function(t,e,a){if(a.cancelNextDblclick)return void(a.cancelNextDblclick=!1);var i={canvasx:a.dragEndX,canvasy:a.dragEndY};e.cascadeEvents_("dblclick",i)||t.altKey||t.shiftKey||e.resetZoom()}},Dygraph.DEFAULT_ATTRS.interactionModel=Dygraph.Interaction.defaultModel,Dygraph.defaultInteractionModel=Dygraph.Interaction.defaultModel,Dygraph.endZoom=Dygraph.Interaction.endZoom,Dygraph.moveZoom=Dygraph.Interaction.moveZoom,Dygraph.startZoom=Dygraph.Interaction.startZoom,Dygraph.endPan=Dygraph.Interaction.endPan,Dygraph.movePan=Dygraph.Interaction.movePan,Dygraph.startPan=Dygraph.Interaction.startPan,Dygraph.Interaction.nonInteractiveModel_={mousedown:function(t,e,a){a.initializeMouseDown(t,e,a)},mouseup:Dygraph.Interaction.maybeTreatMouseOpAsClick},Dygraph.Interaction.dragIsPanInteractionModel={mousedown:function(t,e,a){a.initializeMouseDown(t,e,a),Dygraph.startPan(t,e,a)},mousemove:function(t,e,a){a.isPanning&&Dygraph.movePan(t,e,a)},mouseup:function(t,e,a){a.isPanning&&Dygraph.endPan(t,e,a)}}}(),function(){"use strict";Dygraph.TickList=void 0,Dygraph.Ticker=void 0,Dygraph.numericLinearTicks=function(t,e,a,i,r,n){var o=function(t){return"logscale"===t?!1:i(t)};return Dygraph.numericTicks(t,e,a,o,r,n)},Dygraph.numericTicks=function(t,e,a,i,r,n){var o,s,l,h,p=i("pixelsPerLabel"),g=[];if(n)for(o=0;o<n.length;o++)g.push({v:n[o]});else{if(i("logscale")){h=Math.floor(a/p);var d=Dygraph.binarySearch(t,Dygraph.PREFERRED_LOG_TICK_VALUES,1),u=Dygraph.binarySearch(e,Dygraph.PREFERRED_LOG_TICK_VALUES,-1);-1==d&&(d=0),-1==u&&(u=Dygraph.PREFERRED_LOG_TICK_VALUES.length-1);var c=null;if(u-d>=h/4){for(var y=u;y>=d;y--){var _=Dygraph.PREFERRED_LOG_TICK_VALUES[y],v=Math.log(_/t)/Math.log(e/t)*a,f={v:_};null===c?c={tickValue:_,pixel_coord:v}:Math.abs(v-c.pixel_coord)>=p?c={tickValue:_,pixel_coord:v}:f.label="",g.push(f)}g.reverse()}}if(0===g.length){var x,m,D=i("labelsKMG2");D?(x=[1,2,4,8,16,32,64,128,256],m=16):(x=[1,2,5,10,20,50,100],m=10);var w,A,b,T,E=Math.ceil(a/p),C=Math.abs(e-t)/E,L=Math.floor(Math.log(C)/Math.log(m)),P=Math.pow(m,L);for(s=0;s<x.length&&(w=P*x[s],A=Math.floor(t/w)*w,b=Math.ceil(e/w)*w,h=Math.abs(b-A)/w,T=a/h,!(T>p));s++);for(A>b&&(w*=-1),o=0;h>=o;o++)l=A+o*w,g.push({v:l})}}var S=i("axisLabelFormatter");for(o=0;o<g.length;o++)void 0===g[o].label&&(g[o].label=S.call(r,g[o].v,0,i,r));return g},Dygraph.dateTicker=function(t,e,a,i,r,n){var o=Dygraph.pickDateTickGranularity(t,e,a,i);return o>=0?Dygraph.getDateAxis(t,e,o,i,r):[]},Dygraph.SECONDLY=0,Dygraph.TWO_SECONDLY=1,Dygraph.FIVE_SECONDLY=2,Dygraph.TEN_SECONDLY=3,Dygraph.THIRTY_SECONDLY=4,Dygraph.MINUTELY=5,Dygraph.TWO_MINUTELY=6,Dygraph.FIVE_MINUTELY=7,Dygraph.TEN_MINUTELY=8,Dygraph.THIRTY_MINUTELY=9,Dygraph.HOURLY=10,Dygraph.TWO_HOURLY=11,Dygraph.SIX_HOURLY=12,Dygraph.DAILY=13,Dygraph.TWO_DAILY=14,Dygraph.WEEKLY=15,Dygraph.MONTHLY=16,Dygraph.QUARTERLY=17,Dygraph.BIANNUAL=18,Dygraph.ANNUAL=19,Dygraph.DECADAL=20,Dygraph.CENTENNIAL=21,Dygraph.NUM_GRANULARITIES=22,Dygraph.DATEFIELD_Y=0,Dygraph.DATEFIELD_M=1,Dygraph.DATEFIELD_D=2,Dygraph.DATEFIELD_HH=3,Dygraph.DATEFIELD_MM=4,Dygraph.DATEFIELD_SS=5,Dygraph.DATEFIELD_MS=6,Dygraph.NUM_DATEFIELDS=7,Dygraph.TICK_PLACEMENT=[],Dygraph.TICK_PLACEMENT[Dygraph.SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:1,spacing:1e3},Dygraph.TICK_PLACEMENT[Dygraph.TWO_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:2,spacing:2e3},Dygraph.TICK_PLACEMENT[Dygraph.FIVE_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:5,spacing:5e3},Dygraph.TICK_PLACEMENT[Dygraph.TEN_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:10,spacing:1e4},Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:30,spacing:3e4},Dygraph.TICK_PLACEMENT[Dygraph.MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:1,spacing:6e4},Dygraph.TICK_PLACEMENT[Dygraph.TWO_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:2,spacing:12e4},Dygraph.TICK_PLACEMENT[Dygraph.FIVE_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:5,spacing:3e5},Dygraph.TICK_PLACEMENT[Dygraph.TEN_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:10,spacing:6e5},Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:30,spacing:18e5},Dygraph.TICK_PLACEMENT[Dygraph.HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:1,spacing:36e5},Dygraph.TICK_PLACEMENT[Dygraph.TWO_HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:2,spacing:72e5},Dygraph.TICK_PLACEMENT[Dygraph.SIX_HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:6,spacing:216e5},Dygraph.TICK_PLACEMENT[Dygraph.DAILY]={datefield:Dygraph.DATEFIELD_D,step:1,spacing:864e5},Dygraph.TICK_PLACEMENT[Dygraph.TWO_DAILY]={datefield:Dygraph.DATEFIELD_D,step:2,spacing:1728e5},Dygraph.TICK_PLACEMENT[Dygraph.WEEKLY]={datefield:Dygraph.DATEFIELD_D,step:7,spacing:6048e5},Dygraph.TICK_PLACEMENT[Dygraph.MONTHLY]={datefield:Dygraph.DATEFIELD_M,step:1,spacing:2629817280},Dygraph.TICK_PLACEMENT[Dygraph.QUARTERLY]={datefield:Dygraph.DATEFIELD_M,step:3,spacing:216e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.BIANNUAL]={datefield:Dygraph.DATEFIELD_M,step:6,spacing:432e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.ANNUAL]={datefield:Dygraph.DATEFIELD_Y,step:1,spacing:864e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.DECADAL]={datefield:Dygraph.DATEFIELD_Y,step:10,spacing:315578073600},Dygraph.TICK_PLACEMENT[Dygraph.CENTENNIAL]={datefield:Dygraph.DATEFIELD_Y,step:100,spacing:3155780736e3},Dygraph.PREFERRED_LOG_TICK_VALUES=function(){for(var t=[],e=-39;39>=e;e++)for(var a=Math.pow(10,e),i=1;9>=i;i++){var r=a*i;t.push(r)}return t}(),Dygraph.pickDateTickGranularity=function(t,e,a,i){for(var r=i("pixelsPerLabel"),n=0;n<Dygraph.NUM_GRANULARITIES;n++){var o=Dygraph.numDateTicks(t,e,n);if(a/o>=r)return n}return-1},Dygraph.numDateTicks=function(t,e,a){var i=Dygraph.TICK_PLACEMENT[a].spacing;return Math.round(1*(e-t)/i)},Dygraph.getDateAxis=function(t,e,a,i,r){var n=i("axisLabelFormatter"),o=i("labelsUTC"),s=o?Dygraph.DateAccessorsUTC:Dygraph.DateAccessorsLocal,l=Dygraph.TICK_PLACEMENT[a].datefield,h=Dygraph.TICK_PLACEMENT[a].step,p=Dygraph.TICK_PLACEMENT[a].spacing,g=new Date(t),d=[];d[Dygraph.DATEFIELD_Y]=s.getFullYear(g),d[Dygraph.DATEFIELD_M]=s.getMonth(g),d[Dygraph.DATEFIELD_D]=s.getDate(g),d[Dygraph.DATEFIELD_HH]=s.getHours(g),d[Dygraph.DATEFIELD_MM]=s.getMinutes(g),d[Dygraph.DATEFIELD_SS]=s.getSeconds(g),d[Dygraph.DATEFIELD_MS]=s.getMilliseconds(g);var u=d[l]%h;a==Dygraph.WEEKLY&&(u=s.getDay(g)),d[l]-=u;for(var c=l+1;c<Dygraph.NUM_DATEFIELDS;c++)d[c]=c===Dygraph.DATEFIELD_D?1:0;var y=[],_=s.makeDate.apply(null,d),v=_.getTime();if(a<=Dygraph.HOURLY)for(t>v&&(v+=p,_=new Date(v));e>=v;)y.push({v:v,label:n.call(r,_,a,i,r)}),v+=p,_=new Date(v);else for(t>v&&(d[l]+=h,_=s.makeDate.apply(null,d),v=_.getTime());e>=v;)(a>=Dygraph.DAILY||s.getHours(_)%h===0)&&y.push({v:v,label:n.call(r,_,a,i,r)}),d[l]+=h,_=s.makeDate.apply(null,d),v=_.getTime();return y},Dygraph&&Dygraph.DEFAULT_ATTRS&&Dygraph.DEFAULT_ATTRS.axes&&Dygraph.DEFAULT_ATTRS.axes.x&&Dygraph.DEFAULT_ATTRS.axes.y&&Dygraph.DEFAULT_ATTRS.axes.y2&&(Dygraph.DEFAULT_ATTRS.axes.x.ticker=Dygraph.dateTicker,Dygraph.DEFAULT_ATTRS.axes.y.ticker=Dygraph.numericTicks,Dygraph.DEFAULT_ATTRS.axes.y2.ticker=Dygraph.numericTicks)}(),Dygraph.Plugins={},Dygraph.Plugins.Annotations=function(){"use strict";var t=function(){this.annotations_=[]};return t.prototype.toString=function(){return"Annotations Plugin"},t.prototype.activate=function(t){return{clearChart:this.clearChart,didDrawChart:this.didDrawChart}},t.prototype.detachLabels=function(){for(var t=0;t<this.annotations_.length;t++){var e=this.annotations_[t];e.parentNode&&e.parentNode.removeChild(e),this.annotations_[t]=null}this.annotations_=[]},t.prototype.clearChart=function(t){this.detachLabels()},t.prototype.didDrawChart=function(t){var e=t.dygraph,a=e.layout_.annotated_points;if(a&&0!==a.length)for(var i=t.canvas.parentNode,r={position:"absolute",fontSize:e.getOption("axisLabelFontSize")+"px",zIndex:10,overflow:"hidden"},n=function(t,a,i){return function(r){var n=i.annotation;n.hasOwnProperty(t)?n[t](n,i,e,r):e.getOption(a)&&e.getOption(a)(n,i,e,r)}},o=t.dygraph.plotter_.area,s={},l=0;l<a.length;l++){var h=a[l];if(!(h.canvasx<o.x||h.canvasx>o.x+o.w||h.canvasy<o.y||h.canvasy>o.y+o.h)){var p=h.annotation,g=6;p.hasOwnProperty("tickHeight")&&(g=p.tickHeight);var d=document.createElement("div");for(var u in r)r.hasOwnProperty(u)&&(d.style[u]=r[u]);p.hasOwnProperty("icon")||(d.className="dygraphDefaultAnnotation"),p.hasOwnProperty("cssClass")&&(d.className+=" "+p.cssClass);var c=p.hasOwnProperty("width")?p.width:16,y=p.hasOwnProperty("height")?p.height:16;if(p.hasOwnProperty("icon")){var _=document.createElement("img");_.src=p.icon,_.width=c,_.height=y,d.appendChild(_)}else h.annotation.hasOwnProperty("shortText")&&d.appendChild(document.createTextNode(h.annotation.shortText));var v=h.canvasx-c/2;d.style.left=v+"px";var f=0;if(p.attachAtBottom){var x=o.y+o.h-y-g;s[v]?x-=s[v]:s[v]=0,s[v]+=g+y,f=x}else f=h.canvasy-y-g;d.style.top=f+"px",d.style.width=c+"px",d.style.height=y+"px",d.title=h.annotation.text,d.style.color=e.colorsMap_[h.name],d.style.borderColor=e.colorsMap_[h.name],p.div=d,e.addAndTrackEvent(d,"click",n("clickHandler","annotationClickHandler",h,this)),e.addAndTrackEvent(d,"mouseover",n("mouseOverHandler","annotationMouseOverHandler",h,this)),e.addAndTrackEvent(d,"mouseout",n("mouseOutHandler","annotationMouseOutHandler",h,this)),e.addAndTrackEvent(d,"dblclick",n("dblClickHandler","annotationDblClickHandler",h,this)),i.appendChild(d),this.annotations_.push(d);var m=t.drawingContext;if(m.save(),m.strokeStyle=e.colorsMap_[h.name],m.beginPath(),p.attachAtBottom){var x=f+y;m.moveTo(h.canvasx,x),m.lineTo(h.canvasx,x+g)}else m.moveTo(h.canvasx,h.canvasy),m.lineTo(h.canvasx,h.canvasy-2-g);m.closePath(),m.stroke(),m.restore()}}},t.prototype.destroy=function(){this.detachLabels()},t}(),Dygraph.Plugins.Axes=function(){"use strict";var t=function(){this.xlabels_=[],this.ylabels_=[]};return t.prototype.toString=function(){return"Axes Plugin"},t.prototype.activate=function(t){return{layout:this.layout,clearChart:this.clearChart,willDrawChart:this.willDrawChart}},t.prototype.layout=function(t){var e=t.dygraph;if(e.getOptionForAxis("drawAxis","y")){var a=e.getOptionForAxis("axisLabelWidth","y")+2*e.getOptionForAxis("axisTickSize","y");t.reserveSpaceLeft(a)}if(e.getOptionForAxis("drawAxis","x")){var i;i=e.getOption("xAxisHeight")?e.getOption("xAxisHeight"):e.getOptionForAxis("axisLabelFontSize","x")+2*e.getOptionForAxis("axisTickSize","x"),t.reserveSpaceBottom(i)}if(2==e.numAxes()){if(e.getOptionForAxis("drawAxis","y2")){var a=e.getOptionForAxis("axisLabelWidth","y2")+2*e.getOptionForAxis("axisTickSize","y2");t.reserveSpaceRight(a)}}else e.numAxes()>2&&e.error("Only two y-axes are supported at this time. (Trying to use "+e.numAxes()+")")},t.prototype.detachLabels=function(){function t(t){for(var e=0;e<t.length;e++){var a=t[e];a.parentNode&&a.parentNode.removeChild(a)}}t(this.xlabels_),t(this.ylabels_),this.xlabels_=[],this.ylabels_=[]},t.prototype.clearChart=function(t){this.detachLabels()},t.prototype.willDrawChart=function(t){function e(t){return Math.round(t)+.5}function a(t){return Math.round(t)-.5}var i=t.dygraph;if(i.getOptionForAxis("drawAxis","x")||i.getOptionForAxis("drawAxis","y")||i.getOptionForAxis("drawAxis","y2")){var r,n,o,s,l,h=t.drawingContext,p=t.canvas.parentNode,g=i.width_,d=i.height_,u=function(t){return{position:"absolute",fontSize:i.getOptionForAxis("axisLabelFontSize",t)+"px",zIndex:10,color:i.getOptionForAxis("axisLabelColor",t),width:i.getOptionForAxis("axisLabelWidth",t)+"px",lineHeight:"normal",overflow:"hidden"}},c={x:u("x"),y:u("y"),y2:u("y2")},y=function(t,e,a){var i=document.createElement("div"),r=c["y2"==a?"y2":e];for(var n in r)r.hasOwnProperty(n)&&(i.style[n]=r[n]);var o=document.createElement("div");return o.className="dygraph-axis-label dygraph-axis-label-"+e+(a?" dygraph-axis-label-"+a:""),o.innerHTML=t,i.appendChild(o),i};h.save();var _=i.layout_,v=t.dygraph.plotter_.area,f=function(t){return function(e){return i.getOptionForAxis(e,t)}};if(i.getOptionForAxis("drawAxis","y")){if(_.yticks&&_.yticks.length>0){var x=i.numAxes(),m=[f("y"),f("y2")];for(l=0;l<_.yticks.length;l++){if(s=_.yticks[l],"function"==typeof s)return;n=v.x;var D=1,w="y1",A=m[0];1==s[0]&&(n=v.x+v.w,D=-1,w="y2",A=m[1]);var b=A("axisLabelFontSize");o=v.y+s[1]*v.h,r=y(s[2],"y",2==x?w:null);var T=o-b/2;0>T&&(T=0),T+b+3>d?r.style.bottom="0":r.style.top=T+"px",0===s[0]?(r.style.left=v.x-A("axisLabelWidth")-A("axisTickSize")+"px",r.style.textAlign="right"):1==s[0]&&(r.style.left=v.x+v.w+A("axisTickSize")+"px",r.style.textAlign="left"),r.style.width=A("axisLabelWidth")+"px",p.appendChild(r),this.ylabels_.push(r)}var E=this.ylabels_[0],b=i.getOptionForAxis("axisLabelFontSize","y"),C=parseInt(E.style.top,10)+b;C>d-b&&(E.style.top=parseInt(E.style.top,10)-b/2+"px")}var L;if(i.getOption("drawAxesAtZero")){var P=i.toPercentXCoord(0);(P>1||0>P||isNaN(P))&&(P=0),L=e(v.x+P*v.w)}else L=e(v.x);h.strokeStyle=i.getOptionForAxis("axisLineColor","y"),h.lineWidth=i.getOptionForAxis("axisLineWidth","y"),h.beginPath(),h.moveTo(L,a(v.y)),h.lineTo(L,a(v.y+v.h)),h.closePath(),h.stroke(),2==i.numAxes()&&(h.strokeStyle=i.getOptionForAxis("axisLineColor","y2"),h.lineWidth=i.getOptionForAxis("axisLineWidth","y2"),h.beginPath(),h.moveTo(a(v.x+v.w),a(v.y)),h.lineTo(a(v.x+v.w),a(v.y+v.h)),h.closePath(),h.stroke())}if(i.getOptionForAxis("drawAxis","x")){if(_.xticks){var A=f("x");for(l=0;l<_.xticks.length;l++){s=_.xticks[l],n=v.x+s[0]*v.w,o=v.y+v.h,r=y(s[1],"x"),r.style.textAlign="center",r.style.top=o+A("axisTickSize")+"px";var S=n-A("axisLabelWidth")/2;S+A("axisLabelWidth")>g&&(S=g-A("axisLabelWidth"),r.style.textAlign="right"),0>S&&(S=0,r.style.textAlign="left"),r.style.left=S+"px",r.style.width=A("axisLabelWidth")+"px",
p.appendChild(r),this.xlabels_.push(r)}}h.strokeStyle=i.getOptionForAxis("axisLineColor","x"),h.lineWidth=i.getOptionForAxis("axisLineWidth","x"),h.beginPath();var O;if(i.getOption("drawAxesAtZero")){var P=i.toPercentYCoord(0,0);(P>1||0>P)&&(P=1),O=a(v.y+P*v.h)}else O=a(v.y+v.h);h.moveTo(e(v.x),O),h.lineTo(e(v.x+v.w),O),h.closePath(),h.stroke()}h.restore()}},t}(),Dygraph.Plugins.ChartLabels=function(){"use strict";var t=function(){this.title_div_=null,this.xlabel_div_=null,this.ylabel_div_=null,this.y2label_div_=null};t.prototype.toString=function(){return"ChartLabels Plugin"},t.prototype.activate=function(t){return{layout:this.layout,didDrawChart:this.didDrawChart}};var e=function(t){var e=document.createElement("div");return e.style.position="absolute",e.style.left=t.x+"px",e.style.top=t.y+"px",e.style.width=t.w+"px",e.style.height=t.h+"px",e};t.prototype.detachLabels_=function(){for(var t=[this.title_div_,this.xlabel_div_,this.ylabel_div_,this.y2label_div_],e=0;e<t.length;e++){var a=t[e];a&&a.parentNode&&a.parentNode.removeChild(a)}this.title_div_=null,this.xlabel_div_=null,this.ylabel_div_=null,this.y2label_div_=null};var a=function(t,e,a,i,r){var n=document.createElement("div");n.style.position="absolute",1==a?n.style.left="0px":n.style.left=e.x+"px",n.style.top=e.y+"px",n.style.width=e.w+"px",n.style.height=e.h+"px",n.style.fontSize=t.getOption("yLabelWidth")-2+"px";var o=document.createElement("div");o.style.position="absolute",o.style.width=e.h+"px",o.style.height=e.w+"px",o.style.top=e.h/2-e.w/2+"px",o.style.left=e.w/2-e.h/2+"px",o.style.textAlign="center";var s="rotate("+(1==a?"-":"")+"90deg)";o.style.transform=s,o.style.WebkitTransform=s,o.style.MozTransform=s,o.style.OTransform=s,o.style.msTransform=s,"undefined"!=typeof document.documentMode&&document.documentMode<9&&(o.style.filter="progid:DXImageTransform.Microsoft.BasicImage(rotation="+(1==a?"3":"1")+")",o.style.left="0px",o.style.top="0px");var l=document.createElement("div");return l.className=i,l.innerHTML=r,o.appendChild(l),n.appendChild(o),n};return t.prototype.layout=function(t){this.detachLabels_();var i=t.dygraph,r=t.chart_div;if(i.getOption("title")){var n=t.reserveSpaceTop(i.getOption("titleHeight"));this.title_div_=e(n),this.title_div_.style.textAlign="center",this.title_div_.style.fontSize=i.getOption("titleHeight")-8+"px",this.title_div_.style.fontWeight="bold",this.title_div_.style.zIndex=10;var o=document.createElement("div");o.className="dygraph-label dygraph-title",o.innerHTML=i.getOption("title"),this.title_div_.appendChild(o),r.appendChild(this.title_div_)}if(i.getOption("xlabel")){var s=t.reserveSpaceBottom(i.getOption("xLabelHeight"));this.xlabel_div_=e(s),this.xlabel_div_.style.textAlign="center",this.xlabel_div_.style.fontSize=i.getOption("xLabelHeight")-2+"px";var o=document.createElement("div");o.className="dygraph-label dygraph-xlabel",o.innerHTML=i.getOption("xlabel"),this.xlabel_div_.appendChild(o),r.appendChild(this.xlabel_div_)}if(i.getOption("ylabel")){var l=t.reserveSpaceLeft(0);this.ylabel_div_=a(i,l,1,"dygraph-label dygraph-ylabel",i.getOption("ylabel")),r.appendChild(this.ylabel_div_)}if(i.getOption("y2label")&&2==i.numAxes()){var h=t.reserveSpaceRight(0);this.y2label_div_=a(i,h,2,"dygraph-label dygraph-y2label",i.getOption("y2label")),r.appendChild(this.y2label_div_)}},t.prototype.didDrawChart=function(t){var e=t.dygraph;this.title_div_&&(this.title_div_.children[0].innerHTML=e.getOption("title")),this.xlabel_div_&&(this.xlabel_div_.children[0].innerHTML=e.getOption("xlabel")),this.ylabel_div_&&(this.ylabel_div_.children[0].children[0].innerHTML=e.getOption("ylabel")),this.y2label_div_&&(this.y2label_div_.children[0].children[0].innerHTML=e.getOption("y2label"))},t.prototype.clearChart=function(){},t.prototype.destroy=function(){this.detachLabels_()},t}(),Dygraph.Plugins.Grid=function(){"use strict";var t=function(){};return t.prototype.toString=function(){return"Gridline Plugin"},t.prototype.activate=function(t){return{willDrawChart:this.willDrawChart}},t.prototype.willDrawChart=function(t){function e(t){return Math.round(t)+.5}function a(t){return Math.round(t)-.5}var i,r,n,o,s=t.dygraph,l=t.drawingContext,h=s.layout_,p=t.dygraph.plotter_.area;if(s.getOptionForAxis("drawGrid","y")){for(var g=["y","y2"],d=[],u=[],c=[],y=[],_=[],n=0;n<g.length;n++)c[n]=s.getOptionForAxis("drawGrid",g[n]),c[n]&&(d[n]=s.getOptionForAxis("gridLineColor",g[n]),u[n]=s.getOptionForAxis("gridLineWidth",g[n]),_[n]=s.getOptionForAxis("gridLinePattern",g[n]),y[n]=_[n]&&_[n].length>=2);for(o=h.yticks,l.save(),n=0;n<o.length;n++){var v=o[n][0];c[v]&&(y[v]&&l.installPattern(_[v]),l.strokeStyle=d[v],l.lineWidth=u[v],i=e(p.x),r=a(p.y+o[n][1]*p.h),l.beginPath(),l.moveTo(i,r),l.lineTo(i+p.w,r),l.closePath(),l.stroke(),y[v]&&l.uninstallPattern())}l.restore()}if(s.getOptionForAxis("drawGrid","x")){o=h.xticks,l.save();var _=s.getOptionForAxis("gridLinePattern","x"),y=_&&_.length>=2;for(y&&l.installPattern(_),l.strokeStyle=s.getOptionForAxis("gridLineColor","x"),l.lineWidth=s.getOptionForAxis("gridLineWidth","x"),n=0;n<o.length;n++)i=e(p.x+o[n][0]*p.w),r=a(p.y+p.h),l.beginPath(),l.moveTo(i,r),l.lineTo(i,p.y),l.closePath(),l.stroke();y&&l.uninstallPattern(),l.restore()}},t.prototype.destroy=function(){},t}(),Dygraph.Plugins.Legend=function(){"use strict";var t=function(){this.legend_div_=null,this.is_generated_div_=!1};t.prototype.toString=function(){return"Legend Plugin"};var e;t.prototype.activate=function(t){var e,a=t.getOption("labelsDivWidth"),i=t.getOption("labelsDiv");if(i&&null!==i)e="string"==typeof i||i instanceof String?document.getElementById(i):i;else{var r={position:"absolute",fontSize:"14px",zIndex:10,width:a+"px",top:"0px",left:t.size().width-a-2+"px",background:"white",lineHeight:"normal",textAlign:"left",overflow:"hidden"};Dygraph.update(r,t.getOption("labelsDivStyles")),e=document.createElement("div"),e.className="dygraph-legend";for(var n in r)if(r.hasOwnProperty(n))try{e.style[n]=r[n]}catch(o){console.warn("You are using unsupported css properties for your browser in labelsDivStyles")}t.graphDiv.appendChild(e),this.is_generated_div_=!0}return this.legend_div_=e,this.one_em_width_=10,{select:this.select,deselect:this.deselect,predraw:this.predraw,didDrawChart:this.didDrawChart}};var a=function(t){var e=document.createElement("span");e.setAttribute("style","margin: 0; padding: 0 0 0 1em; border: 0;"),t.appendChild(e);var a=e.offsetWidth;return t.removeChild(e),a},i=function(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")};return t.prototype.select=function(e){var a=e.selectedX,i=e.selectedPoints,r=e.selectedRow,n=e.dygraph.getOption("legend");if("never"===n)return void(this.legend_div_.style.display="none");if("follow"===n){var o=e.dygraph.plotter_.area,s=e.dygraph.getOption("labelsDivWidth"),l=e.dygraph.getOptionForAxis("axisLabelWidth","y"),h=i[0].x*o.w+20,p=i[0].y*o.h-20;h+s+1>window.scrollX+window.innerWidth&&(h=h-40-s-(l-o.x)),e.dygraph.graphDiv.appendChild(this.legend_div_),this.legend_div_.style.left=l+h+"px",this.legend_div_.style.top=p+"px"}var g=t.generateLegendHTML(e.dygraph,a,i,this.one_em_width_,r);this.legend_div_.innerHTML=g,this.legend_div_.style.display=""},t.prototype.deselect=function(e){var i=e.dygraph.getOption("legend");"always"!==i&&(this.legend_div_.style.display="none");var r=a(this.legend_div_);this.one_em_width_=r;var n=t.generateLegendHTML(e.dygraph,void 0,void 0,r,null);this.legend_div_.innerHTML=n},t.prototype.didDrawChart=function(t){this.deselect(t)},t.prototype.predraw=function(t){if(this.is_generated_div_){t.dygraph.graphDiv.appendChild(this.legend_div_);var e=t.dygraph.plotter_.area,a=t.dygraph.getOption("labelsDivWidth");this.legend_div_.style.left=e.x+e.w-a-1+"px",this.legend_div_.style.top=e.y+"px",this.legend_div_.style.width=a+"px"}},t.prototype.destroy=function(){this.legend_div_=null},t.generateLegendHTML=function(t,a,r,n,o){if(t.getOption("showLabelsOnHighlight")!==!0)return"";var s,l,h,p,g,d=t.getLabels();if("undefined"==typeof a){if("always"!=t.getOption("legend"))return"";for(l=t.getOption("labelsSeparateLines"),s="",h=1;h<d.length;h++){var u=t.getPropertiesForSeries(d[h]);u.visible&&(""!==s&&(s+=l?"<br/>":" "),g=t.getOption("strokePattern",d[h]),p=e(g,u.color,n),s+="<span style='font-weight: bold; color: "+u.color+";'>"+p+" "+i(d[h])+"</span>")}return s}var c=t.optionsViewForAxis_("x"),y=c("valueFormatter");s=y.call(t,a,c,d[0],t,o,0),""!==s&&(s+=":");var _=[],v=t.numAxes();for(h=0;v>h;h++)_[h]=t.optionsViewForAxis_("y"+(h?1+h:""));var f=t.getOption("labelsShowZeroValues");l=t.getOption("labelsSeparateLines");var x=t.getHighlightSeries();for(h=0;h<r.length;h++){var m=r[h];if((0!==m.yval||f)&&Dygraph.isOK(m.canvasy)){l&&(s+="<br/>");var u=t.getPropertiesForSeries(m.name),D=_[u.axis-1],w=D("valueFormatter"),A=w.call(t,m.yval,D,m.name,t,o,d.indexOf(m.name)),b=m.name==x?" class='highlight'":"";s+="<span"+b+"> <b><span style='color: "+u.color+";'>"+i(m.name)+"</span></b>:&#160;"+A+"</span>"}}return s},e=function(t,e,a){var i=/MSIE/.test(navigator.userAgent)&&!window.opera;if(i)return"&mdash;";if(!t||t.length<=1)return'<div style="display: inline-block; position: relative; bottom: .5ex; padding-left: 1em; height: 1px; border-bottom: 2px solid '+e+';"></div>';var r,n,o,s,l,h=0,p=0,g=[];for(r=0;r<=t.length;r++)h+=t[r%t.length];if(l=Math.floor(a/(h-t[0])),l>1){for(r=0;r<t.length;r++)g[r]=t[r]/a;p=g.length}else{for(l=1,r=0;r<t.length;r++)g[r]=t[r]/h;p=g.length+1}var d="";for(n=0;l>n;n++)for(r=0;p>r;r+=2)o=g[r%g.length],s=r<t.length?g[(r+1)%g.length]:0,d+='<div style="display: inline-block; position: relative; bottom: .5ex; margin-right: '+s+"em; padding-left: "+o+"em; height: 1px; border-bottom: 2px solid "+e+';"></div>';return d},t}(),Dygraph.Plugins.RangeSelector=function(){"use strict";var t=function(){this.isIE_=/MSIE/.test(navigator.userAgent)&&!window.opera,this.hasTouchInterface_="undefined"!=typeof TouchEvent,this.isMobileDevice_=/mobile|android/gi.test(navigator.appVersion),this.interfaceCreated_=!1};return t.prototype.toString=function(){return"RangeSelector Plugin"},t.prototype.activate=function(t){return this.dygraph_=t,this.isUsingExcanvas_=t.isUsingExcanvas_,this.getOption_("showRangeSelector")&&this.createInterface_(),{layout:this.reserveSpace_,predraw:this.renderStaticLayer_,didDrawChart:this.renderInteractiveLayer_}},t.prototype.destroy=function(){this.bgcanvas_=null,this.fgcanvas_=null,this.leftZoomHandle_=null,this.rightZoomHandle_=null,this.iePanOverlay_=null},t.prototype.getOption_=function(t,e){return this.dygraph_.getOption(t,e)},t.prototype.setDefaultOption_=function(t,e){this.dygraph_.attrs_[t]=e},t.prototype.createInterface_=function(){this.createCanvases_(),this.isUsingExcanvas_&&this.createIEPanOverlay_(),this.createZoomHandles_(),this.initInteraction_(),this.getOption_("animatedZooms")&&(console.warn("Animated zooms and range selector are not compatible; disabling animatedZooms."),this.dygraph_.updateOptions({animatedZooms:!1},!0)),this.interfaceCreated_=!0,this.addToGraph_()},t.prototype.addToGraph_=function(){var t=this.graphDiv_=this.dygraph_.graphDiv;t.appendChild(this.bgcanvas_),t.appendChild(this.fgcanvas_),t.appendChild(this.leftZoomHandle_),t.appendChild(this.rightZoomHandle_)},t.prototype.removeFromGraph_=function(){var t=this.graphDiv_;t.removeChild(this.bgcanvas_),t.removeChild(this.fgcanvas_),t.removeChild(this.leftZoomHandle_),t.removeChild(this.rightZoomHandle_),this.graphDiv_=null},t.prototype.reserveSpace_=function(t){this.getOption_("showRangeSelector")&&t.reserveSpaceBottom(this.getOption_("rangeSelectorHeight")+4)},t.prototype.renderStaticLayer_=function(){this.updateVisibility_()&&(this.resize_(),this.drawStaticLayer_())},t.prototype.renderInteractiveLayer_=function(){this.updateVisibility_()&&!this.isChangingRange_&&(this.placeZoomHandles_(),this.drawInteractiveLayer_())},t.prototype.updateVisibility_=function(){var t=this.getOption_("showRangeSelector");if(t)this.interfaceCreated_?this.graphDiv_&&this.graphDiv_.parentNode||this.addToGraph_():this.createInterface_();else if(this.graphDiv_){this.removeFromGraph_();var e=this.dygraph_;setTimeout(function(){e.width_=0,e.resize()},1)}return t},t.prototype.resize_=function(){function t(t,e,a){var i=Dygraph.getContextPixelRatio(e);t.style.top=a.y+"px",t.style.left=a.x+"px",t.width=a.w*i,t.height=a.h*i,t.style.width=a.w+"px",t.style.height=a.h+"px",1!=i&&e.scale(i,i)}var e=this.dygraph_.layout_.getPlotArea(),a=0;this.dygraph_.getOptionForAxis("drawAxis","x")&&(a=this.getOption_("xAxisHeight")||this.getOption_("axisLabelFontSize")+2*this.getOption_("axisTickSize")),this.canvasRect_={x:e.x,y:e.y+e.h+a+4,w:e.w,h:this.getOption_("rangeSelectorHeight")},t(this.bgcanvas_,this.bgcanvas_ctx_,this.canvasRect_),t(this.fgcanvas_,this.fgcanvas_ctx_,this.canvasRect_)},t.prototype.createCanvases_=function(){this.bgcanvas_=Dygraph.createCanvas(),this.bgcanvas_.className="dygraph-rangesel-bgcanvas",this.bgcanvas_.style.position="absolute",this.bgcanvas_.style.zIndex=9,this.bgcanvas_ctx_=Dygraph.getContext(this.bgcanvas_),this.fgcanvas_=Dygraph.createCanvas(),this.fgcanvas_.className="dygraph-rangesel-fgcanvas",this.fgcanvas_.style.position="absolute",this.fgcanvas_.style.zIndex=9,this.fgcanvas_.style.cursor="default",this.fgcanvas_ctx_=Dygraph.getContext(this.fgcanvas_)},t.prototype.createIEPanOverlay_=function(){this.iePanOverlay_=document.createElement("div"),this.iePanOverlay_.style.position="absolute",this.iePanOverlay_.style.backgroundColor="white",this.iePanOverlay_.style.filter="alpha(opacity=0)",this.iePanOverlay_.style.display="none",this.iePanOverlay_.style.cursor="move",this.fgcanvas_.appendChild(this.iePanOverlay_)},t.prototype.createZoomHandles_=function(){var t=new Image;t.className="dygraph-rangesel-zoomhandle",t.style.position="absolute",t.style.zIndex=10,t.style.visibility="hidden",t.style.cursor="col-resize",/MSIE 7/.test(navigator.userAgent)?(t.width=7,t.height=14,t.style.backgroundColor="white",t.style.border="1px solid #333333"):(t.width=9,t.height=16,t.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAAzwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7sqSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII="),this.isMobileDevice_&&(t.width*=2,t.height*=2),this.leftZoomHandle_=t,this.rightZoomHandle_=t.cloneNode(!1)},t.prototype.initInteraction_=function(){var t,e,a,i,r,n,o,s,l,h,p,g,d,u,c=this,y=document,_=0,v=null,f=!1,x=!1,m=!this.isMobileDevice_&&!this.isUsingExcanvas_,D=new Dygraph.IFrameTarp;t=function(t){var e=c.dygraph_.xAxisExtremes(),a=(e[1]-e[0])/c.canvasRect_.w,i=e[0]+(t.leftHandlePos-c.canvasRect_.x)*a,r=e[0]+(t.rightHandlePos-c.canvasRect_.x)*a;return[i,r]},e=function(t){return Dygraph.cancelEvent(t),f=!0,_=t.clientX,v=t.target?t.target:t.srcElement,("mousedown"===t.type||"dragstart"===t.type)&&(Dygraph.addEvent(y,"mousemove",a),Dygraph.addEvent(y,"mouseup",i)),c.fgcanvas_.style.cursor="col-resize",D.cover(),!0},a=function(t){if(!f)return!1;Dygraph.cancelEvent(t);var e=t.clientX-_;if(Math.abs(e)<4)return!0;_=t.clientX;var a,i=c.getZoomHandleStatus_();v==c.leftZoomHandle_?(a=i.leftHandlePos+e,a=Math.min(a,i.rightHandlePos-v.width-3),a=Math.max(a,c.canvasRect_.x)):(a=i.rightHandlePos+e,a=Math.min(a,c.canvasRect_.x+c.canvasRect_.w),a=Math.max(a,i.leftHandlePos+v.width+3));var n=v.width/2;return v.style.left=a-n+"px",c.drawInteractiveLayer_(),m&&r(),!0},i=function(t){return f?(f=!1,D.uncover(),Dygraph.removeEvent(y,"mousemove",a),Dygraph.removeEvent(y,"mouseup",i),c.fgcanvas_.style.cursor="default",m||r(),!0):!1},r=function(){try{var e=c.getZoomHandleStatus_();if(c.isChangingRange_=!0,e.isZoomed){var a=t(e);c.dygraph_.doZoomXDates_(a[0],a[1])}else c.dygraph_.resetZoom()}finally{c.isChangingRange_=!1}},n=function(t){if(c.isUsingExcanvas_)return t.srcElement==c.iePanOverlay_;var e=c.leftZoomHandle_.getBoundingClientRect(),a=e.left+e.width/2;e=c.rightZoomHandle_.getBoundingClientRect();var i=e.left+e.width/2;return t.clientX>a&&t.clientX<i},o=function(t){return!x&&n(t)&&c.getZoomHandleStatus_().isZoomed?(Dygraph.cancelEvent(t),x=!0,_=t.clientX,"mousedown"===t.type&&(Dygraph.addEvent(y,"mousemove",s),Dygraph.addEvent(y,"mouseup",l)),!0):!1},s=function(t){if(!x)return!1;Dygraph.cancelEvent(t);var e=t.clientX-_;if(Math.abs(e)<4)return!0;_=t.clientX;var a=c.getZoomHandleStatus_(),i=a.leftHandlePos,r=a.rightHandlePos,n=r-i;i+e<=c.canvasRect_.x?(i=c.canvasRect_.x,r=i+n):r+e>=c.canvasRect_.x+c.canvasRect_.w?(r=c.canvasRect_.x+c.canvasRect_.w,i=r-n):(i+=e,r+=e);var o=c.leftZoomHandle_.width/2;return c.leftZoomHandle_.style.left=i-o+"px",c.rightZoomHandle_.style.left=r-o+"px",c.drawInteractiveLayer_(),m&&h(),!0},l=function(t){return x?(x=!1,Dygraph.removeEvent(y,"mousemove",s),Dygraph.removeEvent(y,"mouseup",l),m||h(),!0):!1},h=function(){try{c.isChangingRange_=!0,c.dygraph_.dateWindow_=t(c.getZoomHandleStatus_()),c.dygraph_.drawGraph_(!1)}finally{c.isChangingRange_=!1}},p=function(t){if(!f&&!x){var e=n(t)?"move":"default";e!=c.fgcanvas_.style.cursor&&(c.fgcanvas_.style.cursor=e)}},g=function(t){"touchstart"==t.type&&1==t.targetTouches.length?e(t.targetTouches[0])&&Dygraph.cancelEvent(t):"touchmove"==t.type&&1==t.targetTouches.length?a(t.targetTouches[0])&&Dygraph.cancelEvent(t):i(t)},d=function(t){"touchstart"==t.type&&1==t.targetTouches.length?o(t.targetTouches[0])&&Dygraph.cancelEvent(t):"touchmove"==t.type&&1==t.targetTouches.length?s(t.targetTouches[0])&&Dygraph.cancelEvent(t):l(t)},u=function(t,e){for(var a=["touchstart","touchend","touchmove","touchcancel"],i=0;i<a.length;i++)c.dygraph_.addAndTrackEvent(t,a[i],e)},this.setDefaultOption_("interactionModel",Dygraph.Interaction.dragIsPanInteractionModel),this.setDefaultOption_("panEdgeFraction",1e-4);var w=window.opera?"mousedown":"dragstart";this.dygraph_.addAndTrackEvent(this.leftZoomHandle_,w,e),this.dygraph_.addAndTrackEvent(this.rightZoomHandle_,w,e),this.isUsingExcanvas_?this.dygraph_.addAndTrackEvent(this.iePanOverlay_,"mousedown",o):(this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousedown",o),this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousemove",p)),this.hasTouchInterface_&&(u(this.leftZoomHandle_,g),u(this.rightZoomHandle_,g),u(this.fgcanvas_,d))},t.prototype.drawStaticLayer_=function(){var t=this.bgcanvas_ctx_;t.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);try{this.drawMiniPlot_()}catch(e){console.warn(e)}var a=.5;this.bgcanvas_ctx_.lineWidth=1,t.strokeStyle="gray",t.beginPath(),t.moveTo(a,a),t.lineTo(a,this.canvasRect_.h-a),t.lineTo(this.canvasRect_.w-a,this.canvasRect_.h-a),t.lineTo(this.canvasRect_.w-a,a),t.stroke()},t.prototype.drawMiniPlot_=function(){var t=this.getOption_("rangeSelectorPlotFillColor"),e=this.getOption_("rangeSelectorPlotStrokeColor");if(t||e){var a=this.getOption_("stepPlot"),i=this.computeCombinedSeriesAndLimits_(),r=i.yMax-i.yMin,n=this.bgcanvas_ctx_,o=.5,s=this.dygraph_.xAxisExtremes(),l=Math.max(s[1]-s[0],1e-30),h=(this.canvasRect_.w-o)/l,p=(this.canvasRect_.h-o)/r,g=this.canvasRect_.w-o,d=this.canvasRect_.h-o,u=null,c=null;n.beginPath(),n.moveTo(o,d);for(var y=0;y<i.data.length;y++){var _=i.data[y],v=null!==_[0]?(_[0]-s[0])*h:0/0,f=null!==_[1]?d-(_[1]-i.yMin)*p:0/0;(a||null===u||Math.round(v)!=Math.round(u))&&(isFinite(v)&&isFinite(f)?(null===u?n.lineTo(v,d):a&&n.lineTo(v,c),n.lineTo(v,f),u=v,c=f):(null!==u&&(a?(n.lineTo(v,c),n.lineTo(v,d)):n.lineTo(u,d)),u=c=null))}if(n.lineTo(g,d),n.closePath(),t){var x=this.bgcanvas_ctx_.createLinearGradient(0,0,0,d);x.addColorStop(0,"white"),x.addColorStop(1,t),this.bgcanvas_ctx_.fillStyle=x,n.fill()}e&&(this.bgcanvas_ctx_.strokeStyle=e,this.bgcanvas_ctx_.lineWidth=1.5,n.stroke())}},t.prototype.computeCombinedSeriesAndLimits_=function(){var t,e=this.dygraph_,a=this.getOption_("logscale"),i=e.numColumns(),r=e.getLabels(),n=new Array(i),o=!1;for(t=1;i>t;t++){var s=this.getOption_("showInRangeSelector",r[t]);n[t]=s,null!==s&&(o=!0)}if(!o)for(t=0;t<n.length;t++)n[t]=!0;var l=[],h=e.dataHandler_,p=e.attributes_;for(t=1;t<e.numColumns();t++)if(n[t]){var g=h.extractSeries(e.rawData_,t,p);e.rollPeriod()>1&&(g=h.rollingAverage(g,e.rollPeriod(),p)),l.push(g)}var d=[];for(t=0;t<l[0].length;t++){for(var u=0,c=0,y=0;y<l.length;y++){var _=l[y][t][1];null===_||isNaN(_)||(c++,u+=_)}d.push([l[0][t][0],u/c])}var v=Number.MAX_VALUE,f=-Number.MAX_VALUE;for(t=0;t<d.length;t++){var x=d[t][1];null!==x&&isFinite(x)&&(!a||x>0)&&(v=Math.min(v,x),f=Math.max(f,x))}var m=.25;if(a)for(f=Dygraph.log10(f),f+=f*m,v=Dygraph.log10(v),t=0;t<d.length;t++)d[t][1]=Dygraph.log10(d[t][1]);else{var D,w=f-v;D=w<=Number.MIN_VALUE?f*m:w*m,f+=D,v-=D}return{data:d,yMin:v,yMax:f}},t.prototype.placeZoomHandles_=function(){var t=this.dygraph_.xAxisExtremes(),e=this.dygraph_.xAxisRange(),a=t[1]-t[0],i=Math.max(0,(e[0]-t[0])/a),r=Math.max(0,(t[1]-e[1])/a),n=this.canvasRect_.x+this.canvasRect_.w*i,o=this.canvasRect_.x+this.canvasRect_.w*(1-r),s=Math.max(this.canvasRect_.y,this.canvasRect_.y+(this.canvasRect_.h-this.leftZoomHandle_.height)/2),l=this.leftZoomHandle_.width/2;this.leftZoomHandle_.style.left=n-l+"px",this.leftZoomHandle_.style.top=s+"px",this.rightZoomHandle_.style.left=o-l+"px",this.rightZoomHandle_.style.top=this.leftZoomHandle_.style.top,this.leftZoomHandle_.style.visibility="visible",this.rightZoomHandle_.style.visibility="visible"},t.prototype.drawInteractiveLayer_=function(){var t=this.fgcanvas_ctx_;t.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);var e=1,a=this.canvasRect_.w-e,i=this.canvasRect_.h-e,r=this.getZoomHandleStatus_();if(t.strokeStyle="black",r.isZoomed){var n=Math.max(e,r.leftHandlePos-this.canvasRect_.x),o=Math.min(a,r.rightHandlePos-this.canvasRect_.x);t.fillStyle="rgba(240, 240, 240, 0.6)",t.fillRect(0,0,n,this.canvasRect_.h),t.fillRect(o,0,this.canvasRect_.w-o,this.canvasRect_.h),t.beginPath(),t.moveTo(e,e),t.lineTo(n,e),t.lineTo(n,i),t.lineTo(o,i),t.lineTo(o,e),t.lineTo(a,e),t.stroke(),this.isUsingExcanvas_&&(this.iePanOverlay_.style.width=o-n+"px",this.iePanOverlay_.style.left=n+"px",this.iePanOverlay_.style.height=i+"px",this.iePanOverlay_.style.display="inline")}else t.beginPath(),t.moveTo(e,e),t.lineTo(e,i),t.lineTo(a,i),t.lineTo(a,e),t.stroke(),this.iePanOverlay_&&(this.iePanOverlay_.style.display="none")},t.prototype.getZoomHandleStatus_=function(){var t=this.leftZoomHandle_.width/2,e=parseFloat(this.leftZoomHandle_.style.left)+t,a=parseFloat(this.rightZoomHandle_.style.left)+t;return{leftHandlePos:e,rightHandlePos:a,isZoomed:e-1>this.canvasRect_.x||a+1<this.canvasRect_.x+this.canvasRect_.w}},t}(),Dygraph.PLUGINS.push(Dygraph.Plugins.Legend,Dygraph.Plugins.Axes,Dygraph.Plugins.RangeSelector,Dygraph.Plugins.ChartLabels,Dygraph.Plugins.Annotations,Dygraph.Plugins.Grid),Dygraph.DataHandler=function(){},Dygraph.DataHandlers={},function(){"use strict";var t=Dygraph.DataHandler;t.X=0,t.Y=1,t.EXTRAS=2,t.prototype.extractSeries=function(t,e,a){},t.prototype.seriesToPoints=function(e,a,i){for(var r=[],n=0;n<e.length;++n){var o=e[n],s=o[1],l=null===s?null:t.parseFloat(s),h={x:0/0,y:0/0,xval:t.parseFloat(o[0]),yval:l,name:a,idx:n+i};r.push(h)}return this.onPointsCreated_(e,r),r},t.prototype.onPointsCreated_=function(t,e){},t.prototype.rollingAverage=function(t,e,a){},t.prototype.getExtremeYValues=function(t,e,a){},t.prototype.onLineEvaluated=function(t,e,a){},t.prototype.computeYInterpolation_=function(t,e,a){var i=e[1]-t[1],r=e[0]-t[0],n=i/r,o=(a-t[0])*n;return t[1]+o},t.prototype.getIndexesInWindow_=function(t,e){var a=0,i=t.length-1;if(e){for(var r=0,n=e[0],o=e[1];r<t.length-1&&t[r][0]<n;)a++,r++;for(r=t.length-1;r>0&&t[r][0]>o;)i--,r--}return i>=a?[a,i]:[0,t.length-1]},t.parseFloat=function(t){return null===t?0/0:t}}(),function(){"use strict";Dygraph.DataHandlers.DefaultHandler=function(){};var t=Dygraph.DataHandlers.DefaultHandler;t.prototype=new Dygraph.DataHandler,t.prototype.extractSeries=function(t,e,a){for(var i=[],r=a.get("logscale"),n=0;n<t.length;n++){var o=t[n][0],s=t[n][e];r&&0>=s&&(s=null),i.push([o,s])}return i},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l=[];if(1==e)return t;for(i=0;i<t.length;i++){for(o=0,s=0,r=Math.max(0,i-e+1);i+1>r;r++)n=t[r][1],null===n||isNaN(n)||(s++,o+=t[r][1]);s?l[i]=[t[i][0],o/s]:l[i]=[t[i][0],null]}return l},t.prototype.getExtremeYValues=function(t,e,a){for(var i,r=null,n=null,o=0,s=t.length-1,l=o;s>=l;l++)i=t[l][1],null===i||isNaN(i)||((null===n||i>n)&&(n=i),(null===r||r>i)&&(r=i));return[r,n]}}(),function(){"use strict";Dygraph.DataHandlers.DefaultFractionHandler=function(){};var t=Dygraph.DataHandlers.DefaultFractionHandler;t.prototype=new Dygraph.DataHandlers.DefaultHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s,l,h=[],p=100,g=a.get("logscale"),d=0;d<t.length;d++)i=t[d][0],n=t[d][e],g&&null!==n&&(n[0]<=0||n[1]<=0)&&(n=null),null!==n?(o=n[0],s=n[1],null===o||isNaN(o)?h.push([i,o,[o,s]]):(l=s?o/s:0,r=p*l,h.push([i,r,[o,s]]))):h.push([i,null,[null,null]]);return h},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r=[],n=0,o=0,s=100;for(i=0;i<t.length;i++){n+=t[i][2][0],o+=t[i][2][1],i-e>=0&&(n-=t[i-e][2][0],o-=t[i-e][2][1]);var l=t[i][0],h=o?n/o:0;r[i]=[l,s*h]}return r}}(),function(){"use strict";Dygraph.DataHandlers.BarsHandler=function(){Dygraph.DataHandler.call(this)},Dygraph.DataHandlers.BarsHandler.prototype=new Dygraph.DataHandler;var t=Dygraph.DataHandlers.BarsHandler;t.prototype.extractSeries=function(t,e,a){},t.prototype.rollingAverage=function(t,e,a){},t.prototype.onPointsCreated_=function(t,e){for(var a=0;a<t.length;++a){var i=t[a],r=e[a];r.y_top=0/0,r.y_bottom=0/0,r.yval_minus=Dygraph.DataHandler.parseFloat(i[2][0]),r.yval_plus=Dygraph.DataHandler.parseFloat(i[2][1])}},t.prototype.getExtremeYValues=function(t,e,a){for(var i,r=null,n=null,o=0,s=t.length-1,l=o;s>=l;l++)if(i=t[l][1],null!==i&&!isNaN(i)){var h=t[l][2][0],p=t[l][2][1];h>i&&(h=i),i>p&&(p=i),(null===n||p>n)&&(n=p),(null===r||r>h)&&(r=h)}return[r,n]},t.prototype.onLineEvaluated=function(t,e,a){for(var i,r=0;r<t.length;r++)i=t[r],i.y_top=DygraphLayout.calcYNormal_(e,i.yval_minus,a),i.y_bottom=DygraphLayout.calcYNormal_(e,i.yval_plus,a)}}(),function(){"use strict";Dygraph.DataHandlers.CustomBarsHandler=function(){};var t=Dygraph.DataHandlers.CustomBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o=[],s=a.get("logscale"),l=0;l<t.length;l++)i=t[l][0],n=t[l][e],s&&null!==n&&(n[0]<=0||n[1]<=0||n[2]<=0)&&(n=null),null!==n?(r=n[1],o.push(null===r||isNaN(r)?[i,r,[r,r]]:[i,r,[n[0],n[2]]])):o.push([i,null,[null,null]]);return o},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l,h,p=[];for(r=0,o=0,n=0,s=0,l=0;l<t.length;l++){if(i=t[l][1],h=t[l][2],p[l]=t[l],null===i||isNaN(i)||(r+=h[0],o+=i,n+=h[1],s+=1),l-e>=0){var g=t[l-e];null===g[1]||isNaN(g[1])||(r-=g[2][0],o-=g[1],n-=g[2][1],s-=1)}s?p[l]=[t[l][0],1*o/s,[1*r/s,1*n/s]]:p[l]=[t[l][0],null,[null,null]]}return p}}(),function(){"use strict";Dygraph.DataHandlers.ErrorBarsHandler=function(){};var t=Dygraph.DataHandlers.ErrorBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s=[],l=a.get("sigma"),h=a.get("logscale"),p=0;p<t.length;p++)i=t[p][0],o=t[p][e],h&&null!==o&&(o[0]<=0||o[0]-l*o[1]<=0)&&(o=null),null!==o?(r=o[0],null===r||isNaN(r)?s.push([i,r,[r,r,r]]):(n=l*o[1],s.push([i,r,[r-n,r+n,o[1]]]))):s.push([i,null,[null,null,null]]);return s},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l,h,p,g,d=[],u=a.get("sigma");for(i=0;i<t.length;i++){for(s=0,p=0,l=0,r=Math.max(0,i-e+1);i+1>r;r++)n=t[r][1],null===n||isNaN(n)||(l++,s+=n,p+=Math.pow(t[r][2][2],2));l?(h=Math.sqrt(p)/l,g=s/l,d[i]=[t[i][0],g,[g-u*h,g+u*h]]):(o=1==e?t[i][1]:null,d[i]=[t[i][0],o,[o,o]])}return d}}(),function(){"use strict";Dygraph.DataHandlers.FractionsBarsHandler=function(){};var t=Dygraph.DataHandlers.FractionsBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s,l,h,p,g=[],d=100,u=a.get("sigma"),c=a.get("logscale"),y=0;y<t.length;y++)i=t[y][0],n=t[y][e],c&&null!==n&&(n[0]<=0||n[1]<=0)&&(n=null),null!==n?(o=n[0],s=n[1],null===o||isNaN(o)?g.push([i,o,[o,o,o,s]]):(l=s?o/s:0,h=s?u*Math.sqrt(l*(1-l)/s):1,p=d*h,r=d*l,g.push([i,r,[r-p,r+p,o,s]]))):g.push([i,null,[null,null,null,null]]);return g},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s=[],l=a.get("sigma"),h=a.get("wilsonInterval"),p=0,g=0,d=100;for(n=0;n<t.length;n++){p+=t[n][2][2],g+=t[n][2][3],n-e>=0&&(p-=t[n-e][2][2],g-=t[n-e][2][3]);var u=t[n][0],c=g?p/g:0;if(h)if(g){var y=0>c?0:c,_=g,v=l*Math.sqrt(y*(1-y)/_+l*l/(4*_*_)),f=1+l*l/g;i=(y+l*l/(2*g)-v)/f,r=(y+l*l/(2*g)+v)/f,s[n]=[u,y*d,[i*d,r*d]]}else s[n]=[u,0,[0,0]];else o=g?l*Math.sqrt(c*(1-c)/g):1,s[n]=[u,d*c,[d*(c-o),d*(c+o)]]}return s}}();
//# sourceMappingURL=dygraph-combined.js.map
/*global Dygraph */
// Code for a variety of interaction models. Used in interaction.html, but split out from
// that file so they can be tested in isolation.
//
function downV3(event, g, context) {
  context.initializeMouseDown(event, g, context);
  if (event.altKey || event.shiftKey) {
    Dygraph.startZoom(event, g, context);
  } else {
    Dygraph.startPan(event, g, context);
  }
}

function moveV3(event, g, context) {
  if (context.isPanning) {
    Dygraph.movePan(event, g, context);
  } else if (context.isZooming) {
    Dygraph.moveZoom(event, g, context);
  }
}

function upV3(event, g, context) {
  if (context.isPanning) {
    Dygraph.endPan(event, g, context);
  } else if (context.isZooming) {
    Dygraph.endZoom(event, g, context);
  }
}

// Take the offset of a mouse event on the dygraph canvas and
// convert it to a pair of percentages from the bottom left. 
// (Not top left, bottom is where the lower value is.)
function offsetToPercentage(g, offsetX, offsetY) {
  // This is calculating the pixel offset of the leftmost date.
  var xOffset = g.toDomCoords(g.xAxisRange()[0], null)[0];
  var yar0 = g.yAxisRange(0);

  // This is calculating the pixel of the higest value. (Top pixel)
  var yOffset = g.toDomCoords(null, yar0[1])[1];

  // x y w and h are relative to the corner of the drawing area,
  // so that the upper corner of the drawing area is (0, 0).
  var x = offsetX - xOffset;
  var y = offsetY - yOffset;

  // This is computing the rightmost pixel, effectively defining the
  // width.
  var w = g.toDomCoords(g.xAxisRange()[1], null)[0] - xOffset;

  // This is computing the lowest pixel, effectively defining the height.
  var h = g.toDomCoords(null, yar0[0])[1] - yOffset;

  // Percentage from the left.
  var xPct = w === 0 ? 0 : (x / w);
  // Percentage from the top.
  var yPct = h === 0 ? 0 : (y / h);

  // The (1-) part below changes it from "% distance down from the top"
  // to "% distance up from the bottom".
  return [xPct, (1-yPct)];
}

function dblClickV3(event, g, context) {
  // Reducing by 20% makes it 80% the original size, which means
  // to restore to original size it must grow by 25%

  if (!(event.offsetX && event.offsetY)){
    event.offsetX = event.layerX - event.target.offsetLeft;
    event.offsetY = event.layerY - event.target.offsetTop;
  }

  var percentages = offsetToPercentage(g, event.offsetX, event.offsetY);
  var xPct = percentages[0];
  var yPct = percentages[1];

  if (event.ctrlKey) {
    zoom(g, -0.25, xPct, yPct);
  } else {
    zoom(g, +0.2, xPct, yPct);
  }
}

var lastClickedGraph = null;

function clickV3(event, g, context) {
  lastClickedGraph = g;
  Dygraph.cancelEvent(event);
}

function scrollV3(event, g, context) {
  if (lastClickedGraph != g) {
    return;
  }
  var normal = event.detail ? event.detail * -1 : event.wheelDelta / 40;
  // For me the normalized value shows 0.075 for one click. If I took
  // that verbatim, it would be a 7.5%.
  var percentage = normal / 50;

  if (!(event.offsetX && event.offsetY)){
    event.offsetX = event.layerX - event.target.offsetLeft;
    event.offsetY = event.layerY - event.target.offsetTop;
  }

  var percentages = offsetToPercentage(g, event.offsetX, event.offsetY);
  var xPct = percentages[0];
  var yPct = percentages[1];

  zoom(g, percentage, xPct, yPct);
  Dygraph.cancelEvent(event);
}

// Adjusts [x, y] toward each other by zoomInPercentage%
// Split it so the left/bottom axis gets xBias/yBias of that change and
// tight/top gets (1-xBias)/(1-yBias) of that change.
//
// If a bias is missing it splits it down the middle.
function zoom(g, zoomInPercentage, xBias, yBias) {
  xBias = xBias || 0.5;
  yBias = yBias || 0.5;
  function adjustAxis(axis, zoomInPercentage, bias) {
    var delta = axis[1] - axis[0];
    var increment = delta * zoomInPercentage;
    var foo = [increment * bias, increment * (1-bias)];
    return [ axis[0] + foo[0], axis[1] - foo[1] ];
  }
  var yAxes = g.yAxisRanges();
  var newYAxes = [];
  for (var i = 0; i < yAxes.length; i++) {
    newYAxes[i] = adjustAxis(yAxes[i], zoomInPercentage, yBias);
  }

  g.updateOptions({
      dateWindow: adjustAxis(g.xAxisRange(), zoomInPercentage, xBias)
    //valueRange: newYAxes[0]
    });
}

var v4Active = false;
var v4Canvas = null;

function downV4(event, g, context) {
  context.initializeMouseDown(event, g, context);
  v4Active = true;
  moveV4(event, g, context); // in case the mouse went down on a data point.
}

var processed = [];

function moveV4(event, g, context) {
  var RANGE = 7;

  if (v4Active) {
    var graphPos = Dygraph.findPos(g.graphDiv);
    var canvasx = Dygraph.pageX(event) - graphPos.x;
    var canvasy = Dygraph.pageY(event) - graphPos.y;

    var rows = g.numRows();
    // Row layout:
    // [date, [val1, stdev1], [val2, stdev2]]
    for (var row = 0; row < rows; row++) {
      var date = g.getValue(row, 0);
      var x = g.toDomCoords(date, null)[0];
      var diff = Math.abs(canvasx - x);
      if (diff < RANGE) {
        for (var col = 1; col < 3; col++) {
          // TODO(konigsberg): these will throw exceptions as data is removed.
          var vals =  g.getValue(row, col);
          if (vals === null || vals === undefined) { continue; }
          var val = vals[0];
          var y = g.toDomCoords(null, val)[1];
          var diff2 = Math.abs(canvasy - y);
          if (diff2 < RANGE) {
            var found = false;
            for (var i in processed) {
              var stored = processed[i];
              if(stored[0] == row && stored[1] == col) {
                found = true;
                break;
              }
            }
            if (!found) {
              processed.push([row, col]);
              drawV4(x, y);
            }
            return;
          }
        }
      }
    }
  }
}

function upV4(event, g, context) {
  if (v4Active) {
    v4Active = false;
  }
}

function dblClickV4(event, g, context) {
  restorePositioning(g);
}

function drawV4(x, y) {
  var ctx = v4Canvas;

  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.arc(x,y,5,0,Math.PI*2,true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function captureCanvas(canvas, area, g) {
  v4Canvas = canvas;
}

function restorePositioning(g) {
  g.updateOptions({
    dateWindow: null,
    valueRange: null
  });
}
