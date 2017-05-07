/*
global config, inherits, controller, MHA
*/


define('UtilsDeviceHandlers', ['AbstractModule', 'DeviceStorage'], function(AbstractModule, DeviceStorage) {

    function UtilsDeviceHandlers(config) {
        UtilsDeviceHandlers.super_.call(this, config);
        this.name = 'UtilsDeviceHandlers';
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

    inherits(UtilsDeviceHandlers, AbstractModule);

    // добавляет хендлер к девайсу с ключем key. 
    // хендлер вешается только на MHA.onLevelChange
    UtilsDeviceHandlers.prototype.addHandler = function(key, handler, scope) {
        this._deferredHandlers.push({
            key: key,
            handler: handler,
            scope: scope
        });
        this._addHandlers();
    };

    UtilsDeviceHandlers.prototype._addHandlers = function() {
        this._handlersTimer && clearTimeout(this._handlersTimer);
        delete this._handlersTimer;

        this._deferredHandlers = this._deferredHandlers.filter(function(obj) {
            var dev = DeviceStorage.getDevice(obj.key);
            if (!dev) return true; // оставляем в массиве

            //obj.deviceKey = dev.MHA.key;
            var self = this;

            obj.handlerWrapper = function() {
                try {
                    obj.handler.apply(obj.scope, arguments);
                }
                catch (err) {
                    self.log('Error in handler: ' + obj.key + ' ' + err.toString() + ' ' + err.stack);
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
        
        return; // TODO потом подумать, как подписываться на несуществующие девайсы, но не засрать всю память и консоль
        
        if (this._deferredHandlers.length > 0) {
            this.log('addDeviceHandler: ' + this._deferredHandlers.length + ' devices not found! Repeat after ' + timeout + ' seconds');
            this._handlersTimer = setTimeout(this._addHandlers.bind(this), 10 * 1000);
        }
    };


    UtilsDeviceHandlers.prototype.stop = function() {
        this._handlersTimer && clearTimeout(this._handlersTimer);

        this._handlers.forEach(function(obj) {
            var dev = DeviceStorage.getDevice(obj.key);
            if (!dev) return;

            //var handler = this._handlers[key];
            dev.MHA.offLevelChange(obj.handlerWrapper, this);
            this.log('removeDeviceHandler: ' + dev.MHA.key);
        }, this);
        this._handlers = [];

        UtilsDeviceHandlers.super_.prototype.stop.apply(this, arguments);
    };

    return UtilsDeviceHandlers;
});
