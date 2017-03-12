config = {
   modules: [{
       name: 'AbstractModule'
   },{
       name: 'WebServer'
   },{
       name: 'TestModule', 
       // module: сюда запишется ссылка на экземпляр модуля
       config:{
           param1: 'aaa',
           param2: 'bbb'
       }
   }]
};

