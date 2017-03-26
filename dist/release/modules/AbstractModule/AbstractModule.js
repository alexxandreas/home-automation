
define('AbstractModule', null, function(){
    function AbstractModule(config) {
        this.name = 'AbstractModule';
        this.log('abstract construcror');
    }
  
    AbstractModule.prototype.log = function(data){
        return MHA.prefixLog(this.name || 'UnnamedModule', data);
    };
    
    AbstractModule.prototype.stop = function(){
        
    }
    return AbstractModule;
});