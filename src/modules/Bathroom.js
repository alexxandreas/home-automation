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


