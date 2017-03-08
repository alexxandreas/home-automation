(function(){


function initClass(superClass){

  function Kitchen(/*id, controller*/) {
    Kitchen.super_.call(this, wrapper);
    //this.wrapper = wrapper;
    // Call superconstructor first (ModuleBase)
    this.log('new Kitchen()');
    
  }
  
  inherits(Kitchen, superClass);
  Kitchen.prototype.initClass = initClass;
  
  Kitchen.prototype.init = function (config) {
    this.log('Kitchen.init');
    this.name = 'Kitchen';
    this.settings = {
      userModeTimeout: 15, // таймаут сброса пользовательского режима, мин. Таймер запускается после выключения света. По таймеру выключается и свет
      intMotionTimeout: 15, // таймаут выключения света после окончания движения ВНУТРИ, мин
      extMotionTimeout: 2, // таймаут выключения света после окончания движения СНАРУЖИ, мин
      lightOffTimeout: 15, // таймаут обязательного выключения света (когда не срабатывает датчик движения)
      lastLightTimeout: 3, // таймаут сброса последнего света (12 или 220). Последний свет запоминается и включается при новом движении
      tabletop220on: 99,
      tabletop220half: 70,
      tabletop12on: 70,
      tabletop12half: 40
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
      'tabletop': {}, // свет над столешницей
      'switch': {event: 'change:metrics:level', handler:this.onSwitchChange} // выключатель подсветки
      //'sensors': {event: 'change:metrics:level', handler:this.onSensorChange} // датчики приближения
    };
    
   
    
    // Call superclass
    Kitchen.super_.prototype.init.call(this);
    
    
  };
  
  Kitchen.prototype.initActions = function(){
    Kitchen.super_.prototype.initActions.call(this);
    
    this.getTargets('tabletop').forEach(function(id) {
      var vDev = this.getVDev(id);
      vDev && vDev.performCommand('off');
    }, this);
    
    this.state.switchMode = 'off';
    var switchId = this.getTarget('switch');
    if (!switchId) return;
    this.onSwitchChange(switchId);
  };
  
  Kitchen.prototype.destroy = function(){
    Kitchen.super_.prototype.destroy.call(this);
  };
  
  Kitchen.prototype.onSwitchChange = function(id){
    var vDev = this.getVDev(id);
    if (!vDev) return;
    var value = vDev.get("metrics:level");
    var mode = value > 70 ? 'off' : value > 35 ? 'half' : 'on';
    //this.log('onSwitchChange: ' + value + ' -> ' + mode);
    if (mode == this.state.switchMode) return;
    
    this.state.switchMode = mode;
    this.updateTabletop();
    
  };
  
  Kitchen.prototype.switchLight = function(){
    Kitchen.super_.prototype.switchLight.apply(this, arguments);
    this.updateTabletop();
  };
  
  Kitchen.prototype.updateTabletop = function(){
    var newValue;
    if (!this.state.light || this.state.switchMode == 'off')
      newValue = 0;
    else
      newValue = this.settings['tabletop' + this.state.light + this.state.switchMode];
    this.log('updateTabletop (' + newValue + '%)');// (tabletop' + this.state.light + this.state.switchMode + ')');
    
    this.getTargets('tabletop').forEach(function(id) {
      var vDev = this.getVDev(id);
      if (!vDev) return;
      
      this.action('switchTabletop ('+id+')', function(){
        vDev.performCommand("exact", { level: newValue });
      }, function(){
        return vDev.get("metrics:level") == newValue;
      });
    }, this);  
  };
  
  
  return new Kitchen();
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


