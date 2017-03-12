module = (function(){
    
    function WebServer(config) {
        WebServer.super_.call(this, config);
        // Call superconstructor first (ModuleBase)
        this.name = 'WebServer';
        this.log('construcror');
        
        //this.log(JSON.stringify(config, '', 4));
        this.startWebServer();
    }
    
  
    inherits(WebServer, MHA.modules.AbstractModule);
    
    WebServer.prototype.stop = function(){
        stopWebServer();
        WebServer.super_.prototype.stop.apply(this, arguments);
    }
    
    
    WebServer.prototype.startWebServer = function (){
    	this.routes = [];
    	
        // define global handler for HTTP requests
        mha = function(url, request) {
        	var idx = url.indexOf('?');
        	
            var path = this.trimSlash(url.substring(0, idx >= 0 ? idx : undefined));
            var params = {};
            if (idx >= 0){
            	url
            	.substring(idx+1)
            	.split('&')
            	forEach(function(a) { idx = a.indexOf('='); params[a.substring(0, idx)] = a.substring(idx+1)})
            }	
            
    		if (this.routes[path]){
    			return this.routes[path](params);
    		}
    		
        };
        ws.allowExternalAccess("mha", this.controller.auth.ROLE.ANONYMOUS); // login required
    	
    	this.addDefaultRoutes();
    };
    
    WebServer.prototype.addDefaultRoutes = function(){
    	this.addRoute('/', rootHandler, this);
    	this.addRoute('/index.html', rootHandler, this);
    	
    	this.addRoute('/static/', staticHandler, this);
    	
    	function rootHandler(params){
    		this.log(' get index: ' + JSON.stringify(params));
    		return this.sendFile('modules/WebServer/htdocs/index.html');
    		
    	}
    	
    	function staticHandler(params){
    		this.log(' get static: ' + JSON.stringify(params));
    	}
    };
    	
    	
    WebServer.prototype.sendFile = function(path){
        var root = MHA.fsRoot; //  'modules/MyHomeAutomation/';
        
        this.log('sendFile: ' + root + path);
        

        var img = ["png","jpg","jpeg","JPG","JPEG","gif"];
        var text = ["css","htm","html","shtml","js","txt","rtf","xml"];
        var video = ["mpeg","mpg","mpe","qt","mov","viv","vivo","avi","movie","mp4"];
        //var ext,
        
        var contentType;
        var data;
        
    

        try {
        
            var ext = fileName.split(".").pop();
    
            if(img.indexOf(ext) > -1){
                contentType = "image/(png|jpeg|gif)";
            }
            
            if(text.indexOf(ext) > -1){
                contentType = "text/(css|html|javascript|plain|rtf|xml)";
            }
    
            if(video.indexOf(ext) > -1){
                contentType = "video/(mpeg|quicktime|vnd.vivo|x-msvideo|x-sgi-movie|mp4)";
            }
        
            
            data = fs.load(root + path);
            
            var result = {
                status: 200,
                headers: {
                    "Content-Type": contentType,
			        "Connection": "keep-alive"
                },
                body: data
            }
            return result;
        
        } catch(err) {
            this.log('sendFile Error: ' + err.toString() + "\n" + err.stack);
            
            return {
                status: 500,
                headers: {
                    "Content-Type": "text/plain",
                    "Connection": "keep-alive"
                },
                body: err.toString() + "\n" + err.stack
            }
        }
        
    };
    	
    WebServer.prototype.addRoute = function(route, handler, scope){
    	this.routes[trimSlash(route)] = scope ? handler.bind(scope) : handler;
    };
    
    WebServer.prototype.trimSlash = function(str){
    	while (str.length && str[0] == '/') str = str.substring(1);
    	while (str.length && str[str.length-1] == '/') str = str.substring(0, str.length-1);
    	return str;
    };
    
    WebServer.prototype.stopWebServer = function (){
    	ws.revokeExternalAccess("mha");
        mha = null;
    };
    
    return new WebServer(config);
    
})()

