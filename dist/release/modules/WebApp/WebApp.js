module = (function(){
    
    function WebApp(config) {
        WebApp.super_.call(this, config);
        this.name = 'WebApp';
        this.log('construcror');
        
        this.panels = [];
        this._initRoutes();
        
        this.addPanel({title:'panel1'});
        this.addPanel({title:'panel2'});
        this.addPanel({title:'panel3'});
        this.addPanel({title:'panel4'});
    }
  
    inherits(WebApp, MHA.modules.AbstractModule);
    
    WebApp.prototype._initRoutes = function(){
        var ws = MHA.modules.WebServer;
        
        ws.addRoute('/', rootHandler, this);
    	ws.addRoute('/index.html', rootHandler, this);
    	
    	function rootHandler(params){
    		this.log('get index: ' + JSON.stringify(params));
    		return ws.sendFile('modules/WebApp/htdocs/index.html');
    	}
    	
    	ws.addRoute('/modules/'+this.name+'/api/:method', function(args){
    	    var method = args[0];
    	    if (method == 'panels') 
    	        return this._getPanels();
    	    
    	    return ws.sendError(404, method + ' not found');
    	    
    	}, this);
    };
    
    
    WebApp.prototype._getPanels = function(){
        
        
        var result = {
            status: 200,
            headers: {
                "Content-Type": 'application/json',
		        "Connection": "keep-alive"
            },
            body: this.panels
        };
        return result;
    };
    
    WebApp.prototype.addPanel = function(panel){
        this.panels.push(panel);
    };
    
    
    WebApp.prototype.stop = function(){
        WebApp.super_.prototype.stop.apply(this, arguments);
    };
    
    return new WebApp(config);
    
})();

