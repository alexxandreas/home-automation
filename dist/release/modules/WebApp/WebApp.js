define('WebApp', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
    
    function WebApp(config) {
        WebApp.super_.call(this, config);
        this.name = 'WebApp';
        this.log('construcror');
        
        this.panels = [];
        this._initRoutes();
        
        // this.addPanel({
        //     title:'panel1',
        //     template: '/views/DeviceStorage/htdocs/DeviceStorage.html'
        // });
        
        
        
        this.addPanel({title:'panel2'});
        this.addPanel({title:'panel3'});
        this.addPanel({title:'panel4'});
    }
  
    inherits(WebApp, AbstractModule);
    
    WebApp.prototype._initRoutes = function(){
        var ws = WebServer;
        
        ws.addRoute('/', rootHandler, this);
    	ws.addRoute('/index.html', rootHandler, this);
    	
    	function rootHandler(params){
    		this.log('get index: ' + JSON.stringify(params));
    		return ws.sendFile('modules/WebApp/htdocs/index.html');
    	}
    	
    	ws.addRoute('/modules/'+this.name+'/api/:method', function(args){
    	    var method = args[0];
    	    if (method == 'panels') 
    	        return ws.sendJSON(this.panels);
    	    
    	    return ws.sendError(404, method + ' not found');
    	    
    	}, this);
    };
    
    
    WebApp.prototype.addPanel = function(panel){
        this.panels.push(panel);
    };
    
    
    WebApp.prototype.stop = function(){
        WebApp.super_.prototype.stop.apply(this, arguments);
    };
    
    return new WebApp(config);
    
})();

