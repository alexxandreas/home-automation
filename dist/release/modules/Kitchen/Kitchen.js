/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Kitchen', ['AbstractRoom', 'DeviceStorage', 'UtilsRoomHelpers'], function(AbstractRoom, DeviceStorage, UtilsRoomHelpers){
   
   function Kitchen(config) {
        Kitchen.super_.call(this, config);
        this.name = 'Kitchen';
        this.log('construcror');

        this.devices = {
            switch220:      'kitchen.switch220',
        
            light12:        'kitchen.light12',
            motionSensor:   'kitchen.motionSensor',
            lightSensor:    'kitchen.lightSensor',
            tempSensor:     'kitchen.tempSensor',
            
            tabletopLight:  'kitchen.tabletopLight',
            tabletopSwitch: 'kitchen.tabletopSwitch',
                
            door:           'kitchen.door'
        };
        
        
        this.extRooms = [
        // ванная    
        {
            switch220:      'bathroom.switch220',
            //motionSensor:   'bathroom.motionSensor',
            //door:           'bathroom.door'
        }, 
        // туалет
        {
            switch220:      'toilet.switch220',
            //motionSensor:   'toilet.motionSensor',
            //door:           'toilet.door'
        }, 
        // корридор
        {
            switch220:      'corridor.switch220',
            //motionSensor:   'corridor.motionSensor'
            //door:           'corridor.door'
        }, 
        // прихожая
        {
            switch220:      'hallway.switch220',
            motionSensor:   'hallway.motionSensor',
            door:           'kitchen.door',
        },
        // спальня-center
        {
            switch220:      'bedroom.switch220center'
        },
        // спальня-edge
        {
            switch220:      'bedroom.switch220edge'
        },
        // холл-center
        {
            switch220:      'hall.switch220center'
        },
        // холл-edge
        {
            switch220:      'bedroom.switch220edge'
        }];
  
       
        //this.settings = this.settings || {};
        this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        this.settings.intMotionTimeout = 15; // таймаут выключения света после окончания движения ВНУТРИ, мин
        this.settings.extMotionTimeout = 2; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
        
        this.settings.tabletop220on = 99, // полный уровень яркости столешницы при включенном 220
        this.settings.tabletop220half = 70, // половинный уровень яркости столешницы при включенном 220
        this.settings.tabletop12on = 70, // полный уровень яркости столешницы при включенном 12
        this.settings.tabletop12half = 40 // половинный уровень яркости столешницы при включенном 12
      
      
        this.handlersConfig.tabletopSwitch = this.onTabletopSwitchChange;
        
      
        this.init();
    }

    inherits(Kitchen, AbstractRoom);


    // Установка начальных значений в соответствии с текущим состоянием выключателей / датчиков
    Kitchen.prototype._setInitialState = function() {
        Kitchen.super_.prototype._setInitialState.apply(this, arguments);
        
        this.updateTabletop();
        
    }
    
    Kitchen.prototype.onTabletopSwitchChange = function(value){
        this.updateTabletop();
    };


    Kitchen.prototype.switchLight = function(options){
        Kitchen.super_.prototype.switchLight.apply(this, arguments);
        this.updateTabletop();
    };
  
    Kitchen.prototype.updateTabletop = function(){
        
        var lightState = this.getLightState();
        if (lightState['220'].nextLevel == 'on' || lightState['220'].nextLevel > 0)
            var light = 220;
        else if (lightState['12'].nextLevel || lightState['12'].nextLevel > 0)
            var light = 12;
        
        var devSwitch = DeviceStorage.getDevice(this.devices.tabletopSwitch);
        var switchState = devSwitch && devSwitch.MHA.getLevel() || 'off';
        
        this.log()
        
        var newValue;
        if (!light || switchState == 'off')
          newValue = 0;
        else
          newValue = this.settings['tabletop' + light + switchState];
        this.log('updateTabletop (' + newValue + '%): light = ' + light + ', switchState = ' + switchState);
        
        var devLight = DeviceStorage.getDevice(this.devices.tabletopLight);
        devLight && devLight.MHA.performCommand(this.name, 'exact', {level: newValue});
        
    };




    Kitchen.prototype.init = function(){
        Kitchen.super_.prototype.init.apply(this, arguments);
    };
    
    Kitchen.prototype.stop = function(){
        Kitchen.super_.prototype.stop.apply(this, arguments);
    };

    return new Kitchen();
});

