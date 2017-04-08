/*
global config, inherits, controller, MHA
*/
define('AbstractRoom', ['AbstractModule', 'DeviceStorage', 'Utils'], function(AbstractModule, DeviceStorage, Utils){
   
   /**
    * Методы:
    * init() - после конструктора дочернего класса
    * addHandler(key, handler) - для подписки на девайс
    * 
    * 
    */
   function AbstractRoom(config) {
        AbstractRoom.super_.call(this, config);
        this.name = 'AbstractRoom';
        this.log('construcror');

        /** Общая логика работы
        *   Внутренние устройства:
        *   * switch220
        *   * light12
        *   * motionSensor
        *   * lightSensor
        *   * tempSensor
        *   * humSensor
        *   * door
        * 
        */
        
        Utils.extend(this, Utils.timers);
        Utils.extend(this, Utils.deviceHandlers);
        
        
        this.devices = {};
        this.extRooms = [];
        
        
        
        
        
    }

    inherits(AbstractRoom, AbstractModule);

    AbstractRoom.prototype.init = function(){
      this._initBaseHandlers();  
    };


    /****** HANDLERS ******/
    
    AbstractRoom.prototype._initBaseHandlers = function(){
        var handlers = {
            switch220:      this.onSwitch220Change,
            //light12:        this.onLight12Change,
            motionSensor:   this.onMotionSensorChange,
            lightSensor:    this.onLightSensorChange,
            tempSensor:     this.onTempSensorChange,
            door:           this.onDoorChange
        };
        
        Object.keys(handlers).forEach(function(key){
            if (!this.devices[key]) return;
            this.addHandler(DeviceStorage.getDevice.bind(DeviceStorage, this.devices[key]), handlers[key]);
        }, this);
    };
    
   

    AbstractRoom.prototype.onSwitch220Change = function(){
        
    };
    
    AbstractRoom.prototype.onMotionSensorChange = function(){
        
    };
    
    AbstractRoom.prototype.onLightSensorChange = function(){
        
    };
    
    AbstractRoom.prototype.onTempSensorChange = function(){
        
    };
    
    AbstractRoom.prototype.onDoorChange = function(){
        
    };
    
    
    
    
    
    
    
    // Получение конкретного устройства по ключу
    // AbstractRoom.prototype.getDevice = function(key){
    //     return this.devices[key] && DeviceStorage.getDevice(this.devices[key]);
    // };
    
    AbstractRoom.prototype.stop = function(){
        AbstractRoom.super_.prototype.stop.apply(this, arguments);
    };

    return AbstractRoom;
});

