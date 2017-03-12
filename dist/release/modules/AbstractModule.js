module = (function(){
    
    function AbstractModule(config) {
        //TestModule.super_.call(this, wrapper);
        //MyHomeAutomation.super_.prototype.init.call(this, config);
        // Call superconstructor first (ModuleBase)
        //this.log('new AbstractModule()');
        this.log('abstract construcror');
    }
  
  //inherits(TestModule, superClass);
  //Bathroom.prototype.initClass = initClass;

    AbstractModule.prototype.log = function(data){
        return MHA.prototype.log(this.name || 'UnnamedModule ' + data);
    }
    
    return AbstractModule;
    
})()

