module = (function(){
    
    function WebApp(config) {
        WebApp.super_.call(this, config);
        this.name = 'WebApp';
        this.log('construcror');
        
        this._initDefaultRoute();
    }
  
    inherits(WebApp, MHA.modules.AbstractModule);
    
    WebApp.prototype._initDefaultRoute = function(){
        var ws = MHA.modules.WebServer;
        
        ws.addRoute('/', rootHandler, this);
    	ws.addRoute('/index.html', rootHandler, this);
    	
    	function rootHandler(params){
    		this.log('get index: ' + JSON.stringify(params));
    		return ws._sendFile('modules/WebApp/htdocs/index.html');
    	}
    };
    
    
    
    WebApp.prototype.stop = function(){
        WebApp.super_.prototype.stop.apply(this, arguments);
    }
    
    return new WebApp(config);
    
})()

