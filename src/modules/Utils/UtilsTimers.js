/*
global config, inherits, controller, MHA
*/

/**
 * Utils.extend(this, Utils.timers)
 * Utils.extend(this, Utils.eventHandlers)
 * 
 */

define('UtilsTimers', 'Utils', function(Utils){
    
    // function Utils(config) {
    //     this.name = 'Utils';
    // }
  
  
    
    // Utils.prototype.extend = function(module, util){
    //     if (util.init){
    //         util.init.call(module);
    //     }
        
    //     if (util.stop){
    //         var oldStop = module.stop;
    //         module.stop = (function(){
    //             util.stop.call(module);
    //             oldStop.call(module);
    //         }).bind(module);
    //     }
        
    // }
    
    Utils.prototype.timers = {
        init: function(){
            this.timers = {};
            
            
            // запуск таймера. 
            // name - уникальное название
            // sec - время в секундах
            // callback - функция обратного вызова
            // continue - если true и такой таймер уже запущен - запускается таймер с наименьшим оставшимся временем
            this.startTimer = function(name, sec, callback, _continue){
                var oldTimer = this.timers[name];
                oldTimer && oldTimer.timer && clearTimeout(oldTimer.timer);
                if (oldTimer && oldTimer.offTime && _continue){
                    var timeout = Math.min(sec * 1000, oldTimer.offTime - Date.now());
                } else {
                    var timeout = sec * 1000;
                }
                
                var self = this;
                this.timers[name] = {
                    offTime: Date.now() + timeout,
                    timer: setTimeout(function(){
                        // иногда после stopTimer все равно вызывается callback (если время до вызова меньше секунды)
                        if (!self.timers[name]) return; 
                        delete self.timers[name];
                        callback.call(self);
                    }, timeout)
                };
                
                this.log('startTimer(' + name + ', ' + sec + ') -> timeout=' + timeout/1000);
            };
            
            this.stopTimer = function(name){
                var oldTimer = this.timers[name];
                if (!oldTimer) return;
                oldTimer.timer && clearTimeout(oldTimer.timer);
                delete this.timers[name];
                this.log('stopTimer(' + name + ')');
            };
        },
        
        stop: function(){
            this.log('moduleBase.destroy');
            //var self = this;
            Object.keys(this.timers).forEach(function(name){
              this.stopTimer(name);
            }, this);
        }
        
    }
    
});
