








'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};

var _react=require('react');var _react2=_interopRequireDefault(_react);
var _ReactDimensions=require('../Dimensions/Dimensions.web');var _ReactDimensions2=_interopRequireDefault(_ReactDimensions);
var _ReactInteractionMixin=require('../Interaction/InteractionMixin.web');var _ReactInteractionMixin2=_interopRequireDefault(_ReactInteractionMixin);
var _map=require('core-js/library/fn/map');var _map2=_interopRequireDefault(_map);
var _ReactNavigationContext=require('./Navigation/NavigationContext');var _ReactNavigationContext2=_interopRequireDefault(_ReactNavigationContext);
var _ReactNavigatorBreadcrumbNavigationBar=require('./NavigatorBreadcrumbNavigationBar');var _ReactNavigatorBreadcrumbNavigationBar2=_interopRequireDefault(_ReactNavigatorBreadcrumbNavigationBar);
var _ReactNavigatorNavigationBar=require('./NavigatorNavigationBar');var _ReactNavigatorNavigationBar2=_interopRequireDefault(_ReactNavigatorNavigationBar);
var _ReactNavigatorSceneConfigs=require('./NavigatorSceneConfigs');var _ReactNavigatorSceneConfigs2=_interopRequireDefault(_ReactNavigatorSceneConfigs);
var _ReactPanResponder=require('../PanResponder/PanResponder.web');var _ReactPanResponder2=_interopRequireDefault(_ReactPanResponder);
var _ReactStyleSheet=require('../StyleSheet/StyleSheet.web');var _ReactStyleSheet2=_interopRequireDefault(_ReactStyleSheet);
var _Subscribable=require('./polyfills/Subscribable');var _Subscribable2=_interopRequireDefault(_Subscribable);
var _reactTimerMixin=require('react-timer-mixin');var _reactTimerMixin2=_interopRequireDefault(_reactTimerMixin);
var _ReactView=require('../View/View.web');var _ReactView2=_interopRequireDefault(_ReactView);
var _clamp=require('./polyfills/clamp');var _clamp2=_interopRequireDefault(_clamp);
var _ReactFlattenStyle=require('../StyleSheet/flattenStyle.web');var _ReactFlattenStyle2=_interopRequireDefault(_ReactFlattenStyle);
var _invariant=require('fbjs/lib/invariant');var _invariant2=_interopRequireDefault(_invariant);
var _rebound=require('rebound');var _rebound2=_interopRequireDefault(_rebound);
var _createHashHistory=require('history/lib/createHashHistory');var _createHashHistory2=_interopRequireDefault(_createHashHistory);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var history=(0,_createHashHistory2.default)();
var _unlisten=void 0;




var SCREEN_WIDTH=_ReactDimensions2.default.get('window').width;
var SCREEN_HEIGHT=_ReactDimensions2.default.get('window').height;
var SCENE_DISABLED_NATIVE_PROPS={
pointerEvents:'none',
style:{


opacity:0}};



var __uid=0;
function getuid(){
return __uid++;
}

function getRouteID(route){
if(route===null||typeof route!=='object'){
return String(route);
}

var key='__navigatorRouteID';

if(!route.hasOwnProperty(key)){
Object.defineProperty(route,key,{
enumerable:false,
configurable:false,
writable:false,
value:getuid()});

}
return route[key];
}


var styles=_ReactStyleSheet2.default.create({
container:{
flex:1,
overflow:'hidden'},

defaultSceneStyle:{
position:'absolute',
left:0,
right:0,
bottom:0,
top:0},

baseScene:{
position:'absolute',
overflow:'hidden',
left:0,
right:0,
bottom:0,
top:0},

disabledScene:{},



transitioner:{
flex:1,
backgroundColor:'transparent',
overflow:'hidden'}});



var GESTURE_ACTIONS=[
'pop',
'jumpBack',
'jumpForward'];





























































var Navigator=_react2.default.createClass({displayName:'Navigator',

propTypes:{









configureScene:_react.PropTypes.func,










renderScene:_react.PropTypes.func.isRequired,







initialRoute:_react.PropTypes.object,






initialRouteStack:_react.PropTypes.arrayOf(_react.PropTypes.object),







onWillFocus:_react.PropTypes.func,








onDidFocus:_react.PropTypes.func,





navigationBar:_react.PropTypes.node,




navigator:_react.PropTypes.object,




sceneStyle:_ReactView2.default.propTypes.style},


statics:{
BreadcrumbNavigationBar:_ReactNavigatorBreadcrumbNavigationBar2.default,
NavigationBar:_ReactNavigatorNavigationBar2.default,
SceneConfigs:_ReactNavigatorSceneConfigs2.default},


mixins:[_reactTimerMixin2.default,_ReactInteractionMixin2.default,_Subscribable2.default.Mixin],

getDefaultProps:function getDefaultProps(){
return{
configureScene:function configureScene(){return _ReactNavigatorSceneConfigs2.default.PushFromRight;},
sceneStyle:styles.defaultSceneStyle};

},

getInitialState:function getInitialState(){var _this=this;
this._renderedSceneMap=new _map2.default();

var routeStack=this.props.initialRouteStack||[this.props.initialRoute];
(0,_invariant2.default)(
routeStack.length>=1,
'Navigator requires props.initialRoute or props.initialRouteStack.');

var initialRouteIndex=routeStack.length-1;
if(this.props.initialRoute){
initialRouteIndex=routeStack.indexOf(this.props.initialRoute);
(0,_invariant2.default)(
initialRouteIndex!==-1,
'initialRoute is not in initialRouteStack.');

}
return{
sceneConfigStack:routeStack.map(
function(route){return _this.props.configureScene(route);}),

routeStack:routeStack,
presentedIndex:initialRouteIndex,
transitionFromIndex:null,
activeGesture:null,
pendingGestureProgress:null,
transitionQueue:[]};

},

componentWillMount:function componentWillMount(){var _this2=this;

this.__defineGetter__('navigationContext',this._getNavigationContext);

this._subRouteFocus=[];
this.parentNavigator=this.props.navigator;
this._handlers={};
this.springSystem=new _rebound2.default.SpringSystem();
this.spring=this.springSystem.createSpring();
this.spring.setRestSpeedThreshold(0.05);
this.spring.setCurrentValue(0).setAtRest();
this.spring.addListener({
onSpringEndStateChange:function onSpringEndStateChange(){
if(!_this2._interactionHandle){
_this2._interactionHandle=_this2.createInteractionHandle();
}
},
onSpringUpdate:function onSpringUpdate(){
_this2._handleSpringUpdate();
},
onSpringAtRest:function onSpringAtRest(){
_this2._completeTransition();
}});

this.panGesture=_ReactPanResponder2.default.create({
onMoveShouldSetPanResponder:this._handleMoveShouldSetPanResponder,
onPanResponderGrant:this._handlePanResponderGrant,
onPanResponderRelease:this._handlePanResponderRelease,
onPanResponderMove:this._handlePanResponderMove,
onPanResponderTerminate:this._handlePanResponderTerminate});

this._interactionHandle=null;
this._emitWillFocus(this.state.routeStack[this.state.presentedIndex]);
this.hashChanged=false;
},

componentDidMount:function componentDidMount(){
this._handleSpringUpdate();
this._emitDidFocus(this.state.routeStack[this.state.presentedIndex]);



_unlisten=history.listen(function(location){
var destIndex=0;
if(location.pathname.indexOf('/scene_')!=-1){
destIndex=parseInt(location.pathname.replace('/scene_',''));
}
if(destIndex<this.state.routeStack.length&&destIndex!=this.state.routeStack.length){
this.hashChanged=true;
this._jumpN(destIndex-this.state.presentedIndex);
this.hashChanged=false;
}
}.bind(this));
},

componentWillUnmount:function componentWillUnmount(){
if(this._navigationContext){
this._navigationContext.dispose();
this._navigationContext=null;
}


_unlisten();

},








immediatelyResetRouteStack:function immediatelyResetRouteStack(nextRouteStack){var _this3=this;
var destIndex=nextRouteStack.length-1;
this.setState({
routeStack:nextRouteStack,
sceneConfigStack:nextRouteStack.map(
this.props.configureScene),

presentedIndex:destIndex,
activeGesture:null,
transitionFromIndex:null,
transitionQueue:[]},
function(){
_this3._handleSpringUpdate();
});
},

_transitionTo:function _transitionTo(destIndex,velocity,jumpSpringTo,cb){
if(destIndex===this.state.presentedIndex){
return;
}
if(this.state.transitionFromIndex!==null){
this.state.transitionQueue.push({
destIndex:destIndex,
velocity:velocity,
cb:cb});

return;
}
this.state.transitionFromIndex=this.state.presentedIndex;
this.state.presentedIndex=destIndex;
this.state.transitionCb=cb;
this._onAnimationStart();



var sceneConfig=this.state.sceneConfigStack[this.state.transitionFromIndex]||
this.state.sceneConfigStack[this.state.presentedIndex];
(0,_invariant2.default)(
sceneConfig,
'Cannot configure scene at index '+this.state.transitionFromIndex);

if(jumpSpringTo!=null){
this.spring.setCurrentValue(jumpSpringTo);
}
this.spring.setOvershootClampingEnabled(true);
this.spring.getSpringConfig().friction=sceneConfig.springFriction;
this.spring.getSpringConfig().tension=sceneConfig.springTension;
this.spring.setVelocity(velocity||sceneConfig.defaultTransitionVelocity);
this.spring.setEndValue(1);
},





_handleSpringUpdate:function _handleSpringUpdate(){

if(this.state.transitionFromIndex!=null){
this._transitionBetween(
this.state.transitionFromIndex,
this.state.presentedIndex,
this.spring.getCurrentValue());

}else if(this.state.activeGesture!=null){
var presentedToIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
this._transitionBetween(
this.state.presentedIndex,
presentedToIndex,
this.spring.getCurrentValue());

}
},




_completeTransition:function _completeTransition(){
if(this.spring.getCurrentValue()!==1&&this.spring.getCurrentValue()!==0){


if(this.state.pendingGestureProgress){
this.state.pendingGestureProgress=null;
}
return;
}
this._onAnimationEnd();
var presentedIndex=this.state.presentedIndex;
var didFocusRoute=this._subRouteFocus[presentedIndex]||this.state.routeStack[presentedIndex];
this._emitDidFocus(didFocusRoute);



this.state.transitionFromIndex=null;
this.spring.setCurrentValue(0).setAtRest();
this._hideScenes();
if(this.state.transitionCb){
this.state.transitionCb();
this.state.transitionCb=null;
}
if(this._interactionHandle){
this.clearInteractionHandle(this._interactionHandle);
this._interactionHandle=null;
}
if(this.state.pendingGestureProgress){


var gestureToIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
this._enableScene(gestureToIndex);
this.spring.setEndValue(this.state.pendingGestureProgress);
return;
}
if(this.state.transitionQueue.length){
var queuedTransition=this.state.transitionQueue.shift();
this._enableScene(queuedTransition.destIndex);
this._emitWillFocus(this.state.routeStack[queuedTransition.destIndex]);
this._transitionTo(
queuedTransition.destIndex,
queuedTransition.velocity,
null,
queuedTransition.cb);

}
},

_emitDidFocus:function _emitDidFocus(route){
this.navigationContext.emit('didfocus',{route:route});

if(this.props.onDidFocus){
this.props.onDidFocus(route);
}
},

_emitWillFocus:function _emitWillFocus(route){
this.navigationContext.emit('willfocus',{route:route});

var navBar=this._navBar;
if(navBar&&navBar.handleWillFocus){
navBar.handleWillFocus(route);
}
if(this.props.onWillFocus){
this.props.onWillFocus(route);
}
},




_hideScenes:function _hideScenes(){
var gesturingToIndex=null;
if(this.state.activeGesture){
gesturingToIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
}
for(var i=0;i<this.state.routeStack.length;i++){
if(i===this.state.presentedIndex||
i===this.state.transitionFromIndex||
i===gesturingToIndex){
continue;
}
this._disableScene(i);
}
},




_disableScene:function _disableScene(sceneIndex){
this.refs['scene_'+sceneIndex]&&
this.refs['scene_'+sceneIndex].setNativeProps(SCENE_DISABLED_NATIVE_PROPS);
},




_enableScene:function _enableScene(sceneIndex){

var sceneStyle=(0,_ReactFlattenStyle2.default)([styles.baseScene,this.props.sceneStyle]);

var enabledSceneNativeProps={
pointerEvents:'auto',
style:{
top:sceneStyle.top,
bottom:sceneStyle.bottom}};


if(sceneIndex!==this.state.transitionFromIndex&&
sceneIndex!==this.state.presentedIndex){


enabledSceneNativeProps.style.opacity=0;
}
this.refs['scene_'+sceneIndex]&&
this.refs['scene_'+sceneIndex].setNativeProps(enabledSceneNativeProps);
},

_onAnimationStart:function _onAnimationStart(){
var fromIndex=this.state.presentedIndex;
var toIndex=this.state.presentedIndex;
if(this.state.transitionFromIndex!=null){
fromIndex=this.state.transitionFromIndex;
}else if(this.state.activeGesture){
toIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
}
this._setRenderSceneToHardwareTextureAndroid(fromIndex,true);
this._setRenderSceneToHardwareTextureAndroid(toIndex,true);
var navBar=this._navBar;
if(navBar&&navBar.onAnimationStart){
navBar.onAnimationStart(fromIndex,toIndex);
}
},

_onAnimationEnd:function _onAnimationEnd(){
var max=this.state.routeStack.length-1;
for(var index=0;index<=max;index++){
this._setRenderSceneToHardwareTextureAndroid(index,false);
}

var navBar=this._navBar;
if(navBar&&navBar.onAnimationEnd){
navBar.onAnimationEnd();
}
},

_setRenderSceneToHardwareTextureAndroid:function _setRenderSceneToHardwareTextureAndroid(sceneIndex,shouldRenderToHardwareTexture){
var viewAtIndex=this.refs['scene_'+sceneIndex];
if(viewAtIndex===null||viewAtIndex===undefined){
return;
}
viewAtIndex.setNativeProps({renderToHardwareTextureAndroid:shouldRenderToHardwareTexture});
},

_handleTouchStart:function _handleTouchStart(){
this._eligibleGestures=GESTURE_ACTIONS;
},

_handleMoveShouldSetPanResponder:function _handleMoveShouldSetPanResponder(e,gestureState){
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
if(!sceneConfig){
return false;
}
this._expectingGestureGrant=this._matchGestureAction(this._eligibleGestures,sceneConfig.gestures,gestureState);
return!!this._expectingGestureGrant;
},

_doesGestureOverswipe:function _doesGestureOverswipe(gestureName){
var wouldOverswipeBack=this.state.presentedIndex<=0&&(
gestureName==='pop'||gestureName==='jumpBack');
var wouldOverswipeForward=this.state.presentedIndex>=this.state.routeStack.length-1&&
gestureName==='jumpForward';
return wouldOverswipeForward||wouldOverswipeBack;
},

_handlePanResponderGrant:function _handlePanResponderGrant(e,gestureState){
(0,_invariant2.default)(
this._expectingGestureGrant,
'Responder granted unexpectedly.');

this._attachGesture(this._expectingGestureGrant);
this._onAnimationStart();
this._expectingGestureGrant=null;
},

_deltaForGestureAction:function _deltaForGestureAction(gestureAction){
switch(gestureAction){
case'pop':
case'jumpBack':
return-1;
case'jumpForward':
return 1;
default:
(0,_invariant2.default)(false,'Unsupported gesture action '+gestureAction);
return;}

},

_handlePanResponderRelease:function _handlePanResponderRelease(e,gestureState){var _this4=this;
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
var releaseGestureAction=this.state.activeGesture;
if(!releaseGestureAction){

return;
}
var releaseGesture=sceneConfig.gestures[releaseGestureAction];
var destIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
if(this.spring.getCurrentValue()===0){

this.spring.setCurrentValue(0).setAtRest();
this._completeTransition();
return;
}
var isTravelVertical=releaseGesture.direction==='top-to-bottom'||releaseGesture.direction==='bottom-to-top';
var isTravelInverted=releaseGesture.direction==='right-to-left'||releaseGesture.direction==='bottom-to-top';
var velocity=void 0,gestureDistance=void 0;
if(isTravelVertical){
velocity=isTravelInverted?-gestureState.vy:gestureState.vy;
gestureDistance=isTravelInverted?-gestureState.dy:gestureState.dy;
}else{
velocity=isTravelInverted?-gestureState.vx:gestureState.vx;
gestureDistance=isTravelInverted?-gestureState.dx:gestureState.dx;
}
var transitionVelocity=(0,_clamp2.default)(-10,velocity,10);
if(Math.abs(velocity)<releaseGesture.notMoving){

var hasGesturedEnoughToComplete=gestureDistance>releaseGesture.fullDistance*releaseGesture.stillCompletionRatio;
transitionVelocity=hasGesturedEnoughToComplete?releaseGesture.snapVelocity:-releaseGesture.snapVelocity;
}
if(transitionVelocity<0||this._doesGestureOverswipe(releaseGestureAction)){


if(this.state.transitionFromIndex==null){

var transitionBackToPresentedIndex=this.state.presentedIndex;

this.state.presentedIndex=destIndex;
this._transitionTo(
transitionBackToPresentedIndex,
-transitionVelocity,
1-this.spring.getCurrentValue());

}
}else{

this._emitWillFocus(this.state.routeStack[destIndex]);
this._transitionTo(
destIndex,
transitionVelocity,
null,
function(){
if(releaseGestureAction==='pop'){
_this4._cleanScenesPastIndex(destIndex);
}
});

}
this._detachGesture();
},

_handlePanResponderTerminate:function _handlePanResponderTerminate(e,gestureState){
if(this.state.activeGesture==null){
return;
}
var destIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
this._detachGesture();
var transitionBackToPresentedIndex=this.state.presentedIndex;

this.state.presentedIndex=destIndex;
this._transitionTo(
transitionBackToPresentedIndex,
null,
1-this.spring.getCurrentValue());

},

_attachGesture:function _attachGesture(gestureId){
this.state.activeGesture=gestureId;
var gesturingToIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
this._enableScene(gesturingToIndex);
},

_detachGesture:function _detachGesture(){
this.state.activeGesture=null;
this.state.pendingGestureProgress=null;
this._hideScenes();
},

_handlePanResponderMove:function _handlePanResponderMove(e,gestureState){
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
if(this.state.activeGesture){
var gesture=sceneConfig.gestures[this.state.activeGesture];
return this._moveAttachedGesture(gesture,gestureState);
}
var matchedGesture=this._matchGestureAction(GESTURE_ACTIONS,sceneConfig.gestures,gestureState);
if(matchedGesture){
this._attachGesture(matchedGesture);
}
},

_moveAttachedGesture:function _moveAttachedGesture(gesture,gestureState){
var isTravelVertical=gesture.direction==='top-to-bottom'||gesture.direction==='bottom-to-top';
var isTravelInverted=gesture.direction==='right-to-left'||gesture.direction==='bottom-to-top';
var distance=isTravelVertical?gestureState.dy:gestureState.dx;
distance=isTravelInverted?-distance:distance;
var gestureDetectMovement=gesture.gestureDetectMovement;
var nextProgress=(distance-gestureDetectMovement)/(
gesture.fullDistance-gestureDetectMovement);
if(nextProgress<0&&gesture.isDetachable){
var gesturingToIndex=this.state.presentedIndex+this._deltaForGestureAction(this.state.activeGesture);
this._transitionBetween(this.state.presentedIndex,gesturingToIndex,0);
this._detachGesture();
if(this.state.pendingGestureProgress!=null){
this.spring.setCurrentValue(0);
}
return;
}
if(this._doesGestureOverswipe(this.state.activeGesture)){
var frictionConstant=gesture.overswipe.frictionConstant;
var frictionByDistance=gesture.overswipe.frictionByDistance;
var frictionRatio=1/(frictionConstant+Math.abs(nextProgress)*frictionByDistance);
nextProgress*=frictionRatio;
}
nextProgress=(0,_clamp2.default)(0,nextProgress,1);
if(this.state.transitionFromIndex!=null){
this.state.pendingGestureProgress=nextProgress;
}else if(this.state.pendingGestureProgress){
this.spring.setEndValue(nextProgress);
}else{
this.spring.setCurrentValue(nextProgress);
}
},

_matchGestureAction:function _matchGestureAction(eligibleGestures,gestures,gestureState){var _this5=this;
if(!gestures){
return null;
}
var matchedGesture=null;
eligibleGestures.some(function(gestureName,gestureIndex){
var gesture=gestures[gestureName];
if(!gesture){
return;
}
if(gesture.overswipe==null&&_this5._doesGestureOverswipe(gestureName)){

return false;
}
var isTravelVertical=gesture.direction==='top-to-bottom'||gesture.direction==='bottom-to-top';
var isTravelInverted=gesture.direction==='right-to-left'||gesture.direction==='bottom-to-top';
var currentLoc=isTravelVertical?gestureState.moveY:gestureState.moveX;
var travelDist=isTravelVertical?gestureState.dy:gestureState.dx;
var oppositeAxisTravelDist=
isTravelVertical?gestureState.dx:gestureState.dy;
var edgeHitWidth=gesture.edgeHitWidth;
if(isTravelInverted){
currentLoc=-currentLoc;
travelDist=-travelDist;
oppositeAxisTravelDist=-oppositeAxisTravelDist;
edgeHitWidth=isTravelVertical?
-(SCREEN_HEIGHT-edgeHitWidth):
-(SCREEN_WIDTH-edgeHitWidth);
}
var moveStartedInRegion=gesture.edgeHitWidth==null||
currentLoc<edgeHitWidth;
if(!moveStartedInRegion){
return false;
}
var moveTravelledFarEnough=travelDist>=gesture.gestureDetectMovement;
if(!moveTravelledFarEnough){
return false;
}
var directionIsCorrect=Math.abs(travelDist)>Math.abs(oppositeAxisTravelDist)*gesture.directionRatio;
if(directionIsCorrect){
matchedGesture=gestureName;
return true;
}else{
_this5._eligibleGestures=_this5._eligibleGestures.slice().splice(gestureIndex,1);
}
});
return matchedGesture;
},

_transitionSceneStyle:function _transitionSceneStyle(fromIndex,toIndex,progress,index){
var viewAtIndex=this.refs['scene_'+index];
if(viewAtIndex===null||viewAtIndex===undefined){
return;
}

var sceneConfigIndex=fromIndex<toIndex?toIndex:fromIndex;
var sceneConfig=this.state.sceneConfigStack[sceneConfigIndex];

if(!sceneConfig){
sceneConfig=this.state.sceneConfigStack[sceneConfigIndex-1];
}
var styleToUse={};
var useFn=index<fromIndex||index<toIndex?
sceneConfig.animationInterpolators.out:
sceneConfig.animationInterpolators.into;
var directionAdjustedProgress=fromIndex<toIndex?progress:1-progress;
var didChange=useFn(styleToUse,directionAdjustedProgress);
if(didChange){
viewAtIndex.setNativeProps({style:styleToUse});
}
},

_transitionBetween:function _transitionBetween(fromIndex,toIndex,progress){
this._transitionSceneStyle(fromIndex,toIndex,progress,fromIndex);
this._transitionSceneStyle(fromIndex,toIndex,progress,toIndex);
var navBar=this._navBar;
if(navBar&&navBar.updateProgress&&toIndex>=0&&fromIndex>=0){
navBar.updateProgress(progress,fromIndex,toIndex);
}
},

_handleResponderTerminationRequest:function _handleResponderTerminationRequest(){
return false;
},

_getDestIndexWithinBounds:function _getDestIndexWithinBounds(n){
var currentIndex=this.state.presentedIndex;
var destIndex=currentIndex+n;
(0,_invariant2.default)(
destIndex>=0,
'Cannot jump before the first route.');

var maxIndex=this.state.routeStack.length-1;
(0,_invariant2.default)(
maxIndex>=destIndex,
'Cannot jump past the last route.');

return destIndex;
},

_jumpN:function _jumpN(n){
var destIndex=this._getDestIndexWithinBounds(n);
this._enableScene(destIndex);
this._emitWillFocus(this.state.routeStack[destIndex]);
this._transitionTo(destIndex);
if(!this.hashChanged){
if(n>0){
history.pushState({index:destIndex},'/scene_'+getRouteID(this.state.routeStack[destIndex]));
}else{
history.go(n);
}
return;
}
if(n<0){

__uid=Math.max(__uid+n,0);
}
},

jumpTo:function jumpTo(route){
var destIndex=this.state.routeStack.indexOf(route);
(0,_invariant2.default)(
destIndex!==-1,
'Cannot jump to route that is not in the route stack');

this._jumpN(destIndex-this.state.presentedIndex);
},

jumpForward:function jumpForward(){
this._jumpN(1);
},

jumpBack:function jumpBack(){
this._jumpN(-1);
},

push:function push(route){var _this6=this;
(0,_invariant2.default)(!!route,'Must supply route to push');
var activeLength=this.state.presentedIndex+1;
var activeStack=this.state.routeStack.slice(0,activeLength);
var activeAnimationConfigStack=this.state.sceneConfigStack.slice(0,activeLength);
var nextStack=activeStack.concat([route]);
var destIndex=nextStack.length-1;
var nextAnimationConfigStack=activeAnimationConfigStack.concat([
this.props.configureScene(route)]);

this._emitWillFocus(nextStack[destIndex]);
this.setState({
routeStack:nextStack,
sceneConfigStack:nextAnimationConfigStack},
function(){
history.pushState({index:destIndex},'/scene_'+getRouteID(route));
_this6._enableScene(destIndex);
_this6._transitionTo(destIndex);
});
},

_popN:function _popN(n){var _this7=this;
if(n===0){
return;
}
(0,_invariant2.default)(
this.state.presentedIndex-n>=0,
'Cannot pop below zero');

var popIndex=this.state.presentedIndex-n;
this._enableScene(popIndex);
this._emitWillFocus(this.state.routeStack[popIndex]);
this._transitionTo(
popIndex,
null,
null,
function(){
history.go(-n);
_this7._cleanScenesPastIndex(popIndex);
});

},

pop:function pop(){
if(this.state.transitionQueue.length){






return;
}

if(this.state.presentedIndex>0){
this._popN(1);
}
},







replaceAtIndex:function replaceAtIndex(route,index,cb){var _this8=this;
(0,_invariant2.default)(!!route,'Must supply route to replace');
if(index<0){
index+=this.state.routeStack.length;
}

if(this.state.routeStack.length<=index){
return;
}

var nextRouteStack=this.state.routeStack.slice();
var nextAnimationModeStack=this.state.sceneConfigStack.slice();
nextRouteStack[index]=route;
nextAnimationModeStack[index]=this.props.configureScene(route);

if(index===this.state.presentedIndex){
this._emitWillFocus(route);
}
this.setState({
routeStack:nextRouteStack,
sceneConfigStack:nextAnimationModeStack},
function(){
if(index===_this8.state.presentedIndex){
_this8._emitDidFocus(route);
}
cb&&cb();
});
},




replace:function replace(route){
this.replaceAtIndex(route,this.state.presentedIndex);
},




replacePrevious:function replacePrevious(route){
this.replaceAtIndex(route,this.state.presentedIndex-1);
},

popToTop:function popToTop(){
this.popToRoute(this.state.routeStack[0]);
},

popToRoute:function popToRoute(route){
var indexOfRoute=this.state.routeStack.indexOf(route);
(0,_invariant2.default)(
indexOfRoute!==-1,
'Calling popToRoute for a route that doesn\'t exist!');

var numToPop=this.state.presentedIndex-indexOfRoute;
this._popN(numToPop);
},

replacePreviousAndPop:function replacePreviousAndPop(route){
if(this.state.routeStack.length<2){
return;
}
this.replacePrevious(route);
this.pop();
},

resetTo:function resetTo(route){var _this9=this;
(0,_invariant2.default)(!!route,'Must supply route to push');
this.replaceAtIndex(route,0,function(){


if(_this9.state.presentedIndex>0){
_this9._popN(_this9.state.presentedIndex);
}
});
},

getCurrentRoutes:function getCurrentRoutes(){

return this.state.routeStack.slice();
},

_cleanScenesPastIndex:function _cleanScenesPastIndex(index){
var newStackLength=index+1;

if(newStackLength<this.state.routeStack.length){
this.setState({
sceneConfigStack:this.state.sceneConfigStack.slice(0,newStackLength),
routeStack:this.state.routeStack.slice(0,newStackLength)});

}
},

_renderScene:function _renderScene(route,i){var _this10=this;
var disabledSceneStyle=null;
var disabledScenePointerEvents='auto';
if(i!==this.state.presentedIndex){
disabledSceneStyle=styles.disabledScene;
disabledScenePointerEvents='none';
}

return(
_react2.default.createElement(_ReactView2.default,{
key:'scene_'+getRouteID(route),
ref:'scene_'+i,
onStartShouldSetResponderCapture:function onStartShouldSetResponderCapture(){
return _this10.state.transitionFromIndex!=null||_this10.state.transitionFromIndex!=null;
},
pointerEvents:disabledScenePointerEvents,
style:[styles.baseScene,this.props.sceneStyle,disabledSceneStyle]},
this.props.renderScene(
route,
this)));



},

_renderNavigationBar:function _renderNavigationBar(){var _this11=this;
if(!this.props.navigationBar){
return null;
}
return _react2.default.cloneElement(this.props.navigationBar,{
ref:function ref(navBar){
_this11._navBar=navBar;
},
navigator:this,
navState:this.state});

},

render:function render(){var _this12=this;
var newRenderedSceneMap=new _map2.default();
var scenes=this.state.routeStack.map(function(route,index){
var renderedScene=void 0;
if(_this12._renderedSceneMap.has(route)&&
index!==_this12.state.presentedIndex){
renderedScene=_this12._renderedSceneMap.get(route);
}else{
renderedScene=_this12._renderScene(route,index);
}
newRenderedSceneMap.set(route,renderedScene);
return renderedScene;
});
this._renderedSceneMap=newRenderedSceneMap;
return(
_react2.default.createElement(_ReactView2.default,{style:[styles.container,this.props.style]},
_react2.default.createElement(_ReactView2.default,_extends({
style:styles.transitioner},
this.panGesture.panHandlers,{
onTouchStart:this._handleTouchStart,
onResponderTerminationRequest:
this._handleResponderTerminationRequest}),

scenes),

this._renderNavigationBar()));


},

_getNavigationContext:function _getNavigationContext(){
if(!this._navigationContext){
this._navigationContext=new _ReactNavigationContext2.default();
}
return this._navigationContext;
}});


Navigator.isReactNativeComponent=true;exports.default=

Navigator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRvci53ZWIuanMiXSwibmFtZXMiOlsiaGlzdG9yeSIsIl91bmxpc3RlbiIsIlNDUkVFTl9XSURUSCIsImdldCIsIndpZHRoIiwiU0NSRUVOX0hFSUdIVCIsImhlaWdodCIsIlNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyIsInBvaW50ZXJFdmVudHMiLCJzdHlsZSIsIm9wYWNpdHkiLCJfX3VpZCIsImdldHVpZCIsImdldFJvdXRlSUQiLCJyb3V0ZSIsIlN0cmluZyIsImtleSIsImhhc093blByb3BlcnR5IiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSIsInN0eWxlcyIsImNyZWF0ZSIsImNvbnRhaW5lciIsImZsZXgiLCJvdmVyZmxvdyIsImRlZmF1bHRTY2VuZVN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJ0b3AiLCJiYXNlU2NlbmUiLCJkaXNhYmxlZFNjZW5lIiwidHJhbnNpdGlvbmVyIiwiYmFja2dyb3VuZENvbG9yIiwiR0VTVFVSRV9BQ1RJT05TIiwiTmF2aWdhdG9yIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjb25maWd1cmVTY2VuZSIsImZ1bmMiLCJyZW5kZXJTY2VuZSIsImlzUmVxdWlyZWQiLCJpbml0aWFsUm91dGUiLCJvYmplY3QiLCJpbml0aWFsUm91dGVTdGFjayIsImFycmF5T2YiLCJvbldpbGxGb2N1cyIsIm9uRGlkRm9jdXMiLCJuYXZpZ2F0aW9uQmFyIiwibm9kZSIsIm5hdmlnYXRvciIsInNjZW5lU3R5bGUiLCJzdGF0aWNzIiwiQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIiLCJOYXZpZ2F0aW9uQmFyIiwiU2NlbmVDb25maWdzIiwibWl4aW5zIiwiTWl4aW4iLCJnZXREZWZhdWx0UHJvcHMiLCJQdXNoRnJvbVJpZ2h0IiwiZ2V0SW5pdGlhbFN0YXRlIiwiX3JlbmRlcmVkU2NlbmVNYXAiLCJyb3V0ZVN0YWNrIiwicHJvcHMiLCJsZW5ndGgiLCJpbml0aWFsUm91dGVJbmRleCIsImluZGV4T2YiLCJzY2VuZUNvbmZpZ1N0YWNrIiwibWFwIiwicHJlc2VudGVkSW5kZXgiLCJ0cmFuc2l0aW9uRnJvbUluZGV4IiwiYWN0aXZlR2VzdHVyZSIsInBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MiLCJ0cmFuc2l0aW9uUXVldWUiLCJjb21wb25lbnRXaWxsTW91bnQiLCJfX2RlZmluZUdldHRlcl9fIiwiX2dldE5hdmlnYXRpb25Db250ZXh0IiwiX3N1YlJvdXRlRm9jdXMiLCJwYXJlbnROYXZpZ2F0b3IiLCJfaGFuZGxlcnMiLCJzcHJpbmdTeXN0ZW0iLCJTcHJpbmdTeXN0ZW0iLCJzcHJpbmciLCJjcmVhdGVTcHJpbmciLCJzZXRSZXN0U3BlZWRUaHJlc2hvbGQiLCJzZXRDdXJyZW50VmFsdWUiLCJzZXRBdFJlc3QiLCJhZGRMaXN0ZW5lciIsIm9uU3ByaW5nRW5kU3RhdGVDaGFuZ2UiLCJfaW50ZXJhY3Rpb25IYW5kbGUiLCJjcmVhdGVJbnRlcmFjdGlvbkhhbmRsZSIsIm9uU3ByaW5nVXBkYXRlIiwiX2hhbmRsZVNwcmluZ1VwZGF0ZSIsIm9uU3ByaW5nQXRSZXN0IiwiX2NvbXBsZXRlVHJhbnNpdGlvbiIsInBhbkdlc3R1cmUiLCJvbk1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXIiLCJfaGFuZGxlTW92ZVNob3VsZFNldFBhblJlc3BvbmRlciIsIm9uUGFuUmVzcG9uZGVyR3JhbnQiLCJfaGFuZGxlUGFuUmVzcG9uZGVyR3JhbnQiLCJvblBhblJlc3BvbmRlclJlbGVhc2UiLCJfaGFuZGxlUGFuUmVzcG9uZGVyUmVsZWFzZSIsIm9uUGFuUmVzcG9uZGVyTW92ZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJNb3ZlIiwib25QYW5SZXNwb25kZXJUZXJtaW5hdGUiLCJfaGFuZGxlUGFuUmVzcG9uZGVyVGVybWluYXRlIiwiX2VtaXRXaWxsRm9jdXMiLCJzdGF0ZSIsImhhc2hDaGFuZ2VkIiwiY29tcG9uZW50RGlkTW91bnQiLCJfZW1pdERpZEZvY3VzIiwibGlzdGVuIiwibG9jYXRpb24iLCJkZXN0SW5kZXgiLCJwYXRobmFtZSIsInBhcnNlSW50IiwicmVwbGFjZSIsIl9qdW1wTiIsImJpbmQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIl9uYXZpZ2F0aW9uQ29udGV4dCIsImRpc3Bvc2UiLCJpbW1lZGlhdGVseVJlc2V0Um91dGVTdGFjayIsIm5leHRSb3V0ZVN0YWNrIiwic2V0U3RhdGUiLCJfdHJhbnNpdGlvblRvIiwidmVsb2NpdHkiLCJqdW1wU3ByaW5nVG8iLCJjYiIsInB1c2giLCJ0cmFuc2l0aW9uQ2IiLCJfb25BbmltYXRpb25TdGFydCIsInNjZW5lQ29uZmlnIiwic2V0T3ZlcnNob290Q2xhbXBpbmdFbmFibGVkIiwiZ2V0U3ByaW5nQ29uZmlnIiwiZnJpY3Rpb24iLCJzcHJpbmdGcmljdGlvbiIsInRlbnNpb24iLCJzcHJpbmdUZW5zaW9uIiwic2V0VmVsb2NpdHkiLCJkZWZhdWx0VHJhbnNpdGlvblZlbG9jaXR5Iiwic2V0RW5kVmFsdWUiLCJfdHJhbnNpdGlvbkJldHdlZW4iLCJnZXRDdXJyZW50VmFsdWUiLCJwcmVzZW50ZWRUb0luZGV4IiwiX2RlbHRhRm9yR2VzdHVyZUFjdGlvbiIsIl9vbkFuaW1hdGlvbkVuZCIsImRpZEZvY3VzUm91dGUiLCJfaGlkZVNjZW5lcyIsImNsZWFySW50ZXJhY3Rpb25IYW5kbGUiLCJnZXN0dXJlVG9JbmRleCIsIl9lbmFibGVTY2VuZSIsInF1ZXVlZFRyYW5zaXRpb24iLCJzaGlmdCIsIm5hdmlnYXRpb25Db250ZXh0IiwiZW1pdCIsIm5hdkJhciIsIl9uYXZCYXIiLCJoYW5kbGVXaWxsRm9jdXMiLCJnZXN0dXJpbmdUb0luZGV4IiwiaSIsIl9kaXNhYmxlU2NlbmUiLCJzY2VuZUluZGV4IiwicmVmcyIsInNldE5hdGl2ZVByb3BzIiwiZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMiLCJmcm9tSW5kZXgiLCJ0b0luZGV4IiwiX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkIiwib25BbmltYXRpb25TdGFydCIsIm1heCIsImluZGV4Iiwib25BbmltYXRpb25FbmQiLCJzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZSIsInZpZXdBdEluZGV4IiwidW5kZWZpbmVkIiwicmVuZGVyVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkIiwiX2hhbmRsZVRvdWNoU3RhcnQiLCJfZWxpZ2libGVHZXN0dXJlcyIsImUiLCJnZXN0dXJlU3RhdGUiLCJfZXhwZWN0aW5nR2VzdHVyZUdyYW50IiwiX21hdGNoR2VzdHVyZUFjdGlvbiIsImdlc3R1cmVzIiwiX2RvZXNHZXN0dXJlT3ZlcnN3aXBlIiwiZ2VzdHVyZU5hbWUiLCJ3b3VsZE92ZXJzd2lwZUJhY2siLCJ3b3VsZE92ZXJzd2lwZUZvcndhcmQiLCJfYXR0YWNoR2VzdHVyZSIsImdlc3R1cmVBY3Rpb24iLCJyZWxlYXNlR2VzdHVyZUFjdGlvbiIsInJlbGVhc2VHZXN0dXJlIiwiaXNUcmF2ZWxWZXJ0aWNhbCIsImRpcmVjdGlvbiIsImlzVHJhdmVsSW52ZXJ0ZWQiLCJnZXN0dXJlRGlzdGFuY2UiLCJ2eSIsImR5IiwidngiLCJkeCIsInRyYW5zaXRpb25WZWxvY2l0eSIsIk1hdGgiLCJhYnMiLCJub3RNb3ZpbmciLCJoYXNHZXN0dXJlZEVub3VnaFRvQ29tcGxldGUiLCJmdWxsRGlzdGFuY2UiLCJzdGlsbENvbXBsZXRpb25SYXRpbyIsInNuYXBWZWxvY2l0eSIsInRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCIsIl9jbGVhblNjZW5lc1Bhc3RJbmRleCIsIl9kZXRhY2hHZXN0dXJlIiwiZ2VzdHVyZUlkIiwiZ2VzdHVyZSIsIl9tb3ZlQXR0YWNoZWRHZXN0dXJlIiwibWF0Y2hlZEdlc3R1cmUiLCJkaXN0YW5jZSIsImdlc3R1cmVEZXRlY3RNb3ZlbWVudCIsIm5leHRQcm9ncmVzcyIsImlzRGV0YWNoYWJsZSIsImZyaWN0aW9uQ29uc3RhbnQiLCJvdmVyc3dpcGUiLCJmcmljdGlvbkJ5RGlzdGFuY2UiLCJmcmljdGlvblJhdGlvIiwiZWxpZ2libGVHZXN0dXJlcyIsInNvbWUiLCJnZXN0dXJlSW5kZXgiLCJjdXJyZW50TG9jIiwibW92ZVkiLCJtb3ZlWCIsInRyYXZlbERpc3QiLCJvcHBvc2l0ZUF4aXNUcmF2ZWxEaXN0IiwiZWRnZUhpdFdpZHRoIiwibW92ZVN0YXJ0ZWRJblJlZ2lvbiIsIm1vdmVUcmF2ZWxsZWRGYXJFbm91Z2giLCJkaXJlY3Rpb25Jc0NvcnJlY3QiLCJkaXJlY3Rpb25SYXRpbyIsInNsaWNlIiwic3BsaWNlIiwiX3RyYW5zaXRpb25TY2VuZVN0eWxlIiwicHJvZ3Jlc3MiLCJzY2VuZUNvbmZpZ0luZGV4Iiwic3R5bGVUb1VzZSIsInVzZUZuIiwiYW5pbWF0aW9uSW50ZXJwb2xhdG9ycyIsIm91dCIsImludG8iLCJkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzIiwiZGlkQ2hhbmdlIiwidXBkYXRlUHJvZ3Jlc3MiLCJfaGFuZGxlUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0IiwiX2dldERlc3RJbmRleFdpdGhpbkJvdW5kcyIsIm4iLCJjdXJyZW50SW5kZXgiLCJtYXhJbmRleCIsInB1c2hTdGF0ZSIsImdvIiwianVtcFRvIiwianVtcEZvcndhcmQiLCJqdW1wQmFjayIsImFjdGl2ZUxlbmd0aCIsImFjdGl2ZVN0YWNrIiwiYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2siLCJuZXh0U3RhY2siLCJjb25jYXQiLCJuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2siLCJfcG9wTiIsInBvcEluZGV4IiwicG9wIiwicmVwbGFjZUF0SW5kZXgiLCJuZXh0QW5pbWF0aW9uTW9kZVN0YWNrIiwicmVwbGFjZVByZXZpb3VzIiwicG9wVG9Ub3AiLCJwb3BUb1JvdXRlIiwiaW5kZXhPZlJvdXRlIiwibnVtVG9Qb3AiLCJyZXBsYWNlUHJldmlvdXNBbmRQb3AiLCJyZXNldFRvIiwiZ2V0Q3VycmVudFJvdXRlcyIsIm5ld1N0YWNrTGVuZ3RoIiwiX3JlbmRlclNjZW5lIiwiZGlzYWJsZWRTY2VuZVN0eWxlIiwiZGlzYWJsZWRTY2VuZVBvaW50ZXJFdmVudHMiLCJfcmVuZGVyTmF2aWdhdGlvbkJhciIsImNsb25lRWxlbWVudCIsInJlZiIsIm5hdlN0YXRlIiwicmVuZGVyIiwibmV3UmVuZGVyZWRTY2VuZU1hcCIsInNjZW5lcyIsInJlbmRlcmVkU2NlbmUiLCJoYXMiLCJzZXQiLCJwYW5IYW5kbGVycyIsImlzUmVhY3ROYXRpdmVDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQVNBLGE7O0FBRUEsNEI7QUFDQSw2RDtBQUNBLDBFO0FBQ0EsMkM7QUFDQSxzRTtBQUNBLHlGO0FBQ0EscUU7QUFDQSxtRTtBQUNBLG1FO0FBQ0EsNkQ7QUFDQSxzRDtBQUNBLGtEO0FBQ0EsMkM7QUFDQSx3QztBQUNBLGlFO0FBQ0EsNkM7QUFDQSxnQztBQUNBLGdFOztBQUVBLEdBQUlBLFNBQVUsaUNBQWQ7QUFDQSxHQUFJQyxpQkFBSjs7Ozs7QUFLQSxHQUFNQyxjQUFlLDBCQUFXQyxHQUFYLENBQWUsUUFBZixFQUF5QkMsS0FBOUM7QUFDQSxHQUFNQyxlQUFnQiwwQkFBV0YsR0FBWCxDQUFlLFFBQWYsRUFBeUJHLE1BQS9DO0FBQ0EsR0FBTUMsNkJBQThCO0FBQ2xDQyxjQUFlLE1BRG1CO0FBRWxDQyxNQUFPOzs7QUFHTEMsUUFBUyxDQUhKLENBRjJCLENBQXBDOzs7O0FBU0EsR0FBSUMsT0FBUSxDQUFaO0FBQ0EsUUFBU0MsT0FBVCxFQUFrQjtBQUNoQixNQUFPRCxRQUFQO0FBQ0Q7O0FBRUQsUUFBU0UsV0FBVCxDQUFvQkMsS0FBcEIsQ0FBMkI7QUFDekIsR0FBSUEsUUFBVSxJQUFWLEVBQWtCLE1BQU9BLE1BQVAsR0FBaUIsUUFBdkMsQ0FBaUQ7QUFDL0MsTUFBT0MsUUFBT0QsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQsR0FBSUUsS0FBTSxvQkFBVjs7QUFFQSxHQUFJLENBQUNGLE1BQU1HLGNBQU4sQ0FBcUJELEdBQXJCLENBQUwsQ0FBZ0M7QUFDOUJFLE9BQU9DLGNBQVAsQ0FBc0JMLEtBQXRCLENB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TCxDQUFrQjlRLEtBQWxCLENBQXlCa0ssS0FBekIsQ0FBaEI7QUFDRDtBQUNEb0gsb0JBQW9CSSxHQUFwQixDQUF3QjFSLEtBQXhCLENBQStCd1IsYUFBL0I7QUFDQSxNQUFPQSxjQUFQO0FBQ0QsQ0FWWSxDQUFiO0FBV0EsS0FBS3BPLGlCQUFMLENBQXlCa08sbUJBQXpCO0FBQ0E7QUFDRSxtREFBTSxNQUFPLENBQUM1USxPQUFPRSxTQUFSLENBQW1CLEtBQUswQyxLQUFMLENBQVczRCxLQUE5QixDQUFiO0FBQ0U7QUFDRSxNQUFPZSxPQUFPYSxZQURoQjtBQUVNLEtBQUsrRCxVQUFMLENBQWdCcU0sV0FGdEI7QUFHRSxhQUFjLEtBQUtuSCxpQkFIckI7QUFJRTtBQUNFLEtBQUt3RSxrQ0FMVDs7QUFPR3VDLE1BUEgsQ0FERjs7QUFVRyxLQUFLTixvQkFBTCxFQVZILENBREY7OztBQWNELENBLzdCK0I7O0FBaThCaEM5TSxzQkFBdUIsZ0NBQVc7QUFDaEMsR0FBSSxDQUFDLEtBQUs0QyxrQkFBVixDQUE4QjtBQUM1QixLQUFLQSxrQkFBTCxDQUEwQixzQ0FBMUI7QUFDRDtBQUNELE1BQU8sTUFBS0Esa0JBQVo7QUFDRCxDQXQ4QitCLENBQWxCLENBQWhCOzs7QUF5OEJBckYsVUFBVWtRLHNCQUFWLENBQW1DLElBQW5DLEM7O0FBRWVsUSxTIiwiZmlsZSI6Ik5hdmlnYXRvci53ZWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBBbGliYWJhIEdyb3VwIEhvbGRpbmcgTGltaXRlZC5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LCBGYWNlYm9vaywgSW5jLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgUmVhY3ROYXZpZ2F0b3JcbiAqL1xuIC8qIGVzbGludC1kaXNhYmxlIG5vLWV4dHJhLWJvb2xlYW4tY2FzdCovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCwgeyBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRGltZW5zaW9ucyBmcm9tICdSZWFjdERpbWVuc2lvbnMnO1xuaW1wb3J0IEludGVyYWN0aW9uTWl4aW4gZnJvbSAnUmVhY3RJbnRlcmFjdGlvbk1peGluJztcbmltcG9ydCBNYXAgZnJvbSAnY29yZS1qcy9saWJyYXJ5L2ZuL21hcCc7XG5pbXBvcnQgTmF2aWdhdGlvbkNvbnRleHQgZnJvbSAnUmVhY3ROYXZpZ2F0aW9uQ29udGV4dCc7XG5pbXBvcnQgTmF2aWdhdG9yQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIgZnJvbSAnUmVhY3ROYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQgTmF2aWdhdG9yTmF2aWdhdGlvbkJhciBmcm9tICdSZWFjdE5hdmlnYXRvck5hdmlnYXRpb25CYXInO1xuaW1wb3J0IE5hdmlnYXRvclNjZW5lQ29uZmlncyBmcm9tICdSZWFjdE5hdmlnYXRvclNjZW5lQ29uZmlncyc7XG5pbXBvcnQgUGFuUmVzcG9uZGVyIGZyb20gJ1JlYWN0UGFuUmVzcG9uZGVyJztcbmltcG9ydCBTdHlsZVNoZWV0IGZyb20gJ1JlYWN0U3R5bGVTaGVldCc7XG5pbXBvcnQgU3Vic2NyaWJhYmxlIGZyb20gJy4vcG9seWZpbGxzL1N1YnNjcmliYWJsZSc7XG5pbXBvcnQgVGltZXJNaXhpbiBmcm9tICdyZWFjdC10aW1lci1taXhpbic7XG5pbXBvcnQgVmlldyBmcm9tICdSZWFjdFZpZXcnO1xuaW1wb3J0IGNsYW1wIGZyb20gJy4vcG9seWZpbGxzL2NsYW1wJztcbmltcG9ydCBmbGF0dGVuU3R5bGUgZnJvbSAnUmVhY3RGbGF0dGVuU3R5bGUnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdmYmpzL2xpYi9pbnZhcmlhbnQnO1xuaW1wb3J0IHJlYm91bmQgZnJvbSAncmVib3VuZCc7XG5pbXBvcnQgY3JlYXRlSGlzdG9yeSBmcm9tICdoaXN0b3J5L2xpYi9jcmVhdGVIYXNoSGlzdG9yeSc7XG5cbmxldCBoaXN0b3J5ID0gY3JlYXRlSGlzdG9yeSgpO1xubGV0IF91bmxpc3RlbjtcblxuLy8gVE9ETzogdGhpcyBpcyBub3QgaWRlYWwgYmVjYXVzZSB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgbmF2aWdhdG9yXG4vLyBpcyBmdWxsIHNjcmVlbiwgaHdvZXZlciB3ZSBkb24ndCBoYXZlIGEgZ29vZCB3YXkgdG8gbWVhc3VyZSB0aGUgYWN0dWFsXG4vLyBzaXplIG9mIHRoZSBuYXZpZ2F0b3IgcmlnaHQgbm93LCBzbyB0aGlzIGlzIHRoZSBuZXh0IGJlc3QgdGhpbmcuXG5jb25zdCBTQ1JFRU5fV0lEVEggPSBEaW1lbnNpb25zLmdldCgnd2luZG93Jykud2lkdGg7XG5jb25zdCBTQ1JFRU5fSEVJR0hUID0gRGltZW5zaW9ucy5nZXQoJ3dpbmRvdycpLmhlaWdodDtcbmNvbnN0IFNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyA9IHtcbiAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICBzdHlsZToge1xuICAgIC8vIHRvcDogU0NSRUVOX0hFSUdIVCxcbiAgICAvLyBib3R0b206IC1TQ1JFRU5fSEVJR0hULFxuICAgIG9wYWNpdHk6IDAsXG4gIH0sXG59O1xuXG5sZXQgX191aWQgPSAwO1xuZnVuY3Rpb24gZ2V0dWlkKCkge1xuICByZXR1cm4gX191aWQrKztcbn1cblxuZnVuY3Rpb24gZ2V0Um91dGVJRChyb3V0ZSkge1xuICBpZiAocm91dGUgPT09IG51bGwgfHwgdHlwZW9mIHJvdXRlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBTdHJpbmcocm91dGUpO1xuICB9XG5cbiAgbGV0IGtleSA9ICdfX25hdmlnYXRvclJvdXRlSUQnO1xuXG4gIGlmICghcm91dGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyb3V0ZSwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogZ2V0dWlkKCksXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJvdXRlW2tleV07XG59XG5cbi8vIHN0eWxlcyBtb3ZlZCB0byB0aGUgdG9wIG9mIHRoZSBmaWxlIHNvIGdldERlZmF1bHRQcm9wcyBjYW4gcmVmZXIgdG8gaXRcbmxldCBzdHlsZXMgPSBTdHlsZVNoZWV0LmNyZWF0ZSh7XG4gIGNvbnRhaW5lcjoge1xuICAgIGZsZXg6IDEsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICB9LFxuICBkZWZhdWx0U2NlbmVTdHlsZToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIHRvcDogMCxcbiAgfSxcbiAgYmFzZVNjZW5lOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIHRvcDogMCxcbiAgfSxcbiAgZGlzYWJsZWRTY2VuZToge1xuICAgIC8vIHRvcDogU0NSRUVOX0hFSUdIVCxcbiAgICAvLyBib3R0b206IC1TQ1JFRU5fSEVJR0hULFxuICB9LFxuICB0cmFuc2l0aW9uZXI6IHtcbiAgICBmbGV4OiAxLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gIH1cbn0pO1xuXG5jb25zdCBHRVNUVVJFX0FDVElPTlMgPSBbXG4gICdwb3AnLFxuICAnanVtcEJhY2snLFxuICAnanVtcEZvcndhcmQnLFxuXTtcblxuLyoqXG4gKiBVc2UgYE5hdmlnYXRvcmAgdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIGRpZmZlcmVudCBzY2VuZXMgaW4geW91ciBhcHAuIFRvXG4gKiBhY2NvbXBsaXNoIHRoaXMsIHByb3ZpZGUgcm91dGUgb2JqZWN0cyB0byB0aGUgbmF2aWdhdG9yIHRvIGlkZW50aWZ5IGVhY2hcbiAqIHNjZW5lLCBhbmQgYWxzbyBhIGByZW5kZXJTY2VuZWAgZnVuY3Rpb24gdGhhdCB0aGUgbmF2aWdhdG9yIGNhbiB1c2UgdG9cbiAqIHJlbmRlciB0aGUgc2NlbmUgZm9yIGEgZ2l2ZW4gcm91dGUuXG4gKlxuICogVG8gY2hhbmdlIHRoZSBhbmltYXRpb24gb3IgZ2VzdHVyZSBwcm9wZXJ0aWVzIG9mIHRoZSBzY2VuZSwgcHJvdmlkZSBhXG4gKiBgY29uZmlndXJlU2NlbmVgIHByb3AgdG8gZ2V0IHRoZSBjb25maWcgb2JqZWN0IGZvciBhIGdpdmVuIHJvdXRlLiBTZWVcbiAqIGBOYXZpZ2F0b3IuU2NlbmVDb25maWdzYCBmb3IgZGVmYXVsdCBhbmltYXRpb25zIGFuZCBtb3JlIGluZm8gb25cbiAqIHNjZW5lIGNvbmZpZyBvcHRpb25zLlxuICpcbiAqICMjIyBCYXNpYyBVc2FnZVxuICpcbiAqIGBgYFxuICogICA8TmF2aWdhdG9yXG4gKiAgICAgaW5pdGlhbFJvdXRlPXt7bmFtZTogJ015IEZpcnN0IFNjZW5lJywgaW5kZXg6IDB9fVxuICogICAgIHJlbmRlclNjZW5lPXsocm91dGUsIG5hdmlnYXRvcikgPT5cbiAqICAgICAgIDxNeVNjZW5lQ29tcG9uZW50XG4gKiAgICAgICAgIG5hbWU9e3JvdXRlLm5hbWV9XG4gKiAgICAgICAgIG9uRm9yd2FyZD17KCkgPT4ge1xuICogICAgICAgICAgIGxldCBuZXh0SW5kZXggPSByb3V0ZS5pbmRleCArIDE7XG4gKiAgICAgICAgICAgbmF2aWdhdG9yLnB1c2goe1xuICogICAgICAgICAgICAgbmFtZTogJ1NjZW5lICcgKyBuZXh0SW5kZXgsXG4gKiAgICAgICAgICAgICBpbmRleDogbmV4dEluZGV4LFxuICogICAgICAgICAgIH0pO1xuICogICAgICAgICB9fVxuICogICAgICAgICBvbkJhY2s9eygpID0+IHtcbiAqICAgICAgICAgICBpZiAocm91dGUuaW5kZXggPiAwKSB7XG4gKiAgICAgICAgICAgICBuYXZpZ2F0b3IucG9wKCk7XG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9fVxuICogICAgICAgLz5cbiAqICAgICB9XG4gKiAgIC8+XG4gKiBgYGBcbiAqXG4gKiAjIyMgTmF2aWdhdG9yIE1ldGhvZHNcbiAqXG4gKiBJZiB5b3UgaGF2ZSBhIHJlZiB0byB0aGUgTmF2aWdhdG9yIGVsZW1lbnQsIHlvdSBjYW4gaW52b2tlIHNldmVyYWwgbWV0aG9kc1xuICogb24gaXQgdG8gdHJpZ2dlciBuYXZpZ2F0aW9uOlxuICpcbiAqICAtIGBnZXRDdXJyZW50Um91dGVzKClgIC0gcmV0dXJucyB0aGUgY3VycmVudCBsaXN0IG9mIHJvdXRlc1xuICogIC0gYGp1bXBCYWNrKClgIC0gSnVtcCBiYWNrd2FyZCB3aXRob3V0IHVubW91bnRpbmcgdGhlIGN1cnJlbnQgc2NlbmVcbiAqICAtIGBqdW1wRm9yd2FyZCgpYCAtIEp1bXAgZm9yd2FyZCB0byB0aGUgbmV4dCBzY2VuZSBpbiB0aGUgcm91dGUgc3RhY2tcbiAqICAtIGBqdW1wVG8ocm91dGUpYCAtIFRyYW5zaXRpb24gdG8gYW4gZXhpc3Rpbmcgc2NlbmUgd2l0aG91dCB1bm1vdW50aW5nXG4gKiAgLSBgcHVzaChyb3V0ZSlgIC0gTmF2aWdhdGUgZm9yd2FyZCB0byBhIG5ldyBzY2VuZSwgc3F1YXNoaW5nIGFueSBzY2VuZXNcbiAqICAgICB0aGF0IHlvdSBjb3VsZCBganVtcEZvcndhcmRgIHRvXG4gKiAgLSBgcG9wKClgIC0gVHJhbnNpdGlvbiBiYWNrIGFuZCB1bm1vdW50IHRoZSBjdXJyZW50IHNjZW5lXG4gKiAgLSBgcmVwbGFjZShyb3V0ZSlgIC0gUmVwbGFjZSB0aGUgY3VycmVudCBzY2VuZSB3aXRoIGEgbmV3IHJvdXRlXG4gKiAgLSBgcmVwbGFjZUF0SW5kZXgocm91dGUsIGluZGV4KWAgLSBSZXBsYWNlIGEgc2NlbmUgYXMgc3BlY2lmaWVkIGJ5IGFuIGluZGV4XG4gKiAgLSBgcmVwbGFjZVByZXZpb3VzKHJvdXRlKWAgLSBSZXBsYWNlIHRoZSBwcmV2aW91cyBzY2VuZVxuICogIC0gYGltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrKHJvdXRlU3RhY2spYCAtIFJlc2V0IGV2ZXJ5IHNjZW5lIHdpdGggYW5cbiAqICAgICBhcnJheSBvZiByb3V0ZXNcbiAqICAtIGBwb3BUb1JvdXRlKHJvdXRlKWAgLSBQb3AgdG8gYSBwYXJ0aWN1bGFyIHNjZW5lLCBhcyBzcGVjaWZpZWQgYnkgaXRzXG4gKiAgICAgcm91dGUuIEFsbCBzY2VuZXMgYWZ0ZXIgaXQgd2lsbCBiZSB1bm1vdW50ZWRcbiAqICAtIGBwb3BUb1RvcCgpYCAtIFBvcCB0byB0aGUgZmlyc3Qgc2NlbmUgaW4gdGhlIHN0YWNrLCB1bm1vdW50aW5nIGV2ZXJ5XG4gKiAgICAgb3RoZXIgc2NlbmVcbiAqXG4gKi9cbmxldCBOYXZpZ2F0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgZnVuY3Rpb24gdGhhdCBhbGxvd3MgY29uZmlndXJhdGlvbiBhYm91dCBzY2VuZSBhbmltYXRpb25zIGFuZFxuICAgICAqIGdlc3R1cmVzLiBXaWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcm91dGUgYW5kIHNob3VsZCByZXR1cm4gYSBzY2VuZVxuICAgICAqIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICpcbiAgICAgKiBgYGBcbiAgICAgKiAocm91dGUpID0+IE5hdmlnYXRvci5TY2VuZUNvbmZpZ3MuRmxvYXRGcm9tUmlnaHRcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBjb25maWd1cmVTY2VuZTogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAvKipcbiAgICAgKiBSZXF1aXJlZCBmdW5jdGlvbiB3aGljaCByZW5kZXJzIHRoZSBzY2VuZSBmb3IgYSBnaXZlbiByb3V0ZS4gV2lsbCBiZVxuICAgICAqIGludm9rZWQgd2l0aCB0aGUgcm91dGUgYW5kIHRoZSBuYXZpZ2F0b3Igb2JqZWN0XG4gICAgICpcbiAgICAgKiBgYGBcbiAgICAgKiAocm91dGUsIG5hdmlnYXRvcikgPT5cbiAgICAgKiAgIDxNeVNjZW5lQ29tcG9uZW50IHRpdGxlPXtyb3V0ZS50aXRsZX0gLz5cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICByZW5kZXJTY2VuZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgYSByb3V0ZSB0byBzdGFydCBvbi4gQSByb3V0ZSBpcyBhbiBvYmplY3QgdGhhdCB0aGUgbmF2aWdhdG9yXG4gICAgICogd2lsbCB1c2UgdG8gaWRlbnRpZnkgZWFjaCBzY2VuZSB0byByZW5kZXIuIGBpbml0aWFsUm91dGVgIG11c3QgYmVcbiAgICAgKiBhIHJvdXRlIGluIHRoZSBgaW5pdGlhbFJvdXRlU3RhY2tgIGlmIGJvdGggcHJvcHMgYXJlIHByb3ZpZGVkLiBUaGVcbiAgICAgKiBgaW5pdGlhbFJvdXRlYCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxhc3QgaXRlbSBpbiB0aGUgYGluaXRpYWxSb3V0ZVN0YWNrYC5cbiAgICAgKi9cbiAgICBpbml0aWFsUm91dGU6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGEgc2V0IG9mIHJvdXRlcyB0byBpbml0aWFsbHkgbW91bnQuIFJlcXVpcmVkIGlmIG5vIGluaXRpYWxSb3V0ZVxuICAgICAqIGlzIHByb3ZpZGVkLiBPdGhlcndpc2UsIGl0IHdpbGwgZGVmYXVsdCB0byBhbiBhcnJheSBjb250YWluaW5nIG9ubHkgdGhlXG4gICAgICogYGluaXRpYWxSb3V0ZWBcbiAgICAgKi9cbiAgICBpbml0aWFsUm91dGVTdGFjazogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIFVzZSBgbmF2aWdhdGlvbkNvbnRleHQuYWRkTGlzdGVuZXIoJ3dpbGxmb2N1cycsIGNhbGxiYWNrKWAgaW5zdGVhZC5cbiAgICAgKlxuICAgICAqIFdpbGwgZW1pdCB0aGUgdGFyZ2V0IHJvdXRlIHVwb24gbW91bnRpbmcgYW5kIGJlZm9yZSBlYWNoIG5hdiB0cmFuc2l0aW9uXG4gICAgICovXG4gICAgb25XaWxsRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBVc2UgYG5hdmlnYXRpb25Db250ZXh0LmFkZExpc3RlbmVyKCdkaWRmb2N1cycsIGNhbGxiYWNrKWAgaW5zdGVhZC5cbiAgICAgKlxuICAgICAqIFdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIG5ldyByb3V0ZSBvZiBlYWNoIHNjZW5lIGFmdGVyIHRoZSB0cmFuc2l0aW9uIGlzXG4gICAgICogY29tcGxldGUgb3IgYWZ0ZXIgdGhlIGluaXRpYWwgbW91bnRpbmdcbiAgICAgKi9cbiAgICBvbkRpZEZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsbHkgcHJvdmlkZSBhIG5hdmlnYXRpb24gYmFyIHRoYXQgcGVyc2lzdHMgYWNyb3NzIHNjZW5lXG4gICAgICogdHJhbnNpdGlvbnNcbiAgICAgKi9cbiAgICBuYXZpZ2F0aW9uQmFyOiBQcm9wVHlwZXMubm9kZSxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsbHkgcHJvdmlkZSB0aGUgbmF2aWdhdG9yIG9iamVjdCBmcm9tIGEgcGFyZW50IE5hdmlnYXRvclxuICAgICAqL1xuICAgIG5hdmlnYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgIC8qKlxuICAgICAqIFN0eWxlcyB0byBhcHBseSB0byB0aGUgY29udGFpbmVyIG9mIGVhY2ggc2NlbmVcbiAgICAgKi9cbiAgICBzY2VuZVN0eWxlOiBWaWV3LnByb3BUeXBlcy5zdHlsZSxcbiAgfSxcblxuICBzdGF0aWNzOiB7XG4gICAgQnJlYWRjcnVtYk5hdmlnYXRpb25CYXI6IE5hdmlnYXRvckJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyLFxuICAgIE5hdmlnYXRpb25CYXI6IE5hdmlnYXRvck5hdmlnYXRpb25CYXIsXG4gICAgU2NlbmVDb25maWdzOiBOYXZpZ2F0b3JTY2VuZUNvbmZpZ3MsXG4gIH0sXG5cbiAgbWl4aW5zOiBbVGltZXJNaXhpbiwgSW50ZXJhY3Rpb25NaXhpbiwgU3Vic2NyaWJhYmxlLk1peGluXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmVTY2VuZTogKCkgPT4gTmF2aWdhdG9yU2NlbmVDb25maWdzLlB1c2hGcm9tUmlnaHQsXG4gICAgICBzY2VuZVN0eWxlOiBzdHlsZXMuZGVmYXVsdFNjZW5lU3R5bGUsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBsZXQgcm91dGVTdGFjayA9IHRoaXMucHJvcHMuaW5pdGlhbFJvdXRlU3RhY2sgfHwgW3RoaXMucHJvcHMuaW5pdGlhbFJvdXRlXTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICByb3V0ZVN0YWNrLmxlbmd0aCA+PSAxLFxuICAgICAgJ05hdmlnYXRvciByZXF1aXJlcyBwcm9wcy5pbml0aWFsUm91dGUgb3IgcHJvcHMuaW5pdGlhbFJvdXRlU3RhY2suJ1xuICAgICk7XG4gICAgbGV0IGluaXRpYWxSb3V0ZUluZGV4ID0gcm91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIGlmICh0aGlzLnByb3BzLmluaXRpYWxSb3V0ZSkge1xuICAgICAgaW5pdGlhbFJvdXRlSW5kZXggPSByb3V0ZVN0YWNrLmluZGV4T2YodGhpcy5wcm9wcy5pbml0aWFsUm91dGUpO1xuICAgICAgaW52YXJpYW50KFxuICAgICAgICBpbml0aWFsUm91dGVJbmRleCAhPT0gLTEsXG4gICAgICAgICdpbml0aWFsUm91dGUgaXMgbm90IGluIGluaXRpYWxSb3V0ZVN0YWNrLidcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiByb3V0ZVN0YWNrLm1hcChcbiAgICAgICAgKHJvdXRlKSA9PiB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lKHJvdXRlKVxuICAgICAgKSxcbiAgICAgIHJvdXRlU3RhY2ssXG4gICAgICBwcmVzZW50ZWRJbmRleDogaW5pdGlhbFJvdXRlSW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsLFxuICAgICAgYWN0aXZlR2VzdHVyZTogbnVsbCxcbiAgICAgIHBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3M6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uUXVldWU6IFtdLFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAvLyBUT0RPKHQ3NDg5NTAzKTogRG9uJ3QgbmVlZCB0aGlzIG9uY2UgRVM2IENsYXNzIGxhbmRlZC5cbiAgICB0aGlzLl9fZGVmaW5lR2V0dGVyX18oJ25hdmlnYXRpb25Db250ZXh0JywgdGhpcy5fZ2V0TmF2aWdhdGlvbkNvbnRleHQpO1xuXG4gICAgdGhpcy5fc3ViUm91dGVGb2N1cyA9IFtdO1xuICAgIHRoaXMucGFyZW50TmF2aWdhdG9yID0gdGhpcy5wcm9wcy5uYXZpZ2F0b3I7XG4gICAgdGhpcy5faGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLnNwcmluZ1N5c3RlbSA9IG5ldyByZWJvdW5kLlNwcmluZ1N5c3RlbSgpO1xuICAgIHRoaXMuc3ByaW5nID0gdGhpcy5zcHJpbmdTeXN0ZW0uY3JlYXRlU3ByaW5nKCk7XG4gICAgdGhpcy5zcHJpbmcuc2V0UmVzdFNwZWVkVGhyZXNob2xkKDAuMDUpO1xuICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZSgwKS5zZXRBdFJlc3QoKTtcbiAgICB0aGlzLnNwcmluZy5hZGRMaXN0ZW5lcih7XG4gICAgICBvblNwcmluZ0VuZFN0YXRlQ2hhbmdlOiAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUpIHtcbiAgICAgICAgICB0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSA9IHRoaXMuY3JlYXRlSW50ZXJhY3Rpb25IYW5kbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uU3ByaW5nVXBkYXRlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZVNwcmluZ1VwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIG9uU3ByaW5nQXRSZXN0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbXBsZXRlVHJhbnNpdGlvbigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLnBhbkdlc3R1cmUgPSBQYW5SZXNwb25kZXIuY3JlYXRlKHtcbiAgICAgIG9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlcjogdGhpcy5faGFuZGxlTW92ZVNob3VsZFNldFBhblJlc3BvbmRlcixcbiAgICAgIG9uUGFuUmVzcG9uZGVyR3JhbnQ6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlckdyYW50LFxuICAgICAgb25QYW5SZXNwb25kZXJSZWxlYXNlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlLFxuICAgICAgb25QYW5SZXNwb25kZXJNb3ZlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJNb3ZlLFxuICAgICAgb25QYW5SZXNwb25kZXJUZXJtaW5hdGU6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlclRlcm1pbmF0ZSxcbiAgICB9KTtcbiAgICB0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF0pO1xuICAgIHRoaXMuaGFzaENoYW5nZWQgPSBmYWxzZTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faGFuZGxlU3ByaW5nVXBkYXRlKCk7XG4gICAgdGhpcy5fZW1pdERpZEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XSk7XG5cbiAgICAvLyBOT1RFOiBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnQgbG9jYXRpb24uIFRoZVxuICAgIC8vIGxpc3RlbmVyIGlzIGNhbGxlZCBvbmNlIGltbWVkaWF0ZWx5LlxuICAgIF91bmxpc3RlbiA9IGhpc3RvcnkubGlzdGVuKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICBsZXQgZGVzdEluZGV4ID0gMDtcbiAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCcvc2NlbmVfJykgIT0gLTEpIHtcbiAgICAgICAgZGVzdEluZGV4ID0gcGFyc2VJbnQobG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgnL3NjZW5lXycsICcnKSk7XG4gICAgICB9XG4gICAgICBpZiAoZGVzdEluZGV4IDwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAmJiBkZXN0SW5kZXggIT0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmhhc2hDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fanVtcE4oZGVzdEluZGV4IC0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCk7XG4gICAgICAgIHRoaXMuaGFzaENoYW5nZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbmF2aWdhdGlvbkNvbnRleHQpIHtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25Db250ZXh0LmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25Db250ZXh0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXaGVuIHlvdSdyZSBmaW5pc2hlZCwgc3RvcCB0aGUgbGlzdGVuZXIuXG4gICAgX3VubGlzdGVuKCk7XG5cbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtSb3V0ZVN0YWNrfSBuZXh0Um91dGVTdGFjayBOZXh0IHJvdXRlIHN0YWNrIHRvIHJlaW5pdGlhbGl6ZS4gVGhpc1xuICAgKiBkb2Vzbid0IGFjY2VwdCBzdGFjayBpdGVtIGBpZGBzLCB3aGljaCBpbXBsaWVzIHRoYXQgYWxsIGV4aXN0aW5nIGl0ZW1zIGFyZVxuICAgKiBkZXN0cm95ZWQsIGFuZCB0aGVuIHBvdGVudGlhbGx5IHJlY3JlYXRlZCBhY2NvcmRpbmcgdG8gYHJvdXRlU3RhY2tgLiBEb2VzXG4gICAqIG5vdCBhbmltYXRlLCBpbW1lZGlhdGVseSByZXBsYWNlcyBhbmQgcmVyZW5kZXJzIG5hdmlnYXRpb24gYmFyIGFuZCBzdGFja1xuICAgKiBpdGVtcy5cbiAgICovXG4gIGltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrOiBmdW5jdGlvbihuZXh0Um91dGVTdGFjaykge1xuICAgIGxldCBkZXN0SW5kZXggPSBuZXh0Um91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFJvdXRlU3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0Um91dGVTdGFjay5tYXAoXG4gICAgICAgIHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmVcbiAgICAgICksXG4gICAgICBwcmVzZW50ZWRJbmRleDogZGVzdEluZGV4LFxuICAgICAgYWN0aXZlR2VzdHVyZTogbnVsbCxcbiAgICAgIHRyYW5zaXRpb25Gcm9tSW5kZXg6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uUXVldWU6IFtdLFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuX2hhbmRsZVNwcmluZ1VwZGF0ZSgpO1xuICAgIH0pO1xuICB9LFxuXG4gIF90cmFuc2l0aW9uVG86IGZ1bmN0aW9uKGRlc3RJbmRleCwgdmVsb2NpdHksIGp1bXBTcHJpbmdUbywgY2IpIHtcbiAgICBpZiAoZGVzdEluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLnB1c2goe1xuICAgICAgICBkZXN0SW5kZXgsXG4gICAgICAgIHZlbG9jaXR5LFxuICAgICAgICBjYixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggPSBkZXN0SW5kZXg7XG4gICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IgPSBjYjtcbiAgICB0aGlzLl9vbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgLy8gaWYgKEFuaW1hdGlvbnNEZWJ1Z01vZHVsZSkge1xuICAgIC8vICAgQW5pbWF0aW9uc0RlYnVnTW9kdWxlLnN0YXJ0UmVjb3JkaW5nRnBzKCk7XG4gICAgLy8gfVxuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXhdIHx8XG4gICAgICB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgaW52YXJpYW50KFxuICAgICAgc2NlbmVDb25maWcsXG4gICAgICAnQ2Fubm90IGNvbmZpZ3VyZSBzY2VuZSBhdCBpbmRleCAnICsgdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4XG4gICAgKTtcbiAgICBpZiAoanVtcFNwcmluZ1RvICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShqdW1wU3ByaW5nVG8pO1xuICAgIH1cbiAgICB0aGlzLnNwcmluZy5zZXRPdmVyc2hvb3RDbGFtcGluZ0VuYWJsZWQodHJ1ZSk7XG4gICAgdGhpcy5zcHJpbmcuZ2V0U3ByaW5nQ29uZmlnKCkuZnJpY3Rpb24gPSBzY2VuZUNvbmZpZy5zcHJpbmdGcmljdGlvbjtcbiAgICB0aGlzLnNwcmluZy5nZXRTcHJpbmdDb25maWcoKS50ZW5zaW9uID0gc2NlbmVDb25maWcuc3ByaW5nVGVuc2lvbjtcbiAgICB0aGlzLnNwcmluZy5zZXRWZWxvY2l0eSh2ZWxvY2l0eSB8fCBzY2VuZUNvbmZpZy5kZWZhdWx0VHJhbnNpdGlvblZlbG9jaXR5KTtcbiAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSgxKTtcbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGZvciBlYWNoIGZyYW1lIG9mIGVpdGhlciBhIGdlc3R1cmUgb3IgYSB0cmFuc2l0aW9uLiBJZiBib3RoIGFyZVxuICAgKiBoYXBwZW5pbmcsIHdlIG9ubHkgc2V0IHZhbHVlcyBmb3IgdGhlIHRyYW5zaXRpb24gYW5kIHRoZSBnZXN0dXJlIHdpbGwgY2F0Y2ggdXAgbGF0ZXJcbiAgICovXG4gIF9oYW5kbGVTcHJpbmdVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFByaW9yaXRpemUgaGFuZGxpbmcgdHJhbnNpdGlvbiBpbiBwcm9ncmVzcyBvdmVyIGEgZ2VzdHVyZTpcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKFxuICAgICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXgsXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlICE9IG51bGwpIHtcbiAgICAgIGxldCBwcmVzZW50ZWRUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4oXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHByZXNlbnRlZFRvSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGF0IHRoZSBlbmQgb2YgYSB0cmFuc2l0aW9uIHN0YXJ0ZWQgYnkgdHJhbnNpdGlvblRvLCBhbmQgd2hlbiB0aGUgc3ByaW5nIGNhdGNoZXMgdXAgdG8gYSBwZW5kaW5nIGdlc3R1cmVcbiAgICovXG4gIF9jb21wbGV0ZVRyYW5zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMSAmJiB0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBoYXMgZmluaXNoZWQgY2F0Y2hpbmcgdXAgdG8gYSBnZXN0dXJlIGluIHByb2dyZXNzLiBSZW1vdmUgdGhlIHBlbmRpbmcgcHJvZ3Jlc3NcbiAgICAgIC8vIGFuZCB3ZSB3aWxsIGJlIGluIGEgbm9ybWFsIGFjdGl2ZUdlc3R1cmUgc3RhdGVcbiAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb25BbmltYXRpb25FbmQoKTtcbiAgICBsZXQgcHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCBkaWRGb2N1c1JvdXRlID0gdGhpcy5fc3ViUm91dGVGb2N1c1twcmVzZW50ZWRJbmRleF0gfHwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3ByZXNlbnRlZEluZGV4XTtcbiAgICB0aGlzLl9lbWl0RGlkRm9jdXMoZGlkRm9jdXNSb3V0ZSk7XG4gICAgLy8gaWYgKEFuaW1hdGlvbnNEZWJ1Z01vZHVsZSkge1xuICAgIC8vICAgQW5pbWF0aW9uc0RlYnVnTW9kdWxlLnN0b3BSZWNvcmRpbmdGcHMoRGF0ZS5ub3coKSk7XG4gICAgLy8gfVxuICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9IG51bGw7XG4gICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgIHRoaXMuX2hpZGVTY2VuZXMoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IpIHtcbiAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkNiKCk7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25DYiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSkge1xuICAgICAgdGhpcy5jbGVhckludGVyYWN0aW9uSGFuZGxlKHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKTtcbiAgICAgIHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcykge1xuICAgICAgLy8gQSB0cmFuc2l0aW9uIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFscmVhZHkgYW5vdGhlciBnZXN0dXJlIGhhcHBlbmluZy5cbiAgICAgIC8vIEVuYWJsZSB0aGUgc2NlbmUgYW5kIHNldCB0aGUgc3ByaW5nIHRvIGNhdGNoIHVwIHdpdGggdGhlIG5ldyBnZXN0dXJlXG4gICAgICBsZXQgZ2VzdHVyZVRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShnZXN0dXJlVG9JbmRleCk7XG4gICAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUubGVuZ3RoKSB7XG4gICAgICBsZXQgcXVldWVkVHJhbnNpdGlvbiA9IHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLnNoaWZ0KCk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCk7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1txdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleF0pO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICBxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi52ZWxvY2l0eSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi5jYlxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXREaWRGb2N1czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLm5hdmlnYXRpb25Db250ZXh0LmVtaXQoJ2RpZGZvY3VzJywge3JvdXRlOiByb3V0ZX0pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRGb2N1cykge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXRXaWxsRm9jdXM6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5uYXZpZ2F0aW9uQ29udGV4dC5lbWl0KCd3aWxsZm9jdXMnLCB7cm91dGU6IHJvdXRlfSk7XG5cbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cykge1xuICAgICAgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm9uV2lsbEZvY3VzKSB7XG4gICAgICB0aGlzLnByb3BzLm9uV2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhpZGVzIGFsbCBzY2VuZXMgdGhhdCB3ZSBhcmUgbm90IGN1cnJlbnRseSBvbiwgZ2VzdHVyaW5nIHRvLCBvciB0cmFuc2l0aW9uaW5nIGZyb21cbiAgICovXG4gIF9oaWRlU2NlbmVzOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgZ2VzdHVyaW5nVG9JbmRleCA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgZ2VzdHVyaW5nVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gZ2VzdHVyaW5nVG9JbmRleCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Rpc2FibGVTY2VuZShpKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFB1c2ggYSBzY2VuZSBvZmYgdGhlIHNjcmVlbiwgc28gdGhhdCBvcGFjaXR5OjAgc2NlbmVzIHdpbGwgbm90IGJsb2NrIHRvdWNoZXMgc2VudCB0byB0aGUgcHJlc2VudGVkIHNjZW5lc1xuICAgKi9cbiAgX2Rpc2FibGVTY2VuZTogZnVuY3Rpb24oc2NlbmVJbmRleCkge1xuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTKTtcbiAgfSxcblxuICAvKipcbiAgICogUHV0IHRoZSBzY2VuZSBiYWNrIGludG8gdGhlIHN0YXRlIGFzIGRlZmluZWQgYnkgcHJvcHMuc2NlbmVTdHlsZSwgc28gdHJhbnNpdGlvbnMgY2FuIGhhcHBlbiBub3JtYWxseVxuICAgKi9cbiAgX2VuYWJsZVNjZW5lOiBmdW5jdGlvbihzY2VuZUluZGV4KSB7XG4gICAgLy8gRmlyc3QsIGRldGVybWluZSB3aGF0IHRoZSBkZWZpbmVkIHN0eWxlcyBhcmUgZm9yIHNjZW5lcyBpbiB0aGlzIG5hdmlnYXRvclxuICAgIGxldCBzY2VuZVN0eWxlID0gZmxhdHRlblN0eWxlKFtzdHlsZXMuYmFzZVNjZW5lLCB0aGlzLnByb3BzLnNjZW5lU3R5bGVdKTtcbiAgICAvLyBUaGVuIHJlc3RvcmUgdGhlIHBvaW50ZXIgZXZlbnRzIGFuZCB0b3AgdmFsdWUgZm9yIHRoaXMgc2NlbmVcbiAgICBsZXQgZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMgPSB7XG4gICAgICBwb2ludGVyRXZlbnRzOiAnYXV0bycsXG4gICAgICBzdHlsZToge1xuICAgICAgICB0b3A6IHNjZW5lU3R5bGUudG9wLFxuICAgICAgICBib3R0b206IHNjZW5lU3R5bGUuYm90dG9tLFxuICAgICAgfSxcbiAgICB9O1xuICAgIGlmIChzY2VuZUluZGV4ICE9PSB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggJiZcbiAgICAgICAgc2NlbmVJbmRleCAhPT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgLy8gSWYgd2UgYXJlIG5vdCBpbiBhIHRyYW5zaXRpb24gZnJvbSB0aGlzIGluZGV4LCBtYWtlIHN1cmUgb3BhY2l0eSBpcyAwXG4gICAgICAvLyB0byBwcmV2ZW50IHRoZSBlbmFibGVkIHNjZW5lIGZyb20gZmxhc2hpbmcgb3ZlciB0aGUgcHJlc2VudGVkIHNjZW5lXG4gICAgICBlbmFibGVkU2NlbmVOYXRpdmVQcm9wcy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICB9XG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0gJiZcbiAgICB0aGlzLnJlZnNbJ3NjZW5lXycgKyBzY2VuZUluZGV4XS5zZXROYXRpdmVQcm9wcyhlbmFibGVkU2NlbmVOYXRpdmVQcm9wcyk7XG4gIH0sXG5cbiAgX29uQW5pbWF0aW9uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBmcm9tSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCB0b0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIGZyb21JbmRleCA9IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgdG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQoZnJvbUluZGV4LCB0cnVlKTtcbiAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCh0b0luZGV4LCB0cnVlKTtcbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLm9uQW5pbWF0aW9uU3RhcnQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvblN0YXJ0KGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkFuaW1hdGlvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1heCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPD0gbWF4OyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZChpbmRleCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIub25BbmltYXRpb25FbmQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IGZ1bmN0aW9uKHNjZW5lSW5kZXgsIHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlKSB7XG4gICAgbGV0IHZpZXdBdEluZGV4ID0gdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlld0F0SW5kZXguc2V0TmF0aXZlUHJvcHMoIHtyZW5kZXJUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlfSk7XG4gIH0sXG5cbiAgX2hhbmRsZVRvdWNoU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSBHRVNUVVJFX0FDVElPTlM7XG4gIH0sXG5cbiAgX2hhbmRsZU1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXI6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAoIXNjZW5lQ29uZmlnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCA9IHRoaXMuX21hdGNoR2VzdHVyZUFjdGlvbih0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICByZXR1cm4gISF0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQ7XG4gIH0sXG5cbiAgX2RvZXNHZXN0dXJlT3ZlcnN3aXBlOiBmdW5jdGlvbihnZXN0dXJlTmFtZSkge1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUJhY2sgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IDw9IDAgJiZcbiAgICAgIChnZXN0dXJlTmFtZSA9PT0gJ3BvcCcgfHwgZ2VzdHVyZU5hbWUgPT09ICdqdW1wQmFjaycpO1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUZvcndhcmQgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID49IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxICYmXG4gICAgICBnZXN0dXJlTmFtZSA9PT0gJ2p1bXBGb3J3YXJkJztcbiAgICByZXR1cm4gd291bGRPdmVyc3dpcGVGb3J3YXJkIHx8IHdvdWxkT3ZlcnN3aXBlQmFjaztcbiAgfSxcblxuICBfaGFuZGxlUGFuUmVzcG9uZGVyR3JhbnQ6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCxcbiAgICAgICdSZXNwb25kZXIgZ3JhbnRlZCB1bmV4cGVjdGVkbHkuJ1xuICAgICk7XG4gICAgdGhpcy5fYXR0YWNoR2VzdHVyZSh0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQpO1xuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQgPSBudWxsO1xuICB9LFxuXG4gIF9kZWx0YUZvckdlc3R1cmVBY3Rpb246IGZ1bmN0aW9uKGdlc3R1cmVBY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmVBY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3BvcCc6XG4gICAgICBjYXNlICdqdW1wQmFjayc6XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIGNhc2UgJ2p1bXBGb3J3YXJkJzpcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpbnZhcmlhbnQoZmFsc2UsICdVbnN1cHBvcnRlZCBnZXN0dXJlIGFjdGlvbiAnICsgZ2VzdHVyZUFjdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlclJlbGVhc2U6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBsZXQgcmVsZWFzZUdlc3R1cmVBY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmU7XG4gICAgaWYgKCFyZWxlYXNlR2VzdHVyZUFjdGlvbikge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgbWF5IGhhdmUgYmVlbiBkZXRhY2hlZCB3aGlsZSByZXNwb25kZXIsIHNvIHRoZXJlIGlzIG5vIGFjdGlvbiBoZXJlXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCByZWxlYXNlR2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3JlbGVhc2VHZXN0dXJlQWN0aW9uXTtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSA9PT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBpcyBhdCB6ZXJvLCBzbyB0aGUgZ2VzdHVyZSBpcyBhbHJlYWR5IGNvbXBsZXRlXG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgICB0aGlzLl9jb21wbGV0ZVRyYW5zaXRpb24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICBsZXQgaXNUcmF2ZWxJbnZlcnRlZCA9IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCB2ZWxvY2l0eSwgZ2VzdHVyZURpc3RhbmNlO1xuICAgIGlmIChpc1RyYXZlbFZlcnRpY2FsKSB7XG4gICAgICB2ZWxvY2l0eSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLnZ5IDogZ2VzdHVyZVN0YXRlLnZ5O1xuICAgICAgZ2VzdHVyZURpc3RhbmNlID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlbG9jaXR5ID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUudnggOiBnZXN0dXJlU3RhdGUudng7XG4gICAgICBnZXN0dXJlRGlzdGFuY2UgPSBpc1RyYXZlbEludmVydGVkID8gLWdlc3R1cmVTdGF0ZS5keCA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICB9XG4gICAgbGV0IHRyYW5zaXRpb25WZWxvY2l0eSA9IGNsYW1wKC0xMCwgdmVsb2NpdHksIDEwKTtcbiAgICBpZiAoTWF0aC5hYnModmVsb2NpdHkpIDwgcmVsZWFzZUdlc3R1cmUubm90TW92aW5nKSB7XG4gICAgICAvLyBUaGUgZ2VzdHVyZSB2ZWxvY2l0eSBpcyBzbyBzbG93LCBpcyBcIm5vdCBtb3ZpbmdcIlxuICAgICAgbGV0IGhhc0dlc3R1cmVkRW5vdWdoVG9Db21wbGV0ZSA9IGdlc3R1cmVEaXN0YW5jZSA+IHJlbGVhc2VHZXN0dXJlLmZ1bGxEaXN0YW5jZSAqIHJlbGVhc2VHZXN0dXJlLnN0aWxsQ29tcGxldGlvblJhdGlvO1xuICAgICAgdHJhbnNpdGlvblZlbG9jaXR5ID0gaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlID8gcmVsZWFzZUdlc3R1cmUuc25hcFZlbG9jaXR5IDogLXJlbGVhc2VHZXN0dXJlLnNuYXBWZWxvY2l0eTtcbiAgICB9XG4gICAgaWYgKHRyYW5zaXRpb25WZWxvY2l0eSA8IDAgfHwgdGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUocmVsZWFzZUdlc3R1cmVBY3Rpb24pKSB7XG4gICAgICAvLyBUaGlzIGdlc3R1cmUgaXMgdG8gYW4gb3ZlcnN3aXBlZCByZWdpb24gb3IgZG9lcyBub3QgaGF2ZSBlbm91Z2ggdmVsb2NpdHkgdG8gY29tcGxldGVcbiAgICAgIC8vIElmIHdlIGFyZSBjdXJyZW50bHkgbWlkLXRyYW5zaXRpb24sIHRoZW4gdGhpcyBnZXN0dXJlIHdhcyBhIHBlbmRpbmcgZ2VzdHVyZS4gQmVjYXVzZSB0aGlzIGdlc3R1cmUgdGFrZXMgbm8gYWN0aW9uLCB3ZSBjYW4gc3RvcCBoZXJlXG4gICAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ID09IG51bGwpIHtcbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gY3VycmVudCB0cmFuc2l0aW9uLCBzbyB3ZSBuZWVkIHRvIHRyYW5zaXRpb24gYmFjayB0byB0aGUgcHJlc2VudGVkIGluZGV4XG4gICAgICAgIGxldCB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgICAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgICAgICAtIHRyYW5zaXRpb25WZWxvY2l0eSxcbiAgICAgICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgaGFzIGVub3VnaCB2ZWxvY2l0eSB0byBjb21wbGV0ZSwgc28gd2UgdHJhbnNpdGlvbiB0byB0aGUgZ2VzdHVyZSdzIGRlc3RpbmF0aW9uXG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgZGVzdEluZGV4LFxuICAgICAgICB0cmFuc2l0aW9uVmVsb2NpdHksXG4gICAgICAgIG51bGwsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBpZiAocmVsZWFzZUdlc3R1cmVBY3Rpb24gPT09ICdwb3AnKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGVhblNjZW5lc1Bhc3RJbmRleChkZXN0SW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fZGV0YWNoR2VzdHVyZSgpO1xuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIHRoaXMuX2RldGFjaEdlc3R1cmUoKTtcbiAgICBsZXQgdHJhbnNpdGlvbkJhY2tUb1ByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID0gZGVzdEluZGV4O1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgIG51bGwsXG4gICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICApO1xuICB9LFxuXG4gIF9hdHRhY2hHZXN0dXJlOiBmdW5jdGlvbihnZXN0dXJlSWQpIHtcbiAgICB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPSBnZXN0dXJlSWQ7XG4gICAgbGV0IGdlc3R1cmluZ1RvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZ2VzdHVyaW5nVG9JbmRleCk7XG4gIH0sXG5cbiAgX2RldGFjaEdlc3R1cmU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSA9IG51bGw7XG4gICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICB0aGlzLl9oaWRlU2NlbmVzKCk7XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlck1vdmU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3RoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZV07XG4gICAgICByZXR1cm4gdGhpcy5fbW92ZUF0dGFjaGVkR2VzdHVyZShnZXN0dXJlLCBnZXN0dXJlU3RhdGUpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hlZEdlc3R1cmUgPSB0aGlzLl9tYXRjaEdlc3R1cmVBY3Rpb24oR0VTVFVSRV9BQ1RJT05TLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICBpZiAobWF0Y2hlZEdlc3R1cmUpIHtcbiAgICAgIHRoaXMuX2F0dGFjaEdlc3R1cmUobWF0Y2hlZEdlc3R1cmUpO1xuICAgIH1cbiAgfSxcblxuICBfbW92ZUF0dGFjaGVkR2VzdHVyZTogZnVuY3Rpb24oZ2VzdHVyZSwgZ2VzdHVyZVN0YXRlKSB7XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3RvcC10by1ib3R0b20nIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGRpc3RhbmNlID0gaXNUcmF2ZWxWZXJ0aWNhbCA/IGdlc3R1cmVTdGF0ZS5keSA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICBkaXN0YW5jZSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtIGRpc3RhbmNlIDogZGlzdGFuY2U7XG4gICAgbGV0IGdlc3R1cmVEZXRlY3RNb3ZlbWVudCA9IGdlc3R1cmUuZ2VzdHVyZURldGVjdE1vdmVtZW50O1xuICAgIGxldCBuZXh0UHJvZ3Jlc3MgPSAoZGlzdGFuY2UgLSBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQpIC9cbiAgICAgIChnZXN0dXJlLmZ1bGxEaXN0YW5jZSAtIGdlc3R1cmVEZXRlY3RNb3ZlbWVudCk7XG4gICAgaWYgKG5leHRQcm9ncmVzcyA8IDAgJiYgZ2VzdHVyZS5pc0RldGFjaGFibGUpIHtcbiAgICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4odGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCwgZ2VzdHVyaW5nVG9JbmRleCwgMCk7XG4gICAgICB0aGlzLl9kZXRhY2hHZXN0dXJlKCk7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSkge1xuICAgICAgbGV0IGZyaWN0aW9uQ29uc3RhbnQgPSBnZXN0dXJlLm92ZXJzd2lwZS5mcmljdGlvbkNvbnN0YW50O1xuICAgICAgbGV0IGZyaWN0aW9uQnlEaXN0YW5jZSA9IGdlc3R1cmUub3ZlcnN3aXBlLmZyaWN0aW9uQnlEaXN0YW5jZTtcbiAgICAgIGxldCBmcmljdGlvblJhdGlvID0gMSAvICgoZnJpY3Rpb25Db25zdGFudCkgKyAoTWF0aC5hYnMobmV4dFByb2dyZXNzKSAqIGZyaWN0aW9uQnlEaXN0YW5jZSkpO1xuICAgICAgbmV4dFByb2dyZXNzICo9IGZyaWN0aW9uUmF0aW87XG4gICAgfVxuICAgIG5leHRQcm9ncmVzcyA9IGNsYW1wKDAsIG5leHRQcm9ncmVzcywgMSk7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MgPSBuZXh0UHJvZ3Jlc3M7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEVuZFZhbHVlKG5leHRQcm9ncmVzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShuZXh0UHJvZ3Jlc3MpO1xuICAgIH1cbiAgfSxcblxuICBfbWF0Y2hHZXN0dXJlQWN0aW9uOiBmdW5jdGlvbihlbGlnaWJsZUdlc3R1cmVzLCBnZXN0dXJlcywgZ2VzdHVyZVN0YXRlKSB7XG4gICAgaWYgKCFnZXN0dXJlcykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBtYXRjaGVkR2VzdHVyZSA9IG51bGw7XG4gICAgZWxpZ2libGVHZXN0dXJlcy5zb21lKChnZXN0dXJlTmFtZSwgZ2VzdHVyZUluZGV4KSA9PiB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IGdlc3R1cmVzW2dlc3R1cmVOYW1lXTtcbiAgICAgIGlmICghZ2VzdHVyZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZ2VzdHVyZS5vdmVyc3dpcGUgPT0gbnVsbCAmJiB0aGlzLl9kb2VzR2VzdHVyZU92ZXJzd2lwZShnZXN0dXJlTmFtZSkpIHtcbiAgICAgICAgLy8gY2Fubm90IHN3aXBlIHBhc3QgZmlyc3Qgb3IgbGFzdCBzY2VuZSB3aXRob3V0IG92ZXJzd2lwaW5nXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgICBsZXQgY3VycmVudExvYyA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUubW92ZVkgOiBnZXN0dXJlU3RhdGUubW92ZVg7XG4gICAgICBsZXQgdHJhdmVsRGlzdCA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgICBsZXQgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9XG4gICAgICAgIGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHggOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgICBsZXQgZWRnZUhpdFdpZHRoID0gZ2VzdHVyZS5lZGdlSGl0V2lkdGg7XG4gICAgICBpZiAoaXNUcmF2ZWxJbnZlcnRlZCkge1xuICAgICAgICBjdXJyZW50TG9jID0gLWN1cnJlbnRMb2M7XG4gICAgICAgIHRyYXZlbERpc3QgPSAtdHJhdmVsRGlzdDtcbiAgICAgICAgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9IC1vcHBvc2l0ZUF4aXNUcmF2ZWxEaXN0O1xuICAgICAgICBlZGdlSGl0V2lkdGggPSBpc1RyYXZlbFZlcnRpY2FsID9cbiAgICAgICAgICAtKFNDUkVFTl9IRUlHSFQgLSBlZGdlSGl0V2lkdGgpIDpcbiAgICAgICAgICAtKFNDUkVFTl9XSURUSCAtIGVkZ2VIaXRXaWR0aCk7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVN0YXJ0ZWRJblJlZ2lvbiA9IGdlc3R1cmUuZWRnZUhpdFdpZHRoID09IG51bGwgfHxcbiAgICAgICAgY3VycmVudExvYyA8IGVkZ2VIaXRXaWR0aDtcbiAgICAgIGlmICghbW92ZVN0YXJ0ZWRJblJlZ2lvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVRyYXZlbGxlZEZhckVub3VnaCA9IHRyYXZlbERpc3QgPj0gZ2VzdHVyZS5nZXN0dXJlRGV0ZWN0TW92ZW1lbnQ7XG4gICAgICBpZiAoIW1vdmVUcmF2ZWxsZWRGYXJFbm91Z2gpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbGV0IGRpcmVjdGlvbklzQ29ycmVjdCA9IE1hdGguYWJzKHRyYXZlbERpc3QpID4gTWF0aC5hYnMob3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCkgKiBnZXN0dXJlLmRpcmVjdGlvblJhdGlvO1xuICAgICAgaWYgKGRpcmVjdGlvbklzQ29ycmVjdCkge1xuICAgICAgICBtYXRjaGVkR2VzdHVyZSA9IGdlc3R1cmVOYW1lO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLnNsaWNlKCkuc3BsaWNlKGdlc3R1cmVJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoZWRHZXN0dXJlO1xuICB9LFxuXG4gIF90cmFuc2l0aW9uU2NlbmVTdHlsZTogZnVuY3Rpb24oZnJvbUluZGV4LCB0b0luZGV4LCBwcm9ncmVzcywgaW5kZXgpIHtcbiAgICBsZXQgdmlld0F0SW5kZXggPSB0aGlzLnJlZnNbJ3NjZW5lXycgKyBpbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVXNlIHRvSW5kZXggYW5pbWF0aW9uIHdoZW4gd2UgbW92ZSBmb3J3YXJkcy4gVXNlIGZyb21JbmRleCB3aGVuIHdlIG1vdmUgYmFja1xuICAgIGxldCBzY2VuZUNvbmZpZ0luZGV4ID0gZnJvbUluZGV4IDwgdG9JbmRleCA/IHRvSW5kZXggOiBmcm9tSW5kZXg7XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3NjZW5lQ29uZmlnSW5kZXhdO1xuICAgIC8vIHRoaXMgaGFwcGVucyBmb3Igb3ZlcnN3aXBpbmcgd2hlbiB0aGVyZSBpcyBubyBzY2VuZSBhdCB0b0luZGV4XG4gICAgaWYgKCFzY2VuZUNvbmZpZykge1xuICAgICAgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbc2NlbmVDb25maWdJbmRleCAtIDFdO1xuICAgIH1cbiAgICBsZXQgc3R5bGVUb1VzZSA9IHt9O1xuICAgIGxldCB1c2VGbiA9IGluZGV4IDwgZnJvbUluZGV4IHx8IGluZGV4IDwgdG9JbmRleCA/XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLm91dCA6XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLmludG87XG4gICAgbGV0IGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MgPSBmcm9tSW5kZXggPCB0b0luZGV4ID8gcHJvZ3Jlc3MgOiAxIC0gcHJvZ3Jlc3M7XG4gICAgbGV0IGRpZENoYW5nZSA9IHVzZUZuKHN0eWxlVG9Vc2UsIGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MpO1xuICAgIGlmIChkaWRDaGFuZ2UpIHtcbiAgICAgIHZpZXdBdEluZGV4LnNldE5hdGl2ZVByb3BzKHtzdHlsZTogc3R5bGVUb1VzZX0pO1xuICAgIH1cbiAgfSxcblxuICBfdHJhbnNpdGlvbkJldHdlZW46IGZ1bmN0aW9uKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uU2NlbmVTdHlsZShmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzLCBmcm9tSW5kZXgpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25TY2VuZVN0eWxlKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MsIHRvSW5kZXgpO1xuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MgJiYgdG9JbmRleCA+PSAwICYmIGZyb21JbmRleCA+PSAwKSB7XG4gICAgICBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MsIGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVSZXNwb25kZXJUZXJtaW5hdGlvblJlcXVlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBfZ2V0RGVzdEluZGV4V2l0aGluQm91bmRzOiBmdW5jdGlvbihuKSB7XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgbGV0IGRlc3RJbmRleCA9IGN1cnJlbnRJbmRleCArIG47XG4gICAgaW52YXJpYW50KFxuICAgICAgZGVzdEluZGV4ID49IDAsXG4gICAgICAnQ2Fubm90IGp1bXAgYmVmb3JlIHRoZSBmaXJzdCByb3V0ZS4nXG4gICAgKTtcbiAgICBsZXQgbWF4SW5kZXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBtYXhJbmRleCA+PSBkZXN0SW5kZXgsXG4gICAgICAnQ2Fubm90IGp1bXAgcGFzdCB0aGUgbGFzdCByb3V0ZS4nXG4gICAgKTtcbiAgICByZXR1cm4gZGVzdEluZGV4O1xuICB9LFxuXG4gIF9qdW1wTjogZnVuY3Rpb24obikge1xuICAgIGxldCBkZXN0SW5kZXggPSB0aGlzLl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMobik7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZGVzdEluZGV4KTtcbiAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdKTtcbiAgICB0aGlzLl90cmFuc2l0aW9uVG8oZGVzdEluZGV4KTtcbiAgICBpZiAoIXRoaXMuaGFzaENoYW5nZWQpIHtcbiAgICAgIGlmIChuID4gMCkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7IGluZGV4OiBkZXN0SW5kZXggfSwgJy9zY2VuZV8nICsgZ2V0Um91dGVJRCh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbZGVzdEluZGV4XSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5nbyhuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG4gPCAwKSB7XG4gICAgICAvLyBfX3VpZCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlXG4gICAgICBfX3VpZCA9IE1hdGgubWF4KF9fdWlkICsgbiwgMCk7XG4gICAgfVxuICB9LFxuXG4gIGp1bXBUbzogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmluZGV4T2Yocm91dGUpO1xuICAgIGludmFyaWFudChcbiAgICAgIGRlc3RJbmRleCAhPT0gLTEsXG4gICAgICAnQ2Fubm90IGp1bXAgdG8gcm91dGUgdGhhdCBpcyBub3QgaW4gdGhlIHJvdXRlIHN0YWNrJ1xuICAgICk7XG4gICAgdGhpcy5fanVtcE4oZGVzdEluZGV4IC0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCk7XG4gIH0sXG5cbiAganVtcEZvcndhcmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2p1bXBOKDEpO1xuICB9LFxuXG4gIGp1bXBCYWNrOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9qdW1wTigtMSk7XG4gIH0sXG5cbiAgcHVzaDogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHB1c2gnKTtcbiAgICBsZXQgYWN0aXZlTGVuZ3RoID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIDE7XG4gICAgbGV0IGFjdGl2ZVN0YWNrID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKDAsIGFjdGl2ZUxlbmd0aCk7XG4gICAgbGV0IGFjdGl2ZUFuaW1hdGlvbkNvbmZpZ1N0YWNrID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrLnNsaWNlKDAsIGFjdGl2ZUxlbmd0aCk7XG4gICAgbGV0IG5leHRTdGFjayA9IGFjdGl2ZVN0YWNrLmNvbmNhdChbcm91dGVdKTtcbiAgICBsZXQgZGVzdEluZGV4ID0gbmV4dFN0YWNrLmxlbmd0aCAtIDE7XG4gICAgbGV0IG5leHRBbmltYXRpb25Db25maWdTdGFjayA9IGFjdGl2ZUFuaW1hdGlvbkNvbmZpZ1N0YWNrLmNvbmNhdChbXG4gICAgICB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lKHJvdXRlKSxcbiAgICBdKTtcbiAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKG5leHRTdGFja1tkZXN0SW5kZXhdKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJvdXRlU3RhY2s6IG5leHRTdGFjayxcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IG5leHRBbmltYXRpb25Db25maWdTdGFjayxcbiAgICB9LCAoKSA9PiB7XG4gICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7IGluZGV4OiBkZXN0SW5kZXggfSwgJy9zY2VuZV8nICsgZ2V0Um91dGVJRChyb3V0ZSkpO1xuICAgICAgdGhpcy5fZW5hYmxlU2NlbmUoZGVzdEluZGV4KTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhkZXN0SW5kZXgpO1xuICAgIH0pO1xuICB9LFxuXG4gIF9wb3BOOiBmdW5jdGlvbihuKSB7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KFxuICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCAtIG4gPj0gMCxcbiAgICAgICdDYW5ub3QgcG9wIGJlbG93IHplcm8nXG4gICAgKTtcbiAgICBsZXQgcG9wSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gbjtcbiAgICB0aGlzLl9lbmFibGVTY2VuZShwb3BJbmRleCk7XG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbcG9wSW5kZXhdKTtcbiAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICBwb3BJbmRleCxcbiAgICAgIG51bGwsIC8vIGRlZmF1bHQgdmVsb2NpdHlcbiAgICAgIG51bGwsIC8vIG5vIHNwcmluZyBqdW1waW5nXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGhpc3RvcnkuZ28oLW4pO1xuICAgICAgICB0aGlzLl9jbGVhblNjZW5lc1Bhc3RJbmRleChwb3BJbmRleCk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICBwb3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25RdWV1ZS5sZW5ndGgpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHdvcmthcm91bmQgdG8gcHJldmVudCB1c2VyIGZyb20gZmlyaW5nIG11bHRpcGxlIGBwb3AoKWBcbiAgICAgIC8vIGNhbGxzIHRoYXQgbWF5IHBvcCB0aGUgcm91dGVzIGJleW9uZCB0aGUgbGltaXQuXG4gICAgICAvLyBCZWNhdXNlIGB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4YCBkb2VzIG5vdCB1cGRhdGUgdW50aWwgdGhlXG4gICAgICAvLyB0cmFuc2l0aW9uIHN0YXJ0cywgd2UgY2FuJ3QgcmVsaWFibHkgdXNlIGB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4YFxuICAgICAgLy8gdG8ga25vdyB3aGV0aGVyIHdlIGNhbiBzYWZlbHkga2VlcCBwb3BwaW5nIHRoZSByb3V0ZXMgb3Igbm90IGF0IHRoaXNcbiAgICAgIC8vICBtb21lbnQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9wb3BOKDEpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZSBhIHJvdXRlIGluIHRoZSBuYXZpZ2F0aW9uIHN0YWNrLlxuICAgKlxuICAgKiBgaW5kZXhgIHNwZWNpZmllcyB0aGUgcm91dGUgaW4gdGhlIHN0YWNrIHRoYXQgc2hvdWxkIGJlIHJlcGxhY2VkLlxuICAgKiBJZiBpdCdzIG5lZ2F0aXZlLCBpdCBjb3VudHMgZnJvbSB0aGUgYmFjay5cbiAgICovXG4gIHJlcGxhY2VBdEluZGV4OiBmdW5jdGlvbihyb3V0ZSwgaW5kZXgsIGNiKSB7XG4gICAgaW52YXJpYW50KCEhcm91dGUsICdNdXN0IHN1cHBseSByb3V0ZSB0byByZXBsYWNlJyk7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgaW5kZXggKz0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCA8PSBpbmRleCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBuZXh0Um91dGVTdGFjayA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5zbGljZSgpO1xuICAgIGxldCBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrLnNsaWNlKCk7XG4gICAgbmV4dFJvdXRlU3RhY2tbaW5kZXhdID0gcm91dGU7XG4gICAgbmV4dEFuaW1hdGlvbk1vZGVTdGFja1tpbmRleF0gPSB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lKHJvdXRlKTtcblxuICAgIGlmIChpbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFJvdXRlU3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrLFxuICAgIH0sICgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgICB0aGlzLl9lbWl0RGlkRm9jdXMocm91dGUpO1xuICAgICAgfVxuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIGN1cnJlbnQgc2NlbmUgaW4gdGhlIHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgY3VycmVudCByb3V0ZSdzIHBhcmVudC5cbiAgICovXG4gIHJlcGxhY2VQcmV2aW91czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gMSk7XG4gIH0sXG5cbiAgcG9wVG9Ub3A6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucG9wVG9Sb3V0ZSh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbMF0pO1xuICB9LFxuXG4gIHBvcFRvUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGluZGV4T2ZSb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBpbmRleE9mUm91dGUgIT09IC0xLFxuICAgICAgJ0NhbGxpbmcgcG9wVG9Sb3V0ZSBmb3IgYSByb3V0ZSB0aGF0IGRvZXNuXFwndCBleGlzdCEnXG4gICAgKTtcbiAgICBsZXQgbnVtVG9Qb3AgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gaW5kZXhPZlJvdXRlO1xuICAgIHRoaXMuX3BvcE4obnVtVG9Qb3ApO1xuICB9LFxuXG4gIHJlcGxhY2VQcmV2aW91c0FuZFBvcDogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXBsYWNlUHJldmlvdXMocm91dGUpO1xuICAgIHRoaXMucG9wKCk7XG4gIH0sXG5cbiAgcmVzZXRUbzogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHB1c2gnKTtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCAwLCAoKSA9PiB7XG4gICAgICAvLyBEbyBub3QgdXNlIHBvcFRvUm91dGUgaGVyZSwgYmVjYXVzZSByYWNlIGNvbmRpdGlvbnMgY291bGQgcHJldmVudCB0aGVcbiAgICAgIC8vIHJvdXRlIGZyb20gZXhpc3RpbmcgYXQgdGhpcyB0aW1lLiBJbnN0ZWFkLCBqdXN0IGdvIHRvIGluZGV4IDBcbiAgICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLl9wb3BOKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGdldEN1cnJlbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsb25lIGJlZm9yZSByZXR1cm5pbmcgdG8gYXZvaWQgY2FsbGVyIG11dGF0aW5nIHRoZSBzdGFja1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoKTtcbiAgfSxcblxuICBfY2xlYW5TY2VuZXNQYXN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IG5ld1N0YWNrTGVuZ3RoID0gaW5kZXggKyAxO1xuICAgIC8vIFJlbW92ZSBhbnkgdW5uZWVkZWQgcmVuZGVyZWQgcm91dGVzLlxuICAgIGlmIChuZXdTdGFja0xlbmd0aCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2VuZUNvbmZpZ1N0YWNrOiB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICByb3V0ZVN0YWNrOiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJTY2VuZTogZnVuY3Rpb24ocm91dGUsIGkpIHtcbiAgICBsZXQgZGlzYWJsZWRTY2VuZVN0eWxlID0gbnVsbDtcbiAgICBsZXQgZGlzYWJsZWRTY2VuZVBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgaWYgKGkgIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIGRpc2FibGVkU2NlbmVTdHlsZSA9IHN0eWxlcy5kaXNhYmxlZFNjZW5lO1xuICAgICAgZGlzYWJsZWRTY2VuZVBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3XG4gICAgICAgIGtleT17J3NjZW5lXycgKyBnZXRSb3V0ZUlEKHJvdXRlKX1cbiAgICAgICAgcmVmPXsnc2NlbmVfJyArIGl9XG4gICAgICAgIG9uU3RhcnRTaG91bGRTZXRSZXNwb25kZXJDYXB0dXJlPXsoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCkgfHwgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKTtcbiAgICAgICAgfX1cbiAgICAgICAgcG9pbnRlckV2ZW50cz17ZGlzYWJsZWRTY2VuZVBvaW50ZXJFdmVudHN9XG4gICAgICAgIHN0eWxlPXtbc3R5bGVzLmJhc2VTY2VuZSwgdGhpcy5wcm9wcy5zY2VuZVN0eWxlLCBkaXNhYmxlZFNjZW5lU3R5bGVdfT5cbiAgICAgICAge3RoaXMucHJvcHMucmVuZGVyU2NlbmUoXG4gICAgICAgICAgcm91dGUsXG4gICAgICAgICAgdGhpc1xuICAgICAgICApfVxuICAgICAgPC9WaWV3PlxuICAgICk7XG4gIH0sXG5cbiAgX3JlbmRlck5hdmlnYXRpb25CYXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5uYXZpZ2F0aW9uQmFyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudCh0aGlzLnByb3BzLm5hdmlnYXRpb25CYXIsIHtcbiAgICAgIHJlZjogKG5hdkJhcikgPT4ge1xuICAgICAgICB0aGlzLl9uYXZCYXIgPSBuYXZCYXI7XG4gICAgICB9LFxuICAgICAgbmF2aWdhdG9yOiB0aGlzLFxuICAgICAgbmF2U3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgbmV3UmVuZGVyZWRTY2VuZU1hcCA9IG5ldyBNYXAoKTtcbiAgICBsZXQgc2NlbmVzID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLm1hcCgocm91dGUsIGluZGV4KSA9PiB7XG4gICAgICBsZXQgcmVuZGVyZWRTY2VuZTtcbiAgICAgIGlmICh0aGlzLl9yZW5kZXJlZFNjZW5lTWFwLmhhcyhyb3V0ZSkgJiZcbiAgICAgICAgICBpbmRleCAhPT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgICByZW5kZXJlZFNjZW5lID0gdGhpcy5fcmVuZGVyZWRTY2VuZU1hcC5nZXQocm91dGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWRTY2VuZSA9IHRoaXMuX3JlbmRlclNjZW5lKHJvdXRlLCBpbmRleCk7XG4gICAgICB9XG4gICAgICBuZXdSZW5kZXJlZFNjZW5lTWFwLnNldChyb3V0ZSwgcmVuZGVyZWRTY2VuZSk7XG4gICAgICByZXR1cm4gcmVuZGVyZWRTY2VuZTtcbiAgICB9KTtcbiAgICB0aGlzLl9yZW5kZXJlZFNjZW5lTWFwID0gbmV3UmVuZGVyZWRTY2VuZU1hcDtcbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXcgc3R5bGU9e1tzdHlsZXMuY29udGFpbmVyLCB0aGlzLnByb3BzLnN0eWxlXX0+XG4gICAgICAgIDxWaWV3XG4gICAgICAgICAgc3R5bGU9e3N0eWxlcy50cmFuc2l0aW9uZXJ9XG4gICAgICAgICAgey4uLnRoaXMucGFuR2VzdHVyZS5wYW5IYW5kbGVyc31cbiAgICAgICAgICBvblRvdWNoU3RhcnQ9e3RoaXMuX2hhbmRsZVRvdWNoU3RhcnR9XG4gICAgICAgICAgb25SZXNwb25kZXJUZXJtaW5hdGlvblJlcXVlc3Q9e1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0XG4gICAgICAgICAgfT5cbiAgICAgICAgICB7c2NlbmVzfVxuICAgICAgICA8L1ZpZXc+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJOYXZpZ2F0aW9uQmFyKCl9XG4gICAgICA8L1ZpZXc+XG4gICAgKTtcbiAgfSxcblxuICBfZ2V0TmF2aWdhdGlvbkNvbnRleHQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQpIHtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25Db250ZXh0ID0gbmV3IE5hdmlnYXRpb25Db250ZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dDtcbiAgfVxufSk7XG5cbk5hdmlnYXRvci5pc1JlYWN0TmF0aXZlQ29tcG9uZW50ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgTmF2aWdhdG9yO1xuIl19