








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

var hiddenStyle={
opacity:0,
visibility:'hidden'};


var visibleStyle={
opacity:1,
visibility:'visible'};





var SCREEN_WIDTH=_ReactDimensions2.default.get('window').width;
var SCREEN_HEIGHT=_ReactDimensions2.default.get('window').height;
var SCENE_DISABLED_NATIVE_PROPS={
pointerEvents:'none',
style:hiddenStyle};








var styles=_ReactStyleSheet2.default.create({
container:{
flex:1,
overflow:'hidden'},

defaultSceneStyle:{
position:'absolute',
left:0,
right:0,
bottom:0,
top:0,
visibility:'visible'},

baseScene:{
position:'absolute',
overflow:'hidden',
left:0,
right:0,
bottom:0,
top:0},





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

_nextRouteID:function _nextRouteID(replace){
return this.state.routeStack.length-(replace?1:0);
},

_getRouteID:function _getRouteID(route,action){
if(route===null||typeof route!=='object'){
return String(route);
}

return this.state.routeStack.indexOf(route);
},








immediatelyResetRouteStack:function immediatelyResetRouteStack(nextRouteStack){var _this3=this;
console.warn('navigator.immediatelyResetRouteStack breaks the back button!');

var self=this;
var prevLength=this.state.routeStack.length;
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
this._hideScenes();
return;
}
if(this.state.transitionFromIndex!==null){
this.state.transitionQueue.push({
destIndex:destIndex,
velocity:velocity,
cb:cb});

return;
}

var transitionFromIndex=this.state.presentedIndex;

this.setState({
presentedIndex:destIndex,
transitionFromIndex:transitionFromIndex,
transitionCb:cb});


this._onAnimationStart();



var sceneConfig=this.state.sceneConfigStack[transitionFromIndex]||
this.state.sceneConfigStack[destIndex];
(0,_invariant2.default)(
sceneConfig,
'Cannot configure scene at index '+transitionFromIndex);

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

var sceneNativeProps={
pointerEvents:'auto',
style:_extends({
top:sceneStyle.top,
bottom:sceneStyle.bottom},
visibleStyle)};











this.refs['scene_'+sceneIndex]&&
this.refs['scene_'+sceneIndex].setNativeProps(sceneNativeProps);
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
var route=this.state.routeStack[destIndex];
this._emitWillFocus(route);
this._transitionTo(destIndex);
if(!this.hashChanged){
if(n>0){
history.pushState({index:destIndex},'/scene_'+this._getRouteID(route));
}else{
history.go(n);
}
return;
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
history.pushState({index:destIndex},'/scene_'+_this6._getRouteID(route));
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

var replaceCurrent=index===this.state.presentedIndex;
if(!replaceCurrent){
console.warn('navigator.replaceAtIndex for the non-current route breaks the back button!');
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
sceneConfigStack:nextAnimationModeStack,
presentedIndex:index,
transitionFromIndex:null},
function(){
if(index===_this8.state.presentedIndex){
_this8._emitDidFocus(route);
}

if(replaceCurrent){
history.replaceState({index:index},'/scene_'+_this8._getRouteID(route));
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
routeStack:this.state.routeStack.slice(0,newStackLength),
presentedIndex:index});

}
},

_renderScene:function _renderScene(route,i){var _this10=this;

var pointerEvents='auto';
if(i!==this.state.presentedIndex){

pointerEvents='none';
}

var routeId=this._getRouteID(route);
return(
_react2.default.createElement(_ReactView2.default,{
key:'scene_'+routeId,
ref:'scene_'+routeId,
onStartShouldSetResponderCapture:function onStartShouldSetResponderCapture(){
return _this10.state.transitionFromIndex!=null||_this10.state.transitionFromIndex!=null;
},
pointerEvents:pointerEvents,
style:[styles.baseScene,this.props.sceneStyle]},
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRvci53ZWIuanMiXSwibmFtZXMiOlsiaGlzdG9yeSIsIl91bmxpc3RlbiIsImhpZGRlblN0eWxlIiwib3BhY2l0eSIsInZpc2liaWxpdHkiLCJ2aXNpYmxlU3R5bGUiLCJTQ1JFRU5fV0lEVEgiLCJnZXQiLCJ3aWR0aCIsIlNDUkVFTl9IRUlHSFQiLCJoZWlnaHQiLCJTQ0VORV9ESVNBQkxFRF9OQVRJVkVfUFJPUFMiLCJwb2ludGVyRXZlbnRzIiwic3R5bGUiLCJzdHlsZXMiLCJjcmVhdGUiLCJjb250YWluZXIiLCJmbGV4Iiwib3ZlcmZsb3ciLCJkZWZhdWx0U2NlbmVTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwiYmFzZVNjZW5lIiwidHJhbnNpdGlvbmVyIiwiYmFja2dyb3VuZENvbG9yIiwiR0VTVFVSRV9BQ1RJT05TIiwiTmF2aWdhdG9yIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjb25maWd1cmVTY2VuZSIsImZ1bmMiLCJyZW5kZXJTY2VuZSIsImlzUmVxdWlyZWQiLCJpbml0aWFsUm91dGUiLCJvYmplY3QiLCJpbml0aWFsUm91dGVTdGFjayIsImFycmF5T2YiLCJvbldpbGxGb2N1cyIsIm9uRGlkRm9jdXMiLCJuYXZpZ2F0aW9uQmFyIiwibm9kZSIsIm5hdmlnYXRvciIsInNjZW5lU3R5bGUiLCJzdGF0aWNzIiwiQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIiLCJOYXZpZ2F0aW9uQmFyIiwiU2NlbmVDb25maWdzIiwibWl4aW5zIiwiTWl4aW4iLCJnZXREZWZhdWx0UHJvcHMiLCJQdXNoRnJvbVJpZ2h0IiwiZ2V0SW5pdGlhbFN0YXRlIiwiX3JlbmRlcmVkU2NlbmVNYXAiLCJyb3V0ZVN0YWNrIiwicHJvcHMiLCJsZW5ndGgiLCJpbml0aWFsUm91dGVJbmRleCIsImluZGV4T2YiLCJzY2VuZUNvbmZpZ1N0YWNrIiwibWFwIiwicm91dGUiLCJwcmVzZW50ZWRJbmRleCIsInRyYW5zaXRpb25Gcm9tSW5kZXgiLCJhY3RpdmVHZXN0dXJlIiwicGVuZGluZ0dlc3R1cmVQcm9ncmVzcyIsInRyYW5zaXRpb25RdWV1ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsIl9fZGVmaW5lR2V0dGVyX18iLCJfZ2V0TmF2aWdhdGlvbkNvbnRleHQiLCJfc3ViUm91dGVGb2N1cyIsInBhcmVudE5hdmlnYXRvciIsIl9oYW5kbGVycyIsInNwcmluZ1N5c3RlbSIsIlNwcmluZ1N5c3RlbSIsInNwcmluZyIsImNyZWF0ZVNwcmluZyIsInNldFJlc3RTcGVlZFRocmVzaG9sZCIsInNldEN1cnJlbnRWYWx1ZSIsInNldEF0UmVzdCIsImFkZExpc3RlbmVyIiwib25TcHJpbmdFbmRTdGF0ZUNoYW5nZSIsIl9pbnRlcmFjdGlvbkhhbmRsZSIsImNyZWF0ZUludGVyYWN0aW9uSGFuZGxlIiwib25TcHJpbmdVcGRhdGUiLCJfaGFuZGxlU3ByaW5nVXBkYXRlIiwib25TcHJpbmdBdFJlc3QiLCJfY29tcGxldGVUcmFuc2l0aW9uIiwicGFuR2VzdHVyZSIsIm9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlciIsIl9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyIiwib25QYW5SZXNwb25kZXJHcmFudCIsIl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCIsIm9uUGFuUmVzcG9uZGVyUmVsZWFzZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlIiwib25QYW5SZXNwb25kZXJNb3ZlIiwiX2hhbmRsZVBhblJlc3BvbmRlck1vdmUiLCJvblBhblJlc3BvbmRlclRlcm1pbmF0ZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUiLCJfZW1pdFdpbGxGb2N1cyIsInN0YXRlIiwiaGFzaENoYW5nZWQiLCJjb21wb25lbnREaWRNb3VudCIsIl9lbWl0RGlkRm9jdXMiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImRlc3RJbmRleCIsInBhdGhuYW1lIiwicGFyc2VJbnQiLCJyZXBsYWNlIiwiX2p1bXBOIiwiYmluZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX25hdmlnYXRpb25Db250ZXh0IiwiZGlzcG9zZSIsIl9uZXh0Um91dGVJRCIsIl9nZXRSb3V0ZUlEIiwiYWN0aW9uIiwiU3RyaW5nIiwiaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2siLCJuZXh0Um91dGVTdGFjayIsImNvbnNvbGUiLCJ3YXJuIiwic2VsZiIsInByZXZMZW5ndGgiLCJzZXRTdGF0ZSIsIl90cmFuc2l0aW9uVG8iLCJ2ZWxvY2l0eSIsImp1bXBTcHJpbmdUbyIsImNiIiwiX2hpZGVTY2VuZXMiLCJwdXNoIiwidHJhbnNpdGlvbkNiIiwiX29uQW5pbWF0aW9uU3RhcnQiLCJzY2VuZUNvbmZpZyIsInNldE92ZXJzaG9vdENsYW1waW5nRW5hYmxlZCIsImdldFNwcmluZ0NvbmZpZyIsImZyaWN0aW9uIiwic3ByaW5nRnJpY3Rpb24iLCJ0ZW5zaW9uIiwic3ByaW5nVGVuc2lvbiIsInNldFZlbG9jaXR5IiwiZGVmYXVsdFRyYW5zaXRpb25WZWxvY2l0eSIsInNldEVuZFZhbHVlIiwiX3RyYW5zaXRpb25CZXR3ZWVuIiwiZ2V0Q3VycmVudFZhbHVlIiwicHJlc2VudGVkVG9JbmRleCIsIl9kZWx0YUZvckdlc3R1cmVBY3Rpb24iLCJfb25BbmltYXRpb25FbmQiLCJkaWRGb2N1c1JvdXRlIiwiY2xlYXJJbnRlcmFjdGlvbkhhbmRsZSIsImdlc3R1cmVUb0luZGV4IiwiX2VuYWJsZVNjZW5lIiwicXVldWVkVHJhbnNpdGlvbiIsInNoaWZ0IiwibmF2aWdhdGlvbkNvbnRleHQiLCJlbWl0IiwibmF2QmFyIiwiX25hdkJhciIsImhhbmRsZVdpbGxGb2N1cyIsImdlc3R1cmluZ1RvSW5kZXgiLCJpIiwiX2Rpc2FibGVTY2VuZSIsInNjZW5lSW5kZXgiLCJyZWZzIiwic2V0TmF0aXZlUHJvcHMiLCJzY2VuZU5hdGl2ZVByb3BzIiwiZnJvbUluZGV4IiwidG9JbmRleCIsIl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIm9uQW5pbWF0aW9uU3RhcnQiLCJtYXgiLCJpbmRleCIsIm9uQW5pbWF0aW9uRW5kIiwic2hvdWxkUmVuZGVyVG9IYXJkd2FyZVRleHR1cmUiLCJ2aWV3QXRJbmRleCIsInVuZGVmaW5lZCIsInJlbmRlclRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIl9oYW5kbGVUb3VjaFN0YXJ0IiwiX2VsaWdpYmxlR2VzdHVyZXMiLCJlIiwiZ2VzdHVyZVN0YXRlIiwiX2V4cGVjdGluZ0dlc3R1cmVHcmFudCIsIl9tYXRjaEdlc3R1cmVBY3Rpb24iLCJnZXN0dXJlcyIsIl9kb2VzR2VzdHVyZU92ZXJzd2lwZSIsImdlc3R1cmVOYW1lIiwid291bGRPdmVyc3dpcGVCYWNrIiwid291bGRPdmVyc3dpcGVGb3J3YXJkIiwiX2F0dGFjaEdlc3R1cmUiLCJnZXN0dXJlQWN0aW9uIiwicmVsZWFzZUdlc3R1cmVBY3Rpb24iLCJyZWxlYXNlR2VzdHVyZSIsImlzVHJhdmVsVmVydGljYWwiLCJkaXJlY3Rpb24iLCJpc1RyYXZlbEludmVydGVkIiwiZ2VzdHVyZURpc3RhbmNlIiwidnkiLCJkeSIsInZ4IiwiZHgiLCJ0cmFuc2l0aW9uVmVsb2NpdHkiLCJNYXRoIiwiYWJzIiwibm90TW92aW5nIiwiaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlIiwiZnVsbERpc3RhbmNlIiwic3RpbGxDb21wbGV0aW9uUmF0aW8iLCJzbmFwVmVsb2NpdHkiLCJ0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgiLCJfY2xlYW5TY2VuZXNQYXN0SW5kZXgiLCJfZGV0YWNoR2VzdHVyZSIsImdlc3R1cmVJZCIsImdlc3R1cmUiLCJfbW92ZUF0dGFjaGVkR2VzdHVyZSIsIm1hdGNoZWRHZXN0dXJlIiwiZGlzdGFuY2UiLCJnZXN0dXJlRGV0ZWN0TW92ZW1lbnQiLCJuZXh0UHJvZ3Jlc3MiLCJpc0RldGFjaGFibGUiLCJmcmljdGlvbkNvbnN0YW50Iiwib3ZlcnN3aXBlIiwiZnJpY3Rpb25CeURpc3RhbmNlIiwiZnJpY3Rpb25SYXRpbyIsImVsaWdpYmxlR2VzdHVyZXMiLCJzb21lIiwiZ2VzdHVyZUluZGV4IiwiY3VycmVudExvYyIsIm1vdmVZIiwibW92ZVgiLCJ0cmF2ZWxEaXN0Iiwib3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCIsImVkZ2VIaXRXaWR0aCIsIm1vdmVTdGFydGVkSW5SZWdpb24iLCJtb3ZlVHJhdmVsbGVkRmFyRW5vdWdoIiwiZGlyZWN0aW9uSXNDb3JyZWN0IiwiZGlyZWN0aW9uUmF0aW8iLCJzbGljZSIsInNwbGljZSIsIl90cmFuc2l0aW9uU2NlbmVTdHlsZSIsInByb2dyZXNzIiwic2NlbmVDb25maWdJbmRleCIsInN0eWxlVG9Vc2UiLCJ1c2VGbiIsImFuaW1hdGlvbkludGVycG9sYXRvcnMiLCJvdXQiLCJpbnRvIiwiZGlyZWN0aW9uQWRqdXN0ZWRQcm9ncmVzcyIsImRpZENoYW5nZSIsInVwZGF0ZVByb2dyZXNzIiwiX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdCIsIl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMiLCJuIiwiY3VycmVudEluZGV4IiwibWF4SW5kZXgiLCJwdXNoU3RhdGUiLCJnbyIsImp1bXBUbyIsImp1bXBGb3J3YXJkIiwianVtcEJhY2siLCJhY3RpdmVMZW5ndGgiLCJhY3RpdmVTdGFjayIsImFjdGl2ZUFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwibmV4dFN0YWNrIiwiY29uY2F0IiwibmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwiX3BvcE4iLCJwb3BJbmRleCIsInBvcCIsInJlcGxhY2VBdEluZGV4IiwicmVwbGFjZUN1cnJlbnQiLCJuZXh0QW5pbWF0aW9uTW9kZVN0YWNrIiwicmVwbGFjZVN0YXRlIiwicmVwbGFjZVByZXZpb3VzIiwicG9wVG9Ub3AiLCJwb3BUb1JvdXRlIiwiaW5kZXhPZlJvdXRlIiwibnVtVG9Qb3AiLCJyZXBsYWNlUHJldmlvdXNBbmRQb3AiLCJyZXNldFRvIiwiZ2V0Q3VycmVudFJvdXRlcyIsIm5ld1N0YWNrTGVuZ3RoIiwiX3JlbmRlclNjZW5lIiwicm91dGVJZCIsIl9yZW5kZXJOYXZpZ2F0aW9uQmFyIiwiY2xvbmVFbGVtZW50IiwicmVmIiwibmF2U3RhdGUiLCJyZW5kZXIiLCJuZXdSZW5kZXJlZFNjZW5lTWFwIiwic2NlbmVzIiwicmVuZGVyZWRTY2VuZSIsImhhcyIsInNldCIsInBhbkhhbmRsZXJzIiwiaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBU0EsYTs7QUFFQSw0QjtBQUNBLDZEO0FBQ0EsMEU7QUFDQSwyQztBQUNBLHNFO0FBQ0EseUY7QUFDQSxxRTtBQUNBLG1FO0FBQ0EsbUU7QUFDQSw2RDtBQUNBLHNEO0FBQ0Esa0Q7QUFDQSwyQztBQUNBLHdDO0FBQ0EsaUU7QUFDQSw2QztBQUNBLGdDO0FBQ0EsZ0U7O0FBRUEsR0FBSUEsU0FBVSxpQ0FBZDtBQUNBLEdBQUlDLGlCQUFKOztBQUVBLEdBQU1DLGFBQWM7QUFDbEJDLFFBQVMsQ0FEUztBQUVsQkMsV0FBWSxRQUZNLENBQXBCOzs7QUFLQSxHQUFNQyxjQUFlO0FBQ25CRixRQUFTLENBRFU7QUFFbkJDLFdBQVksU0FGTyxDQUFyQjs7Ozs7O0FBUUEsR0FBTUUsY0FBZSwwQkFBV0MsR0FBWCxDQUFlLFFBQWYsRUFBeUJDLEtBQTlDO0FBQ0EsR0FBTUMsZUFBZ0IsMEJBQVdGLEdBQVgsQ0FBZSxRQUFmLEVBQXlCRyxNQUEvQztBQUNBLEdBQU1DLDZCQUE4QjtBQUNsQ0MsY0FBZSxNQURtQjtBQUVsQ0MsTUFBT1gsV0FGMkIsQ0FBcEM7Ozs7Ozs7OztBQVdBLEdBQUlZLFFBQVMsMEJBQVdDLE1BQVgsQ0FBa0I7QUFDN0JDLFVBQVc7QUFDVEMsS0FBTSxDQURHO0FBRVRDLFNBQVUsUUFGRCxDQURrQjs7QUFLN0JDLGtCQUFtQjtBQUNqQkMsU0FBVSxVQURPO0FBRWpCQyxLQUFNLENBRlc7QUFHakJDLE1BQU8sQ0FIVTtBQUlqQkMsT0FBUSxDQUpTO0FBS2pCQyxJQUFLLENBTFk7QUFNakJwQixXQUFZLFNBTkssQ0FMVTs7QUFhN0JxQixVQUFXO0FBQ1RMLFNBQVUsVUFE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cU8sY0FBZ0IsUUFBSzlPLGlCQUFMLENBQXVCaEQsR0FBdkIsQ0FBMkJ3RCxLQUEzQixDQUFoQjtBQUNELENBSEQsSUFHTztBQUNMc08sY0FBZ0IsUUFBS1QsWUFBTCxDQUFrQjdOLEtBQWxCLENBQXlCK0csS0FBekIsQ0FBaEI7QUFDRDtBQUNEcUgsb0JBQW9CSSxHQUFwQixDQUF3QnhPLEtBQXhCLENBQStCc08sYUFBL0I7QUFDQSxNQUFPQSxjQUFQO0FBQ0QsQ0FWWSxDQUFiO0FBV0EsS0FBSzlPLGlCQUFMLENBQXlCNE8sbUJBQXpCO0FBQ0E7QUFDRSxtREFBTSxNQUFPLENBQUNyUixPQUFPRSxTQUFSLENBQW1CLEtBQUt5QyxLQUFMLENBQVc1QyxLQUE5QixDQUFiO0FBQ0U7QUFDRSxNQUFPQyxPQUFPWSxZQURoQjtBQUVNLEtBQUtnRSxVQUFMLENBQWdCOE0sV0FGdEI7QUFHRSxhQUFjLEtBQUtwSCxpQkFIckI7QUFJRTtBQUNFLEtBQUt3RSxrQ0FMVDs7QUFPR3dDLE1BUEgsQ0FERjs7QUFVRyxLQUFLTixvQkFBTCxFQVZILENBREY7OztBQWNELENBMStCK0I7O0FBNCtCaEN2TixzQkFBdUIsZ0NBQVc7QUFDaEMsR0FBSSxDQUFDLEtBQUs0QyxrQkFBVixDQUE4QjtBQUM1QixLQUFLQSxrQkFBTCxDQUEwQixzQ0FBMUI7QUFDRDtBQUNELE1BQU8sTUFBS0Esa0JBQVo7QUFDRCxDQWovQitCLENBQWxCLENBQWhCOzs7QUFvL0JBdEYsVUFBVTRRLHNCQUFWLENBQW1DLElBQW5DLEM7O0FBRWU1USxTIiwiZmlsZSI6Ik5hdmlnYXRvci53ZWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBBbGliYWJhIEdyb3VwIEhvbGRpbmcgTGltaXRlZC5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LCBGYWNlYm9vaywgSW5jLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgUmVhY3ROYXZpZ2F0b3JcbiAqL1xuIC8qIGVzbGludC1kaXNhYmxlIG5vLWV4dHJhLWJvb2xlYW4tY2FzdCovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCwgeyBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRGltZW5zaW9ucyBmcm9tICdSZWFjdERpbWVuc2lvbnMnO1xuaW1wb3J0IEludGVyYWN0aW9uTWl4aW4gZnJvbSAnUmVhY3RJbnRlcmFjdGlvbk1peGluJztcbmltcG9ydCBNYXAgZnJvbSAnY29yZS1qcy9saWJyYXJ5L2ZuL21hcCc7XG5pbXBvcnQgTmF2aWdhdGlvbkNvbnRleHQgZnJvbSAnUmVhY3ROYXZpZ2F0aW9uQ29udGV4dCc7XG5pbXBvcnQgTmF2aWdhdG9yQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIgZnJvbSAnUmVhY3ROYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQgTmF2aWdhdG9yTmF2aWdhdGlvbkJhciBmcm9tICdSZWFjdE5hdmlnYXRvck5hdmlnYXRpb25CYXInO1xuaW1wb3J0IE5hdmlnYXRvclNjZW5lQ29uZmlncyBmcm9tICdSZWFjdE5hdmlnYXRvclNjZW5lQ29uZmlncyc7XG5pbXBvcnQgUGFuUmVzcG9uZGVyIGZyb20gJ1JlYWN0UGFuUmVzcG9uZGVyJztcbmltcG9ydCBTdHlsZVNoZWV0IGZyb20gJ1JlYWN0U3R5bGVTaGVldCc7XG5pbXBvcnQgU3Vic2NyaWJhYmxlIGZyb20gJy4vcG9seWZpbGxzL1N1YnNjcmliYWJsZSc7XG5pbXBvcnQgVGltZXJNaXhpbiBmcm9tICdyZWFjdC10aW1lci1taXhpbic7XG5pbXBvcnQgVmlldyBmcm9tICdSZWFjdFZpZXcnO1xuaW1wb3J0IGNsYW1wIGZyb20gJy4vcG9seWZpbGxzL2NsYW1wJztcbmltcG9ydCBmbGF0dGVuU3R5bGUgZnJvbSAnUmVhY3RGbGF0dGVuU3R5bGUnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdmYmpzL2xpYi9pbnZhcmlhbnQnO1xuaW1wb3J0IHJlYm91bmQgZnJvbSAncmVib3VuZCc7XG5pbXBvcnQgY3JlYXRlSGlzdG9yeSBmcm9tICdoaXN0b3J5L2xpYi9jcmVhdGVIYXNoSGlzdG9yeSc7XG5cbmxldCBoaXN0b3J5ID0gY3JlYXRlSGlzdG9yeSgpO1xubGV0IF91bmxpc3RlbjtcblxuY29uc3QgaGlkZGVuU3R5bGUgPSB7XG4gIG9wYWNpdHk6IDAsXG4gIHZpc2liaWxpdHk6ICdoaWRkZW4nXG59XG5cbmNvbnN0IHZpc2libGVTdHlsZSA9IHtcbiAgb3BhY2l0eTogMSxcbiAgdmlzaWJpbGl0eTogJ3Zpc2libGUnXG59XG5cbi8vIFRPRE86IHRoaXMgaXMgbm90IGlkZWFsIGJlY2F1c2UgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIG5hdmlnYXRvclxuLy8gaXMgZnVsbCBzY3JlZW4sIGh3b2V2ZXIgd2UgZG9uJ3QgaGF2ZSBhIGdvb2Qgd2F5IHRvIG1lYXN1cmUgdGhlIGFjdHVhbFxuLy8gc2l6ZSBvZiB0aGUgbmF2aWdhdG9yIHJpZ2h0IG5vdywgc28gdGhpcyBpcyB0aGUgbmV4dCBiZXN0IHRoaW5nLlxuY29uc3QgU0NSRUVOX1dJRFRIID0gRGltZW5zaW9ucy5nZXQoJ3dpbmRvdycpLndpZHRoO1xuY29uc3QgU0NSRUVOX0hFSUdIVCA9IERpbWVuc2lvbnMuZ2V0KCd3aW5kb3cnKS5oZWlnaHQ7XG5jb25zdCBTQ0VORV9ESVNBQkxFRF9OQVRJVkVfUFJPUFMgPSB7XG4gIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgc3R5bGU6IGhpZGRlblN0eWxlXG59O1xuXG4vLyBsZXQgX191aWQgPSAwO1xuLy8gZnVuY3Rpb24gZ2V0dWlkKCkge1xuLy8gICByZXR1cm4gX191aWQrKztcbi8vIH1cblxuLy8gc3R5bGVzIG1vdmVkIHRvIHRoZSB0b3Agb2YgdGhlIGZpbGUgc28gZ2V0RGVmYXVsdFByb3BzIGNhbiByZWZlciB0byBpdFxubGV0IHN0eWxlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKHtcbiAgY29udGFpbmVyOiB7XG4gICAgZmxleDogMSxcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gIH0sXG4gIGRlZmF1bHRTY2VuZVN0eWxlOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgbGVmdDogMCxcbiAgICByaWdodDogMCxcbiAgICBib3R0b206IDAsXG4gICAgdG9wOiAwLFxuICAgIHZpc2liaWxpdHk6ICd2aXNpYmxlJ1xuICB9LFxuICBiYXNlU2NlbmU6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgbGVmdDogMCxcbiAgICByaWdodDogMCxcbiAgICBib3R0b206IDAsXG4gICAgdG9wOiAwLFxuICB9LFxuICAvLyBkaXNhYmxlZFNjZW5lOiB7XG4gIC8vICAgdG9wOiBTQ1JFRU5fSEVJR0hULFxuICAvLyAgIGJvdHRvbTogLVNDUkVFTl9IRUlHSFQsXG4gIC8vIH0sXG4gIHRyYW5zaXRpb25lcjoge1xuICAgIGZsZXg6IDEsXG4gICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgfVxufSk7XG5cbmNvbnN0IEdFU1RVUkVfQUNUSU9OUyA9IFtcbiAgJ3BvcCcsXG4gICdqdW1wQmFjaycsXG4gICdqdW1wRm9yd2FyZCcsXG5dO1xuXG4vKipcbiAqIFVzZSBgTmF2aWdhdG9yYCB0byB0cmFuc2l0aW9uIGJldHdlZW4gZGlmZmVyZW50IHNjZW5lcyBpbiB5b3VyIGFwcC4gVG9cbiAqIGFjY29tcGxpc2ggdGhpcywgcHJvdmlkZSByb3V0ZSBvYmplY3RzIHRvIHRoZSBuYXZpZ2F0b3IgdG8gaWRlbnRpZnkgZWFjaFxuICogc2NlbmUsIGFuZCBhbHNvIGEgYHJlbmRlclNjZW5lYCBmdW5jdGlvbiB0aGF0IHRoZSBuYXZpZ2F0b3IgY2FuIHVzZSB0b1xuICogcmVuZGVyIHRoZSBzY2VuZSBmb3IgYSBnaXZlbiByb3V0ZS5cbiAqXG4gKiBUbyBjaGFuZ2UgdGhlIGFuaW1hdGlvbiBvciBnZXN0dXJlIHByb3BlcnRpZXMgb2YgdGhlIHNjZW5lLCBwcm92aWRlIGFcbiAqIGBjb25maWd1cmVTY2VuZWAgcHJvcCB0byBnZXQgdGhlIGNvbmZpZyBvYmplY3QgZm9yIGEgZ2l2ZW4gcm91dGUuIFNlZVxuICogYE5hdmlnYXRvci5TY2VuZUNvbmZpZ3NgIGZvciBkZWZhdWx0IGFuaW1hdGlvbnMgYW5kIG1vcmUgaW5mbyBvblxuICogc2NlbmUgY29uZmlnIG9wdGlvbnMuXG4gKlxuICogIyMjIEJhc2ljIFVzYWdlXG4gKlxuICogYGBgXG4gKiAgIDxOYXZpZ2F0b3JcbiAqICAgICBpbml0aWFsUm91dGU9e3tuYW1lOiAnTXkgRmlyc3QgU2NlbmUnLCBpbmRleDogMH19XG4gKiAgICAgcmVuZGVyU2NlbmU9eyhyb3V0ZSwgbmF2aWdhdG9yKSA9PlxuICogICAgICAgPE15U2NlbmVDb21wb25lbnRcbiAqICAgICAgICAgbmFtZT17cm91dGUubmFtZX1cbiAqICAgICAgICAgb25Gb3J3YXJkPXsoKSA9PiB7XG4gKiAgICAgICAgICAgbGV0IG5leHRJbmRleCA9IHJvdXRlLmluZGV4ICsgMTtcbiAqICAgICAgICAgICBuYXZpZ2F0b3IucHVzaCh7XG4gKiAgICAgICAgICAgICBuYW1lOiAnU2NlbmUgJyArIG5leHRJbmRleCxcbiAqICAgICAgICAgICAgIGluZGV4OiBuZXh0SW5kZXgsXG4gKiAgICAgICAgICAgfSk7XG4gKiAgICAgICAgIH19XG4gKiAgICAgICAgIG9uQmFjaz17KCkgPT4ge1xuICogICAgICAgICAgIGlmIChyb3V0ZS5pbmRleCA+IDApIHtcbiAqICAgICAgICAgICAgIG5hdmlnYXRvci5wb3AoKTtcbiAqICAgICAgICAgICB9XG4gKiAgICAgICAgIH19XG4gKiAgICAgICAvPlxuICogICAgIH1cbiAqICAgLz5cbiAqIGBgYFxuICpcbiAqICMjIyBOYXZpZ2F0b3IgTWV0aG9kc1xuICpcbiAqIElmIHlvdSBoYXZlIGEgcmVmIHRvIHRoZSBOYXZpZ2F0b3IgZWxlbWVudCwgeW91IGNhbiBpbnZva2Ugc2V2ZXJhbCBtZXRob2RzXG4gKiBvbiBpdCB0byB0cmlnZ2VyIG5hdmlnYXRpb246XG4gKlxuICogIC0gYGdldEN1cnJlbnRSb3V0ZXMoKWAgLSByZXR1cm5zIHRoZSBjdXJyZW50IGxpc3Qgb2Ygcm91dGVzXG4gKiAgLSBganVtcEJhY2soKWAgLSBKdW1wIGJhY2t3YXJkIHdpdGhvdXQgdW5tb3VudGluZyB0aGUgY3VycmVudCBzY2VuZVxuICogIC0gYGp1bXBGb3J3YXJkKClgIC0gSnVtcCBmb3J3YXJkIHRvIHRoZSBuZXh0IHNjZW5lIGluIHRoZSByb3V0ZSBzdGFja1xuICogIC0gYGp1bXBUbyhyb3V0ZSlgIC0gVHJhbnNpdGlvbiB0byBhbiBleGlzdGluZyBzY2VuZSB3aXRob3V0IHVubW91bnRpbmdcbiAqICAtIGBwdXNoKHJvdXRlKWAgLSBOYXZpZ2F0ZSBmb3J3YXJkIHRvIGEgbmV3IHNjZW5lLCBzcXVhc2hpbmcgYW55IHNjZW5lc1xuICogICAgIHRoYXQgeW91IGNvdWxkIGBqdW1wRm9yd2FyZGAgdG9cbiAqICAtIGBwb3AoKWAgLSBUcmFuc2l0aW9uIGJhY2sgYW5kIHVubW91bnQgdGhlIGN1cnJlbnQgc2NlbmVcbiAqICAtIGByZXBsYWNlKHJvdXRlKWAgLSBSZXBsYWNlIHRoZSBjdXJyZW50IHNjZW5lIHdpdGggYSBuZXcgcm91dGVcbiAqICAtIGByZXBsYWNlQXRJbmRleChyb3V0ZSwgaW5kZXgpYCAtIFJlcGxhY2UgYSBzY2VuZSBhcyBzcGVjaWZpZWQgYnkgYW4gaW5kZXhcbiAqICAtIGByZXBsYWNlUHJldmlvdXMocm91dGUpYCAtIFJlcGxhY2UgdGhlIHByZXZpb3VzIHNjZW5lXG4gKiAgLSBgaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2socm91dGVTdGFjaylgIC0gUmVzZXQgZXZlcnkgc2NlbmUgd2l0aCBhblxuICogICAgIGFycmF5IG9mIHJvdXRlc1xuICogIC0gYHBvcFRvUm91dGUocm91dGUpYCAtIFBvcCB0byBhIHBhcnRpY3VsYXIgc2NlbmUsIGFzIHNwZWNpZmllZCBieSBpdHNcbiAqICAgICByb3V0ZS4gQWxsIHNjZW5lcyBhZnRlciBpdCB3aWxsIGJlIHVubW91bnRlZFxuICogIC0gYHBvcFRvVG9wKClgIC0gUG9wIHRvIHRoZSBmaXJzdCBzY2VuZSBpbiB0aGUgc3RhY2ssIHVubW91bnRpbmcgZXZlcnlcbiAqICAgICBvdGhlciBzY2VuZVxuICpcbiAqL1xubGV0IE5hdmlnYXRvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBmdW5jdGlvbiB0aGF0IGFsbG93cyBjb25maWd1cmF0aW9uIGFib3V0IHNjZW5lIGFuaW1hdGlvbnMgYW5kXG4gICAgICogZ2VzdHVyZXMuIFdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSByb3V0ZSBhbmQgc2hvdWxkIHJldHVybiBhIHNjZW5lXG4gICAgICogY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgKlxuICAgICAqIGBgYFxuICAgICAqIChyb3V0ZSkgPT4gTmF2aWdhdG9yLlNjZW5lQ29uZmlncy5GbG9hdEZyb21SaWdodFxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIGNvbmZpZ3VyZVNjZW5lOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qKlxuICAgICAqIFJlcXVpcmVkIGZ1bmN0aW9uIHdoaWNoIHJlbmRlcnMgdGhlIHNjZW5lIGZvciBhIGdpdmVuIHJvdXRlLiBXaWxsIGJlXG4gICAgICogaW52b2tlZCB3aXRoIHRoZSByb3V0ZSBhbmQgdGhlIG5hdmlnYXRvciBvYmplY3RcbiAgICAgKlxuICAgICAqIGBgYFxuICAgICAqIChyb3V0ZSwgbmF2aWdhdG9yKSA9PlxuICAgICAqICAgPE15U2NlbmVDb21wb25lbnQgdGl0bGU9e3JvdXRlLnRpdGxlfSAvPlxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHJlbmRlclNjZW5lOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgLyoqXG4gICAgICogU3BlY2lmeSBhIHJvdXRlIHRvIHN0YXJ0IG9uLiBBIHJvdXRlIGlzIGFuIG9iamVjdCB0aGF0IHRoZSBuYXZpZ2F0b3JcbiAgICAgKiB3aWxsIHVzZSB0byBpZGVudGlmeSBlYWNoIHNjZW5lIHRvIHJlbmRlci4gYGluaXRpYWxSb3V0ZWAgbXVzdCBiZVxuICAgICAqIGEgcm91dGUgaW4gdGhlIGBpbml0aWFsUm91dGVTdGFja2AgaWYgYm90aCBwcm9wcyBhcmUgcHJvdmlkZWQuIFRoZVxuICAgICAqIGBpbml0aWFsUm91dGVgIHdpbGwgZGVmYXVsdCB0byB0aGUgbGFzdCBpdGVtIGluIHRoZSBgaW5pdGlhbFJvdXRlU3RhY2tgLlxuICAgICAqL1xuICAgIGluaXRpYWxSb3V0ZTogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgIC8qKlxuICAgICAqIFByb3ZpZGUgYSBzZXQgb2Ygcm91dGVzIHRvIGluaXRpYWxseSBtb3VudC4gUmVxdWlyZWQgaWYgbm8gaW5pdGlhbFJvdXRlXG4gICAgICogaXMgcHJvdmlkZWQuIE90aGVyd2lzZSwgaXQgd2lsbCBkZWZhdWx0IHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgb25seSB0aGVcbiAgICAgKiBgaW5pdGlhbFJvdXRlYFxuICAgICAqL1xuICAgIGluaXRpYWxSb3V0ZVN0YWNrOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogVXNlIGBuYXZpZ2F0aW9uQ29udGV4dC5hZGRMaXN0ZW5lcignd2lsbGZvY3VzJywgY2FsbGJhY2spYCBpbnN0ZWFkLlxuICAgICAqXG4gICAgICogV2lsbCBlbWl0IHRoZSB0YXJnZXQgcm91dGUgdXBvbiBtb3VudGluZyBhbmQgYmVmb3JlIGVhY2ggbmF2IHRyYW5zaXRpb25cbiAgICAgKi9cbiAgICBvbldpbGxGb2N1czogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIFVzZSBgbmF2aWdhdGlvbkNvbnRleHQuYWRkTGlzdGVuZXIoJ2RpZGZvY3VzJywgY2FsbGJhY2spYCBpbnN0ZWFkLlxuICAgICAqXG4gICAgICogV2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbmV3IHJvdXRlIG9mIGVhY2ggc2NlbmUgYWZ0ZXIgdGhlIHRyYW5zaXRpb24gaXNcbiAgICAgKiBjb21wbGV0ZSBvciBhZnRlciB0aGUgaW5pdGlhbCBtb3VudGluZ1xuICAgICAqL1xuICAgIG9uRGlkRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWxseSBwcm92aWRlIGEgbmF2aWdhdGlvbiBiYXIgdGhhdCBwZXJzaXN0cyBhY3Jvc3Mgc2NlbmVcbiAgICAgKiB0cmFuc2l0aW9uc1xuICAgICAqL1xuICAgIG5hdmlnYXRpb25CYXI6IFByb3BUeXBlcy5ub2RlLFxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWxseSBwcm92aWRlIHRoZSBuYXZpZ2F0b3Igb2JqZWN0IGZyb20gYSBwYXJlbnQgTmF2aWdhdG9yXG4gICAgICovXG4gICAgbmF2aWdhdG9yOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgLyoqXG4gICAgICogU3R5bGVzIHRvIGFwcGx5IHRvIHRoZSBjb250YWluZXIgb2YgZWFjaCBzY2VuZVxuICAgICAqL1xuICAgIHNjZW5lU3R5bGU6IFZpZXcucHJvcFR5cGVzLnN0eWxlLFxuICB9LFxuXG4gIHN0YXRpY3M6IHtcbiAgICBCcmVhZGNydW1iTmF2aWdhdGlvbkJhcjogTmF2aWdhdG9yQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIsXG4gICAgTmF2aWdhdGlvbkJhcjogTmF2aWdhdG9yTmF2aWdhdGlvbkJhcixcbiAgICBTY2VuZUNvbmZpZ3M6IE5hdmlnYXRvclNjZW5lQ29uZmlncyxcbiAgfSxcblxuICBtaXhpbnM6IFtUaW1lck1peGluLCBJbnRlcmFjdGlvbk1peGluLCBTdWJzY3JpYmFibGUuTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZ3VyZVNjZW5lOiAoKSA9PiBOYXZpZ2F0b3JTY2VuZUNvbmZpZ3MuUHVzaEZyb21SaWdodCxcbiAgICAgIHNjZW5lU3R5bGU6IHN0eWxlcy5kZWZhdWx0U2NlbmVTdHlsZSxcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcmVuZGVyZWRTY2VuZU1hcCA9IG5ldyBNYXAoKTtcblxuICAgIGxldCByb3V0ZVN0YWNrID0gdGhpcy5wcm9wcy5pbml0aWFsUm91dGVTdGFjayB8fCBbdGhpcy5wcm9wcy5pbml0aWFsUm91dGVdO1xuICAgIGludmFyaWFudChcbiAgICAgIHJvdXRlU3RhY2subGVuZ3RoID49IDEsXG4gICAgICAnTmF2aWdhdG9yIHJlcXVpcmVzIHByb3BzLmluaXRpYWxSb3V0ZSBvciBwcm9wcy5pbml0aWFsUm91dGVTdGFjay4nXG4gICAgKTtcbiAgICBsZXQgaW5pdGlhbFJvdXRlSW5kZXggPSByb3V0ZVN0YWNrLmxlbmd0aCAtIDE7XG4gICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFJvdXRlKSB7XG4gICAgICBpbml0aWFsUm91dGVJbmRleCA9IHJvdXRlU3RhY2suaW5kZXhPZih0aGlzLnByb3BzLmluaXRpYWxSb3V0ZSk7XG4gICAgICBpbnZhcmlhbnQoXG4gICAgICAgIGluaXRpYWxSb3V0ZUluZGV4ICE9PSAtMSxcbiAgICAgICAgJ2luaXRpYWxSb3V0ZSBpcyBub3QgaW4gaW5pdGlhbFJvdXRlU3RhY2suJ1xuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IHJvdXRlU3RhY2subWFwKFxuICAgICAgICAocm91dGUpID0+IHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpXG4gICAgICApLFxuICAgICAgcm91dGVTdGFjayxcbiAgICAgIHByZXNlbnRlZEluZGV4OiBpbml0aWFsUm91dGVJbmRleCxcbiAgICAgIHRyYW5zaXRpb25Gcm9tSW5kZXg6IG51bGwsXG4gICAgICBhY3RpdmVHZXN0dXJlOiBudWxsLFxuICAgICAgcGVuZGluZ0dlc3R1cmVQcm9ncmVzczogbnVsbCxcbiAgICAgIHRyYW5zaXRpb25RdWV1ZTogW10sXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRPRE8odDc0ODk1MDMpOiBEb24ndCBuZWVkIHRoaXMgb25jZSBFUzYgQ2xhc3MgbGFuZGVkLlxuICAgIHRoaXMuX19kZWZpbmVHZXR0ZXJfXygnbmF2aWdhdGlvbkNvbnRleHQnLCB0aGlzLl9nZXROYXZpZ2F0aW9uQ29udGV4dCk7XG5cbiAgICB0aGlzLl9zdWJSb3V0ZUZvY3VzID0gW107XG4gICAgdGhpcy5wYXJlbnROYXZpZ2F0b3IgPSB0aGlzLnByb3BzLm5hdmlnYXRvcjtcbiAgICB0aGlzLl9oYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuc3ByaW5nU3lzdGVtID0gbmV3IHJlYm91bmQuU3ByaW5nU3lzdGVtKCk7XG4gICAgdGhpcy5zcHJpbmcgPSB0aGlzLnNwcmluZ1N5c3RlbS5jcmVhdGVTcHJpbmcoKTtcbiAgICB0aGlzLnNwcmluZy5zZXRSZXN0U3BlZWRUaHJlc2hvbGQoMC4wNSk7XG4gICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgIHRoaXMuc3ByaW5nLmFkZExpc3RlbmVyKHtcbiAgICAgIG9uU3ByaW5nRW5kU3RhdGVDaGFuZ2U6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSkge1xuICAgICAgICAgIHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlID0gdGhpcy5jcmVhdGVJbnRlcmFjdGlvbkhhbmRsZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25TcHJpbmdVcGRhdGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5faGFuZGxlU3ByaW5nVXBkYXRlKCk7XG4gICAgICB9LFxuICAgICAgb25TcHJpbmdBdFJlc3Q6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fY29tcGxldGVUcmFuc2l0aW9uKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRoaXMucGFuR2VzdHVyZSA9IFBhblJlc3BvbmRlci5jcmVhdGUoe1xuICAgICAgb25Nb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyOiB0aGlzLl9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyLFxuICAgICAgb25QYW5SZXNwb25kZXJHcmFudDogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyR3JhbnQsXG4gICAgICBvblBhblJlc3BvbmRlclJlbGVhc2U6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlclJlbGVhc2UsXG4gICAgICBvblBhblJlc3BvbmRlck1vdmU6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlck1vdmUsXG4gICAgICBvblBhblJlc3BvbmRlclRlcm1pbmF0ZTogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyVGVybWluYXRlLFxuICAgIH0pO1xuICAgIHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlID0gbnVsbDtcbiAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XSk7XG4gICAgdGhpcy5oYXNoQ2hhbmdlZCA9IGZhbHNlO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9oYW5kbGVTcHJpbmdVcGRhdGUoKTtcbiAgICB0aGlzLl9lbWl0RGlkRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3RoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhdKTtcblxuICAgIC8vIE5PVEU6IExpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgY3VycmVudCBsb2NhdGlvbi4gVGhlXG4gICAgLy8gbGlzdGVuZXIgaXMgY2FsbGVkIG9uY2UgaW1tZWRpYXRlbHkuXG4gICAgX3VubGlzdGVuID0gaGlzdG9yeS5saXN0ZW4oZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgIGxldCBkZXN0SW5kZXggPSAwO1xuICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJy9zY2VuZV8nKSAhPSAtMSkge1xuICAgICAgICBkZXN0SW5kZXggPSBwYXJzZUludChsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKCcvc2NlbmVfJywgJycpKTtcbiAgICAgIH1cbiAgICAgIGlmIChkZXN0SW5kZXggPCB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoICYmIGRlc3RJbmRleCAhPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuaGFzaENoYW5nZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9qdW1wTihkZXN0SW5kZXggLSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgICAgICAgdGhpcy5oYXNoQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCkge1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFdoZW4geW91J3JlIGZpbmlzaGVkLCBzdG9wIHRoZSBsaXN0ZW5lci5cbiAgICBfdW5saXN0ZW4oKTtcblxuICB9LFxuXG4gIF9uZXh0Um91dGVJRDogZnVuY3Rpb24gKHJlcGxhY2UpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAtIChyZXBsYWNlID8gMSA6IDApXG4gIH0sXG5cbiAgX2dldFJvdXRlSUQ6IGZ1bmN0aW9uIChyb3V0ZSwgYWN0aW9uKSB7XG4gICAgaWYgKHJvdXRlID09PSBudWxsIHx8IHR5cGVvZiByb3V0ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdHJpbmcocm91dGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suaW5kZXhPZihyb3V0ZSlcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtSb3V0ZVN0YWNrfSBuZXh0Um91dGVTdGFjayBOZXh0IHJvdXRlIHN0YWNrIHRvIHJlaW5pdGlhbGl6ZS4gVGhpc1xuICAgKiBkb2Vzbid0IGFjY2VwdCBzdGFjayBpdGVtIGBpZGBzLCB3aGljaCBpbXBsaWVzIHRoYXQgYWxsIGV4aXN0aW5nIGl0ZW1zIGFyZVxuICAgKiBkZXN0cm95ZWQsIGFuZCB0aGVuIHBvdGVudGlhbGx5IHJlY3JlYXRlZCBhY2NvcmRpbmcgdG8gYHJvdXRlU3RhY2tgLiBEb2VzXG4gICAqIG5vdCBhbmltYXRlLCBpbW1lZGlhdGVseSByZXBsYWNlcyBhbmQgcmVyZW5kZXJzIG5hdmlnYXRpb24gYmFyIGFuZCBzdGFja1xuICAgKiBpdGVtcy5cbiAgICovXG4gIGltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrOiBmdW5jdGlvbihuZXh0Um91dGVTdGFjaykge1xuICAgIGNvbnNvbGUud2FybignbmF2aWdhdG9yLmltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrIGJyZWFrcyB0aGUgYmFjayBidXR0b24hJylcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgY29uc3QgcHJldkxlbmd0aCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGhcbiAgICBsZXQgZGVzdEluZGV4ID0gbmV4dFJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJvdXRlU3RhY2s6IG5leHRSb3V0ZVN0YWNrLFxuICAgICAgc2NlbmVDb25maWdTdGFjazogbmV4dFJvdXRlU3RhY2subWFwKFxuICAgICAgICB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lXG4gICAgICApLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleCxcbiAgICAgIGFjdGl2ZUdlc3R1cmU6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsLFxuICAgICAgdHJhbnNpdGlvblF1ZXVlOiBbXSxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLl9oYW5kbGVTcHJpbmdVcGRhdGUoKTtcbiAgICB9KTtcbiAgfSxcblxuICBfdHJhbnNpdGlvblRvOiBmdW5jdGlvbihkZXN0SW5kZXgsIHZlbG9jaXR5LCBqdW1wU3ByaW5nVG8sIGNiKSB7XG4gICAgaWYgKGRlc3RJbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgdGhpcy5faGlkZVNjZW5lcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25RdWV1ZS5wdXNoKHtcbiAgICAgICAgZGVzdEluZGV4LFxuICAgICAgICB2ZWxvY2l0eSxcbiAgICAgICAgY2IsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFuc2l0aW9uRnJvbUluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleFxuICAgIC8vIGdpdmUgc2NlbmVzIGEgY2hhbmNlIHRvIHJlLXJlbmRlclxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleCxcbiAgICAgIHRyYW5zaXRpb25Gcm9tSW5kZXgsXG4gICAgICB0cmFuc2l0aW9uQ2I6IGNiXG4gICAgfSlcblxuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICAvLyBpZiAoQW5pbWF0aW9uc0RlYnVnTW9kdWxlKSB7XG4gICAgLy8gICBBbmltYXRpb25zRGVidWdNb2R1bGUuc3RhcnRSZWNvcmRpbmdGcHMoKTtcbiAgICAvLyB9XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3RyYW5zaXRpb25Gcm9tSW5kZXhdIHx8XG4gICAgICB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbZGVzdEluZGV4XTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBzY2VuZUNvbmZpZyxcbiAgICAgICdDYW5ub3QgY29uZmlndXJlIHNjZW5lIGF0IGluZGV4ICcgKyB0cmFuc2l0aW9uRnJvbUluZGV4XG4gICAgKTtcbiAgICBpZiAoanVtcFNwcmluZ1RvICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShqdW1wU3ByaW5nVG8pO1xuICAgIH1cbiAgICB0aGlzLnNwcmluZy5zZXRPdmVyc2hvb3RDbGFtcGluZ0VuYWJsZWQodHJ1ZSk7XG4gICAgdGhpcy5zcHJpbmcuZ2V0U3ByaW5nQ29uZmlnKCkuZnJpY3Rpb24gPSBzY2VuZUNvbmZpZy5zcHJpbmdGcmljdGlvbjtcbiAgICB0aGlzLnNwcmluZy5nZXRTcHJpbmdDb25maWcoKS50ZW5zaW9uID0gc2NlbmVDb25maWcuc3ByaW5nVGVuc2lvbjtcbiAgICB0aGlzLnNwcmluZy5zZXRWZWxvY2l0eSh2ZWxvY2l0eSB8fCBzY2VuZUNvbmZpZy5kZWZhdWx0VHJhbnNpdGlvblZlbG9jaXR5KTtcbiAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSgxKTtcbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGZvciBlYWNoIGZyYW1lIG9mIGVpdGhlciBhIGdlc3R1cmUgb3IgYSB0cmFuc2l0aW9uLiBJZiBib3RoIGFyZVxuICAgKiBoYXBwZW5pbmcsIHdlIG9ubHkgc2V0IHZhbHVlcyBmb3IgdGhlIHRyYW5zaXRpb24gYW5kIHRoZSBnZXN0dXJlIHdpbGwgY2F0Y2ggdXAgbGF0ZXJcbiAgICovXG4gIF9oYW5kbGVTcHJpbmdVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFByaW9yaXRpemUgaGFuZGxpbmcgdHJhbnNpdGlvbiBpbiBwcm9ncmVzcyBvdmVyIGEgZ2VzdHVyZTpcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKFxuICAgICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXgsXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlICE9IG51bGwpIHtcbiAgICAgIGxldCBwcmVzZW50ZWRUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4oXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHByZXNlbnRlZFRvSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGF0IHRoZSBlbmQgb2YgYSB0cmFuc2l0aW9uIHN0YXJ0ZWQgYnkgdHJhbnNpdGlvblRvLCBhbmQgd2hlbiB0aGUgc3ByaW5nIGNhdGNoZXMgdXAgdG8gYSBwZW5kaW5nIGdlc3R1cmVcbiAgICovXG4gIF9jb21wbGV0ZVRyYW5zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMSAmJiB0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBoYXMgZmluaXNoZWQgY2F0Y2hpbmcgdXAgdG8gYSBnZXN0dXJlIGluIHByb2dyZXNzLiBSZW1vdmUgdGhlIHBlbmRpbmcgcHJvZ3Jlc3NcbiAgICAgIC8vIGFuZCB3ZSB3aWxsIGJlIGluIGEgbm9ybWFsIGFjdGl2ZUdlc3R1cmUgc3RhdGVcbiAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb25BbmltYXRpb25FbmQoKTtcbiAgICBsZXQgcHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCBkaWRGb2N1c1JvdXRlID0gdGhpcy5fc3ViUm91dGVGb2N1c1twcmVzZW50ZWRJbmRleF0gfHwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3ByZXNlbnRlZEluZGV4XTtcbiAgICB0aGlzLl9lbWl0RGlkRm9jdXMoZGlkRm9jdXNSb3V0ZSk7XG4gICAgLy8gaWYgKEFuaW1hdGlvbnNEZWJ1Z01vZHVsZSkge1xuICAgIC8vICAgQW5pbWF0aW9uc0RlYnVnTW9kdWxlLnN0b3BSZWNvcmRpbmdGcHMoRGF0ZS5ub3coKSk7XG4gICAgLy8gfVxuICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9IG51bGw7XG4gICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgIHRoaXMuX2hpZGVTY2VuZXMoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IpIHtcbiAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkNiKCk7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25DYiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSkge1xuICAgICAgdGhpcy5jbGVhckludGVyYWN0aW9uSGFuZGxlKHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKTtcbiAgICAgIHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcykge1xuICAgICAgLy8gQSB0cmFuc2l0aW9uIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFscmVhZHkgYW5vdGhlciBnZXN0dXJlIGhhcHBlbmluZy5cbiAgICAgIC8vIEVuYWJsZSB0aGUgc2NlbmUgYW5kIHNldCB0aGUgc3ByaW5nIHRvIGNhdGNoIHVwIHdpdGggdGhlIG5ldyBnZXN0dXJlXG4gICAgICBsZXQgZ2VzdHVyZVRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShnZXN0dXJlVG9JbmRleCk7XG4gICAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUubGVuZ3RoKSB7XG4gICAgICBsZXQgcXVldWVkVHJhbnNpdGlvbiA9IHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLnNoaWZ0KCk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCk7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1txdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleF0pO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICBxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi52ZWxvY2l0eSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi5jYlxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXREaWRGb2N1czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLm5hdmlnYXRpb25Db250ZXh0LmVtaXQoJ2RpZGZvY3VzJywge3JvdXRlOiByb3V0ZX0pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRGb2N1cykge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXRXaWxsRm9jdXM6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5uYXZpZ2F0aW9uQ29udGV4dC5lbWl0KCd3aWxsZm9jdXMnLCB7cm91dGU6IHJvdXRlfSk7XG5cbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cykge1xuICAgICAgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm9uV2lsbEZvY3VzKSB7XG4gICAgICB0aGlzLnByb3BzLm9uV2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhpZGVzIGFsbCBzY2VuZXMgdGhhdCB3ZSBhcmUgbm90IGN1cnJlbnRseSBvbiwgZ2VzdHVyaW5nIHRvLCBvciB0cmFuc2l0aW9uaW5nIGZyb21cbiAgICovXG4gIF9oaWRlU2NlbmVzOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgZ2VzdHVyaW5nVG9JbmRleCA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgZ2VzdHVyaW5nVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gZ2VzdHVyaW5nVG9JbmRleCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Rpc2FibGVTY2VuZShpKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFB1c2ggYSBzY2VuZSBvZmYgdGhlIHNjcmVlbiwgc28gdGhhdCBvcGFjaXR5OjAgc2NlbmVzIHdpbGwgbm90IGJsb2NrIHRvdWNoZXMgc2VudCB0byB0aGUgcHJlc2VudGVkIHNjZW5lc1xuICAgKi9cbiAgX2Rpc2FibGVTY2VuZTogZnVuY3Rpb24oc2NlbmVJbmRleCkge1xuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTKTtcbiAgfSxcblxuICAvKipcbiAgICogUHV0IHRoZSBzY2VuZSBiYWNrIGludG8gdGhlIHN0YXRlIGFzIGRlZmluZWQgYnkgcHJvcHMuc2NlbmVTdHlsZSwgc28gdHJhbnNpdGlvbnMgY2FuIGhhcHBlbiBub3JtYWxseVxuICAgKi9cbiAgX2VuYWJsZVNjZW5lOiBmdW5jdGlvbihzY2VuZUluZGV4KSB7XG4gICAgLy8gRmlyc3QsIGRldGVybWluZSB3aGF0IHRoZSBkZWZpbmVkIHN0eWxlcyBhcmUgZm9yIHNjZW5lcyBpbiB0aGlzIG5hdmlnYXRvclxuICAgIGxldCBzY2VuZVN0eWxlID0gZmxhdHRlblN0eWxlKFtzdHlsZXMuYmFzZVNjZW5lLCB0aGlzLnByb3BzLnNjZW5lU3R5bGVdKTtcbiAgICAvLyBUaGVuIHJlc3RvcmUgdGhlIHBvaW50ZXIgZXZlbnRzIGFuZCB0b3AgdmFsdWUgZm9yIHRoaXMgc2NlbmVcbiAgICBsZXQgc2NlbmVOYXRpdmVQcm9wcyA9IHtcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdhdXRvJyxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHRvcDogc2NlbmVTdHlsZS50b3AsXG4gICAgICAgIGJvdHRvbTogc2NlbmVTdHlsZS5ib3R0b20sXG4gICAgICAgIC4uLnZpc2libGVTdHlsZVxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gaWYgKHNjZW5lSW5kZXggIT09IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAmJlxuICAgIC8vICAgICBzY2VuZUluZGV4ICE9PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgLy8gICAvLyBJZiB3ZSBhcmUgbm90IGluIGEgdHJhbnNpdGlvbiBmcm9tIHRoaXMgaW5kZXgsIG1ha2Ugc3VyZSBvcGFjaXR5IGlzIDBcbiAgICAvLyAgIC8vIHRvIHByZXZlbnQgdGhlIGVuYWJsZWQgc2NlbmUgZnJvbSBmbGFzaGluZyBvdmVyIHRoZSBwcmVzZW50ZWQgc2NlbmVcbiAgICAvLyAgIHNjZW5lTmF0aXZlUHJvcHMucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAvLyAgIE9iamVjdC5hc3NpZ24oc2NlbmVOYXRpdmVQcm9wcy5zdHlsZSwgU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTLnN0eWxlKVxuICAgIC8vIH1cblxuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoc2NlbmVOYXRpdmVQcm9wcyk7XG4gIH0sXG5cbiAgX29uQW5pbWF0aW9uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBmcm9tSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCB0b0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIGZyb21JbmRleCA9IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgdG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQoZnJvbUluZGV4LCB0cnVlKTtcbiAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCh0b0luZGV4LCB0cnVlKTtcbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLm9uQW5pbWF0aW9uU3RhcnQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvblN0YXJ0KGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkFuaW1hdGlvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1heCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPD0gbWF4OyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZChpbmRleCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIub25BbmltYXRpb25FbmQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IGZ1bmN0aW9uKHNjZW5lSW5kZXgsIHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlKSB7XG4gICAgbGV0IHZpZXdBdEluZGV4ID0gdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlld0F0SW5kZXguc2V0TmF0aXZlUHJvcHMoIHtyZW5kZXJUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlfSk7XG4gIH0sXG5cbiAgX2hhbmRsZVRvdWNoU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSBHRVNUVVJFX0FDVElPTlM7XG4gIH0sXG5cbiAgX2hhbmRsZU1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXI6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAoIXNjZW5lQ29uZmlnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCA9IHRoaXMuX21hdGNoR2VzdHVyZUFjdGlvbih0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICByZXR1cm4gISF0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQ7XG4gIH0sXG5cbiAgX2RvZXNHZXN0dXJlT3ZlcnN3aXBlOiBmdW5jdGlvbihnZXN0dXJlTmFtZSkge1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUJhY2sgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IDw9IDAgJiZcbiAgICAgIChnZXN0dXJlTmFtZSA9PT0gJ3BvcCcgfHwgZ2VzdHVyZU5hbWUgPT09ICdqdW1wQmFjaycpO1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUZvcndhcmQgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID49IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxICYmXG4gICAgICBnZXN0dXJlTmFtZSA9PT0gJ2p1bXBGb3J3YXJkJztcbiAgICByZXR1cm4gd291bGRPdmVyc3dpcGVGb3J3YXJkIHx8IHdvdWxkT3ZlcnN3aXBlQmFjaztcbiAgfSxcblxuICBfaGFuZGxlUGFuUmVzcG9uZGVyR3JhbnQ6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCxcbiAgICAgICdSZXNwb25kZXIgZ3JhbnRlZCB1bmV4cGVjdGVkbHkuJ1xuICAgICk7XG4gICAgdGhpcy5fYXR0YWNoR2VzdHVyZSh0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQpO1xuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQgPSBudWxsO1xuICB9LFxuXG4gIF9kZWx0YUZvckdlc3R1cmVBY3Rpb246IGZ1bmN0aW9uKGdlc3R1cmVBY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmVBY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3BvcCc6XG4gICAgICBjYXNlICdqdW1wQmFjayc6XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIGNhc2UgJ2p1bXBGb3J3YXJkJzpcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpbnZhcmlhbnQoZmFsc2UsICdVbnN1cHBvcnRlZCBnZXN0dXJlIGFjdGlvbiAnICsgZ2VzdHVyZUFjdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlclJlbGVhc2U6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBsZXQgcmVsZWFzZUdlc3R1cmVBY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmU7XG4gICAgaWYgKCFyZWxlYXNlR2VzdHVyZUFjdGlvbikge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgbWF5IGhhdmUgYmVlbiBkZXRhY2hlZCB3aGlsZSByZXNwb25kZXIsIHNvIHRoZXJlIGlzIG5vIGFjdGlvbiBoZXJlXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCByZWxlYXNlR2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3JlbGVhc2VHZXN0dXJlQWN0aW9uXTtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSA9PT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBpcyBhdCB6ZXJvLCBzbyB0aGUgZ2VzdHVyZSBpcyBhbHJlYWR5IGNvbXBsZXRlXG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgICB0aGlzLl9jb21wbGV0ZVRyYW5zaXRpb24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICBsZXQgaXNUcmF2ZWxJbnZlcnRlZCA9IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCB2ZWxvY2l0eSwgZ2VzdHVyZURpc3RhbmNlO1xuICAgIGlmIChpc1RyYXZlbFZlcnRpY2FsKSB7XG4gICAgICB2ZWxvY2l0eSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLnZ5IDogZ2VzdHVyZVN0YXRlLnZ5O1xuICAgICAgZ2VzdHVyZURpc3RhbmNlID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlbG9jaXR5ID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUudnggOiBnZXN0dXJlU3RhdGUudng7XG4gICAgICBnZXN0dXJlRGlzdGFuY2UgPSBpc1RyYXZlbEludmVydGVkID8gLWdlc3R1cmVTdGF0ZS5keCA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICB9XG4gICAgbGV0IHRyYW5zaXRpb25WZWxvY2l0eSA9IGNsYW1wKC0xMCwgdmVsb2NpdHksIDEwKTtcbiAgICBpZiAoTWF0aC5hYnModmVsb2NpdHkpIDwgcmVsZWFzZUdlc3R1cmUubm90TW92aW5nKSB7XG4gICAgICAvLyBUaGUgZ2VzdHVyZSB2ZWxvY2l0eSBpcyBzbyBzbG93LCBpcyBcIm5vdCBtb3ZpbmdcIlxuICAgICAgbGV0IGhhc0dlc3R1cmVkRW5vdWdoVG9Db21wbGV0ZSA9IGdlc3R1cmVEaXN0YW5jZSA+IHJlbGVhc2VHZXN0dXJlLmZ1bGxEaXN0YW5jZSAqIHJlbGVhc2VHZXN0dXJlLnN0aWxsQ29tcGxldGlvblJhdGlvO1xuICAgICAgdHJhbnNpdGlvblZlbG9jaXR5ID0gaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlID8gcmVsZWFzZUdlc3R1cmUuc25hcFZlbG9jaXR5IDogLXJlbGVhc2VHZXN0dXJlLnNuYXBWZWxvY2l0eTtcbiAgICB9XG4gICAgaWYgKHRyYW5zaXRpb25WZWxvY2l0eSA8IDAgfHwgdGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUocmVsZWFzZUdlc3R1cmVBY3Rpb24pKSB7XG4gICAgICAvLyBUaGlzIGdlc3R1cmUgaXMgdG8gYW4gb3ZlcnN3aXBlZCByZWdpb24gb3IgZG9lcyBub3QgaGF2ZSBlbm91Z2ggdmVsb2NpdHkgdG8gY29tcGxldGVcbiAgICAgIC8vIElmIHdlIGFyZSBjdXJyZW50bHkgbWlkLXRyYW5zaXRpb24sIHRoZW4gdGhpcyBnZXN0dXJlIHdhcyBhIHBlbmRpbmcgZ2VzdHVyZS4gQmVjYXVzZSB0aGlzIGdlc3R1cmUgdGFrZXMgbm8gYWN0aW9uLCB3ZSBjYW4gc3RvcCBoZXJlXG4gICAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ID09IG51bGwpIHtcbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gY3VycmVudCB0cmFuc2l0aW9uLCBzbyB3ZSBuZWVkIHRvIHRyYW5zaXRpb24gYmFjayB0byB0aGUgcHJlc2VudGVkIGluZGV4XG4gICAgICAgIGxldCB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgICAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgICAgICAtIHRyYW5zaXRpb25WZWxvY2l0eSxcbiAgICAgICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgaGFzIGVub3VnaCB2ZWxvY2l0eSB0byBjb21wbGV0ZSwgc28gd2UgdHJhbnNpdGlvbiB0byB0aGUgZ2VzdHVyZSdzIGRlc3RpbmF0aW9uXG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgZGVzdEluZGV4LFxuICAgICAgICB0cmFuc2l0aW9uVmVsb2NpdHksXG4gICAgICAgIG51bGwsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBpZiAocmVsZWFzZUdlc3R1cmVBY3Rpb24gPT09ICdwb3AnKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGVhblNjZW5lc1Bhc3RJbmRleChkZXN0SW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fZGV0YWNoR2VzdHVyZSgpO1xuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIHRoaXMuX2RldGFjaEdlc3R1cmUoKTtcbiAgICBsZXQgdHJhbnNpdGlvbkJhY2tUb1ByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID0gZGVzdEluZGV4O1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgIG51bGwsXG4gICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICApO1xuICB9LFxuXG4gIF9hdHRhY2hHZXN0dXJlOiBmdW5jdGlvbihnZXN0dXJlSWQpIHtcbiAgICB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPSBnZXN0dXJlSWQ7XG4gICAgbGV0IGdlc3R1cmluZ1RvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZ2VzdHVyaW5nVG9JbmRleCk7XG4gIH0sXG5cbiAgX2RldGFjaEdlc3R1cmU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSA9IG51bGw7XG4gICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICB0aGlzLl9oaWRlU2NlbmVzKCk7XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlck1vdmU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3RoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZV07XG4gICAgICByZXR1cm4gdGhpcy5fbW92ZUF0dGFjaGVkR2VzdHVyZShnZXN0dXJlLCBnZXN0dXJlU3RhdGUpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hlZEdlc3R1cmUgPSB0aGlzLl9tYXRjaEdlc3R1cmVBY3Rpb24oR0VTVFVSRV9BQ1RJT05TLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICBpZiAobWF0Y2hlZEdlc3R1cmUpIHtcbiAgICAgIHRoaXMuX2F0dGFjaEdlc3R1cmUobWF0Y2hlZEdlc3R1cmUpO1xuICAgIH1cbiAgfSxcblxuICBfbW92ZUF0dGFjaGVkR2VzdHVyZTogZnVuY3Rpb24oZ2VzdHVyZSwgZ2VzdHVyZVN0YXRlKSB7XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3RvcC10by1ib3R0b20nIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGRpc3RhbmNlID0gaXNUcmF2ZWxWZXJ0aWNhbCA/IGdlc3R1cmVTdGF0ZS5keSA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICBkaXN0YW5jZSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtIGRpc3RhbmNlIDogZGlzdGFuY2U7XG4gICAgbGV0IGdlc3R1cmVEZXRlY3RNb3ZlbWVudCA9IGdlc3R1cmUuZ2VzdHVyZURldGVjdE1vdmVtZW50O1xuICAgIGxldCBuZXh0UHJvZ3Jlc3MgPSAoZGlzdGFuY2UgLSBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQpIC9cbiAgICAgIChnZXN0dXJlLmZ1bGxEaXN0YW5jZSAtIGdlc3R1cmVEZXRlY3RNb3ZlbWVudCk7XG4gICAgaWYgKG5leHRQcm9ncmVzcyA8IDAgJiYgZ2VzdHVyZS5pc0RldGFjaGFibGUpIHtcbiAgICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4odGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCwgZ2VzdHVyaW5nVG9JbmRleCwgMCk7XG4gICAgICB0aGlzLl9kZXRhY2hHZXN0dXJlKCk7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSkge1xuICAgICAgbGV0IGZyaWN0aW9uQ29uc3RhbnQgPSBnZXN0dXJlLm92ZXJzd2lwZS5mcmljdGlvbkNvbnN0YW50O1xuICAgICAgbGV0IGZyaWN0aW9uQnlEaXN0YW5jZSA9IGdlc3R1cmUub3ZlcnN3aXBlLmZyaWN0aW9uQnlEaXN0YW5jZTtcbiAgICAgIGxldCBmcmljdGlvblJhdGlvID0gMSAvICgoZnJpY3Rpb25Db25zdGFudCkgKyAoTWF0aC5hYnMobmV4dFByb2dyZXNzKSAqIGZyaWN0aW9uQnlEaXN0YW5jZSkpO1xuICAgICAgbmV4dFByb2dyZXNzICo9IGZyaWN0aW9uUmF0aW87XG4gICAgfVxuICAgIG5leHRQcm9ncmVzcyA9IGNsYW1wKDAsIG5leHRQcm9ncmVzcywgMSk7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MgPSBuZXh0UHJvZ3Jlc3M7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEVuZFZhbHVlKG5leHRQcm9ncmVzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShuZXh0UHJvZ3Jlc3MpO1xuICAgIH1cbiAgfSxcblxuICBfbWF0Y2hHZXN0dXJlQWN0aW9uOiBmdW5jdGlvbihlbGlnaWJsZUdlc3R1cmVzLCBnZXN0dXJlcywgZ2VzdHVyZVN0YXRlKSB7XG4gICAgaWYgKCFnZXN0dXJlcykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBtYXRjaGVkR2VzdHVyZSA9IG51bGw7XG4gICAgZWxpZ2libGVHZXN0dXJlcy5zb21lKChnZXN0dXJlTmFtZSwgZ2VzdHVyZUluZGV4KSA9PiB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IGdlc3R1cmVzW2dlc3R1cmVOYW1lXTtcbiAgICAgIGlmICghZ2VzdHVyZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZ2VzdHVyZS5vdmVyc3dpcGUgPT0gbnVsbCAmJiB0aGlzLl9kb2VzR2VzdHVyZU92ZXJzd2lwZShnZXN0dXJlTmFtZSkpIHtcbiAgICAgICAgLy8gY2Fubm90IHN3aXBlIHBhc3QgZmlyc3Qgb3IgbGFzdCBzY2VuZSB3aXRob3V0IG92ZXJzd2lwaW5nXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgICBsZXQgY3VycmVudExvYyA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUubW92ZVkgOiBnZXN0dXJlU3RhdGUubW92ZVg7XG4gICAgICBsZXQgdHJhdmVsRGlzdCA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgICBsZXQgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9XG4gICAgICAgIGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHggOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgICBsZXQgZWRnZUhpdFdpZHRoID0gZ2VzdHVyZS5lZGdlSGl0V2lkdGg7XG4gICAgICBpZiAoaXNUcmF2ZWxJbnZlcnRlZCkge1xuICAgICAgICBjdXJyZW50TG9jID0gLWN1cnJlbnRMb2M7XG4gICAgICAgIHRyYXZlbERpc3QgPSAtdHJhdmVsRGlzdDtcbiAgICAgICAgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9IC1vcHBvc2l0ZUF4aXNUcmF2ZWxEaXN0O1xuICAgICAgICBlZGdlSGl0V2lkdGggPSBpc1RyYXZlbFZlcnRpY2FsID9cbiAgICAgICAgICAtKFNDUkVFTl9IRUlHSFQgLSBlZGdlSGl0V2lkdGgpIDpcbiAgICAgICAgICAtKFNDUkVFTl9XSURUSCAtIGVkZ2VIaXRXaWR0aCk7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVN0YXJ0ZWRJblJlZ2lvbiA9IGdlc3R1cmUuZWRnZUhpdFdpZHRoID09IG51bGwgfHxcbiAgICAgICAgY3VycmVudExvYyA8IGVkZ2VIaXRXaWR0aDtcbiAgICAgIGlmICghbW92ZVN0YXJ0ZWRJblJlZ2lvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVRyYXZlbGxlZEZhckVub3VnaCA9IHRyYXZlbERpc3QgPj0gZ2VzdHVyZS5nZXN0dXJlRGV0ZWN0TW92ZW1lbnQ7XG4gICAgICBpZiAoIW1vdmVUcmF2ZWxsZWRGYXJFbm91Z2gpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbGV0IGRpcmVjdGlvbklzQ29ycmVjdCA9IE1hdGguYWJzKHRyYXZlbERpc3QpID4gTWF0aC5hYnMob3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCkgKiBnZXN0dXJlLmRpcmVjdGlvblJhdGlvO1xuICAgICAgaWYgKGRpcmVjdGlvbklzQ29ycmVjdCkge1xuICAgICAgICBtYXRjaGVkR2VzdHVyZSA9IGdlc3R1cmVOYW1lO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLnNsaWNlKCkuc3BsaWNlKGdlc3R1cmVJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoZWRHZXN0dXJlO1xuICB9LFxuXG4gIF90cmFuc2l0aW9uU2NlbmVTdHlsZTogZnVuY3Rpb24oZnJvbUluZGV4LCB0b0luZGV4LCBwcm9ncmVzcywgaW5kZXgpIHtcbiAgICBsZXQgdmlld0F0SW5kZXggPSB0aGlzLnJlZnNbJ3NjZW5lXycgKyBpbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVXNlIHRvSW5kZXggYW5pbWF0aW9uIHdoZW4gd2UgbW92ZSBmb3J3YXJkcy4gVXNlIGZyb21JbmRleCB3aGVuIHdlIG1vdmUgYmFja1xuICAgIGxldCBzY2VuZUNvbmZpZ0luZGV4ID0gZnJvbUluZGV4IDwgdG9JbmRleCA/IHRvSW5kZXggOiBmcm9tSW5kZXg7XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3NjZW5lQ29uZmlnSW5kZXhdO1xuICAgIC8vIHRoaXMgaGFwcGVucyBmb3Igb3ZlcnN3aXBpbmcgd2hlbiB0aGVyZSBpcyBubyBzY2VuZSBhdCB0b0luZGV4XG4gICAgaWYgKCFzY2VuZUNvbmZpZykge1xuICAgICAgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbc2NlbmVDb25maWdJbmRleCAtIDFdO1xuICAgIH1cbiAgICBsZXQgc3R5bGVUb1VzZSA9IHt9O1xuICAgIGxldCB1c2VGbiA9IGluZGV4IDwgZnJvbUluZGV4IHx8IGluZGV4IDwgdG9JbmRleCA/XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLm91dCA6XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLmludG87XG4gICAgbGV0IGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MgPSBmcm9tSW5kZXggPCB0b0luZGV4ID8gcHJvZ3Jlc3MgOiAxIC0gcHJvZ3Jlc3M7XG4gICAgbGV0IGRpZENoYW5nZSA9IHVzZUZuKHN0eWxlVG9Vc2UsIGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MpO1xuICAgIGlmIChkaWRDaGFuZ2UpIHtcbiAgICAgIHZpZXdBdEluZGV4LnNldE5hdGl2ZVByb3BzKHtzdHlsZTogc3R5bGVUb1VzZX0pO1xuICAgIH1cbiAgfSxcblxuICBfdHJhbnNpdGlvbkJldHdlZW46IGZ1bmN0aW9uKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uU2NlbmVTdHlsZShmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzLCBmcm9tSW5kZXgpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25TY2VuZVN0eWxlKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MsIHRvSW5kZXgpO1xuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MgJiYgdG9JbmRleCA+PSAwICYmIGZyb21JbmRleCA+PSAwKSB7XG4gICAgICBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MsIGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVSZXNwb25kZXJUZXJtaW5hdGlvblJlcXVlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBfZ2V0RGVzdEluZGV4V2l0aGluQm91bmRzOiBmdW5jdGlvbihuKSB7XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgbGV0IGRlc3RJbmRleCA9IGN1cnJlbnRJbmRleCArIG47XG4gICAgaW52YXJpYW50KFxuICAgICAgZGVzdEluZGV4ID49IDAsXG4gICAgICAnQ2Fubm90IGp1bXAgYmVmb3JlIHRoZSBmaXJzdCByb3V0ZS4nXG4gICAgKTtcbiAgICBsZXQgbWF4SW5kZXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBtYXhJbmRleCA+PSBkZXN0SW5kZXgsXG4gICAgICAnQ2Fubm90IGp1bXAgcGFzdCB0aGUgbGFzdCByb3V0ZS4nXG4gICAgKTtcbiAgICByZXR1cm4gZGVzdEluZGV4O1xuICB9LFxuXG4gIF9qdW1wTjogZnVuY3Rpb24obikge1xuICAgIGxldCBkZXN0SW5kZXggPSB0aGlzLl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMobik7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZGVzdEluZGV4KTtcbiAgICBjb25zdCByb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdXG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgdGhpcy5fdHJhbnNpdGlvblRvKGRlc3RJbmRleCk7XG4gICAgaWYgKCF0aGlzLmhhc2hDaGFuZ2VkKSB7XG4gICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoeyBpbmRleDogZGVzdEluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkuZ28obik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGlmIChuIDwgMCkge1xuICAgIC8vICAgLy8gX191aWQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZVxuICAgIC8vICAgX191aWQgPSBNYXRoLm1heChfX3VpZCArIG4sIDApO1xuICAgIC8vIH1cbiAgfSxcblxuICBqdW1wVG86IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBkZXN0SW5kZXggIT09IC0xLFxuICAgICAgJ0Nhbm5vdCBqdW1wIHRvIHJvdXRlIHRoYXQgaXMgbm90IGluIHRoZSByb3V0ZSBzdGFjaydcbiAgICApO1xuICAgIHRoaXMuX2p1bXBOKGRlc3RJbmRleCAtIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICB9LFxuXG4gIGp1bXBGb3J3YXJkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9qdW1wTigxKTtcbiAgfSxcblxuICBqdW1wQmFjazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fanVtcE4oLTEpO1xuICB9LFxuXG4gIHB1c2g6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgaW52YXJpYW50KCEhcm91dGUsICdNdXN0IHN1cHBseSByb3V0ZSB0byBwdXNoJyk7XG4gICAgbGV0IGFjdGl2ZUxlbmd0aCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyAxO1xuICAgIGxldCBhY3RpdmVTdGFjayA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5zbGljZSgwLCBhY3RpdmVMZW5ndGgpO1xuICAgIGxldCBhY3RpdmVBbmltYXRpb25Db25maWdTdGFjayA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFjay5zbGljZSgwLCBhY3RpdmVMZW5ndGgpO1xuICAgIGxldCBuZXh0U3RhY2sgPSBhY3RpdmVTdGFjay5jb25jYXQoW3JvdXRlXSk7XG4gICAgbGV0IGRlc3RJbmRleCA9IG5leHRTdGFjay5sZW5ndGggLSAxO1xuICAgIGxldCBuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2sgPSBhY3RpdmVBbmltYXRpb25Db25maWdTdGFjay5jb25jYXQoW1xuICAgICAgdGhpcy5wcm9wcy5jb25maWd1cmVTY2VuZShyb3V0ZSksXG4gICAgXSk7XG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhuZXh0U3RhY2tbZGVzdEluZGV4XSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0U3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2ssXG4gICAgICAvLyBwcmVzZW50ZWRJbmRleDogZGVzdEluZGV4XG4gICAgfSwgKCkgPT4ge1xuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoeyBpbmRleDogZGVzdEluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIHRoaXMuX2VuYWJsZVNjZW5lKGRlc3RJbmRleCk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uVG8oZGVzdEluZGV4KTtcbiAgICB9KTtcbiAgfSxcblxuICBfcG9wTjogZnVuY3Rpb24obikge1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggLSBuID49IDAsXG4gICAgICAnQ2Fubm90IHBvcCBiZWxvdyB6ZXJvJ1xuICAgICk7XG4gICAgbGV0IHBvcEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCAtIG47XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUocG9wSW5kZXgpO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3BvcEluZGV4XSk7XG4gICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgcG9wSW5kZXgsXG4gICAgICBudWxsLCAvLyBkZWZhdWx0IHZlbG9jaXR5XG4gICAgICBudWxsLCAvLyBubyBzcHJpbmcganVtcGluZ1xuICAgICAgKCkgPT4ge1xuICAgICAgICBoaXN0b3J5LmdvKC1uKTtcbiAgICAgICAgdGhpcy5fY2xlYW5TY2VuZXNQYXN0SW5kZXgocG9wSW5kZXgpO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgcG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUubGVuZ3RoKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSB3b3JrYXJvdW5kIHRvIHByZXZlbnQgdXNlciBmcm9tIGZpcmluZyBtdWx0aXBsZSBgcG9wKClgXG4gICAgICAvLyBjYWxscyB0aGF0IG1heSBwb3AgdGhlIHJvdXRlcyBiZXlvbmQgdGhlIGxpbWl0LlxuICAgICAgLy8gQmVjYXVzZSBgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleGAgZG9lcyBub3QgdXBkYXRlIHVudGlsIHRoZVxuICAgICAgLy8gdHJhbnNpdGlvbiBzdGFydHMsIHdlIGNhbid0IHJlbGlhYmx5IHVzZSBgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleGBcbiAgICAgIC8vIHRvIGtub3cgd2hldGhlciB3ZSBjYW4gc2FmZWx5IGtlZXAgcG9wcGluZyB0aGUgcm91dGVzIG9yIG5vdCBhdCB0aGlzXG4gICAgICAvLyAgbW9tZW50LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgdGhpcy5fcG9wTigxKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYSByb3V0ZSBpbiB0aGUgbmF2aWdhdGlvbiBzdGFjay5cbiAgICpcbiAgICogYGluZGV4YCBzcGVjaWZpZXMgdGhlIHJvdXRlIGluIHRoZSBzdGFjayB0aGF0IHNob3VsZCBiZSByZXBsYWNlZC5cbiAgICogSWYgaXQncyBuZWdhdGl2ZSwgaXQgY291bnRzIGZyb20gdGhlIGJhY2suXG4gICAqL1xuICByZXBsYWNlQXRJbmRleDogZnVuY3Rpb24ocm91dGUsIGluZGV4LCBjYikge1xuICAgIGludmFyaWFudCghIXJvdXRlLCAnTXVzdCBzdXBwbHkgcm91dGUgdG8gcmVwbGFjZScpO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgIGluZGV4ICs9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggPD0gaW5kZXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXBsYWNlQ3VycmVudCA9IGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XG4gICAgaWYgKCFyZXBsYWNlQ3VycmVudCkge1xuICAgICAgY29uc29sZS53YXJuKCduYXZpZ2F0b3IucmVwbGFjZUF0SW5kZXggZm9yIHRoZSBub24tY3VycmVudCByb3V0ZSBicmVha3MgdGhlIGJhY2sgYnV0dG9uIScpXG4gICAgfVxuXG4gICAgbGV0IG5leHRSb3V0ZVN0YWNrID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKCk7XG4gICAgbGV0IG5leHRBbmltYXRpb25Nb2RlU3RhY2sgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoKTtcbiAgICBuZXh0Um91dGVTdGFja1tpbmRleF0gPSByb3V0ZTtcbiAgICBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrW2luZGV4XSA9IHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpO1xuXG4gICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0Um91dGVTdGFjayxcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IG5leHRBbmltYXRpb25Nb2RlU3RhY2ssXG4gICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICAgIHRoaXMuX2VtaXREaWRGb2N1cyhyb3V0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXBsYWNlQ3VycmVudCkge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IGluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIH1cblxuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIGN1cnJlbnQgc2NlbmUgaW4gdGhlIHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgY3VycmVudCByb3V0ZSdzIHBhcmVudC5cbiAgICovXG4gIHJlcGxhY2VQcmV2aW91czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gMSk7XG4gIH0sXG5cbiAgcG9wVG9Ub3A6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucG9wVG9Sb3V0ZSh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbMF0pO1xuICB9LFxuXG4gIHBvcFRvUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGluZGV4T2ZSb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBpbmRleE9mUm91dGUgIT09IC0xLFxuICAgICAgJ0NhbGxpbmcgcG9wVG9Sb3V0ZSBmb3IgYSByb3V0ZSB0aGF0IGRvZXNuXFwndCBleGlzdCEnXG4gICAgKTtcbiAgICBsZXQgbnVtVG9Qb3AgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gaW5kZXhPZlJvdXRlO1xuICAgIHRoaXMuX3BvcE4obnVtVG9Qb3ApO1xuICB9LFxuXG4gIHJlcGxhY2VQcmV2aW91c0FuZFBvcDogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXBsYWNlUHJldmlvdXMocm91dGUpO1xuICAgIHRoaXMucG9wKCk7XG4gIH0sXG5cbiAgcmVzZXRUbzogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHB1c2gnKTtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCAwLCAoKSA9PiB7XG4gICAgICAvLyBEbyBub3QgdXNlIHBvcFRvUm91dGUgaGVyZSwgYmVjYXVzZSByYWNlIGNvbmRpdGlvbnMgY291bGQgcHJldmVudCB0aGVcbiAgICAgIC8vIHJvdXRlIGZyb20gZXhpc3RpbmcgYXQgdGhpcyB0aW1lLiBJbnN0ZWFkLCBqdXN0IGdvIHRvIGluZGV4IDBcbiAgICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLl9wb3BOKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGdldEN1cnJlbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsb25lIGJlZm9yZSByZXR1cm5pbmcgdG8gYXZvaWQgY2FsbGVyIG11dGF0aW5nIHRoZSBzdGFja1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoKTtcbiAgfSxcblxuICBfY2xlYW5TY2VuZXNQYXN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IG5ld1N0YWNrTGVuZ3RoID0gaW5kZXggKyAxO1xuICAgIC8vIFJlbW92ZSBhbnkgdW5uZWVkZWQgcmVuZGVyZWQgcm91dGVzLlxuICAgIGlmIChuZXdTdGFja0xlbmd0aCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2VuZUNvbmZpZ1N0YWNrOiB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICByb3V0ZVN0YWNrOiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXhcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVyU2NlbmU6IGZ1bmN0aW9uKHJvdXRlLCBpKSB7XG4gICAgLy8gbGV0IGRpc2FibGVkU2NlbmVTdHlsZSA9IG51bGw7XG4gICAgbGV0IHBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgaWYgKGkgIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIC8vIGRpc2FibGVkU2NlbmVTdHlsZSA9IHN0eWxlcy5kaXNhYmxlZFNjZW5lO1xuICAgICAgcG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZUlkID0gdGhpcy5fZ2V0Um91dGVJRChyb3V0ZSlcbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXdcbiAgICAgICAga2V5PXsnc2NlbmVfJyArIHJvdXRlSWR9XG4gICAgICAgIHJlZj17J3NjZW5lXycgKyByb3V0ZUlkfVxuICAgICAgICBvblN0YXJ0U2hvdWxkU2V0UmVzcG9uZGVyQ2FwdHVyZT17KCkgPT4ge1xuICAgICAgICAgIHJldHVybiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHx8ICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIHBvaW50ZXJFdmVudHM9e3BvaW50ZXJFdmVudHN9XG4gICAgICAgIHN0eWxlPXtbc3R5bGVzLmJhc2VTY2VuZSwgdGhpcy5wcm9wcy5zY2VuZVN0eWxlLyosIGRpc2FibGVkU2NlbmVTdHlsZSovXX0+XG4gICAgICAgIHt0aGlzLnByb3BzLnJlbmRlclNjZW5lKFxuICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKX1cbiAgICAgIDwvVmlldz5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uQmFyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMubmF2aWdhdGlvbkJhcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQodGhpcy5wcm9wcy5uYXZpZ2F0aW9uQmFyLCB7XG4gICAgICByZWY6IChuYXZCYXIpID0+IHtcbiAgICAgICAgdGhpcy5fbmF2QmFyID0gbmF2QmFyO1xuICAgICAgfSxcbiAgICAgIG5hdmlnYXRvcjogdGhpcyxcbiAgICAgIG5hdlN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG5ld1JlbmRlcmVkU2NlbmVNYXAgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHNjZW5lcyA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5tYXAoKHJvdXRlLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHJlbmRlcmVkU2NlbmU7XG4gICAgICBpZiAodGhpcy5fcmVuZGVyZWRTY2VuZU1hcC5oYXMocm91dGUpICYmXG4gICAgICAgICAgaW5kZXggIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgICAgcmVuZGVyZWRTY2VuZSA9IHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAuZ2V0KHJvdXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkU2NlbmUgPSB0aGlzLl9yZW5kZXJTY2VuZShyb3V0ZSwgaW5kZXgpO1xuICAgICAgfVxuICAgICAgbmV3UmVuZGVyZWRTY2VuZU1hcC5zZXQocm91dGUsIHJlbmRlcmVkU2NlbmUpO1xuICAgICAgcmV0dXJuIHJlbmRlcmVkU2NlbmU7XG4gICAgfSk7XG4gICAgdGhpcy5fcmVuZGVyZWRTY2VuZU1hcCA9IG5ld1JlbmRlcmVkU2NlbmVNYXA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3IHN0eWxlPXtbc3R5bGVzLmNvbnRhaW5lciwgdGhpcy5wcm9wcy5zdHlsZV19PlxuICAgICAgICA8Vmlld1xuICAgICAgICAgIHN0eWxlPXtzdHlsZXMudHJhbnNpdGlvbmVyfVxuICAgICAgICAgIHsuLi50aGlzLnBhbkdlc3R1cmUucGFuSGFuZGxlcnN9XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0PXt0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0fVxuICAgICAgICAgIG9uUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0PXtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdFxuICAgICAgICAgIH0+XG4gICAgICAgICAge3NjZW5lc31cbiAgICAgICAgPC9WaWV3PlxuICAgICAgICB7dGhpcy5fcmVuZGVyTmF2aWdhdGlvbkJhcigpfVxuICAgICAgPC9WaWV3PlxuICAgICk7XG4gIH0sXG5cbiAgX2dldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX25hdmlnYXRpb25Db250ZXh0KSB7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCA9IG5ldyBOYXZpZ2F0aW9uQ29udGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQ7XG4gIH1cbn0pO1xuXG5OYXZpZ2F0b3IuaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRvcjtcbiJdfQ==