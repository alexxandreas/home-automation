/*
global config, inherits, controller, MHA
*/

/**
 * Utils.extend(this, Utils.timers)
 * Utils.extend(this, Utils.eventHandlers)
 * 
 */

define('Utils', null, function(){
    
    function Utils(config) {
        this.name = 'Utils';
        //this.log('abstract construcror');
    }
  
  
    
    Utils.prototype.extend = function(module, util){
        if (util.init){
            util.init.call(module);
        }
        
        if (util.stop){
            var oldStop = module.stop;
            module.stop = (function(){
                util.stop.call(module);
                oldStop.call(module);
            }).bind(module);
        }
        
    }
    
    // Utils.prototype.timers = {
    //     init: function(){
    //         this.timers = {};
            
            
    //         // запуск таймера. 
    //         // name - уникальное название
    //         // sec - время в секундах
    //         // callback - функция обратного вызова
    //         // continue - если true и такой таймер уже запущен - запускается таймер с наименьшим оставшимся временем
    //         this.startTimer = function(name, sec, callback, _continue){
    //             var oldTimer = this.timers[name];
    //             oldTimer && oldTimer.timer && clearTimeout(oldTimer.timer);
    //             if (oldTimer && oldTimer.offTime && _continue){
    //                 var timeout = Math.min(sec * 1000, oldTimer.offTime - Date.now());
    //             } else {
    //                 var timeout = sec * 1000;
    //             }
                
    //             var self = this;
    //             this.timers[name] = {
    //                 offTime: Date.now() + timeout,
    //                 timer: setTimeout(function(){
    //                     // иногда после stopTimer все равно вызывается callback (если время до вызова меньше секунды)
    //                     if (!self.timers[name]) return; 
    //                     delete self.timers[name];
    //                     callback.call(self);
    //                 }, timeout)
    //             };
                
    //             this.log('startTimer(' + name + ', ' + sec + ') -> timeout=' + timeout/1000);
    //         };
            
    //         this.stopTimer = function(name){
    //             var oldTimer = this.timers[name];
    //             if (!oldTimer) return;
    //             oldTimer.timer && clearTimeout(oldTimer.timer);
    //             delete this.timers[name];
    //             this.log('stopTimer(' + name + ')');
    //         };
    //     },
        
    //     stop: function(){
    //         this.log('moduleBase.destroy');
    //         //var self = this;
    //         Object.keys(this.timers).forEach(function(name){
    //           this.stopTimer(name);
    //         }, this);
    //     }
        
    // }
    
    // Utils.prototype.deviceHandlers = {
    //     init: function(){
            
    //         /** Если нужно повесить обработчик на девайс, он добавляется в 
    //          * _deferredHandlers через this.addHandler(getter, handler)
    //          * Вызывается _addHandlers и, если девайс уже существует - хендлер
    //          * добавляется сразу. Иначе запускается setInterval и хендлер пытается
    //          * добавиться при появлении девайса.
    //          * После успешного добавления хендлера он удаляется из _deferredHandlers
    //          * и заносится в _handlers
    //          */
    //         this._deferredHandlers = [];
    //         this._handlers = [];
    //         this._handlersTimer = undefined;
            
    //         // добавляет хендлер к девайсу с ключем key. 
    //         // хендлер вешается только на MHA.onLevelChange
    //         this.addHandler = function(getter, handler){
    //             //this._deferredHandlers[key] = handler;
                
    //             this._deferredHandlers.push({
    //                 getter: getter, 
    //                 handler: handler
    //                 //wrapper: wrapper
    //             });
    //             this._addHandlers();
    //         };
            
           
    //         this._addHandlers = function(){
    //             this._handlersTimer && clearTimeout(this._handlersTimer);
    //             delete this._handlersTimer;
                
    //             this._deferredHandlers = this._deferredHandlers.filter(function(obj){
    //                 var dev = obj.getter();
    //                 if (!dev) return true; // оставляем в массиве
                    
    //                 obj.deviceKey = dev.MHA.key;
    //                 var self = this;
                    
    //                 obj.handlerWrapper = function(){
    //                     try {
    //                         obj.handler.apply(self, arguments);
    //                     } catch(err){
    //                         self.log('Error in handler: '+ obj.deviceKey + ' ' + err.toString() + ' ' + err.stack);
    //                     }    
    //                 }
    //                 dev.MHA.onLevelChange(obj.handlerWrapper, this);
                    
    //                 this._handlers.push(obj);
                    
    //                 this.log('addDeviceHandler: ' + dev.MHA.key);
    //                 return false; // удаляем из массива
    //             }, this);
                
                
    //             // запускаем таймер, чтобы через какое-то время снова подпиаться
    //             // на несуществующие в данный момент девайсы
    //             var timeout = 10; // sec
    //             if (this._deferredHandlers.length > 0){
    //                 this.log('addDeviceHandler: ' + this._deferredHandlers.length + ' devices not found! Repeat after ' + timeout + ' seconds');
    //                  this._handlersTimer = setTimeout(this._addHandlers.bind(this), 10*1000);
    //             } 
    //         };
          
    //     },
        
        
        
    //     stop: function(){ 
    //         this._handlersTimer && clearTimeout(this._handlersTimer);
            
    //         this._handlers.forEach(function(obj){
    //             var dev = obj.getter();
    //             if (!dev) return;
                
    //             //var handler = this._handlers[key];
    //             dev.MHA.offLevelChange(obj.handlerWrapper, this);
    //             this.log('removeDeviceHandler: ' + dev.MHA.key);
    //         }, this);
    //         this._handlers = [];
    //     }
    // }
    
    return new Utils(config);
});

/*
global config, inherits, controller, MHA
*/

/**
 * Utils.extend(this, Utils.timers)
 * Utils.extend(this, Utils.eventHandlers)
 * 
 */

define('UtilsDeviceHandlers', ['Utils'], function(Utils){
    
    Utils.prototype.deviceHandlers = {
        
        init: function(){
            
            /** Если нужно повесить обработчик на девайс, он добавляется в 
             * _deferredHandlers через this.addHandler(getter, handler)
             * Вызывается _addHandlers и, если девайс уже существует - хендлер
             * добавляется сразу. Иначе запускается setInterval и хендлер пытается
             * добавиться при появлении девайса.
             * После успешного добавления хендлера он удаляется из _deferredHandlers
             * и заносится в _handlers
             */
            this._deferredHandlers = [];
            this._handlers = [];
            this._handlersTimer = undefined;
            
            // добавляет хендлер к девайсу с ключем key. 
            // хендлер вешается только на MHA.onLevelChange
            this.addHandler = function(getter, handler){
                //this._deferredHandlers[key] = handler;
                
                this._deferredHandlers.push({
                    getter: getter, 
                    handler: handler
                    //wrapper: wrapper
                });
                this._addHandlers();
            };
            
           
            this._addHandlers = function(){
                this._handlersTimer && clearTimeout(this._handlersTimer);
                delete this._handlersTimer;
                
                this._deferredHandlers = this._deferredHandlers.filter(function(obj){
                    var dev = obj.getter();
                    if (!dev) return true; // оставляем в массиве
                    
                    obj.deviceKey = dev.MHA.key;
                    var self = this;
                    
                    obj.handlerWrapper = function(){
                        try {
                            obj.handler.apply(self, arguments);
                        } catch(err){
                            self.log('Error in handler: '+ obj.deviceKey + ' ' + err.toString() + ' ' + err.stack);
                        }    
                    }
                    dev.MHA.onLevelChange(obj.handlerWrapper, this);
                    
                    this._handlers.push(obj);
                    
                    this.log('addDeviceHandler: ' + dev.MHA.key);
                    return false; // удаляем из массива
                }, this);
                
                
                // запускаем таймер, чтобы через какое-то время снова подпиаться
                // на несуществующие в данный момент девайсы
                var timeout = 10; // sec
                if (this._deferredHandlers.length > 0){
                    this.log('addDeviceHandler: ' + this._deferredHandlers.length + ' devices not found! Repeat after ' + timeout + ' seconds');
                     this._handlersTimer = setTimeout(this._addHandlers.bind(this), 10*1000);
                } 
            };
          
        },
        
        
        
        stop: function(){ 
            this._handlersTimer && clearTimeout(this._handlersTimer);
            
            this._handlers.forEach(function(obj){
                var dev = obj.getter();
                if (!dev) return;
                
                //var handler = this._handlers[key];
                dev.MHA.offLevelChange(obj.handlerWrapper, this);
                this.log('removeDeviceHandler: ' + dev.MHA.key);
            }, this);
            this._handlers = [];
        }
    }
    
});

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
