
define('AbstractModule', null, function(){
    function AbstractModule(config) {
        this.name = 'AbstractModule';
        this.log('abstract construcror');
    }
  
    AbstractModule.prototype.log = function(data){
        return MHA.prefixLog(this.name || 'UnnamedModule', data);
    };
    
    AbstractModule.prototype.loadData = function (key) {
        return MHA.ModuleLoader.loadData(this.name || 'UnnamedModule' + '_' + key);
    };
    
    AbstractModule.prototype.saveData = function (key, value) {
        return MHA.ModuleLoader.saveData(this.name || 'UnnamedModule' + '_' + key, value);
    };
    
    AbstractModule.prototype.stop = function(){
        
    }
    return AbstractModule;
});