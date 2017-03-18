module = (function(){
    
    function TestModule(config) {
        TestModule.super_.call(this, config);
        
        this.name = 'TestModule';
        this.log('construcror');
    }
  
    inherits(TestModule, MHA.modules.AbstractModule);
    
    TestModule.prototype.stop = function(){
        TestModule.super_.prototype.stop.apply(this, arguments);
    }
    
    return new TestModule(config);
    
})()

