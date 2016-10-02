








var _ExecutionEnvironment=require('fbjs/lib/ExecutionEnvironment');var _ExecutionEnvironment2=_interopRequireDefault(_ExecutionEnvironment);
var _invariant=require('fbjs/lib/invariant');var _invariant2=_interopRequireDefault(_invariant);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var connection=_ExecutionEnvironment2.default.canUseDOM&&(
window.navigator.connection||
window.navigator.mozConnection||
window.navigator.webkitConnection);


var eventTypes=['change'];





var NetInfo={
addEventListener:function addEventListener(type,handler){
(0,_invariant2.default)(eventTypes.indexOf(type)!==-1,'Trying to subscribe to unknown event: "%s"',type);
if(!connection){
console.error('Network Connection API is not supported. Not listening for connection type changes.');
return{
remove:function remove(){}};

}

connection.addEventListener(type,handler);
return{
remove:function remove(){return NetInfo.removeEventListener(type,handler);}};

},

removeEventListener:function removeEventListener(type,handler){
(0,_invariant2.default)(eventTypes.indexOf(type)!==-1,'Trying to subscribe to unknown event: "%s"',type);
if(!connection){return;}
connection.removeEventListener(type,handler);
},

fetch:function fetch(){
return new Promise(function(resolve,reject){
try{
resolve(connection.type);
}catch(err){
resolve('unknown');
}
});
},

isConnected:{
addEventListener:function addEventListener(type,handler){
(0,_invariant2.default)(eventTypes.indexOf(type)!==-1,'Trying to subscribe to unknown event: "%s"',type);
window.addEventListener('online',handler.bind(null,true),false);
window.addEventListener('offline',handler.bind(null,false),false);

return{
remove:function remove(){return NetInfo.isConnected.removeEventListener(type,handler);}};

},

removeEventListener:function removeEventListener(type,handler){
(0,_invariant2.default)(eventTypes.indexOf(type)!==-1,'Trying to subscribe to unknown event: "%s"',type);
window.removeEventListener('online',handler.bind(null,true),false);
window.removeEventListener('offline',handler.bind(null,false),false);
},

fetch:function fetch(){
return new Promise(function(resolve,reject){
try{
resolve(window.navigator.onLine);
}catch(err){
resolve(true);
}
});
}}};



module.exports=NetInfo;