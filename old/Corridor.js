(function(){


function initClass(superClass){

  function Сorridor() {
    Сorridor.super_.call(this, wrapper);
    // Call superconstructor first (ModuleBase)
    this.log('new Сorridor()');
  }
  
  inherits(Сorridor, superClass);
  Сorridor.prototype.initClass = initClass;
  
  Сorridor.prototype.init = function (config) {
    this.log('Сorridor.init');
    this.name = 'Сorridor';
    this.settings = {
      userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света
      intMotionTimeout: 0.5, // таймаут выключения света после окончания движения ВНУТРИ, мин
      extMotionTimeout: 0.5, // таймаут выключения света после окончания движения СНАРУЖИ, мин
      lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
      lastLightTimeout: 3, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
      nextRoom: 'Hallway' // название соседней комнаты с общими устройствами
    }
    
  
    this.targetsConfig = {
      '12': {/*event: 'change:metrics:level', handler:this.handlers.on12LevelChanged*/}, // устройства, отвечающие за 12В свет
      '220': {/*event: 'change:metrics:level', handler:this.handlers.on220LevelChanged*/}, // устройства, отвечающие за 220В свет
      'ext220': {/*event: 'change:metrics:level', handler:on12LevelChanged*/}, // устройства во внешних комнатах, 220В
      'intMotion': {event: 'change:metrics:level', handler:this.onIntMChanged}, // датчики движения внутренние
      'extMotion': {event: 'change:metrics:level', handler:this.onExtMChanged}, // датчики движения внешние
      'buttonUp': {event: 'change:metrics:level', handler:this.onButtonUp}, // кнопка Вверх
      'buttonDown': {event: 'change:metrics:level', handler:this.onButtonDown}, // кнопка Вниз
      'lightSensor': {/*event: 'change:metrics:level', handler:on12LevelChanged*/} // датчик освещенности (для выбора 220/12)
    };
    
    // конфиг для функции выбора подходящего освещения (220 или 12)
    /*this.suitableLightConfig = {
      dayInterval: {hStart:8, mStart:0, hEnd:20, mEnd:0}, // интервал времени, в который гарантированно будет включаться 220 свет. 
      minIlluminationLevel: 0, // уровень освещенности, Lux, выше которого будет гарантированно включаться 220 свет (если не попали в dayInterval).
      lightSensorTarget: 'lightSensor', // устройство, отвечающее за датчик освещенности
      ext220Targets: 'ext220', // устройства, отвечающие за внешний 220В свет. Если он включен - включится 220, иначе 12
      int12Targets: '12' // устройства, отвечающие за 12В свет в текущем помещении. Если таких нет - вернется 220
    };*/
    
    
    // Call superclass
    Сorridor.super_.prototype.init.call(this);
  };
  
  Сorridor.prototype.destroy = function(){
    Сorridor.super_.prototype.destroy.call(this);
  };
  
  
  return new Сorridor();
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


