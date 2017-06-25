/*
global config, inherits, controller, MHA
*/


define('UtilsTimers', ['AbstractModule'], function(AbstractModule){
    
    function UtilsTimers(config) {
        UtilsTimers.super_.call(this, config);
        this.name = 'UtilsTimers';
        this.log('construcror');
        
        
        this._timers = {};
    }
  
    inherits(UtilsTimers, AbstractModule);
  
    // запуск таймера. 
    // name - уникальное название
    // sec - время в секундах
    // callback - функция обратного вызова
    // continue - если true и такой таймер уже запущен - запускается таймер с наименьшим оставшимся временем
    UtilsTimers.prototype.startTimer = function(name, sec, callback, scope, _continue){
        var oldTimer = this._timers[name];
        oldTimer && oldTimer.timer && clearTimeout(oldTimer.timer);
        if (oldTimer && oldTimer.offTime && _continue){
            var timeout = Math.min(sec * 1000, oldTimer.offTime - Date.now());
        } else {
            var timeout = sec * 1000;
        }
        
        // создаем уникальный id для проверки в таймере, актуален он или нет
        // (если таймер вызовется еще раз - то id изменится)
        var unique = Math.random();
        var self = this;
        
        this._timers[name] = {
            offTime: Date.now() + timeout,
            unique: unique,
            timer: setTimeout(function(){
                // иногда после stopTimer все равно вызывается callback (если время до вызова меньше секунды)
                if (!self._timers[name]) return;
                if (self._timers[name].unique != unique) return;
                
                delete self._timers[name];
                callback.call(scope);
            }, timeout)
        };
        
        this.log('startTimer(' + name + ', ' + sec + ') -> timeout=' + timeout/1000);
    };
    

    UtilsTimers.prototype.stopTimer = function(name){
        var oldTimer = this._timers[name];
        if (!oldTimer) return;
        oldTimer.timer && clearTimeout(oldTimer.timer);
        delete this._timers[name];
        this.log('stopTimer(' + name + ')');
    };
    
    UtilsTimers.prototype.stop = function(){
        //this.log('moduleBase.destroy');
        //var self = this;
        Object.keys(this._timers).forEach(function(name){
          this.stopTimer(name);
        }, this);
        
        UtilsTimers.super_.prototype.stop.apply(this, arguments);
    };
    
    return UtilsTimers;
});
