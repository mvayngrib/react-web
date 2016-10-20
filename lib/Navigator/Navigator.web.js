








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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRvci53ZWIuanMiXSwibmFtZXMiOlsiaGlzdG9yeSIsIl91bmxpc3RlbiIsImhpZGRlblN0eWxlIiwib3BhY2l0eSIsInZpc2liaWxpdHkiLCJ2aXNpYmxlU3R5bGUiLCJTQ1JFRU5fV0lEVEgiLCJnZXQiLCJ3aWR0aCIsIlNDUkVFTl9IRUlHSFQiLCJoZWlnaHQiLCJTQ0VORV9ESVNBQkxFRF9OQVRJVkVfUFJPUFMiLCJwb2ludGVyRXZlbnRzIiwic3R5bGUiLCJzdHlsZXMiLCJjcmVhdGUiLCJjb250YWluZXIiLCJmbGV4Iiwib3ZlcmZsb3ciLCJkZWZhdWx0U2NlbmVTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwiYmFzZVNjZW5lIiwidHJhbnNpdGlvbmVyIiwiYmFja2dyb3VuZENvbG9yIiwiR0VTVFVSRV9BQ1RJT05TIiwiTmF2aWdhdG9yIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjb25maWd1cmVTY2VuZSIsImZ1bmMiLCJyZW5kZXJTY2VuZSIsImlzUmVxdWlyZWQiLCJpbml0aWFsUm91dGUiLCJvYmplY3QiLCJpbml0aWFsUm91dGVTdGFjayIsImFycmF5T2YiLCJvbldpbGxGb2N1cyIsIm9uRGlkRm9jdXMiLCJuYXZpZ2F0aW9uQmFyIiwibm9kZSIsIm5hdmlnYXRvciIsInNjZW5lU3R5bGUiLCJzdGF0aWNzIiwiQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIiLCJOYXZpZ2F0aW9uQmFyIiwiU2NlbmVDb25maWdzIiwibWl4aW5zIiwiTWl4aW4iLCJnZXREZWZhdWx0UHJvcHMiLCJQdXNoRnJvbVJpZ2h0IiwiZ2V0SW5pdGlhbFN0YXRlIiwiX3JlbmRlcmVkU2NlbmVNYXAiLCJyb3V0ZVN0YWNrIiwicHJvcHMiLCJsZW5ndGgiLCJpbml0aWFsUm91dGVJbmRleCIsImluZGV4T2YiLCJzY2VuZUNvbmZpZ1N0YWNrIiwibWFwIiwicm91dGUiLCJwcmVzZW50ZWRJbmRleCIsInRyYW5zaXRpb25Gcm9tSW5kZXgiLCJhY3RpdmVHZXN0dXJlIiwicGVuZGluZ0dlc3R1cmVQcm9ncmVzcyIsInRyYW5zaXRpb25RdWV1ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsIl9fZGVmaW5lR2V0dGVyX18iLCJfZ2V0TmF2aWdhdGlvbkNvbnRleHQiLCJfc3ViUm91dGVGb2N1cyIsInBhcmVudE5hdmlnYXRvciIsIl9oYW5kbGVycyIsInNwcmluZ1N5c3RlbSIsIlNwcmluZ1N5c3RlbSIsInNwcmluZyIsImNyZWF0ZVNwcmluZyIsInNldFJlc3RTcGVlZFRocmVzaG9sZCIsInNldEN1cnJlbnRWYWx1ZSIsInNldEF0UmVzdCIsImFkZExpc3RlbmVyIiwib25TcHJpbmdFbmRTdGF0ZUNoYW5nZSIsIl9pbnRlcmFjdGlvbkhhbmRsZSIsImNyZWF0ZUludGVyYWN0aW9uSGFuZGxlIiwib25TcHJpbmdVcGRhdGUiLCJfaGFuZGxlU3ByaW5nVXBkYXRlIiwib25TcHJpbmdBdFJlc3QiLCJfY29tcGxldGVUcmFuc2l0aW9uIiwicGFuR2VzdHVyZSIsIm9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlciIsIl9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyIiwib25QYW5SZXNwb25kZXJHcmFudCIsIl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCIsIm9uUGFuUmVzcG9uZGVyUmVsZWFzZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlIiwib25QYW5SZXNwb25kZXJNb3ZlIiwiX2hhbmRsZVBhblJlc3BvbmRlck1vdmUiLCJvblBhblJlc3BvbmRlclRlcm1pbmF0ZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUiLCJfZW1pdFdpbGxGb2N1cyIsInN0YXRlIiwiaGFzaENoYW5nZWQiLCJjb21wb25lbnREaWRNb3VudCIsIl9lbWl0RGlkRm9jdXMiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImRlc3RJbmRleCIsInBhdGhuYW1lIiwicGFyc2VJbnQiLCJyZXBsYWNlIiwiX2p1bXBOIiwiX2NsZWFuU2NlbmVzUGFzdEluZGV4IiwiYmluZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX25hdmlnYXRpb25Db250ZXh0IiwiZGlzcG9zZSIsIl9uZXh0Um91dGVJRCIsIl9nZXRSb3V0ZUlEIiwiYWN0aW9uIiwiU3RyaW5nIiwiaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2siLCJuZXh0Um91dGVTdGFjayIsImNvbnNvbGUiLCJ3YXJuIiwic2VsZiIsInByZXZMZW5ndGgiLCJzZXRTdGF0ZSIsIl90cmFuc2l0aW9uVG8iLCJ2ZWxvY2l0eSIsImp1bXBTcHJpbmdUbyIsImNiIiwiX2hpZGVTY2VuZXMiLCJwdXNoIiwidHJhbnNpdGlvbkNiIiwiX29uQW5pbWF0aW9uU3RhcnQiLCJzY2VuZUNvbmZpZyIsInNldE92ZXJzaG9vdENsYW1waW5nRW5hYmxlZCIsImdldFNwcmluZ0NvbmZpZyIsImZyaWN0aW9uIiwic3ByaW5nRnJpY3Rpb24iLCJ0ZW5zaW9uIiwic3ByaW5nVGVuc2lvbiIsInNldFZlbG9jaXR5IiwiZGVmYXVsdFRyYW5zaXRpb25WZWxvY2l0eSIsInNldEVuZFZhbHVlIiwiX3RyYW5zaXRpb25CZXR3ZWVuIiwiZ2V0Q3VycmVudFZhbHVlIiwicHJlc2VudGVkVG9JbmRleCIsIl9kZWx0YUZvckdlc3R1cmVBY3Rpb24iLCJfb25BbmltYXRpb25FbmQiLCJkaWRGb2N1c1JvdXRlIiwiY2xlYXJJbnRlcmFjdGlvbkhhbmRsZSIsImdlc3R1cmVUb0luZGV4IiwiX2VuYWJsZVNjZW5lIiwicXVldWVkVHJhbnNpdGlvbiIsInNoaWZ0IiwibmF2aWdhdGlvbkNvbnRleHQiLCJlbWl0IiwibmF2QmFyIiwiX25hdkJhciIsImhhbmRsZVdpbGxGb2N1cyIsImdlc3R1cmluZ1RvSW5kZXgiLCJpIiwiX2Rpc2FibGVTY2VuZSIsInNjZW5lSW5kZXgiLCJyZWZzIiwic2V0TmF0aXZlUHJvcHMiLCJzY2VuZU5hdGl2ZVByb3BzIiwiZnJvbUluZGV4IiwidG9JbmRleCIsIl9zZXRSZW5kZXJTY2VuZVRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIm9uQW5pbWF0aW9uU3RhcnQiLCJtYXgiLCJpbmRleCIsIm9uQW5pbWF0aW9uRW5kIiwic2hvdWxkUmVuZGVyVG9IYXJkd2FyZVRleHR1cmUiLCJ2aWV3QXRJbmRleCIsInVuZGVmaW5lZCIsInJlbmRlclRvSGFyZHdhcmVUZXh0dXJlQW5kcm9pZCIsIl9oYW5kbGVUb3VjaFN0YXJ0IiwiX2VsaWdpYmxlR2VzdHVyZXMiLCJlIiwiZ2VzdHVyZVN0YXRlIiwiX2V4cGVjdGluZ0dlc3R1cmVHcmFudCIsIl9tYXRjaEdlc3R1cmVBY3Rpb24iLCJnZXN0dXJlcyIsIl9kb2VzR2VzdHVyZU92ZXJzd2lwZSIsImdlc3R1cmVOYW1lIiwid291bGRPdmVyc3dpcGVCYWNrIiwid291bGRPdmVyc3dpcGVGb3J3YXJkIiwiX2F0dGFjaEdlc3R1cmUiLCJnZXN0dXJlQWN0aW9uIiwicmVsZWFzZUdlc3R1cmVBY3Rpb24iLCJyZWxlYXNlR2VzdHVyZSIsImlzVHJhdmVsVmVydGljYWwiLCJkaXJlY3Rpb24iLCJpc1RyYXZlbEludmVydGVkIiwiZ2VzdHVyZURpc3RhbmNlIiwidnkiLCJkeSIsInZ4IiwiZHgiLCJ0cmFuc2l0aW9uVmVsb2NpdHkiLCJNYXRoIiwiYWJzIiwibm90TW92aW5nIiwiaGFzR2VzdHVyZWRFbm91Z2hUb0NvbXBsZXRlIiwiZnVsbERpc3RhbmNlIiwic3RpbGxDb21wbGV0aW9uUmF0aW8iLCJzbmFwVmVsb2NpdHkiLCJ0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgiLCJfZGV0YWNoR2VzdHVyZSIsImdlc3R1cmVJZCIsImdlc3R1cmUiLCJfbW92ZUF0dGFjaGVkR2VzdHVyZSIsIm1hdGNoZWRHZXN0dXJlIiwiZGlzdGFuY2UiLCJnZXN0dXJlRGV0ZWN0TW92ZW1lbnQiLCJuZXh0UHJvZ3Jlc3MiLCJpc0RldGFjaGFibGUiLCJmcmljdGlvbkNvbnN0YW50Iiwib3ZlcnN3aXBlIiwiZnJpY3Rpb25CeURpc3RhbmNlIiwiZnJpY3Rpb25SYXRpbyIsImVsaWdpYmxlR2VzdHVyZXMiLCJzb21lIiwiZ2VzdHVyZUluZGV4IiwiY3VycmVudExvYyIsIm1vdmVZIiwibW92ZVgiLCJ0cmF2ZWxEaXN0Iiwib3Bwb3NpdGVBeGlzVHJhdmVsRGlzdCIsImVkZ2VIaXRXaWR0aCIsIm1vdmVTdGFydGVkSW5SZWdpb24iLCJtb3ZlVHJhdmVsbGVkRmFyRW5vdWdoIiwiZGlyZWN0aW9uSXNDb3JyZWN0IiwiZGlyZWN0aW9uUmF0aW8iLCJzbGljZSIsInNwbGljZSIsIl90cmFuc2l0aW9uU2NlbmVTdHlsZSIsInByb2dyZXNzIiwic2NlbmVDb25maWdJbmRleCIsInN0eWxlVG9Vc2UiLCJ1c2VGbiIsImFuaW1hdGlvbkludGVycG9sYXRvcnMiLCJvdXQiLCJpbnRvIiwiZGlyZWN0aW9uQWRqdXN0ZWRQcm9ncmVzcyIsImRpZENoYW5nZSIsInVwZGF0ZVByb2dyZXNzIiwiX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdCIsIl9nZXREZXN0SW5kZXhXaXRoaW5Cb3VuZHMiLCJuIiwiY3VycmVudEluZGV4IiwibWF4SW5kZXgiLCJwdXNoU3RhdGUiLCJnbyIsImp1bXBUbyIsImp1bXBGb3J3YXJkIiwianVtcEJhY2siLCJhY3RpdmVMZW5ndGgiLCJhY3RpdmVTdGFjayIsImFjdGl2ZUFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwibmV4dFN0YWNrIiwiY29uY2F0IiwibmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrIiwiX3BvcE4iLCJwb3BJbmRleCIsInBvcCIsInJlcGxhY2VBdEluZGV4IiwicmVwbGFjZUN1cnJlbnQiLCJuZXh0QW5pbWF0aW9uTW9kZVN0YWNrIiwicmVwbGFjZVN0YXRlIiwicmVwbGFjZVByZXZpb3VzIiwicG9wVG9Ub3AiLCJwb3BUb1JvdXRlIiwiaW5kZXhPZlJvdXRlIiwibnVtVG9Qb3AiLCJyZXBsYWNlUHJldmlvdXNBbmRQb3AiLCJyZXNldFRvIiwiZ2V0Q3VycmVudFJvdXRlcyIsIm5ld1N0YWNrTGVuZ3RoIiwiX3JlbmRlclNjZW5lIiwicm91dGVJZCIsIl9yZW5kZXJOYXZpZ2F0aW9uQmFyIiwiY2xvbmVFbGVtZW50IiwicmVmIiwibmF2U3RhdGUiLCJyZW5kZXIiLCJuZXdSZW5kZXJlZFNjZW5lTWFwIiwic2NlbmVzIiwicmVuZGVyZWRTY2VuZSIsImhhcyIsInNldCIsInBhbkhhbmRsZXJzIiwiaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBU0EsYTs7QUFFQSw0QjtBQUNBLDZEO0FBQ0EsMEU7QUFDQSwyQztBQUNBLHNFO0FBQ0EseUY7QUFDQSxxRTtBQUNBLG1FO0FBQ0EsbUU7QUFDQSw2RDtBQUNBLHNEO0FBQ0Esa0Q7QUFDQSwyQztBQUNBLHdDO0FBQ0EsaUU7QUFDQSw2QztBQUNBLGdDO0FBQ0EsZ0U7O0FBRUEsR0FBSUEsU0FBVSxpQ0FBZDtBQUNBLEdBQUlDLGlCQUFKOztBQUVBLEdBQU1DLGFBQWM7QUFDbEJDLFFBQVMsQ0FEUztBQUVsQkMsV0FBWSxRQUZNLENBQXBCOzs7QUFLQSxHQUFNQyxjQUFlO0FBQ25CRixRQUFTLENBRFU7QUFFbkJDLFdBQVksU0FGTyxDQUFyQjs7Ozs7O0FBUUEsR0FBTUUsY0FBZSwwQkFBV0MsR0FBWCxDQUFlLFFBQWYsRUFBeUJDLEtBQTlDO0FBQ0EsR0FBTUMsZUFBZ0IsMEJBQVdGLEdBQVgsQ0FBZSxRQUFmLEVBQXlCRyxNQUEvQztBQUNBLEdBQU1DLDZCQUE4QjtBQUNsQ0MsY0FBZSxNQURtQjtBQUVsQ0MsTUFBT1gsV0FGMkIsQ0FBcEM7Ozs7Ozs7OztBQVdBLEdBQUlZLFFBQVMsMEJBQVdDLE1BQVgsQ0FBa0I7QUFDN0JDLFVBQVc7QUFDVEMsS0FBTSxDQURHO0FBRVRDLFNBQVUsUUFGRCxDQURrQjs7QUFLN0JDLGtCQUFtQjtBQUNqQkMsU0FBVSxVQURPO0FBRWpCQyxLQUFNLENBRlc7QUFHakJDLE1BQU8sQ0FIVTtBQUlqQkMsT0FBUSxDQUpTO0FBS2pCQyxJQUFLLENBTFk7QUFNakJwQixXQUFZLFNBTkssQ0FMVTs7QUFhN0JxQixVQUFXO0FBQ1RMLFNBQVUsVUFE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QUFMLENBQVd0QyxjQUR6QixDQUN5QztBQUN2Q3FPLGNBQWdCLFFBQUs5TyxpQkFBTCxDQUF1QmhELEdBQXZCLENBQTJCd0QsS0FBM0IsQ0FBaEI7QUFDRCxDQUhELElBR087QUFDTHNPLGNBQWdCLFFBQUtULFlBQUwsQ0FBa0I3TixLQUFsQixDQUF5QmdILEtBQXpCLENBQWhCO0FBQ0Q7QUFDRG9ILG9CQUFvQkksR0FBcEIsQ0FBd0J4TyxLQUF4QixDQUErQnNPLGFBQS9CO0FBQ0EsTUFBT0EsY0FBUDtBQUNELENBVlksQ0FBYjtBQVdBLEtBQUs5TyxpQkFBTCxDQUF5QjRPLG1CQUF6QjtBQUNBO0FBQ0UsbURBQU0sTUFBTyxDQUFDclIsT0FBT0UsU0FBUixDQUFtQixLQUFLeUMsS0FBTCxDQUFXNUMsS0FBOUIsQ0FBYjtBQUNFO0FBQ0UsTUFBT0MsT0FBT1ksWUFEaEI7QUFFTSxLQUFLZ0UsVUFBTCxDQUFnQjhNLFdBRnRCO0FBR0UsYUFBYyxLQUFLbkgsaUJBSHJCO0FBSUU7QUFDRSxLQUFLdUUsa0NBTFQ7O0FBT0d3QyxNQVBILENBREY7O0FBVUcsS0FBS04sb0JBQUwsRUFWSCxDQURGOzs7QUFjRCxDQTMrQitCOztBQTYrQmhDdk4sc0JBQXVCLGdDQUFXO0FBQ2hDLEdBQUksQ0FBQyxLQUFLNkMsa0JBQVYsQ0FBOEI7QUFDNUIsS0FBS0Esa0JBQUwsQ0FBMEIsc0NBQTFCO0FBQ0Q7QUFDRCxNQUFPLE1BQUtBLGtCQUFaO0FBQ0QsQ0FsL0IrQixDQUFsQixDQUFoQjs7O0FBcS9CQXZGLFVBQVU0USxzQkFBVixDQUFtQyxJQUFuQyxDOztBQUVlNVEsUyIsImZpbGUiOiJOYXZpZ2F0b3Iud2ViLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgQWxpYmFiYSBHcm91cCBIb2xkaW5nIExpbWl0ZWQuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSwgRmFjZWJvb2ssIEluYy4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIFJlYWN0TmF2aWdhdG9yXG4gKi9cbiAvKiBlc2xpbnQtZGlzYWJsZSBuby1leHRyYS1ib29sZWFuLWNhc3QqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QsIHsgUHJvcFR5cGVzIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IERpbWVuc2lvbnMgZnJvbSAnUmVhY3REaW1lbnNpb25zJztcbmltcG9ydCBJbnRlcmFjdGlvbk1peGluIGZyb20gJ1JlYWN0SW50ZXJhY3Rpb25NaXhpbic7XG5pbXBvcnQgTWFwIGZyb20gJ2NvcmUtanMvbGlicmFyeS9mbi9tYXAnO1xuaW1wb3J0IE5hdmlnYXRpb25Db250ZXh0IGZyb20gJ1JlYWN0TmF2aWdhdGlvbkNvbnRleHQnO1xuaW1wb3J0IE5hdmlnYXRvckJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyIGZyb20gJ1JlYWN0TmF2aWdhdG9yQnJlYWRjcnVtYk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IE5hdmlnYXRvck5hdmlnYXRpb25CYXIgZnJvbSAnUmVhY3ROYXZpZ2F0b3JOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCBOYXZpZ2F0b3JTY2VuZUNvbmZpZ3MgZnJvbSAnUmVhY3ROYXZpZ2F0b3JTY2VuZUNvbmZpZ3MnO1xuaW1wb3J0IFBhblJlc3BvbmRlciBmcm9tICdSZWFjdFBhblJlc3BvbmRlcic7XG5pbXBvcnQgU3R5bGVTaGVldCBmcm9tICdSZWFjdFN0eWxlU2hlZXQnO1xuaW1wb3J0IFN1YnNjcmliYWJsZSBmcm9tICcuL3BvbHlmaWxscy9TdWJzY3JpYmFibGUnO1xuaW1wb3J0IFRpbWVyTWl4aW4gZnJvbSAncmVhY3QtdGltZXItbWl4aW4nO1xuaW1wb3J0IFZpZXcgZnJvbSAnUmVhY3RWaWV3JztcbmltcG9ydCBjbGFtcCBmcm9tICcuL3BvbHlmaWxscy9jbGFtcCc7XG5pbXBvcnQgZmxhdHRlblN0eWxlIGZyb20gJ1JlYWN0RmxhdHRlblN0eWxlJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnZmJqcy9saWIvaW52YXJpYW50JztcbmltcG9ydCByZWJvdW5kIGZyb20gJ3JlYm91bmQnO1xuaW1wb3J0IGNyZWF0ZUhpc3RvcnkgZnJvbSAnaGlzdG9yeS9saWIvY3JlYXRlSGFzaEhpc3RvcnknO1xuXG5sZXQgaGlzdG9yeSA9IGNyZWF0ZUhpc3RvcnkoKTtcbmxldCBfdW5saXN0ZW47XG5cbmNvbnN0IGhpZGRlblN0eWxlID0ge1xuICBvcGFjaXR5OiAwLFxuICB2aXNpYmlsaXR5OiAnaGlkZGVuJ1xufVxuXG5jb25zdCB2aXNpYmxlU3R5bGUgPSB7XG4gIG9wYWNpdHk6IDEsXG4gIHZpc2liaWxpdHk6ICd2aXNpYmxlJ1xufVxuXG4vLyBUT0RPOiB0aGlzIGlzIG5vdCBpZGVhbCBiZWNhdXNlIHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBuYXZpZ2F0b3Jcbi8vIGlzIGZ1bGwgc2NyZWVuLCBod29ldmVyIHdlIGRvbid0IGhhdmUgYSBnb29kIHdheSB0byBtZWFzdXJlIHRoZSBhY3R1YWxcbi8vIHNpemUgb2YgdGhlIG5hdmlnYXRvciByaWdodCBub3csIHNvIHRoaXMgaXMgdGhlIG5leHQgYmVzdCB0aGluZy5cbmNvbnN0IFNDUkVFTl9XSURUSCA9IERpbWVuc2lvbnMuZ2V0KCd3aW5kb3cnKS53aWR0aDtcbmNvbnN0IFNDUkVFTl9IRUlHSFQgPSBEaW1lbnNpb25zLmdldCgnd2luZG93JykuaGVpZ2h0O1xuY29uc3QgU0NFTkVfRElTQUJMRURfTkFUSVZFX1BST1BTID0ge1xuICBwb2ludGVyRXZlbnRzOiAnbm9uZScsXG4gIHN0eWxlOiBoaWRkZW5TdHlsZVxufTtcblxuLy8gbGV0IF9fdWlkID0gMDtcbi8vIGZ1bmN0aW9uIGdldHVpZCgpIHtcbi8vICAgcmV0dXJuIF9fdWlkKys7XG4vLyB9XG5cbi8vIHN0eWxlcyBtb3ZlZCB0byB0aGUgdG9wIG9mIHRoZSBmaWxlIHNvIGdldERlZmF1bHRQcm9wcyBjYW4gcmVmZXIgdG8gaXRcbmxldCBzdHlsZXMgPSBTdHlsZVNoZWV0LmNyZWF0ZSh7XG4gIGNvbnRhaW5lcjoge1xuICAgIGZsZXg6IDEsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICB9LFxuICBkZWZhdWx0U2NlbmVTdHlsZToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIHRvcDogMCxcbiAgICB2aXNpYmlsaXR5OiAndmlzaWJsZSdcbiAgfSxcbiAgYmFzZVNjZW5lOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIHRvcDogMCxcbiAgfSxcbiAgLy8gZGlzYWJsZWRTY2VuZToge1xuICAvLyAgIHRvcDogU0NSRUVOX0hFSUdIVCxcbiAgLy8gICBib3R0b206IC1TQ1JFRU5fSEVJR0hULFxuICAvLyB9LFxuICB0cmFuc2l0aW9uZXI6IHtcbiAgICBmbGV4OiAxLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gIH1cbn0pO1xuXG5jb25zdCBHRVNUVVJFX0FDVElPTlMgPSBbXG4gICdwb3AnLFxuICAnanVtcEJhY2snLFxuICAnanVtcEZvcndhcmQnLFxuXTtcblxuLyoqXG4gKiBVc2UgYE5hdmlnYXRvcmAgdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIGRpZmZlcmVudCBzY2VuZXMgaW4geW91ciBhcHAuIFRvXG4gKiBhY2NvbXBsaXNoIHRoaXMsIHByb3ZpZGUgcm91dGUgb2JqZWN0cyB0byB0aGUgbmF2aWdhdG9yIHRvIGlkZW50aWZ5IGVhY2hcbiAqIHNjZW5lLCBhbmQgYWxzbyBhIGByZW5kZXJTY2VuZWAgZnVuY3Rpb24gdGhhdCB0aGUgbmF2aWdhdG9yIGNhbiB1c2UgdG9cbiAqIHJlbmRlciB0aGUgc2NlbmUgZm9yIGEgZ2l2ZW4gcm91dGUuXG4gKlxuICogVG8gY2hhbmdlIHRoZSBhbmltYXRpb24gb3IgZ2VzdHVyZSBwcm9wZXJ0aWVzIG9mIHRoZSBzY2VuZSwgcHJvdmlkZSBhXG4gKiBgY29uZmlndXJlU2NlbmVgIHByb3AgdG8gZ2V0IHRoZSBjb25maWcgb2JqZWN0IGZvciBhIGdpdmVuIHJvdXRlLiBTZWVcbiAqIGBOYXZpZ2F0b3IuU2NlbmVDb25maWdzYCBmb3IgZGVmYXVsdCBhbmltYXRpb25zIGFuZCBtb3JlIGluZm8gb25cbiAqIHNjZW5lIGNvbmZpZyBvcHRpb25zLlxuICpcbiAqICMjIyBCYXNpYyBVc2FnZVxuICpcbiAqIGBgYFxuICogICA8TmF2aWdhdG9yXG4gKiAgICAgaW5pdGlhbFJvdXRlPXt7bmFtZTogJ015IEZpcnN0IFNjZW5lJywgaW5kZXg6IDB9fVxuICogICAgIHJlbmRlclNjZW5lPXsocm91dGUsIG5hdmlnYXRvcikgPT5cbiAqICAgICAgIDxNeVNjZW5lQ29tcG9uZW50XG4gKiAgICAgICAgIG5hbWU9e3JvdXRlLm5hbWV9XG4gKiAgICAgICAgIG9uRm9yd2FyZD17KCkgPT4ge1xuICogICAgICAgICAgIGxldCBuZXh0SW5kZXggPSByb3V0ZS5pbmRleCArIDE7XG4gKiAgICAgICAgICAgbmF2aWdhdG9yLnB1c2goe1xuICogICAgICAgICAgICAgbmFtZTogJ1NjZW5lICcgKyBuZXh0SW5kZXgsXG4gKiAgICAgICAgICAgICBpbmRleDogbmV4dEluZGV4LFxuICogICAgICAgICAgIH0pO1xuICogICAgICAgICB9fVxuICogICAgICAgICBvbkJhY2s9eygpID0+IHtcbiAqICAgICAgICAgICBpZiAocm91dGUuaW5kZXggPiAwKSB7XG4gKiAgICAgICAgICAgICBuYXZpZ2F0b3IucG9wKCk7XG4gKiAgICAgICAgICAgfVxuICogICAgICAgICB9fVxuICogICAgICAgLz5cbiAqICAgICB9XG4gKiAgIC8+XG4gKiBgYGBcbiAqXG4gKiAjIyMgTmF2aWdhdG9yIE1ldGhvZHNcbiAqXG4gKiBJZiB5b3UgaGF2ZSBhIHJlZiB0byB0aGUgTmF2aWdhdG9yIGVsZW1lbnQsIHlvdSBjYW4gaW52b2tlIHNldmVyYWwgbWV0aG9kc1xuICogb24gaXQgdG8gdHJpZ2dlciBuYXZpZ2F0aW9uOlxuICpcbiAqICAtIGBnZXRDdXJyZW50Um91dGVzKClgIC0gcmV0dXJucyB0aGUgY3VycmVudCBsaXN0IG9mIHJvdXRlc1xuICogIC0gYGp1bXBCYWNrKClgIC0gSnVtcCBiYWNrd2FyZCB3aXRob3V0IHVubW91bnRpbmcgdGhlIGN1cnJlbnQgc2NlbmVcbiAqICAtIGBqdW1wRm9yd2FyZCgpYCAtIEp1bXAgZm9yd2FyZCB0byB0aGUgbmV4dCBzY2VuZSBpbiB0aGUgcm91dGUgc3RhY2tcbiAqICAtIGBqdW1wVG8ocm91dGUpYCAtIFRyYW5zaXRpb24gdG8gYW4gZXhpc3Rpbmcgc2NlbmUgd2l0aG91dCB1bm1vdW50aW5nXG4gKiAgLSBgcHVzaChyb3V0ZSlgIC0gTmF2aWdhdGUgZm9yd2FyZCB0byBhIG5ldyBzY2VuZSwgc3F1YXNoaW5nIGFueSBzY2VuZXNcbiAqICAgICB0aGF0IHlvdSBjb3VsZCBganVtcEZvcndhcmRgIHRvXG4gKiAgLSBgcG9wKClgIC0gVHJhbnNpdGlvbiBiYWNrIGFuZCB1bm1vdW50IHRoZSBjdXJyZW50IHNjZW5lXG4gKiAgLSBgcmVwbGFjZShyb3V0ZSlgIC0gUmVwbGFjZSB0aGUgY3VycmVudCBzY2VuZSB3aXRoIGEgbmV3IHJvdXRlXG4gKiAgLSBgcmVwbGFjZUF0SW5kZXgocm91dGUsIGluZGV4KWAgLSBSZXBsYWNlIGEgc2NlbmUgYXMgc3BlY2lmaWVkIGJ5IGFuIGluZGV4XG4gKiAgLSBgcmVwbGFjZVByZXZpb3VzKHJvdXRlKWAgLSBSZXBsYWNlIHRoZSBwcmV2aW91cyBzY2VuZVxuICogIC0gYGltbWVkaWF0ZWx5UmVzZXRSb3V0ZVN0YWNrKHJvdXRlU3RhY2spYCAtIFJlc2V0IGV2ZXJ5IHNjZW5lIHdpdGggYW5cbiAqICAgICBhcnJheSBvZiByb3V0ZXNcbiAqICAtIGBwb3BUb1JvdXRlKHJvdXRlKWAgLSBQb3AgdG8gYSBwYXJ0aWN1bGFyIHNjZW5lLCBhcyBzcGVjaWZpZWQgYnkgaXRzXG4gKiAgICAgcm91dGUuIEFsbCBzY2VuZXMgYWZ0ZXIgaXQgd2lsbCBiZSB1bm1vdW50ZWRcbiAqICAtIGBwb3BUb1RvcCgpYCAtIFBvcCB0byB0aGUgZmlyc3Qgc2NlbmUgaW4gdGhlIHN0YWNrLCB1bm1vdW50aW5nIGV2ZXJ5XG4gKiAgICAgb3RoZXIgc2NlbmVcbiAqXG4gKi9cbmxldCBOYXZpZ2F0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgZnVuY3Rpb24gdGhhdCBhbGxvd3MgY29uZmlndXJhdGlvbiBhYm91dCBzY2VuZSBhbmltYXRpb25zIGFuZFxuICAgICAqIGdlc3R1cmVzLiBXaWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcm91dGUgYW5kIHNob3VsZCByZXR1cm4gYSBzY2VuZVxuICAgICAqIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICpcbiAgICAgKiBgYGBcbiAgICAgKiAocm91dGUpID0+IE5hdmlnYXRvci5TY2VuZUNvbmZpZ3MuRmxvYXRGcm9tUmlnaHRcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBjb25maWd1cmVTY2VuZTogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAvKipcbiAgICAgKiBSZXF1aXJlZCBmdW5jdGlvbiB3aGljaCByZW5kZXJzIHRoZSBzY2VuZSBmb3IgYSBnaXZlbiByb3V0ZS4gV2lsbCBiZVxuICAgICAqIGludm9rZWQgd2l0aCB0aGUgcm91dGUgYW5kIHRoZSBuYXZpZ2F0b3Igb2JqZWN0XG4gICAgICpcbiAgICAgKiBgYGBcbiAgICAgKiAocm91dGUsIG5hdmlnYXRvcikgPT5cbiAgICAgKiAgIDxNeVNjZW5lQ29tcG9uZW50IHRpdGxlPXtyb3V0ZS50aXRsZX0gLz5cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICByZW5kZXJTY2VuZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgYSByb3V0ZSB0byBzdGFydCBvbi4gQSByb3V0ZSBpcyBhbiBvYmplY3QgdGhhdCB0aGUgbmF2aWdhdG9yXG4gICAgICogd2lsbCB1c2UgdG8gaWRlbnRpZnkgZWFjaCBzY2VuZSB0byByZW5kZXIuIGBpbml0aWFsUm91dGVgIG11c3QgYmVcbiAgICAgKiBhIHJvdXRlIGluIHRoZSBgaW5pdGlhbFJvdXRlU3RhY2tgIGlmIGJvdGggcHJvcHMgYXJlIHByb3ZpZGVkLiBUaGVcbiAgICAgKiBgaW5pdGlhbFJvdXRlYCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxhc3QgaXRlbSBpbiB0aGUgYGluaXRpYWxSb3V0ZVN0YWNrYC5cbiAgICAgKi9cbiAgICBpbml0aWFsUm91dGU6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGEgc2V0IG9mIHJvdXRlcyB0byBpbml0aWFsbHkgbW91bnQuIFJlcXVpcmVkIGlmIG5vIGluaXRpYWxSb3V0ZVxuICAgICAqIGlzIHByb3ZpZGVkLiBPdGhlcndpc2UsIGl0IHdpbGwgZGVmYXVsdCB0byBhbiBhcnJheSBjb250YWluaW5nIG9ubHkgdGhlXG4gICAgICogYGluaXRpYWxSb3V0ZWBcbiAgICAgKi9cbiAgICBpbml0aWFsUm91dGVTdGFjazogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIFVzZSBgbmF2aWdhdGlvbkNvbnRleHQuYWRkTGlzdGVuZXIoJ3dpbGxmb2N1cycsIGNhbGxiYWNrKWAgaW5zdGVhZC5cbiAgICAgKlxuICAgICAqIFdpbGwgZW1pdCB0aGUgdGFyZ2V0IHJvdXRlIHVwb24gbW91bnRpbmcgYW5kIGJlZm9yZSBlYWNoIG5hdiB0cmFuc2l0aW9uXG4gICAgICovXG4gICAgb25XaWxsRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBVc2UgYG5hdmlnYXRpb25Db250ZXh0LmFkZExpc3RlbmVyKCdkaWRmb2N1cycsIGNhbGxiYWNrKWAgaW5zdGVhZC5cbiAgICAgKlxuICAgICAqIFdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIG5ldyByb3V0ZSBvZiBlYWNoIHNjZW5lIGFmdGVyIHRoZSB0cmFuc2l0aW9uIGlzXG4gICAgICogY29tcGxldGUgb3IgYWZ0ZXIgdGhlIGluaXRpYWwgbW91bnRpbmdcbiAgICAgKi9cbiAgICBvbkRpZEZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsbHkgcHJvdmlkZSBhIG5hdmlnYXRpb24gYmFyIHRoYXQgcGVyc2lzdHMgYWNyb3NzIHNjZW5lXG4gICAgICogdHJhbnNpdGlvbnNcbiAgICAgKi9cbiAgICBuYXZpZ2F0aW9uQmFyOiBQcm9wVHlwZXMubm9kZSxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsbHkgcHJvdmlkZSB0aGUgbmF2aWdhdG9yIG9iamVjdCBmcm9tIGEgcGFyZW50IE5hdmlnYXRvclxuICAgICAqL1xuICAgIG5hdmlnYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgIC8qKlxuICAgICAqIFN0eWxlcyB0byBhcHBseSB0byB0aGUgY29udGFpbmVyIG9mIGVhY2ggc2NlbmVcbiAgICAgKi9cbiAgICBzY2VuZVN0eWxlOiBWaWV3LnByb3BUeXBlcy5zdHlsZSxcbiAgfSxcblxuICBzdGF0aWNzOiB7XG4gICAgQnJlYWRjcnVtYk5hdmlnYXRpb25CYXI6IE5hdmlnYXRvckJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyLFxuICAgIE5hdmlnYXRpb25CYXI6IE5hdmlnYXRvck5hdmlnYXRpb25CYXIsXG4gICAgU2NlbmVDb25maWdzOiBOYXZpZ2F0b3JTY2VuZUNvbmZpZ3MsXG4gIH0sXG5cbiAgbWl4aW5zOiBbVGltZXJNaXhpbiwgSW50ZXJhY3Rpb25NaXhpbiwgU3Vic2NyaWJhYmxlLk1peGluXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmVTY2VuZTogKCkgPT4gTmF2aWdhdG9yU2NlbmVDb25maWdzLlB1c2hGcm9tUmlnaHQsXG4gICAgICBzY2VuZVN0eWxlOiBzdHlsZXMuZGVmYXVsdFNjZW5lU3R5bGUsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBsZXQgcm91dGVTdGFjayA9IHRoaXMucHJvcHMuaW5pdGlhbFJvdXRlU3RhY2sgfHwgW3RoaXMucHJvcHMuaW5pdGlhbFJvdXRlXTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICByb3V0ZVN0YWNrLmxlbmd0aCA+PSAxLFxuICAgICAgJ05hdmlnYXRvciByZXF1aXJlcyBwcm9wcy5pbml0aWFsUm91dGUgb3IgcHJvcHMuaW5pdGlhbFJvdXRlU3RhY2suJ1xuICAgICk7XG4gICAgbGV0IGluaXRpYWxSb3V0ZUluZGV4ID0gcm91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIGlmICh0aGlzLnByb3BzLmluaXRpYWxSb3V0ZSkge1xuICAgICAgaW5pdGlhbFJvdXRlSW5kZXggPSByb3V0ZVN0YWNrLmluZGV4T2YodGhpcy5wcm9wcy5pbml0aWFsUm91dGUpO1xuICAgICAgaW52YXJpYW50KFxuICAgICAgICBpbml0aWFsUm91dGVJbmRleCAhPT0gLTEsXG4gICAgICAgICdpbml0aWFsUm91dGUgaXMgbm90IGluIGluaXRpYWxSb3V0ZVN0YWNrLidcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiByb3V0ZVN0YWNrLm1hcChcbiAgICAgICAgKHJvdXRlKSA9PiB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lKHJvdXRlKVxuICAgICAgKSxcbiAgICAgIHJvdXRlU3RhY2ssXG4gICAgICBwcmVzZW50ZWRJbmRleDogaW5pdGlhbFJvdXRlSW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsLFxuICAgICAgYWN0aXZlR2VzdHVyZTogbnVsbCxcbiAgICAgIHBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3M6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uUXVldWU6IFtdLFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAvLyBUT0RPKHQ3NDg5NTAzKTogRG9uJ3QgbmVlZCB0aGlzIG9uY2UgRVM2IENsYXNzIGxhbmRlZC5cbiAgICB0aGlzLl9fZGVmaW5lR2V0dGVyX18oJ25hdmlnYXRpb25Db250ZXh0JywgdGhpcy5fZ2V0TmF2aWdhdGlvbkNvbnRleHQpO1xuXG4gICAgdGhpcy5fc3ViUm91dGVGb2N1cyA9IFtdO1xuICAgIHRoaXMucGFyZW50TmF2aWdhdG9yID0gdGhpcy5wcm9wcy5uYXZpZ2F0b3I7XG4gICAgdGhpcy5faGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLnNwcmluZ1N5c3RlbSA9IG5ldyByZWJvdW5kLlNwcmluZ1N5c3RlbSgpO1xuICAgIHRoaXMuc3ByaW5nID0gdGhpcy5zcHJpbmdTeXN0ZW0uY3JlYXRlU3ByaW5nKCk7XG4gICAgdGhpcy5zcHJpbmcuc2V0UmVzdFNwZWVkVGhyZXNob2xkKDAuMDUpO1xuICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZSgwKS5zZXRBdFJlc3QoKTtcbiAgICB0aGlzLnNwcmluZy5hZGRMaXN0ZW5lcih7XG4gICAgICBvblNwcmluZ0VuZFN0YXRlQ2hhbmdlOiAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUpIHtcbiAgICAgICAgICB0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSA9IHRoaXMuY3JlYXRlSW50ZXJhY3Rpb25IYW5kbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uU3ByaW5nVXBkYXRlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZVNwcmluZ1VwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIG9uU3ByaW5nQXRSZXN0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbXBsZXRlVHJhbnNpdGlvbigpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLnBhbkdlc3R1cmUgPSBQYW5SZXNwb25kZXIuY3JlYXRlKHtcbiAgICAgIG9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlcjogdGhpcy5faGFuZGxlTW92ZVNob3VsZFNldFBhblJlc3BvbmRlcixcbiAgICAgIG9uUGFuUmVzcG9uZGVyR3JhbnQ6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlckdyYW50LFxuICAgICAgb25QYW5SZXNwb25kZXJSZWxlYXNlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlLFxuICAgICAgb25QYW5SZXNwb25kZXJNb3ZlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJNb3ZlLFxuICAgICAgb25QYW5SZXNwb25kZXJUZXJtaW5hdGU6IHRoaXMuX2hhbmRsZVBhblJlc3BvbmRlclRlcm1pbmF0ZSxcbiAgICB9KTtcbiAgICB0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF0pO1xuICAgIHRoaXMuaGFzaENoYW5nZWQgPSBmYWxzZTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faGFuZGxlU3ByaW5nVXBkYXRlKCk7XG4gICAgdGhpcy5fZW1pdERpZEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XSk7XG5cbiAgICAvLyBOT1RFOiBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGN1cnJlbnQgbG9jYXRpb24uIFRoZVxuICAgIC8vIGxpc3RlbmVyIGlzIGNhbGxlZCBvbmNlIGltbWVkaWF0ZWx5LlxuICAgIF91bmxpc3RlbiA9IGhpc3RvcnkubGlzdGVuKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICBsZXQgZGVzdEluZGV4ID0gMDtcbiAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCcvc2NlbmVfJykgIT0gLTEpIHtcbiAgICAgICAgZGVzdEluZGV4ID0gcGFyc2VJbnQobG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgnL3NjZW5lXycsICcnKSk7XG4gICAgICB9XG4gICAgICBpZiAoZGVzdEluZGV4IDwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAmJiBkZXN0SW5kZXggIT0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmhhc2hDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fanVtcE4oZGVzdEluZGV4IC0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCk7XG4gICAgICAgIHRoaXMuX2NsZWFuU2NlbmVzUGFzdEluZGV4KGRlc3RJbmRleCk7XG4gICAgICAgIHRoaXMuaGFzaENoYW5nZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbmF2aWdhdGlvbkNvbnRleHQpIHtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25Db250ZXh0LmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25Db250ZXh0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXaGVuIHlvdSdyZSBmaW5pc2hlZCwgc3RvcCB0aGUgbGlzdGVuZXIuXG4gICAgX3VubGlzdGVuKCk7XG5cbiAgfSxcblxuICBfbmV4dFJvdXRlSUQ6IGZ1bmN0aW9uIChyZXBsYWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggLSAocmVwbGFjZSA/IDEgOiAwKVxuICB9LFxuXG4gIF9nZXRSb3V0ZUlEOiBmdW5jdGlvbiAocm91dGUsIGFjdGlvbikge1xuICAgIGlmIChyb3V0ZSA9PT0gbnVsbCB8fCB0eXBlb2Ygcm91dGUgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKHJvdXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmluZGV4T2Yocm91dGUpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Um91dGVTdGFja30gbmV4dFJvdXRlU3RhY2sgTmV4dCByb3V0ZSBzdGFjayB0byByZWluaXRpYWxpemUuIFRoaXNcbiAgICogZG9lc24ndCBhY2NlcHQgc3RhY2sgaXRlbSBgaWRgcywgd2hpY2ggaW1wbGllcyB0aGF0IGFsbCBleGlzdGluZyBpdGVtcyBhcmVcbiAgICogZGVzdHJveWVkLCBhbmQgdGhlbiBwb3RlbnRpYWxseSByZWNyZWF0ZWQgYWNjb3JkaW5nIHRvIGByb3V0ZVN0YWNrYC4gRG9lc1xuICAgKiBub3QgYW5pbWF0ZSwgaW1tZWRpYXRlbHkgcmVwbGFjZXMgYW5kIHJlcmVuZGVycyBuYXZpZ2F0aW9uIGJhciBhbmQgc3RhY2tcbiAgICogaXRlbXMuXG4gICAqL1xuICBpbW1lZGlhdGVseVJlc2V0Um91dGVTdGFjazogZnVuY3Rpb24obmV4dFJvdXRlU3RhY2spIHtcbiAgICBjb25zb2xlLndhcm4oJ25hdmlnYXRvci5pbW1lZGlhdGVseVJlc2V0Um91dGVTdGFjayBicmVha3MgdGhlIGJhY2sgYnV0dG9uIScpXG5cbiAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgIGNvbnN0IHByZXZMZW5ndGggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoXG4gICAgbGV0IGRlc3RJbmRleCA9IG5leHRSb3V0ZVN0YWNrLmxlbmd0aCAtIDE7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0Um91dGVTdGFjayxcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IG5leHRSb3V0ZVN0YWNrLm1hcChcbiAgICAgICAgdGhpcy5wcm9wcy5jb25maWd1cmVTY2VuZVxuICAgICAgKSxcbiAgICAgIHByZXNlbnRlZEluZGV4OiBkZXN0SW5kZXgsXG4gICAgICBhY3RpdmVHZXN0dXJlOiBudWxsLFxuICAgICAgdHJhbnNpdGlvbkZyb21JbmRleDogbnVsbCxcbiAgICAgIHRyYW5zaXRpb25RdWV1ZTogW10sXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5faGFuZGxlU3ByaW5nVXBkYXRlKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3RyYW5zaXRpb25UbzogZnVuY3Rpb24oZGVzdEluZGV4LCB2ZWxvY2l0eSwganVtcFNwcmluZ1RvLCBjYikge1xuICAgIGlmIChkZXN0SW5kZXggPT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIHRoaXMuX2hpZGVTY2VuZXMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUucHVzaCh7XG4gICAgICAgIGRlc3RJbmRleCxcbiAgICAgICAgdmVsb2NpdHksXG4gICAgICAgIGNiLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhbnNpdGlvbkZyb21JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhcbiAgICAvLyBnaXZlIHNjZW5lcyBhIGNoYW5jZSB0byByZS1yZW5kZXJcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByZXNlbnRlZEluZGV4OiBkZXN0SW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4LFxuICAgICAgdHJhbnNpdGlvbkNiOiBjYlxuICAgIH0pXG5cbiAgICB0aGlzLl9vbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgLy8gaWYgKEFuaW1hdGlvbnNEZWJ1Z01vZHVsZSkge1xuICAgIC8vICAgQW5pbWF0aW9uc0RlYnVnTW9kdWxlLnN0YXJ0UmVjb3JkaW5nRnBzKCk7XG4gICAgLy8gfVxuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0cmFuc2l0aW9uRnJvbUluZGV4XSB8fFxuICAgICAgdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW2Rlc3RJbmRleF07XG4gICAgaW52YXJpYW50KFxuICAgICAgc2NlbmVDb25maWcsXG4gICAgICAnQ2Fubm90IGNvbmZpZ3VyZSBzY2VuZSBhdCBpbmRleCAnICsgdHJhbnNpdGlvbkZyb21JbmRleFxuICAgICk7XG4gICAgaWYgKGp1bXBTcHJpbmdUbyAhPSBudWxsKSB7XG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoanVtcFNwcmluZ1RvKTtcbiAgICB9XG4gICAgdGhpcy5zcHJpbmcuc2V0T3ZlcnNob290Q2xhbXBpbmdFbmFibGVkKHRydWUpO1xuICAgIHRoaXMuc3ByaW5nLmdldFNwcmluZ0NvbmZpZygpLmZyaWN0aW9uID0gc2NlbmVDb25maWcuc3ByaW5nRnJpY3Rpb247XG4gICAgdGhpcy5zcHJpbmcuZ2V0U3ByaW5nQ29uZmlnKCkudGVuc2lvbiA9IHNjZW5lQ29uZmlnLnNwcmluZ1RlbnNpb247XG4gICAgdGhpcy5zcHJpbmcuc2V0VmVsb2NpdHkodmVsb2NpdHkgfHwgc2NlbmVDb25maWcuZGVmYXVsdFRyYW5zaXRpb25WZWxvY2l0eSk7XG4gICAgdGhpcy5zcHJpbmcuc2V0RW5kVmFsdWUoMSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoaXMgaGFwcGVucyBmb3IgZWFjaCBmcmFtZSBvZiBlaXRoZXIgYSBnZXN0dXJlIG9yIGEgdHJhbnNpdGlvbi4gSWYgYm90aCBhcmVcbiAgICogaGFwcGVuaW5nLCB3ZSBvbmx5IHNldCB2YWx1ZXMgZm9yIHRoZSB0cmFuc2l0aW9uIGFuZCB0aGUgZ2VzdHVyZSB3aWxsIGNhdGNoIHVwIGxhdGVyXG4gICAqL1xuICBfaGFuZGxlU3ByaW5nVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAvLyBQcmlvcml0aXplIGhhbmRsaW5nIHRyYW5zaXRpb24gaW4gcHJvZ3Jlc3Mgb3ZlciBhIGdlc3R1cmU6XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uQmV0d2VlbihcbiAgICAgICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4LFxuICAgICAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4LFxuICAgICAgICB0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSAhPSBudWxsKSB7XG4gICAgICBsZXQgcHJlc2VudGVkVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKFxuICAgICAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4LFxuICAgICAgICBwcmVzZW50ZWRUb0luZGV4LFxuICAgICAgICB0aGlzLnNwcmluZy5nZXRDdXJyZW50VmFsdWUoKVxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoaXMgaGFwcGVucyBhdCB0aGUgZW5kIG9mIGEgdHJhbnNpdGlvbiBzdGFydGVkIGJ5IHRyYW5zaXRpb25UbywgYW5kIHdoZW4gdGhlIHNwcmluZyBjYXRjaGVzIHVwIHRvIGEgcGVuZGluZyBnZXN0dXJlXG4gICAqL1xuICBfY29tcGxldGVUcmFuc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKCkgIT09IDEgJiYgdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKCkgIT09IDApIHtcbiAgICAgIC8vIFRoZSBzcHJpbmcgaGFzIGZpbmlzaGVkIGNhdGNoaW5nIHVwIHRvIGEgZ2VzdHVyZSBpbiBwcm9ncmVzcy4gUmVtb3ZlIHRoZSBwZW5kaW5nIHByb2dyZXNzXG4gICAgICAvLyBhbmQgd2Ugd2lsbCBiZSBpbiBhIG5vcm1hbCBhY3RpdmVHZXN0dXJlIHN0YXRlXG4gICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzKSB7XG4gICAgICAgIHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX29uQW5pbWF0aW9uRW5kKCk7XG4gICAgbGV0IHByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBsZXQgZGlkRm9jdXNSb3V0ZSA9IHRoaXMuX3N1YlJvdXRlRm9jdXNbcHJlc2VudGVkSW5kZXhdIHx8IHRoaXMuc3RhdGUucm91dGVTdGFja1twcmVzZW50ZWRJbmRleF07XG4gICAgdGhpcy5fZW1pdERpZEZvY3VzKGRpZEZvY3VzUm91dGUpO1xuICAgIC8vIGlmIChBbmltYXRpb25zRGVidWdNb2R1bGUpIHtcbiAgICAvLyAgIEFuaW1hdGlvbnNEZWJ1Z01vZHVsZS5zdG9wUmVjb3JkaW5nRnBzKERhdGUubm93KCkpO1xuICAgIC8vIH1cbiAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggPSBudWxsO1xuICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZSgwKS5zZXRBdFJlc3QoKTtcbiAgICB0aGlzLl9oaWRlU2NlbmVzKCk7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkNiKSB7XG4gICAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25DYigpO1xuICAgICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5faW50ZXJhY3Rpb25IYW5kbGUpIHtcbiAgICAgIHRoaXMuY2xlYXJJbnRlcmFjdGlvbkhhbmRsZSh0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSk7XG4gICAgICB0aGlzLl9pbnRlcmFjdGlvbkhhbmRsZSA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MpIHtcbiAgICAgIC8vIEEgdHJhbnNpdGlvbiBjb21wbGV0ZWQsIGJ1dCB0aGVyZSBpcyBhbHJlYWR5IGFub3RoZXIgZ2VzdHVyZSBoYXBwZW5pbmcuXG4gICAgICAvLyBFbmFibGUgdGhlIHNjZW5lIGFuZCBzZXQgdGhlIHNwcmluZyB0byBjYXRjaCB1cCB3aXRoIHRoZSBuZXcgZ2VzdHVyZVxuICAgICAgbGV0IGdlc3R1cmVUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgICAgdGhpcy5fZW5hYmxlU2NlbmUoZ2VzdHVyZVRvSW5kZXgpO1xuICAgICAgdGhpcy5zcHJpbmcuc2V0RW5kVmFsdWUodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLmxlbmd0aCkge1xuICAgICAgbGV0IHF1ZXVlZFRyYW5zaXRpb24gPSB0aGlzLnN0YXRlLnRyYW5zaXRpb25RdWV1ZS5zaGlmdCgpO1xuICAgICAgdGhpcy5fZW5hYmxlU2NlbmUocXVldWVkVHJhbnNpdGlvbi5kZXN0SW5kZXgpO1xuICAgICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbcXVldWVkVHJhbnNpdGlvbi5kZXN0SW5kZXhdKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgcXVldWVkVHJhbnNpdGlvbi5kZXN0SW5kZXgsXG4gICAgICAgIHF1ZXVlZFRyYW5zaXRpb24udmVsb2NpdHksXG4gICAgICAgIG51bGwsXG4gICAgICAgIHF1ZXVlZFRyYW5zaXRpb24uY2JcbiAgICAgICk7XG4gICAgfVxuICB9LFxuXG4gIF9lbWl0RGlkRm9jdXM6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5uYXZpZ2F0aW9uQ29udGV4dC5lbWl0KCdkaWRmb2N1cycsIHtyb3V0ZTogcm91dGV9KTtcblxuICAgIGlmICh0aGlzLnByb3BzLm9uRGlkRm9jdXMpIHtcbiAgICAgIHRoaXMucHJvcHMub25EaWRGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICB9LFxuXG4gIF9lbWl0V2lsbEZvY3VzOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIHRoaXMubmF2aWdhdGlvbkNvbnRleHQuZW1pdCgnd2lsbGZvY3VzJywge3JvdXRlOiByb3V0ZX0pO1xuXG4gICAgbGV0IG5hdkJhciA9IHRoaXMuX25hdkJhcjtcbiAgICBpZiAobmF2QmFyICYmIG5hdkJhci5oYW5kbGVXaWxsRm9jdXMpIHtcbiAgICAgIG5hdkJhci5oYW5kbGVXaWxsRm9jdXMocm91dGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5vbldpbGxGb2N1cykge1xuICAgICAgdGhpcy5wcm9wcy5vbldpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBIaWRlcyBhbGwgc2NlbmVzIHRoYXQgd2UgYXJlIG5vdCBjdXJyZW50bHkgb24sIGdlc3R1cmluZyB0bywgb3IgdHJhbnNpdGlvbmluZyBmcm9tXG4gICAqL1xuICBfaGlkZVNjZW5lczogZnVuY3Rpb24oKSB7XG4gICAgbGV0IGdlc3R1cmluZ1RvSW5kZXggPSBudWxsO1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpIHtcbiAgICAgIGdlc3R1cmluZ1RvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCB8fFxuICAgICAgICAgIGkgPT09IHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCB8fFxuICAgICAgICAgIGkgPT09IGdlc3R1cmluZ1RvSW5kZXgpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9kaXNhYmxlU2NlbmUoaSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBQdXNoIGEgc2NlbmUgb2ZmIHRoZSBzY3JlZW4sIHNvIHRoYXQgb3BhY2l0eTowIHNjZW5lcyB3aWxsIG5vdCBibG9jayB0b3VjaGVzIHNlbnQgdG8gdGhlIHByZXNlbnRlZCBzY2VuZXNcbiAgICovXG4gIF9kaXNhYmxlU2NlbmU6IGZ1bmN0aW9uKHNjZW5lSW5kZXgpIHtcbiAgICB0aGlzLnJlZnNbJ3NjZW5lXycgKyBzY2VuZUluZGV4XSAmJlxuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdLnNldE5hdGl2ZVByb3BzKFNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFB1dCB0aGUgc2NlbmUgYmFjayBpbnRvIHRoZSBzdGF0ZSBhcyBkZWZpbmVkIGJ5IHByb3BzLnNjZW5lU3R5bGUsIHNvIHRyYW5zaXRpb25zIGNhbiBoYXBwZW4gbm9ybWFsbHlcbiAgICovXG4gIF9lbmFibGVTY2VuZTogZnVuY3Rpb24oc2NlbmVJbmRleCkge1xuICAgIC8vIEZpcnN0LCBkZXRlcm1pbmUgd2hhdCB0aGUgZGVmaW5lZCBzdHlsZXMgYXJlIGZvciBzY2VuZXMgaW4gdGhpcyBuYXZpZ2F0b3JcbiAgICBsZXQgc2NlbmVTdHlsZSA9IGZsYXR0ZW5TdHlsZShbc3R5bGVzLmJhc2VTY2VuZSwgdGhpcy5wcm9wcy5zY2VuZVN0eWxlXSk7XG4gICAgLy8gVGhlbiByZXN0b3JlIHRoZSBwb2ludGVyIGV2ZW50cyBhbmQgdG9wIHZhbHVlIGZvciB0aGlzIHNjZW5lXG4gICAgbGV0IHNjZW5lTmF0aXZlUHJvcHMgPSB7XG4gICAgICBwb2ludGVyRXZlbnRzOiAnYXV0bycsXG4gICAgICBzdHlsZToge1xuICAgICAgICB0b3A6IHNjZW5lU3R5bGUudG9wLFxuICAgICAgICBib3R0b206IHNjZW5lU3R5bGUuYm90dG9tLFxuICAgICAgICAuLi52aXNpYmxlU3R5bGVcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIGlmIChzY2VuZUluZGV4ICE9PSB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggJiZcbiAgICAvLyAgICAgc2NlbmVJbmRleCAhPT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgIC8vICAgLy8gSWYgd2UgYXJlIG5vdCBpbiBhIHRyYW5zaXRpb24gZnJvbSB0aGlzIGluZGV4LCBtYWtlIHN1cmUgb3BhY2l0eSBpcyAwXG4gICAgLy8gICAvLyB0byBwcmV2ZW50IHRoZSBlbmFibGVkIHNjZW5lIGZyb20gZmxhc2hpbmcgb3ZlciB0aGUgcHJlc2VudGVkIHNjZW5lXG4gICAgLy8gICBzY2VuZU5hdGl2ZVByb3BzLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgLy8gICBPYmplY3QuYXNzaWduKHNjZW5lTmF0aXZlUHJvcHMuc3R5bGUsIFNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUy5zdHlsZSlcbiAgICAvLyB9XG5cbiAgICB0aGlzLnJlZnNbJ3NjZW5lXycgKyBzY2VuZUluZGV4XSAmJlxuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdLnNldE5hdGl2ZVByb3BzKHNjZW5lTmF0aXZlUHJvcHMpO1xuICB9LFxuXG4gIF9vbkFuaW1hdGlvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZXQgZnJvbUluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBsZXQgdG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICBmcm9tSW5kZXggPSB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXg7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpIHtcbiAgICAgIHRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgfVxuICAgIHRoaXMuX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkKGZyb21JbmRleCwgdHJ1ZSk7XG4gICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQodG9JbmRleCwgdHJ1ZSk7XG4gICAgbGV0IG5hdkJhciA9IHRoaXMuX25hdkJhcjtcbiAgICBpZiAobmF2QmFyICYmIG5hdkJhci5vbkFuaW1hdGlvblN0YXJ0KSB7XG4gICAgICBuYXZCYXIub25BbmltYXRpb25TdGFydChmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH1cbiAgfSxcblxuICBfb25BbmltYXRpb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBtYXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDw9IG1heDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQoaW5kZXgsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLm9uQW5pbWF0aW9uRW5kKSB7XG4gICAgICBuYXZCYXIub25BbmltYXRpb25FbmQoKTtcbiAgICB9XG4gIH0sXG5cbiAgX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkOiBmdW5jdGlvbihzY2VuZUluZGV4LCBzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZSkge1xuICAgIGxldCB2aWV3QXRJbmRleCA9IHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdO1xuICAgIGlmICh2aWV3QXRJbmRleCA9PT0gbnVsbCB8fCB2aWV3QXRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZpZXdBdEluZGV4LnNldE5hdGl2ZVByb3BzKCB7cmVuZGVyVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkOiBzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZX0pO1xuICB9LFxuXG4gIF9oYW5kbGVUb3VjaFN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzID0gR0VTVFVSRV9BQ1RJT05TO1xuICB9LFxuXG4gIF9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgaWYgKCFzY2VuZUNvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQgPSB0aGlzLl9tYXRjaEdlc3R1cmVBY3Rpb24odGhpcy5fZWxpZ2libGVHZXN0dXJlcywgc2NlbmVDb25maWcuZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSk7XG4gICAgcmV0dXJuICEhdGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50O1xuICB9LFxuXG4gIF9kb2VzR2VzdHVyZU92ZXJzd2lwZTogZnVuY3Rpb24oZ2VzdHVyZU5hbWUpIHtcbiAgICBsZXQgd291bGRPdmVyc3dpcGVCYWNrID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA8PSAwICYmXG4gICAgICAoZ2VzdHVyZU5hbWUgPT09ICdwb3AnIHx8IGdlc3R1cmVOYW1lID09PSAnanVtcEJhY2snKTtcbiAgICBsZXQgd291bGRPdmVyc3dpcGVGb3J3YXJkID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA+PSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMSAmJlxuICAgICAgZ2VzdHVyZU5hbWUgPT09ICdqdW1wRm9yd2FyZCc7XG4gICAgcmV0dXJuIHdvdWxkT3ZlcnN3aXBlRm9yd2FyZCB8fCB3b3VsZE92ZXJzd2lwZUJhY2s7XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlckdyYW50OiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQsXG4gICAgICAnUmVzcG9uZGVyIGdyYW50ZWQgdW5leHBlY3RlZGx5LidcbiAgICApO1xuICAgIHRoaXMuX2F0dGFjaEdlc3R1cmUodGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50KTtcbiAgICB0aGlzLl9vbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgdGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50ID0gbnVsbDtcbiAgfSxcblxuICBfZGVsdGFGb3JHZXN0dXJlQWN0aW9uOiBmdW5jdGlvbihnZXN0dXJlQWN0aW9uKSB7XG4gICAgc3dpdGNoIChnZXN0dXJlQWN0aW9uKSB7XG4gICAgICBjYXNlICdwb3AnOlxuICAgICAgY2FzZSAnanVtcEJhY2snOlxuICAgICAgICByZXR1cm4gLTE7XG4gICAgICBjYXNlICdqdW1wRm9yd2FyZCc6XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaW52YXJpYW50KGZhbHNlLCAnVW5zdXBwb3J0ZWQgZ2VzdHVyZSBhY3Rpb24gJyArIGdlc3R1cmVBY3Rpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgbGV0IHJlbGVhc2VHZXN0dXJlQWN0aW9uID0gdGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlO1xuICAgIGlmICghcmVsZWFzZUdlc3R1cmVBY3Rpb24pIHtcbiAgICAgIC8vIFRoZSBnZXN0dXJlIG1heSBoYXZlIGJlZW4gZGV0YWNoZWQgd2hpbGUgcmVzcG9uZGVyLCBzbyB0aGVyZSBpcyBubyBhY3Rpb24gaGVyZVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcmVsZWFzZUdlc3R1cmUgPSBzY2VuZUNvbmZpZy5nZXN0dXJlc1tyZWxlYXNlR2VzdHVyZUFjdGlvbl07XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICBpZiAodGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKCkgPT09IDApIHtcbiAgICAgIC8vIFRoZSBzcHJpbmcgaXMgYXQgemVybywgc28gdGhlIGdlc3R1cmUgaXMgYWxyZWFkeSBjb21wbGV0ZVxuICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgICAgdGhpcy5fY29tcGxldGVUcmFuc2l0aW9uKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gcmVsZWFzZUdlc3R1cmUuZGlyZWN0aW9uID09PSAndG9wLXRvLWJvdHRvbScgfHwgcmVsZWFzZUdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICBsZXQgdmVsb2NpdHksIGdlc3R1cmVEaXN0YW5jZTtcbiAgICBpZiAoaXNUcmF2ZWxWZXJ0aWNhbCkge1xuICAgICAgdmVsb2NpdHkgPSBpc1RyYXZlbEludmVydGVkID8gLWdlc3R1cmVTdGF0ZS52eSA6IGdlc3R1cmVTdGF0ZS52eTtcbiAgICAgIGdlc3R1cmVEaXN0YW5jZSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLmR5IDogZ2VzdHVyZVN0YXRlLmR5O1xuICAgIH0gZWxzZSB7XG4gICAgICB2ZWxvY2l0eSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLnZ4IDogZ2VzdHVyZVN0YXRlLnZ4O1xuICAgICAgZ2VzdHVyZURpc3RhbmNlID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUuZHggOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgfVxuICAgIGxldCB0cmFuc2l0aW9uVmVsb2NpdHkgPSBjbGFtcCgtMTAsIHZlbG9jaXR5LCAxMCk7XG4gICAgaWYgKE1hdGguYWJzKHZlbG9jaXR5KSA8IHJlbGVhc2VHZXN0dXJlLm5vdE1vdmluZykge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgdmVsb2NpdHkgaXMgc28gc2xvdywgaXMgXCJub3QgbW92aW5nXCJcbiAgICAgIGxldCBoYXNHZXN0dXJlZEVub3VnaFRvQ29tcGxldGUgPSBnZXN0dXJlRGlzdGFuY2UgPiByZWxlYXNlR2VzdHVyZS5mdWxsRGlzdGFuY2UgKiByZWxlYXNlR2VzdHVyZS5zdGlsbENvbXBsZXRpb25SYXRpbztcbiAgICAgIHRyYW5zaXRpb25WZWxvY2l0eSA9IGhhc0dlc3R1cmVkRW5vdWdoVG9Db21wbGV0ZSA/IHJlbGVhc2VHZXN0dXJlLnNuYXBWZWxvY2l0eSA6IC1yZWxlYXNlR2VzdHVyZS5zbmFwVmVsb2NpdHk7XG4gICAgfVxuICAgIGlmICh0cmFuc2l0aW9uVmVsb2NpdHkgPCAwIHx8IHRoaXMuX2RvZXNHZXN0dXJlT3ZlcnN3aXBlKHJlbGVhc2VHZXN0dXJlQWN0aW9uKSkge1xuICAgICAgLy8gVGhpcyBnZXN0dXJlIGlzIHRvIGFuIG92ZXJzd2lwZWQgcmVnaW9uIG9yIGRvZXMgbm90IGhhdmUgZW5vdWdoIHZlbG9jaXR5IHRvIGNvbXBsZXRlXG4gICAgICAvLyBJZiB3ZSBhcmUgY3VycmVudGx5IG1pZC10cmFuc2l0aW9uLCB0aGVuIHRoaXMgZ2VzdHVyZSB3YXMgYSBwZW5kaW5nIGdlc3R1cmUuIEJlY2F1c2UgdGhpcyBnZXN0dXJlIHRha2VzIG5vIGFjdGlvbiwgd2UgY2FuIHN0b3AgaGVyZVxuICAgICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9PSBudWxsKSB7XG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIGN1cnJlbnQgdHJhbnNpdGlvbiwgc28gd2UgbmVlZCB0byB0cmFuc2l0aW9uIGJhY2sgdG8gdGhlIHByZXNlbnRlZCBpbmRleFxuICAgICAgICBsZXQgdHJhbnNpdGlvbkJhY2tUb1ByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICAgICAgLy8gc2xpZ2h0IGhhY2s6IGNoYW5nZSB0aGUgcHJlc2VudGVkIGluZGV4IGZvciBhIG1vbWVudCBpbiBvcmRlciB0byB0cmFuc2l0aW9uVG8gY29ycmVjdGx5XG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggPSBkZXN0SW5kZXg7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgICB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgsXG4gICAgICAgICAgLSB0cmFuc2l0aW9uVmVsb2NpdHksXG4gICAgICAgICAgMSAtIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBnZXN0dXJlIGhhcyBlbm91Z2ggdmVsb2NpdHkgdG8gY29tcGxldGUsIHNvIHdlIHRyYW5zaXRpb24gdG8gdGhlIGdlc3R1cmUncyBkZXN0aW5hdGlvblxuICAgICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbZGVzdEluZGV4XSk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICAgIGRlc3RJbmRleCxcbiAgICAgICAgdHJhbnNpdGlvblZlbG9jaXR5LFxuICAgICAgICBudWxsLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlbGVhc2VHZXN0dXJlQWN0aW9uID09PSAncG9wJykge1xuICAgICAgICAgICAgdGhpcy5fY2xlYW5TY2VuZXNQYXN0SW5kZXgoZGVzdEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX2RldGFjaEdlc3R1cmUoKTtcbiAgfSxcblxuICBfaGFuZGxlUGFuUmVzcG9uZGVyVGVybWluYXRlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB0aGlzLl9kZXRhY2hHZXN0dXJlKCk7XG4gICAgbGV0IHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgLy8gc2xpZ2h0IGhhY2s6IGNoYW5nZSB0aGUgcHJlc2VudGVkIGluZGV4IGZvciBhIG1vbWVudCBpbiBvcmRlciB0byB0cmFuc2l0aW9uVG8gY29ycmVjdGx5XG4gICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgsXG4gICAgICBudWxsLFxuICAgICAgMSAtIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgKTtcbiAgfSxcblxuICBfYXR0YWNoR2VzdHVyZTogZnVuY3Rpb24oZ2VzdHVyZUlkKSB7XG4gICAgdGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlID0gZ2VzdHVyZUlkO1xuICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKGdlc3R1cmluZ1RvSW5kZXgpO1xuICB9LFxuXG4gIF9kZXRhY2hHZXN0dXJlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPSBudWxsO1xuICAgIHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyA9IG51bGw7XG4gICAgdGhpcy5faGlkZVNjZW5lcygpO1xuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJNb3ZlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgbGV0IGdlc3R1cmUgPSBzY2VuZUNvbmZpZy5nZXN0dXJlc1t0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmVdO1xuICAgICAgcmV0dXJuIHRoaXMuX21vdmVBdHRhY2hlZEdlc3R1cmUoZ2VzdHVyZSwgZ2VzdHVyZVN0YXRlKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoZWRHZXN0dXJlID0gdGhpcy5fbWF0Y2hHZXN0dXJlQWN0aW9uKEdFU1RVUkVfQUNUSU9OUywgc2NlbmVDb25maWcuZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSk7XG4gICAgaWYgKG1hdGNoZWRHZXN0dXJlKSB7XG4gICAgICB0aGlzLl9hdHRhY2hHZXN0dXJlKG1hdGNoZWRHZXN0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgX21vdmVBdHRhY2hlZEdlc3R1cmU6IGZ1bmN0aW9uKGdlc3R1cmUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCBpc1RyYXZlbEludmVydGVkID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCBkaXN0YW5jZSA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgZGlzdGFuY2UgPSBpc1RyYXZlbEludmVydGVkID8gLSBkaXN0YW5jZSA6IGRpc3RhbmNlO1xuICAgIGxldCBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQgPSBnZXN0dXJlLmdlc3R1cmVEZXRlY3RNb3ZlbWVudDtcbiAgICBsZXQgbmV4dFByb2dyZXNzID0gKGRpc3RhbmNlIC0gZ2VzdHVyZURldGVjdE1vdmVtZW50KSAvXG4gICAgICAoZ2VzdHVyZS5mdWxsRGlzdGFuY2UgLSBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQpO1xuICAgIGlmIChuZXh0UHJvZ3Jlc3MgPCAwICYmIGdlc3R1cmUuaXNEZXRhY2hhYmxlKSB7XG4gICAgICBsZXQgZ2VzdHVyaW5nVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsIGdlc3R1cmluZ1RvSW5kZXgsIDApO1xuICAgICAgdGhpcy5fZGV0YWNoR2VzdHVyZSgpO1xuICAgICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZSgwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2RvZXNHZXN0dXJlT3ZlcnN3aXBlKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkpIHtcbiAgICAgIGxldCBmcmljdGlvbkNvbnN0YW50ID0gZ2VzdHVyZS5vdmVyc3dpcGUuZnJpY3Rpb25Db25zdGFudDtcbiAgICAgIGxldCBmcmljdGlvbkJ5RGlzdGFuY2UgPSBnZXN0dXJlLm92ZXJzd2lwZS5mcmljdGlvbkJ5RGlzdGFuY2U7XG4gICAgICBsZXQgZnJpY3Rpb25SYXRpbyA9IDEgLyAoKGZyaWN0aW9uQ29uc3RhbnQpICsgKE1hdGguYWJzKG5leHRQcm9ncmVzcykgKiBmcmljdGlvbkJ5RGlzdGFuY2UpKTtcbiAgICAgIG5leHRQcm9ncmVzcyAqPSBmcmljdGlvblJhdGlvO1xuICAgIH1cbiAgICBuZXh0UHJvZ3Jlc3MgPSBjbGFtcCgwLCBuZXh0UHJvZ3Jlc3MsIDEpO1xuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbmV4dFByb2dyZXNzO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzKSB7XG4gICAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZShuZXh0UHJvZ3Jlc3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUobmV4dFByb2dyZXNzKTtcbiAgICB9XG4gIH0sXG5cbiAgX21hdGNoR2VzdHVyZUFjdGlvbjogZnVuY3Rpb24oZWxpZ2libGVHZXN0dXJlcywgZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGlmICghZ2VzdHVyZXMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hlZEdlc3R1cmUgPSBudWxsO1xuICAgIGVsaWdpYmxlR2VzdHVyZXMuc29tZSgoZ2VzdHVyZU5hbWUsIGdlc3R1cmVJbmRleCkgPT4ge1xuICAgICAgbGV0IGdlc3R1cmUgPSBnZXN0dXJlc1tnZXN0dXJlTmFtZV07XG4gICAgICBpZiAoIWdlc3R1cmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGdlc3R1cmUub3ZlcnN3aXBlID09IG51bGwgJiYgdGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUoZ2VzdHVyZU5hbWUpKSB7XG4gICAgICAgIC8vIGNhbm5vdCBzd2lwZSBwYXN0IGZpcnN0IG9yIGxhc3Qgc2NlbmUgd2l0aG91dCBvdmVyc3dpcGluZ1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgaXNUcmF2ZWxWZXJ0aWNhbCA9IGdlc3R1cmUuZGlyZWN0aW9uID09PSAndG9wLXRvLWJvdHRvbScgfHwgZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICAgIGxldCBpc1RyYXZlbEludmVydGVkID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgICAgbGV0IGN1cnJlbnRMb2MgPSBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLm1vdmVZIDogZ2VzdHVyZVN0YXRlLm1vdmVYO1xuICAgICAgbGV0IHRyYXZlbERpc3QgPSBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLmR5IDogZ2VzdHVyZVN0YXRlLmR4O1xuICAgICAgbGV0IG9wcG9zaXRlQXhpc1RyYXZlbERpc3QgPVxuICAgICAgICBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLmR4IDogZ2VzdHVyZVN0YXRlLmR5O1xuICAgICAgbGV0IGVkZ2VIaXRXaWR0aCA9IGdlc3R1cmUuZWRnZUhpdFdpZHRoO1xuICAgICAgaWYgKGlzVHJhdmVsSW52ZXJ0ZWQpIHtcbiAgICAgICAgY3VycmVudExvYyA9IC1jdXJyZW50TG9jO1xuICAgICAgICB0cmF2ZWxEaXN0ID0gLXRyYXZlbERpc3Q7XG4gICAgICAgIG9wcG9zaXRlQXhpc1RyYXZlbERpc3QgPSAtb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdDtcbiAgICAgICAgZWRnZUhpdFdpZHRoID0gaXNUcmF2ZWxWZXJ0aWNhbCA/XG4gICAgICAgICAgLShTQ1JFRU5fSEVJR0hUIC0gZWRnZUhpdFdpZHRoKSA6XG4gICAgICAgICAgLShTQ1JFRU5fV0lEVEggLSBlZGdlSGl0V2lkdGgpO1xuICAgICAgfVxuICAgICAgbGV0IG1vdmVTdGFydGVkSW5SZWdpb24gPSBnZXN0dXJlLmVkZ2VIaXRXaWR0aCA9PSBudWxsIHx8XG4gICAgICAgIGN1cnJlbnRMb2MgPCBlZGdlSGl0V2lkdGg7XG4gICAgICBpZiAoIW1vdmVTdGFydGVkSW5SZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbGV0IG1vdmVUcmF2ZWxsZWRGYXJFbm91Z2ggPSB0cmF2ZWxEaXN0ID49IGdlc3R1cmUuZ2VzdHVyZURldGVjdE1vdmVtZW50O1xuICAgICAgaWYgKCFtb3ZlVHJhdmVsbGVkRmFyRW5vdWdoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBkaXJlY3Rpb25Jc0NvcnJlY3QgPSBNYXRoLmFicyh0cmF2ZWxEaXN0KSA+IE1hdGguYWJzKG9wcG9zaXRlQXhpc1RyYXZlbERpc3QpICogZ2VzdHVyZS5kaXJlY3Rpb25SYXRpbztcbiAgICAgIGlmIChkaXJlY3Rpb25Jc0NvcnJlY3QpIHtcbiAgICAgICAgbWF0Y2hlZEdlc3R1cmUgPSBnZXN0dXJlTmFtZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzID0gdGhpcy5fZWxpZ2libGVHZXN0dXJlcy5zbGljZSgpLnNwbGljZShnZXN0dXJlSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGVkR2VzdHVyZTtcbiAgfSxcblxuICBfdHJhbnNpdGlvblNjZW5lU3R5bGU6IGZ1bmN0aW9uKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MsIGluZGV4KSB7XG4gICAgbGV0IHZpZXdBdEluZGV4ID0gdGhpcy5yZWZzWydzY2VuZV8nICsgaW5kZXhdO1xuICAgIGlmICh2aWV3QXRJbmRleCA9PT0gbnVsbCB8fCB2aWV3QXRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFVzZSB0b0luZGV4IGFuaW1hdGlvbiB3aGVuIHdlIG1vdmUgZm9yd2FyZHMuIFVzZSBmcm9tSW5kZXggd2hlbiB3ZSBtb3ZlIGJhY2tcbiAgICBsZXQgc2NlbmVDb25maWdJbmRleCA9IGZyb21JbmRleCA8IHRvSW5kZXggPyB0b0luZGV4IDogZnJvbUluZGV4O1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1tzY2VuZUNvbmZpZ0luZGV4XTtcbiAgICAvLyB0aGlzIGhhcHBlbnMgZm9yIG92ZXJzd2lwaW5nIHdoZW4gdGhlcmUgaXMgbm8gc2NlbmUgYXQgdG9JbmRleFxuICAgIGlmICghc2NlbmVDb25maWcpIHtcbiAgICAgIHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3NjZW5lQ29uZmlnSW5kZXggLSAxXTtcbiAgICB9XG4gICAgbGV0IHN0eWxlVG9Vc2UgPSB7fTtcbiAgICBsZXQgdXNlRm4gPSBpbmRleCA8IGZyb21JbmRleCB8fCBpbmRleCA8IHRvSW5kZXggP1xuICAgICAgc2NlbmVDb25maWcuYW5pbWF0aW9uSW50ZXJwb2xhdG9ycy5vdXQgOlxuICAgICAgc2NlbmVDb25maWcuYW5pbWF0aW9uSW50ZXJwb2xhdG9ycy5pbnRvO1xuICAgIGxldCBkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzID0gZnJvbUluZGV4IDwgdG9JbmRleCA/IHByb2dyZXNzIDogMSAtIHByb2dyZXNzO1xuICAgIGxldCBkaWRDaGFuZ2UgPSB1c2VGbihzdHlsZVRvVXNlLCBkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzKTtcbiAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICB2aWV3QXRJbmRleC5zZXROYXRpdmVQcm9wcyh7c3R5bGU6IHN0eWxlVG9Vc2V9KTtcbiAgICB9XG4gIH0sXG5cbiAgX3RyYW5zaXRpb25CZXR3ZWVuOiBmdW5jdGlvbihmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvblNjZW5lU3R5bGUoZnJvbUluZGV4LCB0b0luZGV4LCBwcm9ncmVzcywgZnJvbUluZGV4KTtcbiAgICB0aGlzLl90cmFuc2l0aW9uU2NlbmVTdHlsZShmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzLCB0b0luZGV4KTtcbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLnVwZGF0ZVByb2dyZXNzICYmIHRvSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPj0gMCkge1xuICAgICAgbmF2QmFyLnVwZGF0ZVByb2dyZXNzKHByb2dyZXNzLCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH1cbiAgfSxcblxuICBfaGFuZGxlUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgX2dldERlc3RJbmRleFdpdGhpbkJvdW5kczogZnVuY3Rpb24obikge1xuICAgIGxldCBjdXJyZW50SW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCBkZXN0SW5kZXggPSBjdXJyZW50SW5kZXggKyBuO1xuICAgIGludmFyaWFudChcbiAgICAgIGRlc3RJbmRleCA+PSAwLFxuICAgICAgJ0Nhbm5vdCBqdW1wIGJlZm9yZSB0aGUgZmlyc3Qgcm91dGUuJ1xuICAgICk7XG4gICAgbGV0IG1heEluZGV4ID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAtIDE7XG4gICAgaW52YXJpYW50KFxuICAgICAgbWF4SW5kZXggPj0gZGVzdEluZGV4LFxuICAgICAgJ0Nhbm5vdCBqdW1wIHBhc3QgdGhlIGxhc3Qgcm91dGUuJ1xuICAgICk7XG4gICAgcmV0dXJuIGRlc3RJbmRleDtcbiAgfSxcblxuICBfanVtcE46IGZ1bmN0aW9uKG4pIHtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5fZ2V0RGVzdEluZGV4V2l0aGluQm91bmRzKG4pO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKGRlc3RJbmRleCk7XG4gICAgY29uc3Qgcm91dGUgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2tbZGVzdEluZGV4XVxuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXMocm91dGUpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhkZXN0SW5kZXgpO1xuICAgIGlmICghdGhpcy5oYXNoQ2hhbmdlZCkge1xuICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsgaW5kZXg6IGRlc3RJbmRleCB9LCAnL3NjZW5lXycgKyB0aGlzLl9nZXRSb3V0ZUlEKHJvdXRlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LmdvKG4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBpZiAobiA8IDApIHtcbiAgICAvLyAgIC8vIF9fdWlkIHNob3VsZCBiZSBub24tbmVnYXRpdmVcbiAgICAvLyAgIF9fdWlkID0gTWF0aC5tYXgoX191aWQgKyBuLCAwKTtcbiAgICAvLyB9XG4gIH0sXG5cbiAganVtcFRvOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIGxldCBkZXN0SW5kZXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2suaW5kZXhPZihyb3V0ZSk7XG4gICAgaW52YXJpYW50KFxuICAgICAgZGVzdEluZGV4ICE9PSAtMSxcbiAgICAgICdDYW5ub3QganVtcCB0byByb3V0ZSB0aGF0IGlzIG5vdCBpbiB0aGUgcm91dGUgc3RhY2snXG4gICAgKTtcbiAgICB0aGlzLl9qdW1wTihkZXN0SW5kZXggLSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICBqdW1wRm9yd2FyZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fanVtcE4oMSk7XG4gIH0sXG5cbiAganVtcEJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2p1bXBOKC0xKTtcbiAgfSxcblxuICBwdXNoOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIGludmFyaWFudCghIXJvdXRlLCAnTXVzdCBzdXBwbHkgcm91dGUgdG8gcHVzaCcpO1xuICAgIGxldCBhY3RpdmVMZW5ndGggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgMTtcbiAgICBsZXQgYWN0aXZlU3RhY2sgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgYWN0aXZlTGVuZ3RoKTtcbiAgICBsZXQgYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2sgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgYWN0aXZlTGVuZ3RoKTtcbiAgICBsZXQgbmV4dFN0YWNrID0gYWN0aXZlU3RhY2suY29uY2F0KFtyb3V0ZV0pO1xuICAgIGxldCBkZXN0SW5kZXggPSBuZXh0U3RhY2subGVuZ3RoIC0gMTtcbiAgICBsZXQgbmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrID0gYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2suY29uY2F0KFtcbiAgICAgIHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpLFxuICAgIF0pO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXMobmV4dFN0YWNrW2Rlc3RJbmRleF0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFN0YWNrLFxuICAgICAgc2NlbmVDb25maWdTdGFjazogbmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrLFxuICAgICAgLy8gcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleFxuICAgIH0sICgpID0+IHtcbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsgaW5kZXg6IGRlc3RJbmRleCB9LCAnL3NjZW5lXycgKyB0aGlzLl9nZXRSb3V0ZUlEKHJvdXRlKSk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShkZXN0SW5kZXgpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKGRlc3RJbmRleCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3BvcE46IGZ1bmN0aW9uKG4pIHtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gbiA+PSAwLFxuICAgICAgJ0Nhbm5vdCBwb3AgYmVsb3cgemVybydcbiAgICApO1xuICAgIGxldCBwb3BJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggLSBuO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKHBvcEluZGV4KTtcbiAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1twb3BJbmRleF0pO1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgIHBvcEluZGV4LFxuICAgICAgbnVsbCwgLy8gZGVmYXVsdCB2ZWxvY2l0eVxuICAgICAgbnVsbCwgLy8gbm8gc3ByaW5nIGp1bXBpbmdcbiAgICAgICgpID0+IHtcbiAgICAgICAgaGlzdG9yeS5nbygtbik7XG4gICAgICAgIHRoaXMuX2NsZWFuU2NlbmVzUGFzdEluZGV4KHBvcEluZGV4KTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIHBvcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLmxlbmd0aCkge1xuICAgICAgLy8gVGhpcyBpcyB0aGUgd29ya2Fyb3VuZCB0byBwcmV2ZW50IHVzZXIgZnJvbSBmaXJpbmcgbXVsdGlwbGUgYHBvcCgpYFxuICAgICAgLy8gY2FsbHMgdGhhdCBtYXkgcG9wIHRoZSByb3V0ZXMgYmV5b25kIHRoZSBsaW1pdC5cbiAgICAgIC8vIEJlY2F1c2UgYHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhgIGRvZXMgbm90IHVwZGF0ZSB1bnRpbCB0aGVcbiAgICAgIC8vIHRyYW5zaXRpb24gc3RhcnRzLCB3ZSBjYW4ndCByZWxpYWJseSB1c2UgYHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhgXG4gICAgICAvLyB0byBrbm93IHdoZXRoZXIgd2UgY2FuIHNhZmVseSBrZWVwIHBvcHBpbmcgdGhlIHJvdXRlcyBvciBub3QgYXQgdGhpc1xuICAgICAgLy8gIG1vbWVudC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA+IDApIHtcbiAgICAgIHRoaXMuX3BvcE4oMSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGEgcm91dGUgaW4gdGhlIG5hdmlnYXRpb24gc3RhY2suXG4gICAqXG4gICAqIGBpbmRleGAgc3BlY2lmaWVzIHRoZSByb3V0ZSBpbiB0aGUgc3RhY2sgdGhhdCBzaG91bGQgYmUgcmVwbGFjZWQuXG4gICAqIElmIGl0J3MgbmVnYXRpdmUsIGl0IGNvdW50cyBmcm9tIHRoZSBiYWNrLlxuICAgKi9cbiAgcmVwbGFjZUF0SW5kZXg6IGZ1bmN0aW9uKHJvdXRlLCBpbmRleCwgY2IpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHJlcGxhY2UnKTtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICBpbmRleCArPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIDw9IGluZGV4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVwbGFjZUN1cnJlbnQgPSBpbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleFxuICAgIGlmICghcmVwbGFjZUN1cnJlbnQpIHtcbiAgICAgIGNvbnNvbGUud2FybignbmF2aWdhdG9yLnJlcGxhY2VBdEluZGV4IGZvciB0aGUgbm9uLWN1cnJlbnQgcm91dGUgYnJlYWtzIHRoZSBiYWNrIGJ1dHRvbiEnKVxuICAgIH1cblxuICAgIGxldCBuZXh0Um91dGVTdGFjayA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5zbGljZSgpO1xuICAgIGxldCBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrLnNsaWNlKCk7XG4gICAgbmV4dFJvdXRlU3RhY2tbaW5kZXhdID0gcm91dGU7XG4gICAgbmV4dEFuaW1hdGlvbk1vZGVTdGFja1tpbmRleF0gPSB0aGlzLnByb3BzLmNvbmZpZ3VyZVNjZW5lKHJvdXRlKTtcblxuICAgIGlmIChpbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgdGhpcy5fZW1pdFdpbGxGb2N1cyhyb3V0ZSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFJvdXRlU3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGluZGV4LFxuICAgICAgdHJhbnNpdGlvbkZyb21JbmRleDogbnVsbFxuICAgIH0sICgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCkge1xuICAgICAgICB0aGlzLl9lbWl0RGlkRm9jdXMocm91dGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwbGFjZUN1cnJlbnQpIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBpbmRleCB9LCAnL3NjZW5lXycgKyB0aGlzLl9nZXRSb3V0ZUlEKHJvdXRlKSk7XG4gICAgICB9XG5cbiAgICAgIGNiICYmIGNiKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSBjdXJyZW50IHNjZW5lIGluIHRoZSBzdGFjay5cbiAgICovXG4gIHJlcGxhY2U6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5yZXBsYWNlQXRJbmRleChyb3V0ZSwgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgcm91dGUncyBwYXJlbnQuXG4gICAqL1xuICByZXBsYWNlUHJldmlvdXM6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgdGhpcy5yZXBsYWNlQXRJbmRleChyb3V0ZSwgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCAtIDEpO1xuICB9LFxuXG4gIHBvcFRvVG9wOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBvcFRvUm91dGUodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrWzBdKTtcbiAgfSxcblxuICBwb3BUb1JvdXRlOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIGxldCBpbmRleE9mUm91dGUgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2suaW5kZXhPZihyb3V0ZSk7XG4gICAgaW52YXJpYW50KFxuICAgICAgaW5kZXhPZlJvdXRlICE9PSAtMSxcbiAgICAgICdDYWxsaW5nIHBvcFRvUm91dGUgZm9yIGEgcm91dGUgdGhhdCBkb2VzblxcJ3QgZXhpc3QhJ1xuICAgICk7XG4gICAgbGV0IG51bVRvUG9wID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCAtIGluZGV4T2ZSb3V0ZTtcbiAgICB0aGlzLl9wb3BOKG51bVRvUG9wKTtcbiAgfSxcblxuICByZXBsYWNlUHJldmlvdXNBbmRQb3A6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVwbGFjZVByZXZpb3VzKHJvdXRlKTtcbiAgICB0aGlzLnBvcCgpO1xuICB9LFxuXG4gIHJlc2V0VG86IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgaW52YXJpYW50KCEhcm91dGUsICdNdXN0IHN1cHBseSByb3V0ZSB0byBwdXNoJyk7XG4gICAgdGhpcy5yZXBsYWNlQXRJbmRleChyb3V0ZSwgMCwgKCkgPT4ge1xuICAgICAgLy8gRG8gbm90IHVzZSBwb3BUb1JvdXRlIGhlcmUsIGJlY2F1c2UgcmFjZSBjb25kaXRpb25zIGNvdWxkIHByZXZlbnQgdGhlXG4gICAgICAvLyByb3V0ZSBmcm9tIGV4aXN0aW5nIGF0IHRoaXMgdGltZS4gSW5zdGVhZCwganVzdCBnbyB0byBpbmRleCAwXG4gICAgICBpZiAodGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA+IDApIHtcbiAgICAgICAgdGhpcy5fcG9wTih0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBnZXRDdXJyZW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBDbG9uZSBiZWZvcmUgcmV0dXJuaW5nIHRvIGF2b2lkIGNhbGxlciBtdXRhdGluZyB0aGUgc3RhY2tcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKCk7XG4gIH0sXG5cbiAgX2NsZWFuU2NlbmVzUGFzdEluZGV4OiBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBuZXdTdGFja0xlbmd0aCA9IGluZGV4ICsgMTtcbiAgICAvLyBSZW1vdmUgYW55IHVubmVlZGVkIHJlbmRlcmVkIHJvdXRlcy5cbiAgICBpZiAobmV3U3RhY2tMZW5ndGggPCB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2NlbmVDb25maWdTdGFjazogdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrLnNsaWNlKDAsIG5ld1N0YWNrTGVuZ3RoKSxcbiAgICAgICAgcm91dGVTdGFjazogdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKDAsIG5ld1N0YWNrTGVuZ3RoKSxcbiAgICAgICAgcHJlc2VudGVkSW5kZXg6IGluZGV4XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbmRlclNjZW5lOiBmdW5jdGlvbihyb3V0ZSwgaSkge1xuICAgIC8vIGxldCBkaXNhYmxlZFNjZW5lU3R5bGUgPSBudWxsO1xuICAgIGxldCBwb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xuICAgIGlmIChpICE9PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICAvLyBkaXNhYmxlZFNjZW5lU3R5bGUgPSBzdHlsZXMuZGlzYWJsZWRTY2VuZTtcbiAgICAgIHBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgY29uc3Qgcm91dGVJZCA9IHRoaXMuX2dldFJvdXRlSUQocm91dGUpXG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3XG4gICAgICAgIGtleT17J3NjZW5lXycgKyByb3V0ZUlkfVxuICAgICAgICByZWY9eydzY2VuZV8nICsgcm91dGVJZH1cbiAgICAgICAgb25TdGFydFNob3VsZFNldFJlc3BvbmRlckNhcHR1cmU9eygpID0+IHtcbiAgICAgICAgICByZXR1cm4gKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB8fCAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpO1xuICAgICAgICB9fVxuICAgICAgICBwb2ludGVyRXZlbnRzPXtwb2ludGVyRXZlbnRzfVxuICAgICAgICBzdHlsZT17W3N0eWxlcy5iYXNlU2NlbmUsIHRoaXMucHJvcHMuc2NlbmVTdHlsZS8qLCBkaXNhYmxlZFNjZW5lU3R5bGUqL119PlxuICAgICAgICB7dGhpcy5wcm9wcy5yZW5kZXJTY2VuZShcbiAgICAgICAgICByb3V0ZSxcbiAgICAgICAgICB0aGlzXG4gICAgICAgICl9XG4gICAgICA8L1ZpZXc+XG4gICAgKTtcbiAgfSxcblxuICBfcmVuZGVyTmF2aWdhdGlvbkJhcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm5hdmlnYXRpb25CYXIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KHRoaXMucHJvcHMubmF2aWdhdGlvbkJhciwge1xuICAgICAgcmVmOiAobmF2QmFyKSA9PiB7XG4gICAgICAgIHRoaXMuX25hdkJhciA9IG5hdkJhcjtcbiAgICAgIH0sXG4gICAgICBuYXZpZ2F0b3I6IHRoaXMsXG4gICAgICBuYXZTdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBuZXdSZW5kZXJlZFNjZW5lTWFwID0gbmV3IE1hcCgpO1xuICAgIGxldCBzY2VuZXMgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subWFwKChyb3V0ZSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCByZW5kZXJlZFNjZW5lO1xuICAgICAgaWYgKHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAuaGFzKHJvdXRlKSAmJlxuICAgICAgICAgIGluZGV4ICE9PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICAgIHJlbmRlcmVkU2NlbmUgPSB0aGlzLl9yZW5kZXJlZFNjZW5lTWFwLmdldChyb3V0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZFNjZW5lID0gdGhpcy5fcmVuZGVyU2NlbmUocm91dGUsIGluZGV4KTtcbiAgICAgIH1cbiAgICAgIG5ld1JlbmRlcmVkU2NlbmVNYXAuc2V0KHJvdXRlLCByZW5kZXJlZFNjZW5lKTtcbiAgICAgIHJldHVybiByZW5kZXJlZFNjZW5lO1xuICAgIH0pO1xuICAgIHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAgPSBuZXdSZW5kZXJlZFNjZW5lTWFwO1xuICAgIHJldHVybiAoXG4gICAgICA8VmlldyBzdHlsZT17W3N0eWxlcy5jb250YWluZXIsIHRoaXMucHJvcHMuc3R5bGVdfT5cbiAgICAgICAgPFZpZXdcbiAgICAgICAgICBzdHlsZT17c3R5bGVzLnRyYW5zaXRpb25lcn1cbiAgICAgICAgICB7Li4udGhpcy5wYW5HZXN0dXJlLnBhbkhhbmRsZXJzfVxuICAgICAgICAgIG9uVG91Y2hTdGFydD17dGhpcy5faGFuZGxlVG91Y2hTdGFydH1cbiAgICAgICAgICBvblJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdD17XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVSZXNwb25kZXJUZXJtaW5hdGlvblJlcXVlc3RcbiAgICAgICAgICB9PlxuICAgICAgICAgIHtzY2VuZXN9XG4gICAgICAgIDwvVmlldz5cbiAgICAgICAge3RoaXMuX3JlbmRlck5hdmlnYXRpb25CYXIoKX1cbiAgICAgIDwvVmlldz5cbiAgICApO1xuICB9LFxuXG4gIF9nZXROYXZpZ2F0aW9uQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCkge1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQgPSBuZXcgTmF2aWdhdGlvbkNvbnRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRpb25Db250ZXh0O1xuICB9XG59KTtcblxuTmF2aWdhdG9yLmlzUmVhY3ROYXRpdmVDb21wb25lbnQgPSB0cnVlO1xuXG5leHBvcnQgZGVmYXVsdCBOYXZpZ2F0b3I7XG4iXX0=