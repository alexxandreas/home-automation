(function(){


function initClass(superClass){

  function Toilet() {
    Toilet.super_.call(this, wrapper);
    // Call superconstructor first (ModuleBase)
    this.log('new Toilet()');
  }
  
  inherits(Toilet, superClass);
  Toilet.prototype.initClass = initClass;
  
  Toilet.prototype.init = function (config) {
    this.log('Toilet.init');
    this.name = 'Toilet';
    this.settings = {
      userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
      intMotionTimeout: 10, // таймаут выключения света после окончания движения ВНУТРИ, мин
      extMotionTimeout: 1, // таймаут выключения света после окончания движения СНАРУЖИ, мин
      lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
      lastLightTimeout: 3, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
      nextRoom: 'Bathroom',// название соседней комнаты с общими устройствами
      fanStartDelay: 1.5,    // задержка включения вентилятора после включения света, мин
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
      'fan': {}, // вентилятор
      'doors': {event: 'change:metrics:level', handler:this.onDoorChanged}
    };
    
    // Режим работы вентилятора:
    // this.state.someDoorClosed = false;
    // this.state.someDoorOpened = false;
    
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
    
    // * дверь открылась и fanMode == 'on'
    // ==> начать отсчет времени this.startTimer('fanStopTimer', Math.min(Date.now()-state.fanModeTimeout, 5минут))
    

    // * onFanStopTimer
    // ==> выключить венрилятор this.switchFan('off')
    
    
    // Call superclass
    Toilet.super_.prototype.init.call(this);
  };
  
  Toilet.prototype.destroy = function(){
    Toilet.super_.prototype.destroy.call(this);
  };
  
  
  Toilet.prototype.onLightOn = function(){
    Toilet.super_.prototype.onLightOn.apply(this, arguments);
    this.stopTimer('fanStopTimer');
    if (this.state.someDoorOpened) return; // при открытой двери вентилятор не включаем
    if (this.state.fanMode == 'on') return;
    
    this.startTimer('fanStartTimer', this.settings.fanStartDelay*60, this.onFanStartTimer);
  };
  
  Toilet.prototype.onLightOff = function(){
    Toilet.super_.prototype.onLightOff.apply(this, arguments);
    this.stopTimer('fanStartTimer');
    if (this.state.fanMode == 'on') {
      this.startTimer('fanStopTimer', Math.min((Date.now()-this.state.fanModeTimeout)/1000, this.settings.fanMaxTimeout*60), this.onFanStopTimer);
    }
  };
  
  Toilet.prototype.onDoorOpen = function(id){
    Toilet.super_.prototype.onDoorOpen.apply(this, arguments);
    this.stopTimer('fanStartTimer');
    if (this.state.fanMode == 'on') {
      this.startTimer('fanStopTimer', Math.min((Date.now()-this.state.fanModeTimeout)/1000, this.settings.fanMaxTimeout*60), this.onFanStopTimer);
    }
  }
  
  Toilet.prototype.onDoorClose = function(id){
    Toilet.super_.prototype.onDoorClose.apply(this, arguments);
    this.stopTimer('fanStopTimer');
    if (!this.state.light) return; // при выключенном свете вентилятор не включаем
    if (this.state.fanMode == 'on') return;
    
    this.startTimer('fanStartTimer', this.settings.fanStartDelay*60, this.onFanStartTimer);
  }
  
  
  Toilet.prototype.onFanStartTimer = function(){ // сработал таймер ВКЛЮЧЕНИЯ вентилятора
	this.log('onFanStartTimer()');
	this.switchFan('on');
  };
  
  Toilet.prototype.onFanStopTimer = function(){ // сработал таймер ВЫКЛЮЧЕНИЯ вентилятора
	this.log('onFanStopTimer()');
	this.switchFan('off');
  };
  
  
  
  return new Toilet();
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


