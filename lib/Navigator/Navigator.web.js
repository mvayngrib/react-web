








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
if(destIndex<this.state.routeStack.length){
this.hashChanged=true;
this._jumpN(destIndex-this.state.presentedIndex);



this._cleanScenesPastIndex(destIndex);


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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRvci53ZWIuanMiXSwibmFtZXMiOlsiaGlzdG9yeSIsIl91bmxpc3RlbiIsImhpZGRlblN0eWxlIiwib3BhY2l0eSIsInZpc2liaWxpdHkiLCJ2aXNpYmxlU3R5bGUiLCJTQ1JFRU5fV0lEVEgiLCJnZXQiLCJ3aWR0aCIsIlNDUkVFTl9IRUlHSFQiLCJoZWlnaHQiLCJTQ0VORV9ESVNBQkxFRF9OQVRJVkVfUFJPUFMiLCJwb2ludGVyRXZlbnRzIiwic3R5bGUiLCJzdHlsZXMiLCJjcmVhdGUiLCJjb250YWluZXIiLCJmbGV4Iiwib3ZlcmZsb3ciLCJkZWZhdWx0U2NlbmVTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwiYmFzZVNjZW5lIiwidHJhbnNpdGlvbmVyIiwiYmFja2dyb3VuZENvbG9yIiwiR0VTVFVSRV9BQ1RJT05TIiwiTmF2aWdhdG9yIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjb25maWd1cmVTY2VuZSIsImZ1bmMiLCJyZW5kZXJTY2VuZSIsImlzUmVxdWlyZWQiLCJpbml0aWFsUm91dGUiLCJvYmplY3QiLCJpbml0aWFsUm91dGVTdGFjayIsImFycmF5T2YiLCJvbldpbGxGb2N1cyIsIm9uRGlkRm9jdXMiLCJuYXZpZ2F0aW9uQmFyIiwibm9kZSIsIm5hdmlnYXRvciIsInNjZW5lU3R5bGUiLCJzdGF0aWNzIiwiQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIiLCJOYXZpZ2F0aW9uQmFyIiwiU2NlbmVDb25maWdzIiwibWl4aW5zIiwiTWl4aW4iLCJnZXREZWZhdWx0UHJvcHMiLCJQdXNoRnJvbVJpZ2h0IiwiZ2V0SW5pdGlhbFN0YXRlIiwiX3JlbmRlcmVkU2NlbmVNYXAiLCJyb3V0ZVN0YWNrIiwicHJvcHMiLCJsZW5ndGgiLCJpbml0aWFsUm91dGVJbmRleCIsImluZGV4T2YiLCJzY2VuZUNvbmZpZ1N0YWNrIiwibWFwIiwicm91dGUiLCJwcmVzZW50ZWRJbmRleCIsInRyYW5zaXRpb25Gcm9tSW5kZXgiLCJhY3RpdmVHZXN0dXJlIiwicGVuZGluZ0dlc3R1cmVQcm9ncmVzcyIsInRyYW5zaXRpb25RdWV1ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsIl9fZGVmaW5lR2V0dGVyX18iLCJfZ2V0TmF2aWdhdGlvbkNvbnRleHQiLCJfc3ViUm91dGVGb2N1cyIsInBhcmVudE5hdmlnYXRvciIsIl9oYW5kbGVycyIsInNwcmluZ1N5c3RlbSIsIlNwcmluZ1N5c3RlbSIsInNwcmluZyIsImNyZWF0ZVNwcmluZyIsInNldFJlc3RTcGVlZFRocmVzaG9sZCIsInNldEN1cnJlbnRWYWx1ZSIsInNldEF0UmVzdCIsImFkZExpc3RlbmVyIiwib25TcHJpbmdFbmRTdGF0ZUNoYW5nZSIsIl9pbnRlcmFjdGlvbkhhbmRsZSIsImNyZWF0ZUludGVyYWN0aW9uSGFuZGxlIiwib25TcHJpbmdVcGRhdGUiLCJfaGFuZGxlU3ByaW5nVXBkYXRlIiwib25TcHJpbmdBdFJlc3QiLCJfY29tcGxldGVUcmFuc2l0aW9uIiwicGFuR2VzdHVyZSIsIm9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlciIsIl9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyIiwib25QYW5SZXNwb25kZXJHcmFudCIsIl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCIsIm9uUGFuUmVzcG9uZGVyUmVsZWFzZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlIiwib25QYW5SZXNwb25kZXJNb3ZlIiwiX2hhbmRsZVBhblJlc3BvbmRlck1vdmUiLCJvblBhblJlc3BvbmRlclRlcm1pbmF0ZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUiLCJfZW1pdFdpbGxGb2N1cyIsInN0YXRlIiwiaGFzaENoYW5nZWQiLCJjb21wb25lbnREaWRNb3VudCIsIl9lbWl0RGlkRm9jdXMiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImRlc3RJbmRleCIsInBhdGhuYW1lIiwicGFyc2VJbnQiLCJyZXBsYWNlIiwiX2p1bXBOIiwiX2NsZWFuU2NlbmVzUGFzdEluZGV4IiwiYmluZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX25hdmlnYXRpb25Db250ZXh0IiwiZGlzcG9zZSIsIl9uZXh0Um91dGVJRCIsIl9nZXRSb3V0ZUlEIiwiYWN0aW9uIiwiU3RyaW5nIiwiaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2siLCJuZXh0Um91dGVTdGFjayIsImNvbnNvbGUiLCJ3YXJuIiwic2VsZiIsInByZXZMZW5ndGgiLCJzZXRTdGF0ZSIsIl90cmFuc2l0aW9uVG8iLCJ2ZWxvY2l0eSIsImp1bXBTcHJpbmdUbyIsImNiIiwiX2hpZGVTY2VuZXMiLCJwdXNoIiwidHJhbnNpdGlvbkNiIiwiX29uQW5pbWF0aW9uU3RhcnQiLCJzY2VuZUNvbmZpZyIsInNldE92ZXJzaG9vdENsYW1waW5nRW5hYmxlZCIsImdldFNwcmluZ0NvbmZpZyIsImZyaWN0aW9uIiwic3ByaW5nRnJpY3Rpb24iLCJ0ZW5zaW9uIiwic3ByaW5nVGVuc2lvbiIsInNldFZlbG9jaXR5IiwiZGVmYXVsdFRyYW5zaXRpb25WZWxvY2l0eSIsInNldEVuZFZhbHVlIiwiX3RyYW5zaXRpb25CZXR3ZWVuIiwiZ2V0Q3VycmVudFZhbHVlIiwicHJlc2VudGVkVG9JbmRleCIsIl9kZWx0YUZvckdlc3R1cmVBY3Rpb24iLCJfb25BbmltYXRpb25FbmQiLCJkaWRGb2N1c1JvdXRlIiwiY2xlYXJJbnRlcmFjdGlvbkhhbmRsZSIsImdlc3R1cmVUb0luZGV4IiwiX2VuYWJsZVNjZW5lIiwicXVldWVkVHJhbnNpdGlvbiIsInNoaWZ0IiwibmF2aWdhdGlvbkNvbnRleHQiLCJlbWl0IiwibmF2QmFyIiwiX25hdkJhciIsImhhbmRsZVdpbGxGb2N1cyIsImdlc3R1cmluZ1RvSW5kZXgiLCJpIiwiX2Rpc2FibGVTY2VuZSIsInNjZW5lSW5kZXgiLCJyZWZzIiwic2V0TmF0aXZlUHJvcHMiLCJzY2VuZU5hdGl2ZVByb3BzIiwiZnJvbUluZGV4IiwidG9JbmRleCIsIl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIm9uQW5pbWF0aW9uU3RhcnQiLCJtYXgiLCJpbmRleCIsIm9uQW5pbWF0aW9uRW5kIiwic2hvdWxkUmVuZGVyVG9IYXJkd2FyZVRleHR1cmUiLCJ2aWV3QXRJbmRleCIsInVuZGVmaW5lZCIsInJlbmRlclRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIl9oYW5kbGVUb3VjaFN0YXJ0IiwiX2VsaWdpYmxlR2VzdHVyZXMiLCJlIiwiZ2VzdHVyZVN0YXRlIiwiX2V4cGVjdGluZ0dlc3R1cmVHcmFudCIsIl9tYXRjaEdlc3R1cmVBY3Rpb24iLCJnZXN0dXJlcyIsIl9kb2VzR2VzdHVyZU92ZXJzd2lwZSIsImdlc3R1cmVOYW1lIiwid291bGRPdmVyc3dpcGVCYWNrIiwid291bGRPdmVyc3dpcGVGb3J3YXJkIiwiX2F0dGFjaEdlc3R1cmUiLCJnZXN0dXJlQWN0aW9uIiwicmVsZWFzZUdlc3R1cmVBY3Rpb24iLCJyZWxlYXNlR2VzdHVyZSIsImlzVHJhdmVsVmVydGljYWwiLCJkaXJlY3Rpb24iLCJpc1RyYXZlbEludmVydGVkIiwiZ2VzdHVyZURpc3RhbmNlIiwidnkiLCJkeSIsInZ4IiwiZHgiLCJ0cmFuc2l0aW9uVmVsb2NpdHkiLCJNYXRoIiwiYWJzIiwibm90TW92aW5nIiwiaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlIiwiZnVsbERpc3RhbmNlIiwic3RpbGxDb21wbGV0aW9uUmF0aW8iLCJzbmFwVmVsb2NpdHkiLCJ0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgiLCJfZGV0YWNoR2VzdHVyZSIsImdlc3R1cmVJZCIsImdlc3R1cmUiLCJfbW92ZUF0dGFjaGVkR2VzdHVyZSIsIm1hdGNoZWRHZXN0dXJlIiwiZGlzdGFuY2UiLCJnZXN0dXJlRGV0ZWN0TW92ZW1lbnQiLCJuZXh0UHJvZ3Jlc3MiLCJpc0RldGFjaGFibGUiLCJmcmljdGlvbkNvbnN0YW50Iiwib3ZlcnN3aXBlIiwiZnJpY3Rpb25CeURpc3RhbmNlIiwiZnJpY3Rpb25SYXRpbyIsImVsaWdpYmxlR2VzdHVyZXMiLCJzb21lIiwiZ2VzdHVyZUluZGV4IiwiY3VycmVudExvYyIsIm1vdmVZIiwibW92ZVgiLCJ0cmF2ZWxEaXN0Iiwib3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCIsImVkZ2VIaXRXaWR0aCIsIm1vdmVTdGFydGVkSW5SZWdpb24iLCJtb3ZlVHJhdmVsbGVkRmFyRW5vdWdoIiwiZGlyZWN0aW9uSXNDb3JyZWN0IiwiZGlyZWN0aW9uUmF0aW8iLCJzbGljZSIsInNwbGljZSIsIl90cmFuc2l0aW9uU2NlbmVTdHlsZSIsInByb2dyZXNzIiwic2NlbmVDb25maWdJbmRleCIsInN0eWxlVG9Vc2UiLCJ1c2VGbiIsImFuaW1hdGlvbkludGVycG9sYXRvcnMiLCJvdXQiLCJpbnRvIiwiZGlyZWN0aW9uQWRqdXN0ZWRQcm9ncmVzcyIsImRpZENoYW5nZSIsInVwZGF0ZVByb2dyZXNzIiwiX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdCIsIl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMiLCJuIiwiY3VycmVudEluZGV4IiwibWF4SW5kZXgiLCJwdXNoU3RhdGUiLCJnbyIsImp1bXBUbyIsImp1bXBGb3J3YXJkIiwianVtcEJhY2siLCJhY3RpdmVMZW5ndGgiLCJhY3RpdmVTdGFjayIsImFjdGl2ZUFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwibmV4dFN0YWNrIiwiY29uY2F0IiwibmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwiX3BvcE4iLCJwb3BJbmRleCIsInBvcCIsInJlcGxhY2VBdEluZGV4IiwicmVwbGFjZUN1cnJlbnQiLCJuZXh0QW5pbWF0aW9uTW9kZVN0YWNrIiwicmVwbGFjZVN0YXRlIiwicmVwbGFjZVByZXZpb3VzIiwicG9wVG9Ub3AiLCJwb3BUb1JvdXRlIiwiaW5kZXhPZlJvdXRlIiwibnVtVG9Qb3AiLCJyZXBsYWNlUHJldmlvdXNBbmRQb3AiLCJyZXNldFRvIiwiZ2V0Q3VycmVudFJvdXRlcyIsIm5ld1N0YWNrTGVuZ3RoIiwiX3JlbmRlclNjZW5lIiwicm91dGVJZCIsIl9yZW5kZXJOYXZpZ2F0aW9uQmFyIiwiY2xvbmVFbGVtZW50IiwicmVmIiwibmF2U3RhdGUiLCJyZW5kZXIiLCJuZXdSZW5kZXJlZFNjZW5lTWFwIiwic2NlbmVzIiwicmVuZGVyZWRTY2VuZSIsImhhcyIsInNldCIsInBhbkhhbmRsZXJzIiwiaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBU0EsYTs7QUFFQSw0QjtBQUNBLDZEO0FBQ0EsMEU7QUFDQSwyQztBQUNBLHNFO0FBQ0EseUY7QUFDQSxxRTtBQUNBLG1FO0FBQ0EsbUU7QUFDQSw2RDtBQUNBLHNEO0FBQ0Esa0Q7QUFDQSwyQztBQUNBLHdDO0FBQ0EsaUU7QUFDQSw2QztBQUNBLGdDO0FBQ0EsZ0U7O0FBRUEsR0FBSUEsU0FBVSxpQ0FBZDtBQUNBLEdBQUlDLGlCQUFKOztBQUVBLEdBQU1DLGFBQWM7QUFDbEJDLFFBQVMsQ0FEUztBQUVsQkMsV0FBWSxRQUZNLENBQXBCOzs7QUFLQSxHQUFNQyxjQUFlO0FBQ25CRixRQUFTLENBRFU7QUFFbkJDLFdBQVksU0FGTyxDQUFyQjs7Ozs7O0FBUUEsR0FBTUUsY0FBZSwwQkFBV0MsR0FBWCxDQUFlLFFBQWYsRUFBeUJDLEtBQTlDO0FBQ0EsR0FBTUMsZUFBZ0IsMEJBQVdGLEdBQVgsQ0FBZSxRQUFmLEVBQXlCRyxNQUEvQztBQUNBLEdBQU1DLDZCQUE4QjtBQUNsQ0MsY0FBZSxNQURtQjtBQUVsQ0MsTUFBT1gsV0FGMkIsQ0FBcEM7Ozs7Ozs7OztBQVdBLEdBQUlZLFFBQVMsMEJBQVdDLE1BQVgsQ0FBa0I7QUFDN0JDLFVBQVc7QUFDVEMsS0FBTSxDQURHO0FBRVRDLFNBQVUsUUFGRCxDQURrQjs7QUFLN0JDLGtCQUFtQjtBQUNqQkMsU0FBVSxVQURPO0FBRWpCQyxLQUFNLENBRlc7QUFHakJDLE1BQU8sQ0FIVTtBQUlqQkMsT0FBUSxDQUpTO0FBS2pCQyxJQUFLLENBTFk7QUFNakJwQixXQUFZLFNBTkssQ0FMVTs7QUFhN0JxQixVQUFXO0FBQ1RMLFNBQVUsVUFE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QUFLOU8saUJBQUwsQ0FBdUJoRCxHQUF2QixDQUEyQndELEtBQTNCLENBQWhCO0FBQ0QsQ0FIRCxJQUdPO0FBQ0xzTyxjQUFnQixRQUFLVCxZQUFMLENBQWtCN04sS0FBbEIsQ0FBeUJnSCxLQUF6QixDQUFoQjtBQUNEO0FBQ0RvSCxvQkFBb0JJLEdBQXBCLENBQXdCeE8sS0FBeEIsQ0FBK0JzTyxhQUEvQjtBQUNBLE1BQU9BLGNBQVA7QUFDRCxDQVZZLENBQWI7QUFXQSxLQUFLOU8saUJBQUwsQ0FBeUI0TyxtQkFBekI7QUFDQTtBQUNFLG1EQUFNLE1BQU8sQ0FBQ3JSLE9BQU9FLFNBQVIsQ0FBbUIsS0FBS3lDLEtBQUwsQ0FBVzVDLEtBQTlCLENBQWI7QUFDRTtBQUNFLE1BQU9DLE9BQU9ZLFlBRGhCO0FBRU0sS0FBS2dFLFVBQUwsQ0FBZ0I4TSxXQUZ0QjtBQUdFLGFBQWMsS0FBS25ILGlCQUhyQjtBQUlFO0FBQ0UsS0FBS3VFLGtDQUxUOztBQU9Hd0MsTUFQSCxDQURGOztBQVVHLEtBQUtOLG9CQUFMLEVBVkgsQ0FERjs7O0FBY0QsQ0FoL0IrQjs7QUFrL0JoQ3ZOLHNCQUF1QixnQ0FBVztBQUNoQyxHQUFJLENBQUMsS0FBSzZDLGtCQUFWLENBQThCO0FBQzVCLEtBQUtBLGtCQUFMLENBQTBCLHNDQUExQjtBQUNEO0FBQ0QsTUFBTyxNQUFLQSxrQkFBWjtBQUNELENBdi9CK0IsQ0FBbEIsQ0FBaEI7OztBQTAvQkF2RixVQUFVNFEsc0JBQVYsQ0FBbUMsSUFBbkMsQzs7QUFFZTVRLFMiLCJmaWxlIjoiTmF2aWdhdG9yLndlYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEFsaWJhYmEgR3JvdXAgSG9sZGluZyBMaW1pdGVkLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUsIEZhY2Vib29rLCBJbmMuICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBSZWFjdE5hdmlnYXRvclxuICovXG4gLyogZXNsaW50LWRpc2FibGUgbm8tZXh0cmEtYm9vbGVhbi1jYXN0Ki9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0LCB7IFByb3BUeXBlcyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBEaW1lbnNpb25zIGZyb20gJ1JlYWN0RGltZW5zaW9ucyc7XG5pbXBvcnQgSW50ZXJhY3Rpb25NaXhpbiBmcm9tICdSZWFjdEludGVyYWN0aW9uTWl4aW4nO1xuaW1wb3J0IE1hcCBmcm9tICdjb3JlLWpzL2xpYnJhcnkvZm4vbWFwJztcbmltcG9ydCBOYXZpZ2F0aW9uQ29udGV4dCBmcm9tICdSZWFjdE5hdmlnYXRpb25Db250ZXh0JztcbmltcG9ydCBOYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhciBmcm9tICdSZWFjdE5hdmlnYXRvckJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCBOYXZpZ2F0b3JOYXZpZ2F0aW9uQmFyIGZyb20gJ1JlYWN0TmF2aWdhdG9yTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQgTmF2aWdhdG9yU2NlbmVDb25maWdzIGZyb20gJ1JlYWN0TmF2aWdhdG9yU2NlbmVDb25maWdzJztcbmltcG9ydCBQYW5SZXNwb25kZXIgZnJvbSAnUmVhY3RQYW5SZXNwb25kZXInO1xuaW1wb3J0IFN0eWxlU2hlZXQgZnJvbSAnUmVhY3RTdHlsZVNoZWV0JztcbmltcG9ydCBTdWJzY3JpYmFibGUgZnJvbSAnLi9wb2x5ZmlsbHMvU3Vic2NyaWJhYmxlJztcbmltcG9ydCBUaW1lck1peGluIGZyb20gJ3JlYWN0LXRpbWVyLW1peGluJztcbmltcG9ydCBWaWV3IGZyb20gJ1JlYWN0Vmlldyc7XG5pbXBvcnQgY2xhbXAgZnJvbSAnLi9wb2x5ZmlsbHMvY2xhbXAnO1xuaW1wb3J0IGZsYXR0ZW5TdHlsZSBmcm9tICdSZWFjdEZsYXR0ZW5TdHlsZSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2ZianMvbGliL2ludmFyaWFudCc7XG5pbXBvcnQgcmVib3VuZCBmcm9tICdyZWJvdW5kJztcbmltcG9ydCBjcmVhdGVIaXN0b3J5IGZyb20gJ2hpc3RvcnkvbGliL2NyZWF0ZUhhc2hIaXN0b3J5JztcblxubGV0IGhpc3RvcnkgPSBjcmVhdGVIaXN0b3J5KCk7XG5sZXQgX3VubGlzdGVuO1xuXG5jb25zdCBoaWRkZW5TdHlsZSA9IHtcbiAgb3BhY2l0eTogMCxcbiAgdmlzaWJpbGl0eTogJ2hpZGRlbidcbn1cblxuY29uc3QgdmlzaWJsZVN0eWxlID0ge1xuICBvcGFjaXR5OiAxLFxuICB2aXNpYmlsaXR5OiAndmlzaWJsZSdcbn1cblxuLy8gVE9ETzogdGhpcyBpcyBub3QgaWRlYWwgYmVjYXVzZSB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgbmF2aWdhdG9yXG4vLyBpcyBmdWxsIHNjcmVlbiwgaHdvZXZlciB3ZSBkb24ndCBoYXZlIGEgZ29vZCB3YXkgdG8gbWVhc3VyZSB0aGUgYWN0dWFsXG4vLyBzaXplIG9mIHRoZSBuYXZpZ2F0b3IgcmlnaHQgbm93LCBzbyB0aGlzIGlzIHRoZSBuZXh0IGJlc3QgdGhpbmcuXG5jb25zdCBTQ1JFRU5fV0lEVEggPSBEaW1lbnNpb25zLmdldCgnd2luZG93Jykud2lkdGg7XG5jb25zdCBTQ1JFRU5fSEVJR0hUID0gRGltZW5zaW9ucy5nZXQoJ3dpbmRvdycpLmhlaWdodDtcbmNvbnN0IFNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyA9IHtcbiAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICBzdHlsZTogaGlkZGVuU3R5bGVcbn07XG5cbi8vIGxldCBfX3VpZCA9IDA7XG4vLyBmdW5jdGlvbiBnZXR1aWQoKSB7XG4vLyAgIHJldHVybiBfX3VpZCsrO1xuLy8gfVxuXG4vLyBzdHlsZXMgbW92ZWQgdG8gdGhlIHRvcCBvZiB0aGUgZmlsZSBzbyBnZXREZWZhdWx0UHJvcHMgY2FuIHJlZmVyIHRvIGl0XG5sZXQgc3R5bGVzID0gU3R5bGVTaGVldC5jcmVhdGUoe1xuICBjb250YWluZXI6IHtcbiAgICBmbGV4OiAxLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgfSxcbiAgZGVmYXVsdFNjZW5lU3R5bGU6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICB0b3A6IDAsXG4gICAgdmlzaWJpbGl0eTogJ3Zpc2libGUnXG4gIH0sXG4gIGJhc2VTY2VuZToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICB0b3A6IDAsXG4gIH0sXG4gIC8vIGRpc2FibGVkU2NlbmU6IHtcbiAgLy8gICB0b3A6IFNDUkVFTl9IRUlHSFQsXG4gIC8vICAgYm90dG9tOiAtU0NSRUVOX0hFSUdIVCxcbiAgLy8gfSxcbiAgdHJhbnNpdGlvbmVyOiB7XG4gICAgZmxleDogMSxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICB9XG59KTtcblxuY29uc3QgR0VTVFVSRV9BQ1RJT05TID0gW1xuICAncG9wJyxcbiAgJ2p1bXBCYWNrJyxcbiAgJ2p1bXBGb3J3YXJkJyxcbl07XG5cbi8qKlxuICogVXNlIGBOYXZpZ2F0b3JgIHRvIHRyYW5zaXRpb24gYmV0d2VlbiBkaWZmZXJlbnQgc2NlbmVzIGluIHlvdXIgYXBwLiBUb1xuICogYWNjb21wbGlzaCB0aGlzLCBwcm92aWRlIHJvdXRlIG9iamVjdHMgdG8gdGhlIG5hdmlnYXRvciB0byBpZGVudGlmeSBlYWNoXG4gKiBzY2VuZSwgYW5kIGFsc28gYSBgcmVuZGVyU2NlbmVgIGZ1bmN0aW9uIHRoYXQgdGhlIG5hdmlnYXRvciBjYW4gdXNlIHRvXG4gKiByZW5kZXIgdGhlIHNjZW5lIGZvciBhIGdpdmVuIHJvdXRlLlxuICpcbiAqIFRvIGNoYW5nZSB0aGUgYW5pbWF0aW9uIG9yIGdlc3R1cmUgcHJvcGVydGllcyBvZiB0aGUgc2NlbmUsIHByb3ZpZGUgYVxuICogYGNvbmZpZ3VyZVNjZW5lYCBwcm9wIHRvIGdldCB0aGUgY29uZmlnIG9iamVjdCBmb3IgYSBnaXZlbiByb3V0ZS4gU2VlXG4gKiBgTmF2aWdhdG9yLlNjZW5lQ29uZmlnc2AgZm9yIGRlZmF1bHQgYW5pbWF0aW9ucyBhbmQgbW9yZSBpbmZvIG9uXG4gKiBzY2VuZSBjb25maWcgb3B0aW9ucy5cbiAqXG4gKiAjIyMgQmFzaWMgVXNhZ2VcbiAqXG4gKiBgYGBcbiAqICAgPE5hdmlnYXRvclxuICogICAgIGluaXRpYWxSb3V0ZT17e25hbWU6ICdNeSBGaXJzdCBTY2VuZScsIGluZGV4OiAwfX1cbiAqICAgICByZW5kZXJTY2VuZT17KHJvdXRlLCBuYXZpZ2F0b3IpID0+XG4gKiAgICAgICA8TXlTY2VuZUNvbXBvbmVudFxuICogICAgICAgICBuYW1lPXtyb3V0ZS5uYW1lfVxuICogICAgICAgICBvbkZvcndhcmQ9eygpID0+IHtcbiAqICAgICAgICAgICBsZXQgbmV4dEluZGV4ID0gcm91dGUuaW5kZXggKyAxO1xuICogICAgICAgICAgIG5hdmlnYXRvci5wdXNoKHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdTY2VuZSAnICsgbmV4dEluZGV4LFxuICogICAgICAgICAgICAgaW5kZXg6IG5leHRJbmRleCxcbiAqICAgICAgICAgICB9KTtcbiAqICAgICAgICAgfX1cbiAqICAgICAgICAgb25CYWNrPXsoKSA9PiB7XG4gKiAgICAgICAgICAgaWYgKHJvdXRlLmluZGV4ID4gMCkge1xuICogICAgICAgICAgICAgbmF2aWdhdG9yLnBvcCgpO1xuICogICAgICAgICAgIH1cbiAqICAgICAgICAgfX1cbiAqICAgICAgIC8+XG4gKiAgICAgfVxuICogICAvPlxuICogYGBgXG4gKlxuICogIyMjIE5hdmlnYXRvciBNZXRob2RzXG4gKlxuICogSWYgeW91IGhhdmUgYSByZWYgdG8gdGhlIE5hdmlnYXRvciBlbGVtZW50LCB5b3UgY2FuIGludm9rZSBzZXZlcmFsIG1ldGhvZHNcbiAqIG9uIGl0IHRvIHRyaWdnZXIgbmF2aWdhdGlvbjpcbiAqXG4gKiAgLSBgZ2V0Q3VycmVudFJvdXRlcygpYCAtIHJldHVybnMgdGhlIGN1cnJlbnQgbGlzdCBvZiByb3V0ZXNcbiAqICAtIGBqdW1wQmFjaygpYCAtIEp1bXAgYmFja3dhcmQgd2l0aG91dCB1bm1vdW50aW5nIHRoZSBjdXJyZW50IHNjZW5lXG4gKiAgLSBganVtcEZvcndhcmQoKWAgLSBKdW1wIGZvcndhcmQgdG8gdGhlIG5leHQgc2NlbmUgaW4gdGhlIHJvdXRlIHN0YWNrXG4gKiAgLSBganVtcFRvKHJvdXRlKWAgLSBUcmFuc2l0aW9uIHRvIGFuIGV4aXN0aW5nIHNjZW5lIHdpdGhvdXQgdW5tb3VudGluZ1xuICogIC0gYHB1c2gocm91dGUpYCAtIE5hdmlnYXRlIGZvcndhcmQgdG8gYSBuZXcgc2NlbmUsIHNxdWFzaGluZyBhbnkgc2NlbmVzXG4gKiAgICAgdGhhdCB5b3UgY291bGQgYGp1bXBGb3J3YXJkYCB0b1xuICogIC0gYHBvcCgpYCAtIFRyYW5zaXRpb24gYmFjayBhbmQgdW5tb3VudCB0aGUgY3VycmVudCBzY2VuZVxuICogIC0gYHJlcGxhY2Uocm91dGUpYCAtIFJlcGxhY2UgdGhlIGN1cnJlbnQgc2NlbmUgd2l0aCBhIG5ldyByb3V0ZVxuICogIC0gYHJlcGxhY2VBdEluZGV4KHJvdXRlLCBpbmRleClgIC0gUmVwbGFjZSBhIHNjZW5lIGFzIHNwZWNpZmllZCBieSBhbiBpbmRleFxuICogIC0gYHJlcGxhY2VQcmV2aW91cyhyb3V0ZSlgIC0gUmVwbGFjZSB0aGUgcHJldmlvdXMgc2NlbmVcbiAqICAtIGBpbW1lZGlhdGVseVJlc2V0Um91dGVTdGFjayhyb3V0ZVN0YWNrKWAgLSBSZXNldCBldmVyeSBzY2VuZSB3aXRoIGFuXG4gKiAgICAgYXJyYXkgb2Ygcm91dGVzXG4gKiAgLSBgcG9wVG9Sb3V0ZShyb3V0ZSlgIC0gUG9wIHRvIGEgcGFydGljdWxhciBzY2VuZSwgYXMgc3BlY2lmaWVkIGJ5IGl0c1xuICogICAgIHJvdXRlLiBBbGwgc2NlbmVzIGFmdGVyIGl0IHdpbGwgYmUgdW5tb3VudGVkXG4gKiAgLSBgcG9wVG9Ub3AoKWAgLSBQb3AgdG8gdGhlIGZpcnN0IHNjZW5lIGluIHRoZSBzdGFjaywgdW5tb3VudGluZyBldmVyeVxuICogICAgIG90aGVyIHNjZW5lXG4gKlxuICovXG5sZXQgTmF2aWdhdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGNvbmZpZ3VyYXRpb24gYWJvdXQgc2NlbmUgYW5pbWF0aW9ucyBhbmRcbiAgICAgKiBnZXN0dXJlcy4gV2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIHJvdXRlIGFuZCBzaG91bGQgcmV0dXJuIGEgc2NlbmVcbiAgICAgKiBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgICAqXG4gICAgICogYGBgXG4gICAgICogKHJvdXRlKSA9PiBOYXZpZ2F0b3IuU2NlbmVDb25maWdzLkZsb2F0RnJvbVJpZ2h0XG4gICAgICogYGBgXG4gICAgICovXG4gICAgY29uZmlndXJlU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyoqXG4gICAgICogUmVxdWlyZWQgZnVuY3Rpb24gd2hpY2ggcmVuZGVycyB0aGUgc2NlbmUgZm9yIGEgZ2l2ZW4gcm91dGUuIFdpbGwgYmVcbiAgICAgKiBpbnZva2VkIHdpdGggdGhlIHJvdXRlIGFuZCB0aGUgbmF2aWdhdG9yIG9iamVjdFxuICAgICAqXG4gICAgICogYGBgXG4gICAgICogKHJvdXRlLCBuYXZpZ2F0b3IpID0+XG4gICAgICogICA8TXlTY2VuZUNvbXBvbmVudCB0aXRsZT17cm91dGUudGl0bGV9IC8+XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcmVuZGVyU2NlbmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IGEgcm91dGUgdG8gc3RhcnQgb24uIEEgcm91dGUgaXMgYW4gb2JqZWN0IHRoYXQgdGhlIG5hdmlnYXRvclxuICAgICAqIHdpbGwgdXNlIHRvIGlkZW50aWZ5IGVhY2ggc2NlbmUgdG8gcmVuZGVyLiBgaW5pdGlhbFJvdXRlYCBtdXN0IGJlXG4gICAgICogYSByb3V0ZSBpbiB0aGUgYGluaXRpYWxSb3V0ZVN0YWNrYCBpZiBib3RoIHByb3BzIGFyZSBwcm92aWRlZC4gVGhlXG4gICAgICogYGluaXRpYWxSb3V0ZWAgd2lsbCBkZWZhdWx0IHRvIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGBpbml0aWFsUm91dGVTdGFja2AuXG4gICAgICovXG4gICAgaW5pdGlhbFJvdXRlOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZSBhIHNldCBvZiByb3V0ZXMgdG8gaW5pdGlhbGx5IG1vdW50LiBSZXF1aXJlZCBpZiBubyBpbml0aWFsUm91dGVcbiAgICAgKiBpcyBwcm92aWRlZC4gT3RoZXJ3aXNlLCBpdCB3aWxsIGRlZmF1bHQgdG8gYW4gYXJyYXkgY29udGFpbmluZyBvbmx5IHRoZVxuICAgICAqIGBpbml0aWFsUm91dGVgXG4gICAgICovXG4gICAgaW5pdGlhbFJvdXRlU3RhY2s6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBVc2UgYG5hdmlnYXRpb25Db250ZXh0LmFkZExpc3RlbmVyKCd3aWxsZm9jdXMnLCBjYWxsYmFjaylgIGluc3RlYWQuXG4gICAgICpcbiAgICAgKiBXaWxsIGVtaXQgdGhlIHRhcmdldCByb3V0ZSB1cG9uIG1vdW50aW5nIGFuZCBiZWZvcmUgZWFjaCBuYXYgdHJhbnNpdGlvblxuICAgICAqL1xuICAgIG9uV2lsbEZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogVXNlIGBuYXZpZ2F0aW9uQ29udGV4dC5hZGRMaXN0ZW5lcignZGlkZm9jdXMnLCBjYWxsYmFjaylgIGluc3RlYWQuXG4gICAgICpcbiAgICAgKiBXaWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBuZXcgcm91dGUgb2YgZWFjaCBzY2VuZSBhZnRlciB0aGUgdHJhbnNpdGlvbiBpc1xuICAgICAqIGNvbXBsZXRlIG9yIGFmdGVyIHRoZSBpbml0aWFsIG1vdW50aW5nXG4gICAgICovXG4gICAgb25EaWRGb2N1czogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbGx5IHByb3ZpZGUgYSBuYXZpZ2F0aW9uIGJhciB0aGF0IHBlcnNpc3RzIGFjcm9zcyBzY2VuZVxuICAgICAqIHRyYW5zaXRpb25zXG4gICAgICovXG4gICAgbmF2aWdhdGlvbkJhcjogUHJvcFR5cGVzLm5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbGx5IHByb3ZpZGUgdGhlIG5hdmlnYXRvciBvYmplY3QgZnJvbSBhIHBhcmVudCBOYXZpZ2F0b3JcbiAgICAgKi9cbiAgICBuYXZpZ2F0b3I6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAvKipcbiAgICAgKiBTdHlsZXMgdG8gYXBwbHkgdG8gdGhlIGNvbnRhaW5lciBvZiBlYWNoIHNjZW5lXG4gICAgICovXG4gICAgc2NlbmVTdHlsZTogVmlldy5wcm9wVHlwZXMuc3R5bGUsXG4gIH0sXG5cbiAgc3RhdGljczoge1xuICAgIEJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyOiBOYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhcixcbiAgICBOYXZpZ2F0aW9uQmFyOiBOYXZpZ2F0b3JOYXZpZ2F0aW9uQmFyLFxuICAgIFNjZW5lQ29uZmlnczogTmF2aWdhdG9yU2NlbmVDb25maWdzLFxuICB9LFxuXG4gIG1peGluczogW1RpbWVyTWl4aW4sIEludGVyYWN0aW9uTWl4aW4sIFN1YnNjcmliYWJsZS5NaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJlU2NlbmU6ICgpID0+IE5hdmlnYXRvclNjZW5lQ29uZmlncy5QdXNoRnJvbVJpZ2h0LFxuICAgICAgc2NlbmVTdHlsZTogc3R5bGVzLmRlZmF1bHRTY2VuZVN0eWxlLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9yZW5kZXJlZFNjZW5lTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgbGV0IHJvdXRlU3RhY2sgPSB0aGlzLnByb3BzLmluaXRpYWxSb3V0ZVN0YWNrIHx8IFt0aGlzLnByb3BzLmluaXRpYWxSb3V0ZV07XG4gICAgaW52YXJpYW50KFxuICAgICAgcm91dGVTdGFjay5sZW5ndGggPj0gMSxcbiAgICAgICdOYXZpZ2F0b3IgcmVxdWlyZXMgcHJvcHMuaW5pdGlhbFJvdXRlIG9yIHByb3BzLmluaXRpYWxSb3V0ZVN0YWNrLidcbiAgICApO1xuICAgIGxldCBpbml0aWFsUm91dGVJbmRleCA9IHJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBpZiAodGhpcy5wcm9wcy5pbml0aWFsUm91dGUpIHtcbiAgICAgIGluaXRpYWxSb3V0ZUluZGV4ID0gcm91dGVTdGFjay5pbmRleE9mKHRoaXMucHJvcHMuaW5pdGlhbFJvdXRlKTtcbiAgICAgIGludmFyaWFudChcbiAgICAgICAgaW5pdGlhbFJvdXRlSW5kZXggIT09IC0xLFxuICAgICAgICAnaW5pdGlhbFJvdXRlIGlzIG5vdCBpbiBpbml0aWFsUm91dGVTdGFjay4nXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc2NlbmVDb25maWdTdGFjazogcm91dGVTdGFjay5tYXAoXG4gICAgICAgIChyb3V0ZSkgPT4gdGhpcy5wcm9wcy5jb25maWd1cmVTY2VuZShyb3V0ZSlcbiAgICAgICksXG4gICAgICByb3V0ZVN0YWNrLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGluaXRpYWxSb3V0ZUluZGV4LFxuICAgICAgdHJhbnNpdGlvbkZyb21JbmRleDogbnVsbCxcbiAgICAgIGFjdGl2ZUdlc3R1cmU6IG51bGwsXG4gICAgICBwZW5kaW5nR2VzdHVyZVByb2dyZXNzOiBudWxsLFxuICAgICAgdHJhbnNpdGlvblF1ZXVlOiBbXSxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgLy8gVE9ETyh0NzQ4OTUwMyk6IERvbid0IG5lZWQgdGhpcyBvbmNlIEVTNiBDbGFzcyBsYW5kZWQuXG4gICAgdGhpcy5fX2RlZmluZUdldHRlcl9fKCduYXZpZ2F0aW9uQ29udGV4dCcsIHRoaXMuX2dldE5hdmlnYXRpb25Db250ZXh0KTtcblxuICAgIHRoaXMuX3N1YlJvdXRlRm9jdXMgPSBbXTtcbiAgICB0aGlzLnBhcmVudE5hdmlnYXRvciA9IHRoaXMucHJvcHMubmF2aWdhdG9yO1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge307XG4gICAgdGhpcy5zcHJpbmdTeXN0ZW0gPSBuZXcgcmVib3VuZC5TcHJpbmdTeXN0ZW0oKTtcbiAgICB0aGlzLnNwcmluZyA9IHRoaXMuc3ByaW5nU3lzdGVtLmNyZWF0ZVNwcmluZygpO1xuICAgIHRoaXMuc3ByaW5nLnNldFJlc3RTcGVlZFRocmVzaG9sZCgwLjA1KTtcbiAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgdGhpcy5zcHJpbmcuYWRkTGlzdGVuZXIoe1xuICAgICAgb25TcHJpbmdFbmRTdGF0ZUNoYW5nZTogKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKSB7XG4gICAgICAgICAgdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUgPSB0aGlzLmNyZWF0ZUludGVyYWN0aW9uSGFuZGxlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblNwcmluZ1VwZGF0ZTogKCkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVTcHJpbmdVcGRhdGUoKTtcbiAgICAgIH0sXG4gICAgICBvblNwcmluZ0F0UmVzdDogKCkgPT4ge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZVRyYW5zaXRpb24oKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5wYW5HZXN0dXJlID0gUGFuUmVzcG9uZGVyLmNyZWF0ZSh7XG4gICAgICBvbk1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXI6IHRoaXMuX2hhbmRsZU1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXIsXG4gICAgICBvblBhblJlc3BvbmRlckdyYW50OiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCxcbiAgICAgIG9uUGFuUmVzcG9uZGVyUmVsZWFzZTogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyUmVsZWFzZSxcbiAgICAgIG9uUGFuUmVzcG9uZGVyTW92ZTogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyTW92ZSxcbiAgICAgIG9uUGFuUmVzcG9uZGVyVGVybWluYXRlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUsXG4gICAgfSk7XG4gICAgdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUgPSBudWxsO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3RoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhdKTtcbiAgICB0aGlzLmhhc2hDaGFuZ2VkID0gZmFsc2U7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2hhbmRsZVNwcmluZ1VwZGF0ZSgpO1xuICAgIHRoaXMuX2VtaXREaWRGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF0pO1xuXG4gICAgLy8gTk9URTogTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBjdXJyZW50IGxvY2F0aW9uLiBUaGVcbiAgICAvLyBsaXN0ZW5lciBpcyBjYWxsZWQgb25jZSBpbW1lZGlhdGVseS5cbiAgICBfdW5saXN0ZW4gPSBoaXN0b3J5Lmxpc3RlbihmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgbGV0IGRlc3RJbmRleCA9IDA7XG4gICAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignL3NjZW5lXycpICE9IC0xKSB7XG4gICAgICAgIGRlc3RJbmRleCA9IHBhcnNlSW50KGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoJy9zY2VuZV8nLCAnJykpO1xuICAgICAgfVxuICAgICAgaWYgKGRlc3RJbmRleCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5oYXNoQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2p1bXBOKGRlc3RJbmRleCAtIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgICAvLyB0byBzdXBwb3J0IGZvcndhcmQgYnV0dG9uLCB1bmNvbW1lbnQgdGhlIGlmXG4gICAgICAgIC8vIEJVVCBpdCdsbCByZXF1aXJlIHlvdXIgcm91dGUgY29tcG9uZW50cyB0byBzdXBwb3J0IGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHNcbiAgICAgICAgLy8gaWYgKGRlc3RJbmRleCA+IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgICAgICB0aGlzLl9jbGVhblNjZW5lc1Bhc3RJbmRleChkZXN0SW5kZXgpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdGhpcy5oYXNoQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCkge1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFdoZW4geW91J3JlIGZpbmlzaGVkLCBzdG9wIHRoZSBsaXN0ZW5lci5cbiAgICBfdW5saXN0ZW4oKTtcblxuICB9LFxuXG4gIF9uZXh0Um91dGVJRDogZnVuY3Rpb24gKHJlcGxhY2UpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAtIChyZXBsYWNlID8gMSA6IDApXG4gIH0sXG5cbiAgX2dldFJvdXRlSUQ6IGZ1bmN0aW9uIChyb3V0ZSwgYWN0aW9uKSB7XG4gICAgaWYgKHJvdXRlID09PSBudWxsIHx8IHR5cGVvZiByb3V0ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBTdHJpbmcocm91dGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suaW5kZXhPZihyb3V0ZSlcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtSb3V0ZVN0YWNrfSBuZXh0Um91dGVTdGFjayBOZXh0IHJvdXRlIHN0YWNrIHRvIHJlaW5pdGlhbGl6ZS4gVGhpc1xuICAgKiBkb2Vzbid0IGFjY2VwdCBzdGFjayBpdGVtIGBpZGBzLCB3aGljaCBpbXBsaWVzIHRoYXQgYWxsIGV4aXN0aW5nIGl0ZW1zIGFyZVxuICAgKiBkZXN0cm95ZWQsIGFuZCB0aGVuIHBvdGVudGlhbGx5IHJlY3JlYXRlZCBhY2NvcmRpbmcgdG8gYHJvdXRlU3RhY2tgLiBEb2VzXG4gICAqIG5vdCBhbmltYXRlLCBpbW1lZGlhdGVseSByZXBsYWNlcyBhbmQgcmVyZW5kZXJzIG5hdmlnYXRpb24gYmFyIGFuZCBzdGFja1xuICAgKiBpdGVtcy5cbiAgICovXG4gIGltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrOiBmdW5jdGlvbihuZXh0Um91dGVTdGFjaykge1xuICAgIGNvbnNvbGUud2FybignbmF2aWdhdG9yLmltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrIGJyZWFrcyB0aGUgYmFjayBidXR0b24hJylcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgY29uc3QgcHJldkxlbmd0aCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGhcbiAgICBsZXQgZGVzdEluZGV4ID0gbmV4dFJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJvdXRlU3RhY2s6IG5leHRSb3V0ZVN0YWNrLFxuICAgICAgc2NlbmVDb25maWdTdGFjazogbmV4dFJvdXRlU3RhY2subWFwKFxuICAgICAgICB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lXG4gICAgICApLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleCxcbiAgICAgIGFjdGl2ZUdlc3R1cmU6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsLFxuICAgICAgdHJhbnNpdGlvblF1ZXVlOiBbXSxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLl9oYW5kbGVTcHJpbmdVcGRhdGUoKTtcbiAgICB9KTtcbiAgfSxcblxuICBfdHJhbnNpdGlvblRvOiBmdW5jdGlvbihkZXN0SW5kZXgsIHZlbG9jaXR5LCBqdW1wU3ByaW5nVG8sIGNiKSB7XG4gICAgaWYgKGRlc3RJbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgdGhpcy5faGlkZVNjZW5lcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25RdWV1ZS5wdXNoKHtcbiAgICAgICAgZGVzdEluZGV4LFxuICAgICAgICB2ZWxvY2l0eSxcbiAgICAgICAgY2IsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFuc2l0aW9uRnJvbUluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleFxuICAgIC8vIGdpdmUgc2NlbmVzIGEgY2hhbmNlIHRvIHJlLXJlbmRlclxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleCxcbiAgICAgIHRyYW5zaXRpb25Gcm9tSW5kZXgsXG4gICAgICB0cmFuc2l0aW9uQ2I6IGNiXG4gICAgfSlcblxuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICAvLyBpZiAoQW5pbWF0aW9uc0RlYnVnTW9kdWxlKSB7XG4gICAgLy8gICBBbmltYXRpb25zRGVidWdNb2R1bGUuc3RhcnRSZWNvcmRpbmdGcHMoKTtcbiAgICAvLyB9XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3RyYW5zaXRpb25Gcm9tSW5kZXhdIHx8XG4gICAgICB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbZGVzdEluZGV4XTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBzY2VuZUNvbmZpZyxcbiAgICAgICdDYW5ub3QgY29uZmlndXJlIHNjZW5lIGF0IGluZGV4ICcgKyB0cmFuc2l0aW9uRnJvbUluZGV4XG4gICAgKTtcbiAgICBpZiAoanVtcFNwcmluZ1RvICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShqdW1wU3ByaW5nVG8pO1xuICAgIH1cbiAgICB0aGlzLnNwcmluZy5zZXRPdmVyc2hvb3RDbGFtcGluZ0VuYWJsZWQodHJ1ZSk7XG4gICAgdGhpcy5zcHJpbmcuZ2V0U3ByaW5nQ29uZmlnKCkuZnJpY3Rpb24gPSBzY2VuZUNvbmZpZy5zcHJpbmdGcmljdGlvbjtcbiAgICB0aGlzLnNwcmluZy5nZXRTcHJpbmdDb25maWcoKS50ZW5zaW9uID0gc2NlbmVDb25maWcuc3ByaW5nVGVuc2lvbjtcbiAgICB0aGlzLnNwcmluZy5zZXRWZWxvY2l0eSh2ZWxvY2l0eSB8fCBzY2VuZUNvbmZpZy5kZWZhdWx0VHJhbnNpdGlvblZlbG9jaXR5KTtcbiAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSgxKTtcbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGZvciBlYWNoIGZyYW1lIG9mIGVpdGhlciBhIGdlc3R1cmUgb3IgYSB0cmFuc2l0aW9uLiBJZiBib3RoIGFyZVxuICAgKiBoYXBwZW5pbmcsIHdlIG9ubHkgc2V0IHZhbHVlcyBmb3IgdGhlIHRyYW5zaXRpb24gYW5kIHRoZSBnZXN0dXJlIHdpbGwgY2F0Y2ggdXAgbGF0ZXJcbiAgICovXG4gIF9oYW5kbGVTcHJpbmdVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFByaW9yaXRpemUgaGFuZGxpbmcgdHJhbnNpdGlvbiBpbiBwcm9ncmVzcyBvdmVyIGEgZ2VzdHVyZTpcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKFxuICAgICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXgsXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlICE9IG51bGwpIHtcbiAgICAgIGxldCBwcmVzZW50ZWRUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4oXG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsXG4gICAgICAgIHByZXNlbnRlZFRvSW5kZXgsXG4gICAgICAgIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBoYXBwZW5zIGF0IHRoZSBlbmQgb2YgYSB0cmFuc2l0aW9uIHN0YXJ0ZWQgYnkgdHJhbnNpdGlvblRvLCBhbmQgd2hlbiB0aGUgc3ByaW5nIGNhdGNoZXMgdXAgdG8gYSBwZW5kaW5nIGdlc3R1cmVcbiAgICovXG4gIF9jb21wbGV0ZVRyYW5zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMSAmJiB0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSAhPT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBoYXMgZmluaXNoZWQgY2F0Y2hpbmcgdXAgdG8gYSBnZXN0dXJlIGluIHByb2dyZXNzLiBSZW1vdmUgdGhlIHBlbmRpbmcgcHJvZ3Jlc3NcbiAgICAgIC8vIGFuZCB3ZSB3aWxsIGJlIGluIGEgbm9ybWFsIGFjdGl2ZUdlc3R1cmUgc3RhdGVcbiAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fb25BbmltYXRpb25FbmQoKTtcbiAgICBsZXQgcHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCBkaWRGb2N1c1JvdXRlID0gdGhpcy5fc3ViUm91dGVGb2N1c1twcmVzZW50ZWRJbmRleF0gfHwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3ByZXNlbnRlZEluZGV4XTtcbiAgICB0aGlzLl9lbWl0RGlkRm9jdXMoZGlkRm9jdXNSb3V0ZSk7XG4gICAgLy8gaWYgKEFuaW1hdGlvbnNEZWJ1Z01vZHVsZSkge1xuICAgIC8vICAgQW5pbWF0aW9uc0RlYnVnTW9kdWxlLnN0b3BSZWNvcmRpbmdGcHMoRGF0ZS5ub3coKSk7XG4gICAgLy8gfVxuICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9IG51bGw7XG4gICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgIHRoaXMuX2hpZGVTY2VuZXMoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IpIHtcbiAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkNiKCk7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25DYiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSkge1xuICAgICAgdGhpcy5jbGVhckludGVyYWN0aW9uSGFuZGxlKHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKTtcbiAgICAgIHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcykge1xuICAgICAgLy8gQSB0cmFuc2l0aW9uIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFscmVhZHkgYW5vdGhlciBnZXN0dXJlIGhhcHBlbmluZy5cbiAgICAgIC8vIEVuYWJsZSB0aGUgc2NlbmUgYW5kIHNldCB0aGUgc3ByaW5nIHRvIGNhdGNoIHVwIHdpdGggdGhlIG5ldyBnZXN0dXJlXG4gICAgICBsZXQgZ2VzdHVyZVRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShnZXN0dXJlVG9JbmRleCk7XG4gICAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZSh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUubGVuZ3RoKSB7XG4gICAgICBsZXQgcXVldWVkVHJhbnNpdGlvbiA9IHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLnNoaWZ0KCk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCk7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1txdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleF0pO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICBxdWV1ZWRUcmFuc2l0aW9uLmRlc3RJbmRleCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi52ZWxvY2l0eSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi5jYlxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXREaWRGb2N1czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLm5hdmlnYXRpb25Db250ZXh0LmVtaXQoJ2RpZGZvY3VzJywge3JvdXRlOiByb3V0ZX0pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRGb2N1cykge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgX2VtaXRXaWxsRm9jdXM6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5uYXZpZ2F0aW9uQ29udGV4dC5lbWl0KCd3aWxsZm9jdXMnLCB7cm91dGU6IHJvdXRlfSk7XG5cbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cykge1xuICAgICAgbmF2QmFyLmhhbmRsZVdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm9uV2lsbEZvY3VzKSB7XG4gICAgICB0aGlzLnByb3BzLm9uV2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhpZGVzIGFsbCBzY2VuZXMgdGhhdCB3ZSBhcmUgbm90IGN1cnJlbnRseSBvbiwgZ2VzdHVyaW5nIHRvLCBvciB0cmFuc2l0aW9uaW5nIGZyb21cbiAgICovXG4gIF9oaWRlU2NlbmVzOiBmdW5jdGlvbigpIHtcbiAgICBsZXQgZ2VzdHVyaW5nVG9JbmRleCA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgZ2VzdHVyaW5nVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4IHx8XG4gICAgICAgICAgaSA9PT0gZ2VzdHVyaW5nVG9JbmRleCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Rpc2FibGVTY2VuZShpKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFB1c2ggYSBzY2VuZSBvZmYgdGhlIHNjcmVlbiwgc28gdGhhdCBvcGFjaXR5OjAgc2NlbmVzIHdpbGwgbm90IGJsb2NrIHRvdWNoZXMgc2VudCB0byB0aGUgcHJlc2VudGVkIHNjZW5lc1xuICAgKi9cbiAgX2Rpc2FibGVTY2VuZTogZnVuY3Rpb24oc2NlbmVJbmRleCkge1xuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTKTtcbiAgfSxcblxuICAvKipcbiAgICogUHV0IHRoZSBzY2VuZSBiYWNrIGludG8gdGhlIHN0YXRlIGFzIGRlZmluZWQgYnkgcHJvcHMuc2NlbmVTdHlsZSwgc28gdHJhbnNpdGlvbnMgY2FuIGhhcHBlbiBub3JtYWxseVxuICAgKi9cbiAgX2VuYWJsZVNjZW5lOiBmdW5jdGlvbihzY2VuZUluZGV4KSB7XG4gICAgLy8gRmlyc3QsIGRldGVybWluZSB3aGF0IHRoZSBkZWZpbmVkIHN0eWxlcyBhcmUgZm9yIHNjZW5lcyBpbiB0aGlzIG5hdmlnYXRvclxuICAgIGxldCBzY2VuZVN0eWxlID0gZmxhdHRlblN0eWxlKFtzdHlsZXMuYmFzZVNjZW5lLCB0aGlzLnByb3BzLnNjZW5lU3R5bGVdKTtcbiAgICAvLyBUaGVuIHJlc3RvcmUgdGhlIHBvaW50ZXIgZXZlbnRzIGFuZCB0b3AgdmFsdWUgZm9yIHRoaXMgc2NlbmVcbiAgICBsZXQgc2NlbmVOYXRpdmVQcm9wcyA9IHtcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdhdXRvJyxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHRvcDogc2NlbmVTdHlsZS50b3AsXG4gICAgICAgIGJvdHRvbTogc2NlbmVTdHlsZS5ib3R0b20sXG4gICAgICAgIC4uLnZpc2libGVTdHlsZVxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gaWYgKHNjZW5lSW5kZXggIT09IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAmJlxuICAgIC8vICAgICBzY2VuZUluZGV4ICE9PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgLy8gICAvLyBJZiB3ZSBhcmUgbm90IGluIGEgdHJhbnNpdGlvbiBmcm9tIHRoaXMgaW5kZXgsIG1ha2Ugc3VyZSBvcGFjaXR5IGlzIDBcbiAgICAvLyAgIC8vIHRvIHByZXZlbnQgdGhlIGVuYWJsZWQgc2NlbmUgZnJvbSBmbGFzaGluZyBvdmVyIHRoZSBwcmVzZW50ZWQgc2NlbmVcbiAgICAvLyAgIHNjZW5lTmF0aXZlUHJvcHMucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAvLyAgIE9iamVjdC5hc3NpZ24oc2NlbmVOYXRpdmVQcm9wcy5zdHlsZSwgU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTLnN0eWxlKVxuICAgIC8vIH1cblxuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoc2NlbmVOYXRpdmVQcm9wcyk7XG4gIH0sXG5cbiAgX29uQW5pbWF0aW9uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBmcm9tSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCB0b0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHtcbiAgICAgIGZyb21JbmRleCA9IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgdG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQoZnJvbUluZGV4LCB0cnVlKTtcbiAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCh0b0luZGV4LCB0cnVlKTtcbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLm9uQW5pbWF0aW9uU3RhcnQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvblN0YXJ0KGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkFuaW1hdGlvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1heCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPD0gbWF4OyBpbmRleCsrKSB7XG4gICAgICB0aGlzLl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZChpbmRleCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIub25BbmltYXRpb25FbmQpIHtcbiAgICAgIG5hdkJhci5vbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IGZ1bmN0aW9uKHNjZW5lSW5kZXgsIHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlKSB7XG4gICAgbGV0IHZpZXdBdEluZGV4ID0gdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlld0F0SW5kZXguc2V0TmF0aXZlUHJvcHMoIHtyZW5kZXJUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQ6IHNob3VsZFJlbmRlclRvSGFyZHdhcmVUZXh0dXJlfSk7XG4gIH0sXG5cbiAgX2hhbmRsZVRvdWNoU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSBHRVNUVVJFX0FDVElPTlM7XG4gIH0sXG5cbiAgX2hhbmRsZU1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXI6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAoIXNjZW5lQ29uZmlnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCA9IHRoaXMuX21hdGNoR2VzdHVyZUFjdGlvbih0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICByZXR1cm4gISF0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQ7XG4gIH0sXG5cbiAgX2RvZXNHZXN0dXJlT3ZlcnN3aXBlOiBmdW5jdGlvbihnZXN0dXJlTmFtZSkge1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUJhY2sgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IDw9IDAgJiZcbiAgICAgIChnZXN0dXJlTmFtZSA9PT0gJ3BvcCcgfHwgZ2VzdHVyZU5hbWUgPT09ICdqdW1wQmFjaycpO1xuICAgIGxldCB3b3VsZE92ZXJzd2lwZUZvcndhcmQgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID49IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAxICYmXG4gICAgICBnZXN0dXJlTmFtZSA9PT0gJ2p1bXBGb3J3YXJkJztcbiAgICByZXR1cm4gd291bGRPdmVyc3dpcGVGb3J3YXJkIHx8IHdvdWxkT3ZlcnN3aXBlQmFjaztcbiAgfSxcblxuICBfaGFuZGxlUGFuUmVzcG9uZGVyR3JhbnQ6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuX2V4cGVjdGluZ0dlc3R1cmVHcmFudCxcbiAgICAgICdSZXNwb25kZXIgZ3JhbnRlZCB1bmV4cGVjdGVkbHkuJ1xuICAgICk7XG4gICAgdGhpcy5fYXR0YWNoR2VzdHVyZSh0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQpO1xuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQgPSBudWxsO1xuICB9LFxuXG4gIF9kZWx0YUZvckdlc3R1cmVBY3Rpb246IGZ1bmN0aW9uKGdlc3R1cmVBY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmVBY3Rpb24pIHtcbiAgICAgIGNhc2UgJ3BvcCc6XG4gICAgICBjYXNlICdqdW1wQmFjayc6XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIGNhc2UgJ2p1bXBGb3J3YXJkJzpcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpbnZhcmlhbnQoZmFsc2UsICdVbnN1cHBvcnRlZCBnZXN0dXJlIGFjdGlvbiAnICsgZ2VzdHVyZUFjdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlclJlbGVhc2U6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBsZXQgcmVsZWFzZUdlc3R1cmVBY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmU7XG4gICAgaWYgKCFyZWxlYXNlR2VzdHVyZUFjdGlvbikge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgbWF5IGhhdmUgYmVlbiBkZXRhY2hlZCB3aGlsZSByZXNwb25kZXIsIHNvIHRoZXJlIGlzIG5vIGFjdGlvbiBoZXJlXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCByZWxlYXNlR2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3JlbGVhc2VHZXN0dXJlQWN0aW9uXTtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIGlmICh0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKSA9PT0gMCkge1xuICAgICAgLy8gVGhlIHNwcmluZyBpcyBhdCB6ZXJvLCBzbyB0aGUgZ2VzdHVyZSBpcyBhbHJlYWR5IGNvbXBsZXRlXG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgICB0aGlzLl9jb21wbGV0ZVRyYW5zaXRpb24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICBsZXQgaXNUcmF2ZWxJbnZlcnRlZCA9IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IHJlbGVhc2VHZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCB2ZWxvY2l0eSwgZ2VzdHVyZURpc3RhbmNlO1xuICAgIGlmIChpc1RyYXZlbFZlcnRpY2FsKSB7XG4gICAgICB2ZWxvY2l0eSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLnZ5IDogZ2VzdHVyZVN0YXRlLnZ5O1xuICAgICAgZ2VzdHVyZURpc3RhbmNlID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlbG9jaXR5ID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUudnggOiBnZXN0dXJlU3RhdGUudng7XG4gICAgICBnZXN0dXJlRGlzdGFuY2UgPSBpc1RyYXZlbEludmVydGVkID8gLWdlc3R1cmVTdGF0ZS5keCA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICB9XG4gICAgbGV0IHRyYW5zaXRpb25WZWxvY2l0eSA9IGNsYW1wKC0xMCwgdmVsb2NpdHksIDEwKTtcbiAgICBpZiAoTWF0aC5hYnModmVsb2NpdHkpIDwgcmVsZWFzZUdlc3R1cmUubm90TW92aW5nKSB7XG4gICAgICAvLyBUaGUgZ2VzdHVyZSB2ZWxvY2l0eSBpcyBzbyBzbG93LCBpcyBcIm5vdCBtb3ZpbmdcIlxuICAgICAgbGV0IGhhc0dlc3R1cmVkRW5vdWdoVG9Db21wbGV0ZSA9IGdlc3R1cmVEaXN0YW5jZSA+IHJlbGVhc2VHZXN0dXJlLmZ1bGxEaXN0YW5jZSAqIHJlbGVhc2VHZXN0dXJlLnN0aWxsQ29tcGxldGlvblJhdGlvO1xuICAgICAgdHJhbnNpdGlvblZlbG9jaXR5ID0gaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlID8gcmVsZWFzZUdlc3R1cmUuc25hcFZlbG9jaXR5IDogLXJlbGVhc2VHZXN0dXJlLnNuYXBWZWxvY2l0eTtcbiAgICB9XG4gICAgaWYgKHRyYW5zaXRpb25WZWxvY2l0eSA8IDAgfHwgdGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUocmVsZWFzZUdlc3R1cmVBY3Rpb24pKSB7XG4gICAgICAvLyBUaGlzIGdlc3R1cmUgaXMgdG8gYW4gb3ZlcnN3aXBlZCByZWdpb24gb3IgZG9lcyBub3QgaGF2ZSBlbm91Z2ggdmVsb2NpdHkgdG8gY29tcGxldGVcbiAgICAgIC8vIElmIHdlIGFyZSBjdXJyZW50bHkgbWlkLXRyYW5zaXRpb24sIHRoZW4gdGhpcyBnZXN0dXJlIHdhcyBhIHBlbmRpbmcgZ2VzdHVyZS4gQmVjYXVzZSB0aGlzIGdlc3R1cmUgdGFrZXMgbm8gYWN0aW9uLCB3ZSBjYW4gc3RvcCBoZXJlXG4gICAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ID09IG51bGwpIHtcbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gY3VycmVudCB0cmFuc2l0aW9uLCBzbyB3ZSBuZWVkIHRvIHRyYW5zaXRpb24gYmFjayB0byB0aGUgcHJlc2VudGVkIGluZGV4XG4gICAgICAgIGxldCB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgICAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgICAgICAtIHRyYW5zaXRpb25WZWxvY2l0eSxcbiAgICAgICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgaGFzIGVub3VnaCB2ZWxvY2l0eSB0byBjb21wbGV0ZSwgc28gd2UgdHJhbnNpdGlvbiB0byB0aGUgZ2VzdHVyZSdzIGRlc3RpbmF0aW9uXG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgZGVzdEluZGV4LFxuICAgICAgICB0cmFuc2l0aW9uVmVsb2NpdHksXG4gICAgICAgIG51bGwsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBpZiAocmVsZWFzZUdlc3R1cmVBY3Rpb24gPT09ICdwb3AnKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGVhblNjZW5lc1Bhc3RJbmRleChkZXN0SW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fZGV0YWNoR2VzdHVyZSgpO1xuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIHRoaXMuX2RldGFjaEdlc3R1cmUoKTtcbiAgICBsZXQgdHJhbnNpdGlvbkJhY2tUb1ByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICAvLyBzbGlnaHQgaGFjazogY2hhbmdlIHRoZSBwcmVzZW50ZWQgaW5kZXggZm9yIGEgbW9tZW50IGluIG9yZGVyIHRvIHRyYW5zaXRpb25UbyBjb3JyZWN0bHlcbiAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID0gZGVzdEluZGV4O1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgIHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCxcbiAgICAgIG51bGwsXG4gICAgICAxIC0gdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICApO1xuICB9LFxuXG4gIF9hdHRhY2hHZXN0dXJlOiBmdW5jdGlvbihnZXN0dXJlSWQpIHtcbiAgICB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPSBnZXN0dXJlSWQ7XG4gICAgbGV0IGdlc3R1cmluZ1RvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZ2VzdHVyaW5nVG9JbmRleCk7XG4gIH0sXG5cbiAgX2RldGFjaEdlc3R1cmU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSA9IG51bGw7XG4gICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbnVsbDtcbiAgICB0aGlzLl9oaWRlU2NlbmVzKCk7XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlck1vdmU6IGZ1bmN0aW9uKGUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IHNjZW5lQ29uZmlnLmdlc3R1cmVzW3RoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZV07XG4gICAgICByZXR1cm4gdGhpcy5fbW92ZUF0dGFjaGVkR2VzdHVyZShnZXN0dXJlLCBnZXN0dXJlU3RhdGUpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hlZEdlc3R1cmUgPSB0aGlzLl9tYXRjaEdlc3R1cmVBY3Rpb24oR0VTVFVSRV9BQ1RJT05TLCBzY2VuZUNvbmZpZy5nZXN0dXJlcywgZ2VzdHVyZVN0YXRlKTtcbiAgICBpZiAobWF0Y2hlZEdlc3R1cmUpIHtcbiAgICAgIHRoaXMuX2F0dGFjaEdlc3R1cmUobWF0Y2hlZEdlc3R1cmUpO1xuICAgIH1cbiAgfSxcblxuICBfbW92ZUF0dGFjaGVkR2VzdHVyZTogZnVuY3Rpb24oZ2VzdHVyZSwgZ2VzdHVyZVN0YXRlKSB7XG4gICAgbGV0IGlzVHJhdmVsVmVydGljYWwgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3RvcC10by1ib3R0b20nIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGRpc3RhbmNlID0gaXNUcmF2ZWxWZXJ0aWNhbCA/IGdlc3R1cmVTdGF0ZS5keSA6IGdlc3R1cmVTdGF0ZS5keDtcbiAgICBkaXN0YW5jZSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtIGRpc3RhbmNlIDogZGlzdGFuY2U7XG4gICAgbGV0IGdlc3R1cmVEZXRlY3RNb3ZlbWVudCA9IGdlc3R1cmUuZ2VzdHVyZURldGVjdE1vdmVtZW50O1xuICAgIGxldCBuZXh0UHJvZ3Jlc3MgPSAoZGlzdGFuY2UgLSBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQpIC9cbiAgICAgIChnZXN0dXJlLmZ1bGxEaXN0YW5jZSAtIGdlc3R1cmVEZXRlY3RNb3ZlbWVudCk7XG4gICAgaWYgKG5leHRQcm9ncmVzcyA8IDAgJiYgZ2VzdHVyZS5pc0RldGFjaGFibGUpIHtcbiAgICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4odGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCwgZ2VzdHVyaW5nVG9JbmRleCwgMCk7XG4gICAgICB0aGlzLl9kZXRhY2hHZXN0dXJlKCk7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSkge1xuICAgICAgbGV0IGZyaWN0aW9uQ29uc3RhbnQgPSBnZXN0dXJlLm92ZXJzd2lwZS5mcmljdGlvbkNvbnN0YW50O1xuICAgICAgbGV0IGZyaWN0aW9uQnlEaXN0YW5jZSA9IGdlc3R1cmUub3ZlcnN3aXBlLmZyaWN0aW9uQnlEaXN0YW5jZTtcbiAgICAgIGxldCBmcmljdGlvblJhdGlvID0gMSAvICgoZnJpY3Rpb25Db25zdGFudCkgKyAoTWF0aC5hYnMobmV4dFByb2dyZXNzKSAqIGZyaWN0aW9uQnlEaXN0YW5jZSkpO1xuICAgICAgbmV4dFByb2dyZXNzICo9IGZyaWN0aW9uUmF0aW87XG4gICAgfVxuICAgIG5leHRQcm9ncmVzcyA9IGNsYW1wKDAsIG5leHRQcm9ncmVzcywgMSk7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MgPSBuZXh0UHJvZ3Jlc3M7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEVuZFZhbHVlKG5leHRQcm9ncmVzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZShuZXh0UHJvZ3Jlc3MpO1xuICAgIH1cbiAgfSxcblxuICBfbWF0Y2hHZXN0dXJlQWN0aW9uOiBmdW5jdGlvbihlbGlnaWJsZUdlc3R1cmVzLCBnZXN0dXJlcywgZ2VzdHVyZVN0YXRlKSB7XG4gICAgaWYgKCFnZXN0dXJlcykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBtYXRjaGVkR2VzdHVyZSA9IG51bGw7XG4gICAgZWxpZ2libGVHZXN0dXJlcy5zb21lKChnZXN0dXJlTmFtZSwgZ2VzdHVyZUluZGV4KSA9PiB7XG4gICAgICBsZXQgZ2VzdHVyZSA9IGdlc3R1cmVzW2dlc3R1cmVOYW1lXTtcbiAgICAgIGlmICghZ2VzdHVyZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZ2VzdHVyZS5vdmVyc3dpcGUgPT0gbnVsbCAmJiB0aGlzLl9kb2VzR2VzdHVyZU92ZXJzd2lwZShnZXN0dXJlTmFtZSkpIHtcbiAgICAgICAgLy8gY2Fubm90IHN3aXBlIHBhc3QgZmlyc3Qgb3IgbGFzdCBzY2VuZSB3aXRob3V0IG92ZXJzd2lwaW5nXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0LXRvLWxlZnQnIHx8IGdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgICBsZXQgY3VycmVudExvYyA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUubW92ZVkgOiBnZXN0dXJlU3RhdGUubW92ZVg7XG4gICAgICBsZXQgdHJhdmVsRGlzdCA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgICBsZXQgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9XG4gICAgICAgIGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHggOiBnZXN0dXJlU3RhdGUuZHk7XG4gICAgICBsZXQgZWRnZUhpdFdpZHRoID0gZ2VzdHVyZS5lZGdlSGl0V2lkdGg7XG4gICAgICBpZiAoaXNUcmF2ZWxJbnZlcnRlZCkge1xuICAgICAgICBjdXJyZW50TG9jID0gLWN1cnJlbnRMb2M7XG4gICAgICAgIHRyYXZlbERpc3QgPSAtdHJhdmVsRGlzdDtcbiAgICAgICAgb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCA9IC1vcHBvc2l0ZUF4aXNUcmF2ZWxEaXN0O1xuICAgICAgICBlZGdlSGl0V2lkdGggPSBpc1RyYXZlbFZlcnRpY2FsID9cbiAgICAgICAgICAtKFNDUkVFTl9IRUlHSFQgLSBlZGdlSGl0V2lkdGgpIDpcbiAgICAgICAgICAtKFNDUkVFTl9XSURUSCAtIGVkZ2VIaXRXaWR0aCk7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVN0YXJ0ZWRJblJlZ2lvbiA9IGdlc3R1cmUuZWRnZUhpdFdpZHRoID09IG51bGwgfHxcbiAgICAgICAgY3VycmVudExvYyA8IGVkZ2VIaXRXaWR0aDtcbiAgICAgIGlmICghbW92ZVN0YXJ0ZWRJblJlZ2lvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgbW92ZVRyYXZlbGxlZEZhckVub3VnaCA9IHRyYXZlbERpc3QgPj0gZ2VzdHVyZS5nZXN0dXJlRGV0ZWN0TW92ZW1lbnQ7XG4gICAgICBpZiAoIW1vdmVUcmF2ZWxsZWRGYXJFbm91Z2gpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbGV0IGRpcmVjdGlvbklzQ29ycmVjdCA9IE1hdGguYWJzKHRyYXZlbERpc3QpID4gTWF0aC5hYnMob3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCkgKiBnZXN0dXJlLmRpcmVjdGlvblJhdGlvO1xuICAgICAgaWYgKGRpcmVjdGlvbklzQ29ycmVjdCkge1xuICAgICAgICBtYXRjaGVkR2VzdHVyZSA9IGdlc3R1cmVOYW1lO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VsaWdpYmxlR2VzdHVyZXMgPSB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzLnNsaWNlKCkuc3BsaWNlKGdlc3R1cmVJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoZWRHZXN0dXJlO1xuICB9LFxuXG4gIF90cmFuc2l0aW9uU2NlbmVTdHlsZTogZnVuY3Rpb24oZnJvbUluZGV4LCB0b0luZGV4LCBwcm9ncmVzcywgaW5kZXgpIHtcbiAgICBsZXQgdmlld0F0SW5kZXggPSB0aGlzLnJlZnNbJ3NjZW5lXycgKyBpbmRleF07XG4gICAgaWYgKHZpZXdBdEluZGV4ID09PSBudWxsIHx8IHZpZXdBdEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVXNlIHRvSW5kZXggYW5pbWF0aW9uIHdoZW4gd2UgbW92ZSBmb3J3YXJkcy4gVXNlIGZyb21JbmRleCB3aGVuIHdlIG1vdmUgYmFja1xuICAgIGxldCBzY2VuZUNvbmZpZ0luZGV4ID0gZnJvbUluZGV4IDwgdG9JbmRleCA/IHRvSW5kZXggOiBmcm9tSW5kZXg7XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3NjZW5lQ29uZmlnSW5kZXhdO1xuICAgIC8vIHRoaXMgaGFwcGVucyBmb3Igb3ZlcnN3aXBpbmcgd2hlbiB0aGVyZSBpcyBubyBzY2VuZSBhdCB0b0luZGV4XG4gICAgaWYgKCFzY2VuZUNvbmZpZykge1xuICAgICAgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbc2NlbmVDb25maWdJbmRleCAtIDFdO1xuICAgIH1cbiAgICBsZXQgc3R5bGVUb1VzZSA9IHt9O1xuICAgIGxldCB1c2VGbiA9IGluZGV4IDwgZnJvbUluZGV4IHx8IGluZGV4IDwgdG9JbmRleCA/XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLm91dCA6XG4gICAgICBzY2VuZUNvbmZpZy5hbmltYXRpb25JbnRlcnBvbGF0b3JzLmludG87XG4gICAgbGV0IGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MgPSBmcm9tSW5kZXggPCB0b0luZGV4ID8gcHJvZ3Jlc3MgOiAxIC0gcHJvZ3Jlc3M7XG4gICAgbGV0IGRpZENoYW5nZSA9IHVzZUZuKHN0eWxlVG9Vc2UsIGRpcmVjdGlvbkFkanVzdGVkUHJvZ3Jlc3MpO1xuICAgIGlmIChkaWRDaGFuZ2UpIHtcbiAgICAgIHZpZXdBdEluZGV4LnNldE5hdGl2ZVByb3BzKHtzdHlsZTogc3R5bGVUb1VzZX0pO1xuICAgIH1cbiAgfSxcblxuICBfdHJhbnNpdGlvbkJldHdlZW46IGZ1bmN0aW9uKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MpIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uU2NlbmVTdHlsZShmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzLCBmcm9tSW5kZXgpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25TY2VuZVN0eWxlKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MsIHRvSW5kZXgpO1xuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MgJiYgdG9JbmRleCA+PSAwICYmIGZyb21JbmRleCA+PSAwKSB7XG4gICAgICBuYXZCYXIudXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3MsIGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVSZXNwb25kZXJUZXJtaW5hdGlvblJlcXVlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBfZ2V0RGVzdEluZGV4V2l0aGluQm91bmRzOiBmdW5jdGlvbihuKSB7XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgbGV0IGRlc3RJbmRleCA9IGN1cnJlbnRJbmRleCArIG47XG4gICAgaW52YXJpYW50KFxuICAgICAgZGVzdEluZGV4ID49IDAsXG4gICAgICAnQ2Fubm90IGp1bXAgYmVmb3JlIHRoZSBmaXJzdCByb3V0ZS4nXG4gICAgKTtcbiAgICBsZXQgbWF4SW5kZXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBtYXhJbmRleCA+PSBkZXN0SW5kZXgsXG4gICAgICAnQ2Fubm90IGp1bXAgcGFzdCB0aGUgbGFzdCByb3V0ZS4nXG4gICAgKTtcbiAgICByZXR1cm4gZGVzdEluZGV4O1xuICB9LFxuXG4gIF9qdW1wTjogZnVuY3Rpb24obikge1xuICAgIGxldCBkZXN0SW5kZXggPSB0aGlzLl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMobik7XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUoZGVzdEluZGV4KTtcbiAgICBjb25zdCByb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFja1tkZXN0SW5kZXhdXG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgdGhpcy5fdHJhbnNpdGlvblRvKGRlc3RJbmRleCk7XG4gICAgaWYgKCF0aGlzLmhhc2hDaGFuZ2VkKSB7XG4gICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoeyBpbmRleDogZGVzdEluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkuZ28obik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGlmIChuIDwgMCkge1xuICAgIC8vICAgLy8gX191aWQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZVxuICAgIC8vICAgX191aWQgPSBNYXRoLm1heChfX3VpZCArIG4sIDApO1xuICAgIC8vIH1cbiAgfSxcblxuICBqdW1wVG86IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBkZXN0SW5kZXggIT09IC0xLFxuICAgICAgJ0Nhbm5vdCBqdW1wIHRvIHJvdXRlIHRoYXQgaXMgbm90IGluIHRoZSByb3V0ZSBzdGFjaydcbiAgICApO1xuICAgIHRoaXMuX2p1bXBOKGRlc3RJbmRleCAtIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICB9LFxuXG4gIGp1bXBGb3J3YXJkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9qdW1wTigxKTtcbiAgfSxcblxuICBqdW1wQmFjazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fanVtcE4oLTEpO1xuICB9LFxuXG4gIHB1c2g6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgaW52YXJpYW50KCEhcm91dGUsICdNdXN0IHN1cHBseSByb3V0ZSB0byBwdXNoJyk7XG4gICAgbGV0IGFjdGl2ZUxlbmd0aCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyAxO1xuICAgIGxldCBhY3RpdmVTdGFjayA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5zbGljZSgwLCBhY3RpdmVMZW5ndGgpO1xuICAgIGxldCBhY3RpdmVBbmltYXRpb25Db25maWdTdGFjayA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFjay5zbGljZSgwLCBhY3RpdmVMZW5ndGgpO1xuICAgIGxldCBuZXh0U3RhY2sgPSBhY3RpdmVTdGFjay5jb25jYXQoW3JvdXRlXSk7XG4gICAgbGV0IGRlc3RJbmRleCA9IG5leHRTdGFjay5sZW5ndGggLSAxO1xuICAgIGxldCBuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2sgPSBhY3RpdmVBbmltYXRpb25Db25maWdTdGFjay5jb25jYXQoW1xuICAgICAgdGhpcy5wcm9wcy5jb25maWd1cmVTY2VuZShyb3V0ZSksXG4gICAgXSk7XG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhuZXh0U3RhY2tbZGVzdEluZGV4XSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0U3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2ssXG4gICAgICAvLyBwcmVzZW50ZWRJbmRleDogZGVzdEluZGV4XG4gICAgfSwgKCkgPT4ge1xuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoeyBpbmRleDogZGVzdEluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIHRoaXMuX2VuYWJsZVNjZW5lKGRlc3RJbmRleCk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uVG8oZGVzdEluZGV4KTtcbiAgICB9KTtcbiAgfSxcblxuICBfcG9wTjogZnVuY3Rpb24obikge1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggLSBuID49IDAsXG4gICAgICAnQ2Fubm90IHBvcCBiZWxvdyB6ZXJvJ1xuICAgICk7XG4gICAgbGV0IHBvcEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCAtIG47XG4gICAgdGhpcy5fZW5hYmxlU2NlbmUocG9wSW5kZXgpO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3BvcEluZGV4XSk7XG4gICAgdGhpcy5fdHJhbnNpdGlvblRvKFxuICAgICAgcG9wSW5kZXgsXG4gICAgICBudWxsLCAvLyBkZWZhdWx0IHZlbG9jaXR5XG4gICAgICBudWxsLCAvLyBubyBzcHJpbmcganVtcGluZ1xuICAgICAgKCkgPT4ge1xuICAgICAgICBoaXN0b3J5LmdvKC1uKTtcbiAgICAgICAgdGhpcy5fY2xlYW5TY2VuZXNQYXN0SW5kZXgocG9wSW5kZXgpO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgcG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUubGVuZ3RoKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSB3b3JrYXJvdW5kIHRvIHByZXZlbnQgdXNlciBmcm9tIGZpcmluZyBtdWx0aXBsZSBgcG9wKClgXG4gICAgICAvLyBjYWxscyB0aGF0IG1heSBwb3AgdGhlIHJvdXRlcyBiZXlvbmQgdGhlIGxpbWl0LlxuICAgICAgLy8gQmVjYXVzZSBgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleGAgZG9lcyBub3QgdXBkYXRlIHVudGlsIHRoZVxuICAgICAgLy8gdHJhbnNpdGlvbiBzdGFydHMsIHdlIGNhbid0IHJlbGlhYmx5IHVzZSBgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleGBcbiAgICAgIC8vIHRvIGtub3cgd2hldGhlciB3ZSBjYW4gc2FmZWx5IGtlZXAgcG9wcGluZyB0aGUgcm91dGVzIG9yIG5vdCBhdCB0aGlzXG4gICAgICAvLyAgbW9tZW50LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgdGhpcy5fcG9wTigxKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYSByb3V0ZSBpbiB0aGUgbmF2aWdhdGlvbiBzdGFjay5cbiAgICpcbiAgICogYGluZGV4YCBzcGVjaWZpZXMgdGhlIHJvdXRlIGluIHRoZSBzdGFjayB0aGF0IHNob3VsZCBiZSByZXBsYWNlZC5cbiAgICogSWYgaXQncyBuZWdhdGl2ZSwgaXQgY291bnRzIGZyb20gdGhlIGJhY2suXG4gICAqL1xuICByZXBsYWNlQXRJbmRleDogZnVuY3Rpb24ocm91dGUsIGluZGV4LCBjYikge1xuICAgIGludmFyaWFudCghIXJvdXRlLCAnTXVzdCBzdXBwbHkgcm91dGUgdG8gcmVwbGFjZScpO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgIGluZGV4ICs9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggPD0gaW5kZXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXBsYWNlQ3VycmVudCA9IGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XG4gICAgaWYgKCFyZXBsYWNlQ3VycmVudCkge1xuICAgICAgY29uc29sZS53YXJuKCduYXZpZ2F0b3IucmVwbGFjZUF0SW5kZXggZm9yIHRoZSBub24tY3VycmVudCByb3V0ZSBicmVha3MgdGhlIGJhY2sgYnV0dG9uIScpXG4gICAgfVxuXG4gICAgbGV0IG5leHRSb3V0ZVN0YWNrID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKCk7XG4gICAgbGV0IG5leHRBbmltYXRpb25Nb2RlU3RhY2sgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoKTtcbiAgICBuZXh0Um91dGVTdGFja1tpbmRleF0gPSByb3V0ZTtcbiAgICBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrW2luZGV4XSA9IHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpO1xuXG4gICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0Um91dGVTdGFjayxcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IG5leHRBbmltYXRpb25Nb2RlU3RhY2ssXG4gICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICAgIHRoaXMuX2VtaXREaWRGb2N1cyhyb3V0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXBsYWNlQ3VycmVudCkge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IGluZGV4IH0sICcvc2NlbmVfJyArIHRoaXMuX2dldFJvdXRlSUQocm91dGUpKTtcbiAgICAgIH1cblxuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIGN1cnJlbnQgc2NlbmUgaW4gdGhlIHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgY3VycmVudCByb3V0ZSdzIHBhcmVudC5cbiAgICovXG4gIHJlcGxhY2VQcmV2aW91czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gMSk7XG4gIH0sXG5cbiAgcG9wVG9Ub3A6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucG9wVG9Sb3V0ZSh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbMF0pO1xuICB9LFxuXG4gIHBvcFRvUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGluZGV4T2ZSb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBpbmRleE9mUm91dGUgIT09IC0xLFxuICAgICAgJ0NhbGxpbmcgcG9wVG9Sb3V0ZSBmb3IgYSByb3V0ZSB0aGF0IGRvZXNuXFwndCBleGlzdCEnXG4gICAgKTtcbiAgICBsZXQgbnVtVG9Qb3AgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gaW5kZXhPZlJvdXRlO1xuICAgIHRoaXMuX3BvcE4obnVtVG9Qb3ApO1xuICB9LFxuXG4gIHJlcGxhY2VQcmV2aW91c0FuZFBvcDogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXBsYWNlUHJldmlvdXMocm91dGUpO1xuICAgIHRoaXMucG9wKCk7XG4gIH0sXG5cbiAgcmVzZXRUbzogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHB1c2gnKTtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCAwLCAoKSA9PiB7XG4gICAgICAvLyBEbyBub3QgdXNlIHBvcFRvUm91dGUgaGVyZSwgYmVjYXVzZSByYWNlIGNvbmRpdGlvbnMgY291bGQgcHJldmVudCB0aGVcbiAgICAgIC8vIHJvdXRlIGZyb20gZXhpc3RpbmcgYXQgdGhpcyB0aW1lLiBJbnN0ZWFkLCBqdXN0IGdvIHRvIGluZGV4IDBcbiAgICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLl9wb3BOKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGdldEN1cnJlbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsb25lIGJlZm9yZSByZXR1cm5pbmcgdG8gYXZvaWQgY2FsbGVyIG11dGF0aW5nIHRoZSBzdGFja1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoKTtcbiAgfSxcblxuICBfY2xlYW5TY2VuZXNQYXN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IG5ld1N0YWNrTGVuZ3RoID0gaW5kZXggKyAxO1xuICAgIC8vIFJlbW92ZSBhbnkgdW5uZWVkZWQgcmVuZGVyZWQgcm91dGVzLlxuICAgIGlmIChuZXdTdGFja0xlbmd0aCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2VuZUNvbmZpZ1N0YWNrOiB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICByb3V0ZVN0YWNrOiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXhcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVyU2NlbmU6IGZ1bmN0aW9uKHJvdXRlLCBpKSB7XG4gICAgLy8gbGV0IGRpc2FibGVkU2NlbmVTdHlsZSA9IG51bGw7XG4gICAgbGV0IHBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgaWYgKGkgIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIC8vIGRpc2FibGVkU2NlbmVTdHlsZSA9IHN0eWxlcy5kaXNhYmxlZFNjZW5lO1xuICAgICAgcG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZUlkID0gdGhpcy5fZ2V0Um91dGVJRChyb3V0ZSlcbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXdcbiAgICAgICAga2V5PXsnc2NlbmVfJyArIHJvdXRlSWR9XG4gICAgICAgIHJlZj17J3NjZW5lXycgKyByb3V0ZUlkfVxuICAgICAgICBvblN0YXJ0U2hvdWxkU2V0UmVzcG9uZGVyQ2FwdHVyZT17KCkgPT4ge1xuICAgICAgICAgIHJldHVybiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHx8ICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIHBvaW50ZXJFdmVudHM9e3BvaW50ZXJFdmVudHN9XG4gICAgICAgIHN0eWxlPXtbc3R5bGVzLmJhc2VTY2VuZSwgdGhpcy5wcm9wcy5zY2VuZVN0eWxlLyosIGRpc2FibGVkU2NlbmVTdHlsZSovXX0+XG4gICAgICAgIHt0aGlzLnByb3BzLnJlbmRlclNjZW5lKFxuICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKX1cbiAgICAgIDwvVmlldz5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uQmFyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMubmF2aWdhdGlvbkJhcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQodGhpcy5wcm9wcy5uYXZpZ2F0aW9uQmFyLCB7XG4gICAgICByZWY6IChuYXZCYXIpID0+IHtcbiAgICAgICAgdGhpcy5fbmF2QmFyID0gbmF2QmFyO1xuICAgICAgfSxcbiAgICAgIG5hdmlnYXRvcjogdGhpcyxcbiAgICAgIG5hdlN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG5ld1JlbmRlcmVkU2NlbmVNYXAgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHNjZW5lcyA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5tYXAoKHJvdXRlLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHJlbmRlcmVkU2NlbmU7XG4gICAgICBpZiAodGhpcy5fcmVuZGVyZWRTY2VuZU1hcC5oYXMocm91dGUpICYmXG4gICAgICAgICAgaW5kZXggIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgICAgcmVuZGVyZWRTY2VuZSA9IHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAuZ2V0KHJvdXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkU2NlbmUgPSB0aGlzLl9yZW5kZXJTY2VuZShyb3V0ZSwgaW5kZXgpO1xuICAgICAgfVxuICAgICAgbmV3UmVuZGVyZWRTY2VuZU1hcC5zZXQocm91dGUsIHJlbmRlcmVkU2NlbmUpO1xuICAgICAgcmV0dXJuIHJlbmRlcmVkU2NlbmU7XG4gICAgfSk7XG4gICAgdGhpcy5fcmVuZGVyZWRTY2VuZU1hcCA9IG5ld1JlbmRlcmVkU2NlbmVNYXA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3IHN0eWxlPXtbc3R5bGVzLmNvbnRhaW5lciwgdGhpcy5wcm9wcy5zdHlsZV19PlxuICAgICAgICA8Vmlld1xuICAgICAgICAgIHN0eWxlPXtzdHlsZXMudHJhbnNpdGlvbmVyfVxuICAgICAgICAgIHsuLi50aGlzLnBhbkdlc3R1cmUucGFuSGFuZGxlcnN9XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0PXt0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0fVxuICAgICAgICAgIG9uUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0PXtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdFxuICAgICAgICAgIH0+XG4gICAgICAgICAge3NjZW5lc31cbiAgICAgICAgPC9WaWV3PlxuICAgICAgICB7dGhpcy5fcmVuZGVyTmF2aWdhdGlvbkJhcigpfVxuICAgICAgPC9WaWV3PlxuICAgICk7XG4gIH0sXG5cbiAgX2dldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX25hdmlnYXRpb25Db250ZXh0KSB7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCA9IG5ldyBOYXZpZ2F0aW9uQ29udGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQ7XG4gIH1cbn0pO1xuXG5OYXZpZ2F0b3IuaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRvcjtcbiJdfQ==