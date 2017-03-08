var config = {
    a: 10,
    b: 20
};
(function(){


function initClass(superClass){

  function Bathroom() {
    Bathroom.super_.call(this, wrapper);
    // Call superconstructor first (ModuleBase)
    this.log('new Bathroom()');
    
  }
  
  inherits(Bathroom, superClass);
  Bathroom.prototype.initClass = initClass;
  
  Bathroom.prototype.init = function (config) {
    this.log('Bathroom.init');
    this.name = 'Bathroom';
    this.settings = {
      userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
      intMotionTimeout: 30, // таймаут выключения света после окончания движения ВНУТРИ, мин
      extMotionTimeout: 1, // таймаут выключения света после окончания движения СНАРУЖИ, мин
      lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
      lastLightTimeout: 3, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
      nextRoom: 'Toilet', // название соседней комнаты с общими устройствами
      humidityOnDelta: 40, // разница во влажности для ВКЛЮЧЕНИЯ вентилятора
      humidityOffDelta: 30, // разница во влажности для ВЫКЛЮЧЕНИЯ вентилятора
      fanMaxTimeout: 5     // максимальная продолжинельность работы вентилятора после выключения света, мин
    }
    
  
    this.targetsConfig = {
      '12': {/*event: 'change:metrics:level', handler:this.handlers.on12LevelChanged*/}, // устройства, отвечающие за 12В свет
      '220': {/*event: 'change:metrics:level', handler:this.handlers.on220LevelChanged*/}, // устройства, отвечающие за 220В свет
      'ext220': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // устройства во внешних комнатах, 220В
      'intMotion': {event: 'change:metrics:level', handler:this.onIntMChanged}, // датчики движения внутренние
      'extMotion': {event: 'change:metrics:level', handler:this.onExtMChanged}, // датчики движения внешние
      'buttonUp': {event: 'change:metrics:level', handler:this.onButtonUp}, // кнопка Вверх
      'buttonDown': {event: 'change:metrics:level', handler:this.onButtonDown}, // кнопка Вниз
      'lightSensor': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // датчик освещенности (для выбора 220/12)
      'intHumiditySensor': {event: 'change:metrics:level', handler:this.onHumidityChanged}, // датчик влажности внутренний
      'extHumiditySensor': {event: 'change:metrics:level', handler:this.onHumidityChanged}, // датчик влажности внешний
      'fan': {} // вентилятор
    };
    
    // конфиг для функции выбора подходящего освещения (220 или 12)
    /*this.suitableLightConfig = {
      dayInterval: {hStart:8, mStart:0, hEnd:20, mEnd:0}, // интервал времени, в который гарантированно будет включаться 220 свет. 
      minIlluminationLevel: 0, // уровень освещенности, Lux, выше которого будет гарантированно включаться 220 свет (если не попали в dayInterval).
      lightSensorTarget: 'lightSensor', // устройство, отвечающее за датчик освещенности
      ext220Targets: 'ext220', // устройства, отвечающие за внешний 220В свет. Если он включен - включится 220, иначе 12
      int12Targets: '12' // устройства, отвечающие за 12В свет в текущем помещении. Если таких нет - вернется 220
    };*/
    
    
    // Режим работы вентилятора:
    // * свет включился и дверь закрыта и fanMode == 'off'
    // * или дверь закрылась и свет включен и fanMode == 'off'
    // ==> начать отсчет времени this.startTimer('fanStartTimer', 30)
    
    // * свет выключился
    // * или дверь открылась
    // ==> this.stopTimer('fanStartTimer')
    
    // * onFanStartTimer
    // ==> включить венрилятор this.switchFan('on')
    
    // * свет выключился и fanMode == 'on'
    // ==> начать отсчет времени this.startTimer('fanStopTimer', Math.min(Date.now()-state.fanModeTimeout, 5минут))
    
    // * onFanStopTimer
    // ==> выключить венрилятор this.switchFan('off')
    
    // Call superclass
    Bathroom.super_.prototype.init.call(this);
  };
  
  Bathroom.prototype.destroy = function(){
    Bathroom.super_.prototype.destroy.call(this);
  };
  
  Bathroom.prototype.onHumidityChanged = function(){
    //this.log('onHumidityChanged()');
    var intHumiditySensorId = this.getTarget('intHumiditySensor');
    var intHumiditySensor = intHumiditySensorId && this.getVDev(intHumiditySensorId);
    
    var extHumiditySensorId = this.getTarget('extHumiditySensor');
    var extHumiditySensor = extHumiditySensorId && this.getVDev(extHumiditySensorId);
    
    if (!intHumiditySensor || !extHumiditySensor) return;
    
    var intHumidity = intHumiditySensor.get("metrics:level");
    var extHumidity = extHumiditySensor.get("metrics:level");
    
    //this.log('onHumidityChanged(intHumidity='+intHumidity+', extHumidity='+extHumidity+', fanMode='+this.state.fanMode+')');
    
    if (this.state.fanMode == 'off') {
      if (!this.state.light) return;
      if (intHumidity - extHumidity > this.settings.humidityOnDelta) {
        this.switchFan('on');
      }
    } else {
      if (intHumidity - extHumidity < this.settings.humidityOffDelta) {
        this.switchFan('off');
        this.stopTimer('fanStopTimer');
      }
    } 
  };
  
  Bathroom.prototype.onLightOff = function(){
    Bathroom.super_.prototype.onLightOff.apply(this, arguments);
    if (this.state.fanMode == 'on') {
      this.startTimer('fanStopTimer', this.settings.fanMaxTimeout*60, this.onFanStopTimer);
    }
  };
  
  Bathroom.prototype.onFanStopTimer = function(){ // сработал таймер ВЫКЛЮЧЕНИЯ вентилятора
	this.log('onFanStopTimer()');
	this.switchFan('off');
  };
  
  Bathroom.prototype.onLightOn = function(){
    Bathroom.super_.prototype.onLightOn.apply(this, arguments);
    this.stopTimer('fanStopTimer');
    if (this.state.fanMode == 'off') {
      this.onHumidityChanged();
    }
  };
  
  
  return new Bathroom();
}


(function waitSuperClass(){
  var superClass = wrapper.myZWay.ModuleBase;
  if (superClass) {
    wrapper.log('waitSuperClass: superClass found! initClass()');
    initClass(superClass);
  }
  else {
    wrapper.log('waitSuperClass: superClass not found. waiting...');
    setTimeout(waitSuperClass, 10*1000);
  }
})()


})()



(function(){


function initClass(superClass){

  function Bedroom(/*id, controller*/) {
    Bedroom.super_.call(this, wrapper);
    //this.wrapper = wrapper;
    // Call superconstructor first (ModuleBase)
    this.log('new Bedroom()');
    
    /*this._getTargets = this.getTargets;
    var self = this;
    this.getTargets = function(name, sceneId){
      if (!sceneId) return self.getTargets(name);
      var id = this.getTarget(key);
      if (!id) return null;
      
        var targets = this.targets[name];
        if (!targets) return [];
        
        return targets;
    };*/
  }
  
  inherits(Bedroom, superClass);
  Bedroom.prototype.initClass = initClass;
  
  Bedroom.prototype.init = function (config) {
    this.log('Bedroom.init');
    this.name = 'Bedroom';
    this.settings = {
      //userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света. По таймеру выключается и свет
      //intMotionTimeout: 15, // таймаут выключения света после окончания движения ВНУТРИ, мин
      //extMotionTimeout: 2, // таймаут выключения света после окончания движения СНАРУЖИ, мин
      //lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
      //lastLightTimeout: 3 // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
    }
    
    

    this.targetsConfig = {
      //'12': {/*event: 'change:metrics:level', handler:this.handlers.on12LevelChanged*/}, // устройства, отвечающие за 12В свет
      '220center': {}, // устройства, отвечающие за 220В свет по центру
      '220center10': {event: 'change:metrics:level', handler:this.onCenterButtonUpClick}, // UP switch from OFF to ON
      //'220center14': {event: 'change:metrics:level', handler:this.onCenterButtonUpDoubleClick}, // UP double click
      //'220center15': {event: 'change:metrics:level', handler:this.onCenterButtonUpTrippleClick}, // UP triple click
      '220center17': {event: 'change:metrics:level', handler:this.onCenterButtonUpHold}, // UP brighten
      '220center14': {event: 'change:metrics:level', handler:this.onCenterButtonUpReleace}, // UP releasing
      '220center11': {event: 'change:metrics:level', handler:this.onCenterButtonDownClick}, // DOWN switch from ON to OFF
      //'220center25': {event: 'change:metrics:level', handler:this.onCenterButtonDownTrippleClick}, // DOWN triple click
      '220center18': {event: 'change:metrics:level', handler:this.onCenterButtonDownHold}, // DOWN dim
      '220center13': {event: 'change:metrics:level', handler:this.onCenterButtonDownRelease}, // DOWN releasing
      
      '220edge': {}, // устройства, отвечающие за 220В свет по краям
      '220edge10': {event: 'change:metrics:level', handler:this.onEdgeButtonUpClick}, // UP switch from OFF to ON
      //'220edge14': {event: 'change:metrics:level', handler:this.onEdgeButtonUpDoubleClick}, // UP double click
      //'220edge15': {event: 'change:metrics:level', handler:this.onEdgeButtonUpTrippleClick}, // UP triple click
      '220edge17': {event: 'change:metrics:level', handler:this.onEdgeButtonUpHold}, // UP brighten
      '220edge14': {event: 'change:metrics:level', handler:this.onEdgeButtonUpReleace}, // UP releasing
      '220edge11': {event: 'change:metrics:level', handler:this.onEdgeButtonDownClick}, // DOWN switch from ON to OFF
      //'220edge25': {event: 'change:metrics:level', handler:this.onEdgeButtonDownTrippleClick}, // DOWN triple click
      '220edge18': {event: 'change:metrics:level', handler:this.onEdgeButtonDownHold}, // DOWN dim
      '220edge13': {event: 'change:metrics:level', handler:this.onEdgeButtonDownRelease}, // DOWN releasing
      
      'rgb':{}, // switchRGBW
      //'r': {},
      //'g': {},
      //'b': {},
      'w': {}
      
      
      //'ext220': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // устройства во внешних комнатах, 220В
      //'intMotion': {event: 'change:metrics:level', handler:this.onIntMChanged}, // датчики движения внутренние
      //'extMotion': {event: 'change:metrics:level', handler:this.onExtMChanged}, // датчики движения внешние
      //'buttonUp': {event: 'change:metrics:level', handler:this.onButtonUp}, // кнопка Вверх
      //'buttonDown': {event: 'change:metrics:level', handler:this.onButtonDown}, // кнопка Вниз
      //'lightSensor': {/*event: 'change:metrics:level', handler:on12LevelChanged*/} // датчик освещенности (для выбора 220/12)
    };
    
    
    this.colors = [
      'rainbow',
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
    
    
   this.getTargets('220center').forEach(function(id){
     
   }, this);
    
    // Call superclass
    Bedroom.super_.prototype.init.call(this);
    
    this.state['220center'] = 'off'; //  ('on', 'off')
    this.state['220edge'] = 'off'; //  ('on', 'off')
    this.state.rgb = 'off'; //  ('on', 'off')
    this.state.rgbDimUp = true; // направление диммирования. true / false
    this.state.colorIndex = 0; // индекс цвета в массиве цветов
    this.state.lastColor = null; // последний цвет
    this.state.rgbBr = 100; // яркость RGB
    this.state.useMinBr = false; // показывает, что при смене цвета нужно выставлять минимальную яркость
    this.state.daylightColor = [15, 15, 100];
  };
  
  
  
  // приведение системы в исходное состояние
  Bedroom.prototype.initActions = function(){
    this.switch220('220center', 'off');
    this.switch220('220edge', 'off');
    this.offRGB();
    Bedroom.super_.prototype.initActions.call(this);
  }
  
  
  Bedroom.prototype.destroy = function(){
    Bedroom.super_.prototype.destroy.call(this);
  };
  
  
  // центральный свет вверх
  Bedroom.prototype.onCenterButtonUpClick = function(){ 
    this.log('onCenterButtonUpClick()');
    if (this.state['220center'] == 'off'){
      this.switch220('220center', 'on');
    }
  }
  
  // центральный свет вверх
  //Bedroom.prototype.onCenterButtonUpDoubleClick = function(){ }
  
  // центральный свет вверх
  //Bedroom.prototype.onCenterButtonUpTrippleClick = function(){ }
  
  // центральный свет вверх
  Bedroom.prototype.onCenterButtonUpHold = function(){ 
    this.log('onCenterButtonUpHold()');
  }
  
  // центральный свет вверх
  Bedroom.prototype.onCenterButtonUpReleace = function(){ 
    this.log('onCenterButtonUpReleace()');
  }
  
  // центральный свет вниз
  Bedroom.prototype.onCenterButtonDownClick = function(){ 
    this.log('onCenterButtonDownClick()');
    if (this.state['220center'] == 'on'){
      this.switch220('220center', 'off');
    } else if (this.state['220edge'] == 'on'){
      this.switch220('220edge', 'off');
    } else if (this.state.rgb == 'off'){
      this.onRGB();
    } else if (this.state.rgb == 'on'){
      this.nextRGB();
    } 
  }
  
  // центральный свет вниз
  //Bedroom.prototype.onCenterButtonDownTrippleClick = function(){ }
  
  // центральный свет вниз
  Bedroom.prototype.onCenterButtonDownHold = function(){ 
    this.log('onCenterButtonDownHold()');
  }
  
  // центральный свет вниз
  Bedroom.prototype.onCenterButtonDownRelease = function(){ 
    this.log('onCenterButtonDownRelease()');
  }
  
  // боковой свет вверх
  Bedroom.prototype.onEdgeButtonUpClick = function(){ 
    this.log('onEdgeButtonUpClick()');
    if (this.state['220edge'] == 'off'){
      this.switch220('220edge', 'on');
    }
  }
  
  // боковой свет вверх
  //Bedroom.prototype.onEdgeButtonUpDoubleClick = function(){ }
  
  // боковой свет вверх
  //Bedroom.prototype.onEdgeButtonUpTrippleClick = function(){ }
  
  // боковой свет вверх
  Bedroom.prototype.onEdgeButtonUpHold = function(){ 
    this.log('onEdgeButtonUpHold()');
  }
  
  // боковой свет вверх
  Bedroom.prototype.onEdgeButtonUpReleace = function(){ 
    this.log('onEdgeButtonUpReleace()');
  }
  
  // боковой свет вниз
  Bedroom.prototype.onEdgeButtonDownClick = function(){ 
    this.log('onEdgeButtonDownClick()');
    if (this.state['220edge'] == 'on'){
      this.switch220('220edge', 'off');
    } else if (this.state['220center'] == 'on'){
      this.switch220('220center', 'off');
    } else if (this.state.rgb == 'off'){
      this.onRGB();
    } else if (this.state.rgb == 'on'){
      this.offRGB();
    } 
  }
  
  // боковой свет вниз
  //Bedroom.prototype.onEdgeButtonDownTrippleClick = function(){ }
  
  // боковой свет вниз
  Bedroom.prototype.onEdgeButtonDownHold = function(){ 
    this.log('onEdgeButtonDownHold()');
     if (this.state['220edge'] == 'on') return;
     this.switch220('220edge', 'off');
     this.startRGBDim();
  }
  
  // боковой свет вниз
  Bedroom.prototype.onEdgeButtonDownRelease = function(){ 
    this.log('onEdgeButtonDownRelease()');
    if (this.state['220edge'] == 'on') return;
    this.stopRGBDim();
  }
  
  Bedroom.prototype.switch220 = function(light, mode){ 
    var is220on = this.state['220center'] == 'on' || this.state['220edge'] == 'on';
    
    this.log('switch220(' + light + ', ' + mode + ')');
    this.getTargets(light).forEach(function(id) {
      var vDev = this.getVDev(id);
      vDev && vDev.performCommand(mode);
    }, this);
    this.state[light] = mode;
    
    if (this.state['220center'] == 'on' && this.state['220edge'] == 'on'){
      this.onRGB(this.state.daylightColor, 100);
    } else if (this.state['220center'] == 'on' || this.state['220edge'] == 'on') {
      this.onRGB(this.state.daylightColor, 50);
    } else if (is220on) {
      this.offRGB();
    }
  }
  
  // включить/выключить RGB
  /*Bedroom.prototype.switchRGB = function(mode){ 
    this.log('switchRGB(' + mode + ')');
    this.sendRGBCommand(mode);
    this.state.rgb = mode;
  }*/
  
  // следующий цвет RGB
  Bedroom.prototype.nextRGB = function(){ 
    var colorIndex = this.state.colorIndex < this.colors.length-1 ? this.state.colorIndex+1 : 0;
    this.state.colorIndex = colorIndex;
    this.state.lastColor = null;
    //var color = this.colors[this.state.colorIndex];  
    this.onRGB();
  }
  
  Bedroom.prototype.onRGB = function(color, br){ 
    //if (colorIndex === undefined) colorIndex = this.state.colorIndex;
    color = color || this.state.lastColor;
    if (!color){
      color =  this.colors[this.state.colorIndex];
      if (color == 'rainbow') {
        this.startRainbow();
        return;
      } else {
        this.stopRainbow();
      }
    }
    this.state.lastColor = color;
    

    if (!br){
      var minBr = this.getMinBr(color);
      if (this.state.useMinBr)
        this.state.rgbBr = minBr;
      else 
        this.state.rgbBr = Math.max(minBr, this.state.rgbBr);
      br = this.state.rgbBr;
    }
    //this.sendRGBCommand(mode);
//    var col = {
//          red: Math.round(Math.ceil(this.colors[colorIndex][0] * (this.state.rgbBr+0.1) / 100)),
//          green: Math.round(Math.ceil(this.colors[colorIndex][1] * (this.state.rgbBr+0.1) / 100)),
//          blue: Math.round(Math.ceil(this.colors[colorIndex][2] * (this.state.rgbBr+0.1) / 100))
//        }
    var col = {
      red: Math.round(Math.ceil(color[0] * (br+0.1) / 100)),
      green: Math.round(Math.ceil(color[1] * (br+0.1) / 100)),
      blue: Math.round(Math.ceil(color[2] * (br+0.1) / 100))
    }
    this.log('onRGB(): ' + JSON.stringify(col));
    
    
    this.getTargets('rgb').forEach(function(id) {
        var vDev = this.getVDev(id);
        vDev && vDev.performCommand('exact', col);
    }, this);
    
  
    //this.state.colorIndex = colorIndex; // индекс цвета в массиве цветов
    //this.state.rgbBr = 100; // яркость RGB
    this.state.rgb = 'on';
  }
  
  Bedroom.prototype.offRGB = function(){ 
    this.log('offRGB()');
    this.stopRainbow();
    this.state.lastColor = null;
    //this.sendRGBCommand(mode);
    this.getTargets('rgb').forEach(function(id) {
        var vDev = this.getVDev(id);
        vDev && vDev.performCommand('off');
    }, this);
    this.state.rgb = 'off';
  }
  
  // определяем минимальную яркость, допустимую для цвета
  Bedroom.prototype.getMinBr = function(color){
    if (!(color instanceof Array)) return 1;
    //var color = this.colors[colorIndex];
    var minValue = Math.min.apply(Math, color.filter(function(val){ return val > 0;}));
    var minBr = Math.ceil(100 / minValue);
    return minBr;
  }
  
  
  Bedroom.prototype.startRGBDim = function(){
    this.log('startRGBDim(' + (this.state.rgbDimUp ? 'startUp' : 'startDown') + ')');
    
    onTimer.call(this);
    
    function onTimer(){
      var timeout = 1;
      
      if (this.state.rgbDimUp) {
        this.state.useMinBr = false;
        if (this.state.rgbBr == 100) return;
        this.log('change brightness: ' + this.state.rgbBr + ' -> ' + Math.min(this.state.rgbBr+10, 100));
        this.state.rgbBr = Math.min(this.state.rgbBr+10, 100);
        this.onRGB();
        this.startTimer('RGBDim', timeout, onTimer);
      } else {
        var minBr = this.getMinBr(this.colors[this.state.colorIndex]);
        if (this.state.rgbBr <= minBr) {
          this.state.useMinBr = true;
          return;
        }
        this.log('change brightness: ' + this.state.rgbBr + ' -> ' + Math.max(this.state.rgbBr-10, minBr) + ' (min: '+minBr+')');
        this.state.rgbBr = Math.max(this.state.rgbBr-10, minBr);
        if (this.state.rgbBr == minBr)
          this.state.useMinBr = true;
        this.onRGB();
        this.startTimer('RGBDim', timeout, onTimer);
      }
    }
    //this.sendRGBCommand('exact', {level: this.state.rgbDimUp ? 100 : 0});
  }
  
  Bedroom.prototype.stopRGBDim = function(){
    this.log('stopRGBDim()');
    //this.sendRGBCommand('stop');
    this.stopTimer('RGBDim');
    this.state.rgbDimUp = !this.state.rgbDimUp;
  }
  
  Bedroom.prototype.startRainbow = function(){
    this.log('startRainbow()');
    // вектор направления изменения цвета
    var v = [1,1,1].map(function(){
      return Math.random() > 0.5 ? 1 : -1;
    });
    
    var color = [50, 50, 50];
    var delta = 10;
    var timeout = 1;
    
    iter.call(this);
    
    function iter(){
      color = color.map(function(value, index){
        var val = value + Math.random() * delta * v[index];
        val = Math.round(val);
        if (val > 100){
          val = 200-val;
          v[index] = v[index] * -1;
        } else if (val < 0) {
          val = 0-val;
          v[index] = v[index] * -1;
        } else if (Math.random() * 10 < 1){
          //v[index] = v[index] * -1;
        }
        return val;
      });
      
      this.onRGB(color);
      this.startTimer('rainbow', timeout, iter);
    }
    
  }
  
  Bedroom.prototype.stopRainbow = function(){
    this.log('stopRainbow()');
    this.stopTimer('rainbow');
  }
  
  /*Bedroom.prototype.sendRGBCommand = function(command, options) {
    this.getTargets('r').concat(this.getTargets('g')).concat(this.getTargets('b'))
      .forEach(function(id) {
        var vDev = this.getVDev(id);
        vDev && vDev.performCommand(command, options);
        this.log(id + '.performCommand('+command+', '+JSON.stringify(options) + ')');
      }, this);
  }*/
  
  return new Bedroom();
}


(function waitSuperClass(){
  var superClass = wrapper.myZWay.ModuleBase;
  if (superClass) {
    wrapper.log('waitSuperClass: superClass found! initClass()');
    initClass(superClass);
  }
  else {
    wrapper.log('waitSuperClass: superClass not found. waiting...');
    setTimeout(waitSuperClass, 10*1000);
  }
})()



})()


