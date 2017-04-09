/*
global config, inherits, controller, MHA
*/
define('RemoteConsole', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
   
   function RemoteConsole(config) {
        RemoteConsole.super_.call(this, config);
        this.name = 'RemoteConsole';
        this.log('construcror');

        this._initFrontend();
    }

    inherits(RemoteConsole, AbstractModule);


    RemoteConsole.prototype._initFrontend = function(){
        var ws = WebServer;
        
        var history = [];
        try {
            history = this.loadData('history') || [];
        } catch (err){ }
        
        
    	ws.addRoute('/modules/'+this.name+'/api/eval/:code', function(args){
	        var code = args[0];
	        try {
	            addToHistory(code);
	            var result = eval(code);
	            return ws.sendJSON(result);
	        } catch (err){
	            return ws.sendError(500, {text: err.toString(), stack: err.stack});
	        }
    	}, this);
    	
    	ws.addRoute('/modules/'+this.name+'/api/history', function(args){
	        try {
	            return ws.sendJSON(history);
	        } catch (err){
	            return ws.sendError(500, {text: err.toString(), stack: err.stack});
	        }
    	}, this);
    	
    	function addToHistory(code){
    	    try {
        	    history.push(code);
        	    this.saveData('history', history);
    	    } catch (err) {}
    	}
    	
    	WebServer.addPanel({
    	    key: this.name,
            title:'Remote Console',
            template: '/views/RemoteConsole/htdocs/RemoteConsole.html'
        });
    };
    
    
    RemoteConsole.prototype.stop = function(){
        WebServer.removePanel(this.name);
        RemoteConsole.super_.prototype.stop.apply(this, arguments);
    };

    return new RemoteConsole(config);

});

