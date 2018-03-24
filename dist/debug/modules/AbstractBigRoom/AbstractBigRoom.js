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
        
        this.handlersConfig.switch220center = this.onSwitch220centerEvent;
        this.handlersConfig.switch220edge = this.onSwitch220edgeEvent;
        
        
        
        //this.settings = this.settings || {};
        // this.settings.userModeTimeout = 15; // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
        // this.settings.intMotionTimeout = 30; // таймаут выключения света после окончания движения ВНУТРИ, мин
        // this.settings.extMotionTimeout = 1; // таймаут выключения света после окончания движения СНАРУЖИ, мин
        // this.settings.lightOffTimeout = 15; // таймаут обязательного выключения света (когда не срабатывает датчик движения)
        // this.settings.lastLightTimeout = 3; // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
       
        //this.init();
        this.colors = [
            //'rainbow',
            //[100,100,100], // full
            [100, 50, 50], // white
            [100, 8, 0], // orange
            [100, 100, 0], //lime
            [100, 0, 25], // magenta
            [100, 0, 100], // purple
            [15, 15, 100], // light blue
            [0, 100, 0], // green
            [0,100,100] // cyan
        ];
      
    } 

    inherits(AbstractBigRoom, AbstractRoom);
    
    AbstractBigRoom.prototype.init = function(){
        
        AbstractBigRoom.super_.prototype.init.apply(this, arguments);
        
        this.state.rgbDimming = false;
        this.state.rgbDimDirection = 'off'; // направление диммирования 12 света при удержании кнопки Вниз
        this.state.daylightColor = [15, 15, 100];
        
        //this.state.colorIndex = 0; // индекс цвета в массиве цветов
        
        this.defaultParameters.RGBLevel = 99;
        this.defaultParameters.colorIndex = 0;
        
        
        // this.state['220center'] = 'off'; //  ('on', 'off')
        // this.state['220edge'] = 'off'; //  ('on', 'off')
        // this.state.rgb = 'off'; //  ('on', 'off')
        // this.state.rgbDimUp = true; // направление диммирования. true / false
        // 
        // this.state.lastColor = null; // последний цвет
        // this.state.rgbBr = 100; // яркость RGB
        // this.state.useMinBr = false; // показывает, что при смене цвета нужно выставлять минимальную яркость
        // 
    };
    
    
    
    
    
    /**********************************************************/
    /***************** Обертки над roomHelpers ****************/
    /**********************************************************/

    AbstractBigRoom.prototype.getLightState = function() {
        return UtilsRoomHelpers.getLightState({
            switch220center: this.devices.switch220center, 
            switch220edge: this.devices.switch220edge,
            rgb: this.devices.rgb 
        });
    };
    
    AbstractBigRoom.prototype.setSwitch220center = function(command, args) {
        var devLight = DeviceStorage.getDevice(this.devices.switch220center);
        devLight && devLight.MHA.performCommand(this.name, command, args);
        this.syncRGB();
    };
    
    AbstractBigRoom.prototype.setSwitch220edge = function(command, args) {
        var devLight = DeviceStorage.getDevice(this.devices.switch220edge);
        devLight && devLight.MHA.performCommand(this.name, command, args);
        this.syncRGB();
    };
    
    
    /**********************************************************/
    /********************** RGB commands **********************/
    /**********************************************************/
    
    AbstractBigRoom.prototype.onRGB = function(color, br) {
        //this.log('onRGB(' + JSON.stringify(color) + ', ' + br + ')');
        //color = color || this.state.lastColor;
        if (!color){
          color =  this.colors[this.getParameter('colorIndex')];
        //   if (color == 'rainbow') {
        //     this.startRainbow();
        //     return;
        //   } else {
            // this.stopRainbow();
        //   }
        }
        //this.state.lastColor = color;
        
    
        // if (!br){
        //   var minBr = this.getMinBr(color);
        //   if (this.state.useMinBr)
        //     this.state.rgbBr = minBr;
        //   else 
        //     this.state.rgbBr = Math.max(minBr, this.state.rgbBr);
        //   br = this.state.rgbBr;
        // }
        
        var minBr = this.getMinBr(color);
        var rgbLevel = this.getParameter('RGBLevel');
        
        if (br === undefined){
            br = Math.max(minBr, rgbLevel);
        }
        
        // if (br === 0) { // use minimum brightness
        //     this.log('using min brightness');
        //     br = minBr;
        // }
        
        var col = {
          red: Math.round(Math.ceil(color[0] * (br+0.1) / 100)),
          green: Math.round(Math.ceil(color[1] * (br+0.1) / 100)),
          blue: Math.round(Math.ceil(color[2] * (br+0.1) / 100)) 
        }
        this.log('onRGB(): ' + JSON.stringify(col));
        
        var devLight = DeviceStorage.getDevice(this.devices.rgb);
        devLight && devLight.MHA.performCommand(this.name, 'exact', col);
        
        // this.state.rgb = 'on';
    }
    
    AbstractBigRoom.prototype.offRGB = function() {
        this.log('offRGB()');
        //this.stopRainbow();
        //this.state.lastColor = null;
        //this.sendRGBCommand(mode);
        
        var devLight = DeviceStorage.getDevice(this.devices.rgb);
        devLight && devLight.MHA.performCommand(this.name, 'off');
        
        // this.getTargets('rgb').forEach(function(id) {
        //     var vDev = this.getVDev(id);
        //     vDev && vDev.performCommand('off');
        // }, this);
        // this.state.rgb = 'off';
    }
    
    // определяем минимальную яркость, допустимую для цвета
    AbstractBigRoom.prototype.getMinBr = function(color){
        if (!(color instanceof Array)) return 1;
        //var color = this.colors[colorIndex];
        var minValue = Math.min.apply(Math, color.filter(function(val){ return val > 0;}));
        var minBr = Math.ceil(100 / minValue);
        return minBr;
    }
    
    AbstractBigRoom.prototype.nextRGB = function() {
        // var colorIndex = this.state.colorIndex < this.colors.length-1 ? this.state.colorIndex+1 : 0;
        var currentColorIndex = this.getParameter('colorIndex');
        var nextColorIndex = currentColorIndex < this.colors.length-1 ? currentColorIndex+1 : 0;
        this.setParameter('colorIndex', nextColorIndex);
        
        //this.state.colorIndex = colorIndex;
        //this.state.lastColor = null;
        //var color = this.colors[this.state.colorIndex];  
        this.onRGB();
    }
    
    AbstractBigRoom.prototype.startRGBDim = function() {
        var lightState = this.getLightState();
        
        this.state.rgbDimming = true;
        this.startDim({
            direction: this.state.rgbDimDirection,
            currentLevel: this.getParameter('RGBLevel'),
            minLevel: 0,
            maxLevel: 99,
            callback: function(level){ 
                this.setParameter('RGBLevel', level);
                this.onRGB();
            }
        });
    }
    
    AbstractBigRoom.prototype.stopRGBDim = function() {
        if (!this.state.rgbDimming) return;
        
        this.state.rgbDimming = false;
        this.stopDim();
        this.state.rgbDimDirection = this.state.rgbDimDirection == 'off' ? 'on' : 'off';
        //var level = this.getLightState().rgb.level;
        //this.setParameter('RGBLevel', level);
    };
    
    // включение RBG при включенном 220
    AbstractBigRoom.prototype.syncRGB = function() {
        var lightState = this.getLightState();
        
        if (lightState.switch220center.nextLevelOnOff == 'on' && lightState.switch220edge.nextLevelOnOff == 'on'){
            // горят оба
            this.onRGB(this.state.daylightColor, 100);
        } else if (lightState.switch220center.nextLevelOnOff == 'on' || lightState.switch220edge.nextLevelOnOff == 'on') {
            // горит хотя бы один
            this.onRGB(this.state.daylightColor, 50);
        } else if (lightState.switch220center.lastLevelChange < 2*1000 || lightState.switch220edge.lastLevelChange < 2*1000) {
            // оба не горят, но выключились только что - выключаем RGB
            this.offRGB();
        }
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
        this.setSwitch220center('on');
        
        var lightState = this.getLightState();
        
        if (lightState.switch220center.levelOnOff == 'on' && lightState.switch220center.lastLevelChange > 2*1000){
            // центральный свет горит давно
            
            if (lightState.switch220edge.levelOnOff == 'off'){
                // боковой не горит - включаем его
                this.setSwitch220edge('on'); // 'exact', {level: newValue}
            }
        }
    }
            
    AbstractBigRoom.prototype.onSwitch220centerSceneDownClick = function() {
        this.setSwitch220center('off');
        
        var lightState = this.getLightState();
        
        if (lightState.switch220center.levelOnOff == 'off' && lightState.switch220center.lastLevelChange > 2*1000){
            // центральный свет выключен давно 
            
            if (lightState.switch220edge.levelOnOff == 'on'){
                // горит боковой - выключаем его
                this.setSwitch220edge('off');
            }
            else if (lightState.rgb.levelOnOff == 'off') {
                this.onRGB();
            }
            else if (lightState.rgb.levelOnOff == 'on') {
                this.nextRGB();
            }
        }
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
        this.setSwitch220edge('on');
        
        var lightState = this.getLightState();
        
        if (lightState.switch220edge.levelOnOff == 'on' && lightState.switch220edge.lastLevelChange > 2*1000){
            // боковой свет горит давно
            
            if (lightState.switch220center.levelOnOff == 'off'){
                // центральный не горит - включаем его
                this.setSwitch220center('on'); // 'exact', {level: newValue}
            }
        }
    }
            
    AbstractBigRoom.prototype.onSwitch220edgeSceneDownClick = function() {
        this.setSwitch220edge('off');
        
        var lightState = this.getLightState();
        
        if (lightState.switch220edge.levelOnOff == 'off' && lightState.switch220edge.lastLevelChange > 2*1000){
            // боковой свет выключен давно 
            
            if (lightState.switch220center.levelOnOff == 'on'){
                // горит центральный - выключаем его
                this.setSwitch220center('off');
            }
            else if (lightState.rgb.levelOnOff == 'off') {
                this.onRGB();
            }
            else if (lightState.rgb.levelOnOff == 'on') {
                this.offRGB();
            }
        }
    }
    
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpDoubleClick = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpHold = function() {
        
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneDownHold = function() {
        var lightState = this.getLightState();
        
        if (lightState.switch220edge.levelOnOff == 'off' || lightState.switch220edge.lastLevelChange < 2*1000) {
            // 220 еще не горит или только что включился - значит в момент нажатия он еще не горел
            this.setSwitch220edge('off');
            
            if (lightState.rgb.levelOnOff == 'on') {
                // 12 включен - можно диммировать
                this.startRGBDim();
            }
        }
    }
    
    AbstractBigRoom.prototype.onSwitch220edgeSceneUpDownRelease = function() {
    
        this.stopRGBDim();
           
    }

 
    
    AbstractBigRoom.prototype.stop = function(){
        AbstractBigRoom.super_.prototype.stop.apply(this, arguments);
    };

    return AbstractBigRoom;
});

