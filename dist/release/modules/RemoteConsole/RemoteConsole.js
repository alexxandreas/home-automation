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
	            //addToHistory(code);
	            var result = eval(code);
	            addToHistory(code, result);
	            return ws.sendJSON(result);
	        } catch (err){
	            var errObj = {text: err.toString(), stack: err.stack};
	            addToHistory(code, errObj);
	            return ws.sendError(500, errObj);
	        }
    	}, this);
    	
    	ws.addRoute('/modules/'+this.name+'/api/history', function(args){
	        try {
	            return ws.sendJSON(history);
	        } catch (err){
	            return ws.sendError(500, {text: err.toString(), stack: err.stack});
	        }
    	}, this);
    	
    	function addToHistory(src, data){
    	    try {
    	        var result = JSON.stringify(data, null, '  ').substr(0, 1000);
        	    //history.push(code);
        	    history.push({
                    src: src,
                    result: result
                });
        	    this.saveData('history', history);
    	    } catch (err) {
    	        this.log('Error in addToHistory: '  + err.toString() + ' ' + err.stack);
    	    }
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

