/*
global config, inherits, controller, MHA
*/


define('UtilsDeviceHandler', ['AbstractModule', 'DeviceStorage'], function(AbstractModule, DeviceStorage){
    
    function UtilsDeviceHandler(config) {
        UtilsDeviceHandler.super_.call(this, config);
        this.name = 'UtilsDeviceHandler';
        this.log('construcror');
        
        
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
    }
  
    inherits(UtilsDeviceHandler, AbstractModule);
  
    // добавляет хендлер к девайсу с ключем key. 
    // хендлер вешается только на MHA.onLevelChange
    UtilsDeviceHandler.prototype.addHandler = function(key, handler, scope){
        this._deferredHandlers.push({
            key: key, 
            handler: handler,
            scope: scope
        });
        this._addHandlers();
    };
    
    UtilsDeviceHandler.prototype._addHandlers = function(){
        this._handlersTimer && clearTimeout(this._handlersTimer);
        delete this._handlersTimer;
        
        this._deferredHandlers = this._deferredHandlers.filter(function(obj){
            //var dev = obj.getter();
            var dev = DeviceStorage.getDevice(key);
            if (!dev) return true; // оставляем в массиве
            
            //obj.deviceKey = dev.MHA.key;
            var self = this;
            
            obj.handlerWrapper = function(){
                try {
                    obj.handler.apply(obj.scope, arguments);
                } catch(err){
                    self.log('Error in handler: '+ obj.key + ' ' + err.toString() + ' ' + err.stack);
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
          
   
    UtilsDeviceHandler.prototype.stop = function(){
        this._handlersTimer && clearTimeout(this._handlersTimer);
        
        this._handlers.forEach(function(obj){
            var dev = obj.getter();
            if (!dev) return;
            
            //var handler = this._handlers[key];
            dev.MHA.offLevelChange(obj.handlerWrapper, this);
            this.log('removeDeviceHandler: ' + dev.MHA.key);
        }, this);
        this._handlers = [];
        
        UtilsDeviceHandler.super_.prototype.stop.apply(this, arguments);
    };
    
    return UtilsDeviceHandler;
});
