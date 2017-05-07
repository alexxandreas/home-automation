/*
global config, inherits, controller, MHA
*/

// Прихожая
define('Kitchen', ['AbstractRoom', 'DeviceStorage'], function(AbstractRoom, DeviceStorage){
   
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
        
        this.state.switchMode = 'off';
        var devSwitch = DeviceStorage.getDevice(this.devices.tabletopSwitch);
        if (devSwitch) {
            var level = devSwitch.MHA.getLevel();
            this.onTabletopSwitchChange(level);    
        }
        
        
        this.getTargets('tabletop').forEach(function(id) {
          var vDev = this.getVDev(id);
          vDev && vDev.performCommand('off');
        }, this);
        
        this.state.switchMode = 'off';
        var switchId = this.getTarget('switch');
        if (!switchId) return;
        this.onSwitchChange(switchId);
    }
    
    Kitchen.prototype.onTabletopSwitchChange = function(value){
        // var vDev = this.getVDev(id);
        // if (!vDev) return;
        // var value = vDev.get("metrics:level");
        
        var mode = value > 70 ? 'off' : value > 35 ? 'half' : 'on';
        //this.log('onSwitchChange: ' + value + ' -> ' + mode);
        if (mode == this.state.switchMode) return;
        
        this.state.switchMode = mode;
        this.updateTabletop();
        
    };


    Kitchen.prototype.switchLight = function(options){
        Kitchen.super_.prototype.switchLight.apply(this, arguments);
        this.updateTabletop();
    };
  
    Kitchen.prototype.updateTabletop = function(){
        
        var lightState = this.getLightState();
        if (lightState['220'].pendingLevel && (
                lightState['220'].pendingLevel == 'on' || 
                lightState['220'].pendingLevel > 0
            ) || lightState['220'].level == 'on')
            var light = 220;
        else if (lightState['12'].pendingLevel && (
                lightState['12'].pendingLevel == 'on' || 
                lightState['12'].pendingLevel > 0
            ) || lightState['12'].level == 'on')
            var light = 12;
        
        var newValue;
        if (!light || this.state.switchMode == 'off')
          newValue = 0;
        else
          newValue = this.settings['tabletop' + light + this.state.switchMode];
        this.log('updateTabletop (' + newValue + '%)');
        
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

