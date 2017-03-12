module = (function(){
    
    function TestModule(config) {
        TestModule.super_.call(this, config);
        //MyHomeAutomation.super_.prototype.init.call(this, config);
        // Call superconstructor first (ModuleBase)
        this.name = 'TestModule';
        this.log('construcror');
        
        this.log(JSON.stringify(config));
    }
  
    inherits(TestModule, MHA.modules.AbstractModule.module);
    
    return new TestModule();
    
})()

