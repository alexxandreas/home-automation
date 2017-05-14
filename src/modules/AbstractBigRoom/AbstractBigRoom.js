/*
global config, inherits, controller, MHA
*/

// Прихожая
define('AbstractBigRoom', ['AbstractRoom', 'DeviceStorage', 'UtilsRoomHelpers'], function(AbstractRoom, DeviceStorage, UtilsRoomHelpers){
   
   function AbstractBigRoom(config) {
        AbstractBigRoom.super_.call(this, config);
        this.name = 'AbstractBigRoom';
        this.log('construcror');


        // this.devices = {
        //     switch220center:    'bedroom.switch220center',
        //     switch220edge:      'bedroom.switch220edge',
        //     rgb:                'bedroom.rgb', // switchRGBW
        //     w:                  'bedroom.w'
        // };
        
        // this.handlersConfig.switch220center = this.onSwitch220centerEvent;
        // this.handlersConfig.switch220edge = this.onSwitch220edgeEvent;
        
        
        //this.settings = this.settings || {};
        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 30; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
       
        //this.init();
      
    } 

    inherits(AbstractBigRoom, AbstractRoom);
    
    
    
    /**********************************************************/
    /***************** Обертки над roomHelpers ****************/
    /**********************************************************/

    AbstractRoom.prototype.getLightState = function() {
        return UtilsRoomHelpers.getLightState({switch220center: this.devices.switch220center, switch220edge :this.devices.switch220edge});
    };
    
    
    /**********************************************************/
    /**************** Switch220center HANDLERS ****************/
    /**********************************************************/
    
    AbstractBigRoom.prototype.onSwitch220centerEvent = function(event){
        this.log('onSwitch220centerEvent: ' + JSON.stringify(event));
        if (event.type == 'level'){
            if (event.level == 'on' || event.level > 0)
                this.onSwitch220centerOn(event.level);
            else 
                this.onSwitch220centerOff(event.level);
        } else if (event.type == 'scene'){
            var handler = 'onSwitch220centerScene' + event.name;
            this[handler] && this[handler].call(this);
        }
    };
    
    AbstractBigRoom.prototype.onSwitch220centerOn = function(level) {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerOff = function(level) {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerSceneUpClick = function() {
        
    }
            
    AbstractBigRoom.prototype.onSwitch220centerSceneDownClick = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerSceneUpDownRelease = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerSceneUpDoubleClick = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerSceneUpHold = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220centerSceneDownHold = function() {
        
    }
    
    /**********************************************************/
    /***************** Switch220edge HANDLERS *****************/
    /**********************************************************/
    
    AbstractBigRoom.prototype.onSwitch220edgeEvent = function(event){
        this.log('onSwitch220edgeEvent: ' + JSON.stringify(event));
        if (event.type == 'level'){
            if (event.level == 'on' || event.level > 0)
                this.onSwitch220edgeOn(event.level);
            else 
                this.onSwitch220edgeOff(event.level);
        } else if (event.type == 'scene'){
            var handler = 'onSwitch220edgeScene' + event.name;
            this[handler] && this[handler].call(this);
        }
    };


    AbstractBigRoom.prototype.onSwitch220edgeOn = function(level) {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeOff = function(level) {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpClick = function() {
        
    }
            
    AbstractBigRoom.prototype.onSwitch220edgeSceneDownClick = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpDownRelease = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpDoubleClick = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpHold = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneDownHold = function() {
        
    }

    
    

    




    AbstractBigRoom.prototype.init = function(){
        AbstractBigRoom.super_.prototype.init.apply(this, arguments);
    };
    
    AbstractBigRoom.prototype.stop = function(){
        AbstractBigRoom.super_.prototype.stop.apply(this, arguments);
    };

    return new AbstractBigRoom();
});

