module = (function(){
    
    function TestModule(config) {
        TestModule.super_.call(this, config);
        //MyHomeAutomation.super_.prototype.init.call(this, config);
        // Call superconstructor first (ModuleBase)
        this.name = 'TestModule';
        this.log('construcror');
        
        this.log(JSON.stringify(config, '', 4));
    }
  
    inherits(TestModule, MHA.modules.AbstractModule);
    
    TestModule.prototype.stop = function(){
        TestModule.super_.prototype.stop.apply(this, arguments);
    }
    
    return new TestModule(config);
    
})()

