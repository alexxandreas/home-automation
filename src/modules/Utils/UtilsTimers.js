/*
global config, inherits, controller, MHA
*/

/**
 * Utils.extend(this, Utils.timers)
 * Utils.extend(this, Utils.eventHandlers)
 * 
 */

define('UtilsTimers', ['Utils'], function(Utils){
    
    Utils.prototype.timers = {
        init: function(){
            this._timers = {};
            
            
            // запуск таймера. 
            // name - уникальное название
            // sec - время в секундах
            // callback - функция обратного вызова
            // continue - если true и такой таймер уже запущен - запускается таймер с наименьшим оставшимся временем
            this.startTimer = function(name, sec, callback, _continue){
                var oldTimer = this._timers[name];
                oldTimer && oldTimer.timer && clearTimeout(oldTimer.timer);
                if (oldTimer && oldTimer.offTime && _continue){
                    var timeout = Math.min(sec * 1000, oldTimer.offTime - Date.now());
                } else {
                    var timeout = sec * 1000;
                }
                
                var self = this;
                this._timers[name] = {
                    offTime: Date.now() + timeout,
                    timer: setTimeout(function(){
                        // иногда после stopTimer все равно вызывается callback (если время до вызова меньше секунды)
                        if (!self._timers[name]) return; 
                        delete self._timers[name];
                        callback.call(self);
                    }, timeout)
                };
                
                this.log('startTimer(' + name + ', ' + sec + ') -> timeout=' + timeout/1000);
            };
            
            this.stopTimer = function(name){
                var oldTimer = this._timers[name];
                if (!oldTimer) return;
                oldTimer.timer && clearTimeout(oldTimer.timer);
                delete this._timers[name];
                this.log('stopTimer(' + name + ')');
            };
        },
        
        stop: function(){
            this.log('moduleBase.destroy');
            //var self = this;
            Object.keys(this._timers).forEach(function(name){
              this.stopTimer(name);
            }, this);
        }
        
    }
    
});
