








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
bottom:sceneStyle.bottom,
opacity:1}};


if(sceneIndex!==this.state.transitionFromIndex&&
sceneIndex!==this.state.presentedIndex){


enabledSceneNativeProps.style.opacity=0;
enabledSceneNativeProps.pointerEvents='none';

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
sceneConfigStack:nextAnimationConfigStack,
presentedIndex:destIndex},
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

var distance=this.state.routeStack.length-index-1;
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

if(distance)history.go(-distance);

history.replaceState({index:index},'/scene_'+_this8._getRouteID(route));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRvci53ZWIuanMiXSwibmFtZXMiOlsiaGlzdG9yeSIsIl91bmxpc3RlbiIsIlNDUkVFTl9XSURUSCIsImdldCIsIndpZHRoIiwiU0NSRUVOX0hFSUdIVCIsImhlaWdodCIsIlNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyIsInBvaW50ZXJFdmVudHMiLCJzdHlsZSIsIm9wYWNpdHkiLCJzdHlsZXMiLCJjcmVhdGUiLCJjb250YWluZXIiLCJmbGV4Iiwib3ZlcmZsb3ciLCJkZWZhdWx0U2NlbmVTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwiYmFzZVNjZW5lIiwidHJhbnNpdGlvbmVyIiwiYmFja2dyb3VuZENvbG9yIiwiR0VTVFVSRV9BQ1RJT05TIiwiTmF2aWdhdG9yIiwiY3JlYXRlQ2xhc3MiLCJwcm9wVHlwZXMiLCJjb25maWd1cmVTY2VuZSIsImZ1bmMiLCJyZW5kZXJTY2VuZSIsImlzUmVxdWlyZWQiLCJpbml0aWFsUm91dGUiLCJvYmplY3QiLCJpbml0aWFsUm91dGVTdGFjayIsImFycmF5T2YiLCJvbldpbGxGb2N1cyIsIm9uRGlkRm9jdXMiLCJuYXZpZ2F0aW9uQmFyIiwibm9kZSIsIm5hdmlnYXRvciIsInNjZW5lU3R5bGUiLCJzdGF0aWNzIiwiQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIiLCJOYXZpZ2F0aW9uQmFyIiwiU2NlbmVDb25maWdzIiwibWl4aW5zIiwiTWl4aW4iLCJnZXREZWZhdWx0UHJvcHMiLCJQdXNoRnJvbVJpZ2h0IiwiZ2V0SW5pdGlhbFN0YXRlIiwiX3JlbmRlcmVkU2NlbmVNYXAiLCJyb3V0ZVN0YWNrIiwicHJvcHMiLCJsZW5ndGgiLCJpbml0aWFsUm91dGVJbmRleCIsImluZGV4T2YiLCJzY2VuZUNvbmZpZ1N0YWNrIiwibWFwIiwicm91dGUiLCJwcmVzZW50ZWRJbmRleCIsInRyYW5zaXRpb25Gcm9tSW5kZXgiLCJhY3RpdmVHZXN0dXJlIiwicGVuZGluZ0dlc3R1cmVQcm9ncmVzcyIsInRyYW5zaXRpb25RdWV1ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsIl9fZGVmaW5lR2V0dGVyX18iLCJfZ2V0TmF2aWdhdGlvbkNvbnRleHQiLCJfc3ViUm91dGVGb2N1cyIsInBhcmVudE5hdmlnYXRvciIsIl9oYW5kbGVycyIsInNwcmluZ1N5c3RlbSIsIlNwcmluZ1N5c3RlbSIsInNwcmluZyIsImNyZWF0ZVNwcmluZyIsInNldFJlc3RTcGVlZFRocmVzaG9sZCIsInNldEN1cnJlbnRWYWx1ZSIsInNldEF0UmVzdCIsImFkZExpc3RlbmVyIiwib25TcHJpbmdFbmRTdGF0ZUNoYW5nZSIsIl9pbnRlcmFjdGlvbkhhbmRsZSIsImNyZWF0ZUludGVyYWN0aW9uSGFuZGxlIiwib25TcHJpbmdVcGRhdGUiLCJfaGFuZGxlU3ByaW5nVXBkYXRlIiwib25TcHJpbmdBdFJlc3QiLCJfY29tcGxldGVUcmFuc2l0aW9uIiwicGFuR2VzdHVyZSIsIm9uTW92ZVNob3VsZFNldFBhblJlc3BvbmRlciIsIl9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyIiwib25QYW5SZXNwb25kZXJHcmFudCIsIl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCIsIm9uUGFuUmVzcG9uZGVyUmVsZWFzZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlIiwib25QYW5SZXNwb25kZXJNb3ZlIiwiX2hhbmRsZVBhblJlc3BvbmRlck1vdmUiLCJvblBhblJlc3BvbmRlclRlcm1pbmF0ZSIsIl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUiLCJfZW1pdFdpbGxGb2N1cyIsInN0YXRlIiwiaGFzaENoYW5nZWQiLCJjb21wb25lbnREaWRNb3VudCIsIl9lbWl0RGlkRm9jdXMiLCJsaXN0ZW4iLCJsb2NhdGlvbiIsImRlc3RJbmRleCIsInBhdGhuYW1lIiwicGFyc2VJbnQiLCJyZXBsYWNlIiwiX2p1bXBOIiwiYmluZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX25hdmlnYXRpb25Db250ZXh0IiwiZGlzcG9zZSIsIl9uZXh0Um91dGVJRCIsIl9nZXRSb3V0ZUlEIiwiYWN0aW9uIiwiU3RyaW5nIiwiaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2siLCJuZXh0Um91dGVTdGFjayIsInNlbGYiLCJwcmV2TGVuZ3RoIiwic2V0U3RhdGUiLCJfdHJhbnNpdGlvblRvIiwidmVsb2NpdHkiLCJqdW1wU3ByaW5nVG8iLCJjYiIsIl9oaWRlU2NlbmVzIiwicHVzaCIsInRyYW5zaXRpb25DYiIsIl9vbkFuaW1hdGlvblN0YXJ0Iiwic2NlbmVDb25maWciLCJzZXRPdmVyc2hvb3RDbGFtcGluZ0VuYWJsZWQiLCJnZXRTcHJpbmdDb25maWciLCJmcmljdGlvbiIsInNwcmluZ0ZyaWN0aW9uIiwidGVuc2lvbiIsInNwcmluZ1RlbnNpb24iLCJzZXRWZWxvY2l0eSIsImRlZmF1bHRUcmFuc2l0aW9uVmVsb2NpdHkiLCJzZXRFbmRWYWx1ZSIsIl90cmFuc2l0aW9uQmV0d2VlbiIsImdldEN1cnJlbnRWYWx1ZSIsInByZXNlbnRlZFRvSW5kZXgiLCJfZGVsdGFGb3JHZXN0dXJlQWN0aW9uIiwiX29uQW5pbWF0aW9uRW5kIiwiZGlkRm9jdXNSb3V0ZSIsImNsZWFySW50ZXJhY3Rpb25IYW5kbGUiLCJnZXN0dXJlVG9JbmRleCIsIl9lbmFibGVTY2VuZSIsInF1ZXVlZFRyYW5zaXRpb24iLCJzaGlmdCIsIm5hdmlnYXRpb25Db250ZXh0IiwiZW1pdCIsIm5hdkJhciIsIl9uYXZCYXIiLCJoYW5kbGVXaWxsRm9jdXMiLCJnZXN0dXJpbmdUb0luZGV4IiwiaSIsIl9kaXNhYmxlU2NlbmUiLCJzY2VuZUluZGV4IiwicmVmcyIsInNldE5hdGl2ZVByb3BzIiwiZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMiLCJmcm9tSW5kZXgiLCJ0b0luZGV4IiwiX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkIiwib25BbmltYXRpb25TdGFydCIsIm1heCIsImluZGV4Iiwib25BbmltYXRpb25FbmQiLCJzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZSIsInZpZXdBdEluZGV4IiwidW5kZWZpbmVkIiwicmVuZGVyVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkIiwiX2hhbmRsZVRvdWNoU3RhcnQiLCJfZWxpZ2libGVHZXN0dXJlcyIsImUiLCJnZXN0dXJlU3RhdGUiLCJfZXhwZWN0aW5nR2VzdHVyZUdyYW50IiwiX21hdGNoR2VzdHVyZUFjdGlvbiIsImdlc3R1cmVzIiwiX2RvZXNHZXN0dXJlT3ZlcnN3aXBlIiwiZ2VzdHVyZU5hbWUiLCJ3b3VsZE92ZXJzd2lwZUJhY2siLCJ3b3VsZE92ZXJzd2lwZUZvcndhcmQiLCJfYXR0YWNoR2VzdHVyZSIsImdlc3R1cmVBY3Rpb24iLCJyZWxlYXNlR2VzdHVyZUFjdGlvbiIsInJlbGVhc2VHZXN0dXJlIiwiaXNUcmF2ZWxWZXJ0aWNhbCIsImRpcmVjdGlvbiIsImlzVHJhdmVsSW52ZXJ0ZWQiLCJnZXN0dXJlRGlzdGFuY2UiLCJ2eSIsImR5IiwidngiLCJkeCIsInRyYW5zaXRpb25WZWxvY2l0eSIsIk1hdGgiLCJhYnMiLCJub3RNb3ZpbmciLCJoYXNHZXN0dXJlZEVub3VnaFRvQ29tcGxldGUiLCJmdWxsRGlzdGFuY2UiLCJzdGlsbENvbXBsZXRpb25SYXRpbyIsInNuYXBWZWxvY2l0eSIsInRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCIsIl9jbGVhblNjZW5lc1Bhc3RJbmRleCIsIl9kZXRhY2hHZXN0dXJlIiwiZ2VzdHVyZUlkIiwiZ2VzdHVyZSIsIl9tb3ZlQXR0YWNoZWRHZXN0dXJlIiwibWF0Y2hlZEdlc3R1cmUiLCJkaXN0YW5jZSIsImdlc3R1cmVEZXRlY3RNb3ZlbWVudCIsIm5leHRQcm9ncmVzcyIsImlzRGV0YWNoYWJsZSIsImZyaWN0aW9uQ29uc3RhbnQiLCJvdmVyc3dpcGUiLCJmcmljdGlvbkJ5RGlzdGFuY2UiLCJmcmljdGlvblJhdGlvIiwiZWxpZ2libGVHZXN0dXJlcyIsInNvbWUiLCJnZXN0dXJlSW5kZXgiLCJjdXJyZW50TG9jIiwibW92ZVkiLCJtb3ZlWCIsInRyYXZlbERpc3QiLCJvcHBvc2l0ZUF4aXNUcmF2ZWxEaXN0IiwiZWRnZUhpdFdpZHRoIiwibW92ZVN0YXJ0ZWRJblJlZ2lvbiIsIm1vdmVUcmF2ZWxsZWRGYXJFbm91Z2giLCJkaXJlY3Rpb25Jc0NvcnJlY3QiLCJkaXJlY3Rpb25SYXRpbyIsInNsaWNlIiwic3BsaWNlIiwiX3RyYW5zaXRpb25TY2VuZVN0eWxlIiwicHJvZ3Jlc3MiLCJzY2VuZUNvbmZpZ0luZGV4Iiwic3R5bGVUb1VzZSIsInVzZUZuIiwiYW5pbWF0aW9uSW50ZXJwb2xhdG9ycyIsIm91dCIsImludG8iLCJkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzIiwiZGlkQ2hhbmdlIiwidXBkYXRlUHJvZ3Jlc3MiLCJfaGFuZGxlUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0IiwiX2dldERlc3RJbmRleFdpdGhpbkJvdW5kcyIsIm4iLCJjdXJyZW50SW5kZXgiLCJtYXhJbmRleCIsInB1c2hTdGF0ZSIsImdvIiwianVtcFRvIiwianVtcEZvcndhcmQiLCJqdW1wQmFjayIsImFjdGl2ZUxlbmd0aCIsImFjdGl2ZVN0YWNrIiwiYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2siLCJuZXh0U3RhY2siLCJjb25jYXQiLCJuZXh0QW5pbWF0aW9uQ29uZmlnU3RhY2siLCJfcG9wTiIsInBvcEluZGV4IiwicG9wIiwicmVwbGFjZUF0SW5kZXgiLCJuZXh0QW5pbWF0aW9uTW9kZVN0YWNrIiwicmVwbGFjZVN0YXRlIiwicmVwbGFjZVByZXZpb3VzIiwicG9wVG9Ub3AiLCJwb3BUb1JvdXRlIiwiaW5kZXhPZlJvdXRlIiwibnVtVG9Qb3AiLCJyZXBsYWNlUHJldmlvdXNBbmRQb3AiLCJyZXNldFRvIiwiZ2V0Q3VycmVudFJvdXRlcyIsIm5ld1N0YWNrTGVuZ3RoIiwiX3JlbmRlclNjZW5lIiwicm91dGVJZCIsIl9yZW5kZXJOYXZpZ2F0aW9uQmFyIiwiY2xvbmVFbGVtZW50IiwicmVmIiwibmF2U3RhdGUiLCJyZW5kZXIiLCJuZXdSZW5kZXJlZFNjZW5lTWFwIiwic2NlbmVzIiwicmVuZGVyZWRTY2VuZSIsImhhcyIsInNldCIsInBhbkhhbmRsZXJzIiwiaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBU0EsYTs7QUFFQSw0QjtBQUNBLDZEO0FBQ0EsMEU7QUFDQSwyQztBQUNBLHNFO0FBQ0EseUY7QUFDQSxxRTtBQUNBLG1FO0FBQ0EsbUU7QUFDQSw2RDtBQUNBLHNEO0FBQ0Esa0Q7QUFDQSwyQztBQUNBLHdDO0FBQ0EsaUU7QUFDQSw2QztBQUNBLGdDO0FBQ0EsZ0U7O0FBRUEsR0FBSUEsU0FBVSxpQ0FBZDtBQUNBLEdBQUlDLGlCQUFKOzs7OztBQUtBLEdBQU1DLGNBQWUsMEJBQVdDLEdBQVgsQ0FBZSxRQUFmLEVBQXlCQyxLQUE5QztBQUNBLEdBQU1DLGVBQWdCLDBCQUFXRixHQUFYLENBQWUsUUFBZixFQUF5QkcsTUFBL0M7QUFDQSxHQUFNQyw2QkFBOEI7QUFDbENDLGNBQWUsTUFEbUI7QUFFbENDLE1BQU87OztBQUdMQyxRQUFTLENBSEosQ0FGMkIsQ0FBcEM7Ozs7Ozs7Ozs7QUFlQSxHQUFJQyxRQUFTLDBCQUFXQyxNQUFYLENBQWtCO0FBQzdCQyxVQUFXO0FBQ1RDLEtBQU0sQ0FERztBQUVUQyxTQUFVLFFBRkQsQ0FEa0I7O0FBSzdCQyxrQkFBbUI7QUFDakJDLFNBQVUsVUFETztBQUVqQkMsS0FBTSxDQUZXO0FBR2pCQyxNQUFPLENBSFU7QUFJakJDLE9BQVEsQ0FKUztBQUtqQkMsSUFBSyxDQUxZLENBTFU7OztBQWE3QkMsVUFBVztBQUNUTCxTQUFVLFVBREQ7QUFFVEYsU0FBVSxRQUZEO0FBR1RHLEtBQU0sQ0FIRztBQUlUQyxNQUFPLENBSkU7QUFLVEMsT0FBUSxDQUxDO0FBTVRDLElBQUssQ0FOSSxDQWJrQjs7Ozs7O0FBeUI3QkUsYUFBYztBQUNaVCxLQUFNLENBRE07QUFFWlUsZ0JBQWlCLGFBRkw7QUFHWlQsU0FBVSxRQUhFLENBekJlLENBQWxCLENBQWI7Ozs7QUFnQ0EsR0FB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QUFDQTZHLFFBQVUsUUFBS3RFLEtBQUwsQ0FBV3RDLGNBRHpCLENBQ3lDO0FBQ3ZDa08sY0FBZ0IsUUFBSzNPLGlCQUFMLENBQXVCakQsR0FBdkIsQ0FBMkJ5RCxLQUEzQixDQUFoQjtBQUNELENBSEQsSUFHTztBQUNMbU8sY0FBZ0IsUUFBS1QsWUFBTCxDQUFrQjFOLEtBQWxCLENBQXlCNkcsS0FBekIsQ0FBaEI7QUFDRDtBQUNEb0gsb0JBQW9CSSxHQUFwQixDQUF3QnJPLEtBQXhCLENBQStCbU8sYUFBL0I7QUFDQSxNQUFPQSxjQUFQO0FBQ0QsQ0FWWSxDQUFiO0FBV0EsS0FBSzNPLGlCQUFMLENBQXlCeU8sbUJBQXpCO0FBQ0E7QUFDRSxtREFBTSxNQUFPLENBQUNsUixPQUFPRSxTQUFSLENBQW1CLEtBQUt5QyxLQUFMLENBQVc3QyxLQUE5QixDQUFiO0FBQ0U7QUFDRSxNQUFPRSxPQUFPWSxZQURoQjtBQUVNLEtBQUtnRSxVQUFMLENBQWdCMk0sV0FGdEI7QUFHRSxhQUFjLEtBQUtuSCxpQkFIckI7QUFJRTtBQUNFLEtBQUt3RSxrQ0FMVDs7QUFPR3VDLE1BUEgsQ0FERjs7QUFVRyxLQUFLTixvQkFBTCxFQVZILENBREY7OztBQWNELENBcCtCK0I7O0FBcytCaENwTixzQkFBdUIsZ0NBQVc7QUFDaEMsR0FBSSxDQUFDLEtBQUs0QyxrQkFBVixDQUE4QjtBQUM1QixLQUFLQSxrQkFBTCxDQUEwQixzQ0FBMUI7QUFDRDtBQUNELE1BQU8sTUFBS0Esa0JBQVo7QUFDRCxDQTMrQitCLENBQWxCLENBQWhCOzs7QUE4K0JBdEYsVUFBVXlRLHNCQUFWLENBQW1DLElBQW5DLEM7O0FBRWV6USxTIiwiZmlsZSI6Ik5hdmlnYXRvci53ZWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBBbGliYWJhIEdyb3VwIEhvbGRpbmcgTGltaXRlZC5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LCBGYWNlYm9vaywgSW5jLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgUmVhY3ROYXZpZ2F0b3JcbiAqL1xuIC8qIGVzbGludC1kaXNhYmxlIG5vLWV4dHJhLWJvb2xlYW4tY2FzdCovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCwgeyBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRGltZW5zaW9ucyBmcm9tICdSZWFjdERpbWVuc2lvbnMnO1xuaW1wb3J0IEludGVyYWN0aW9uTWl4aW4gZnJvbSAnUmVhY3RJbnRlcmFjdGlvbk1peGluJztcbmltcG9ydCBNYXAgZnJvbSAnY29yZS1qcy9saWJyYXJ5L2ZuL21hcCc7XG5pbXBvcnQgTmF2aWdhdGlvbkNvbnRleHQgZnJvbSAnUmVhY3ROYXZpZ2F0aW9uQ29udGV4dCc7XG5pbXBvcnQgTmF2aWdhdG9yQnJlYWRjcnVtYk5hdmlnYXRpb25CYXIgZnJvbSAnUmVhY3ROYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQgTmF2aWdhdG9yTmF2aWdhdGlvbkJhciBmcm9tICdSZWFjdE5hdmlnYXRvck5hdmlnYXRpb25CYXInO1xuaW1wb3J0IE5hdmlnYXRvclNjZW5lQ29uZmlncyBmcm9tICdSZWFjdE5hdmlnYXRvclNjZW5lQ29uZmlncyc7XG5pbXBvcnQgUGFuUmVzcG9uZGVyIGZyb20gJ1JlYWN0UGFuUmVzcG9uZGVyJztcbmltcG9ydCBTdHlsZVNoZWV0IGZyb20gJ1JlYWN0U3R5bGVTaGVldCc7XG5pbXBvcnQgU3Vic2NyaWJhYmxlIGZyb20gJy4vcG9seWZpbGxzL1N1YnNjcmliYWJsZSc7XG5pbXBvcnQgVGltZXJNaXhpbiBmcm9tICdyZWFjdC10aW1lci1taXhpbic7XG5pbXBvcnQgVmlldyBmcm9tICdSZWFjdFZpZXcnO1xuaW1wb3J0IGNsYW1wIGZyb20gJy4vcG9seWZpbGxzL2NsYW1wJztcbmltcG9ydCBmbGF0dGVuU3R5bGUgZnJvbSAnUmVhY3RGbGF0dGVuU3R5bGUnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdmYmpzL2xpYi9pbnZhcmlhbnQnO1xuaW1wb3J0IHJlYm91bmQgZnJvbSAncmVib3VuZCc7XG5pbXBvcnQgY3JlYXRlSGlzdG9yeSBmcm9tICdoaXN0b3J5L2xpYi9jcmVhdGVIYXNoSGlzdG9yeSc7XG5cbmxldCBoaXN0b3J5ID0gY3JlYXRlSGlzdG9yeSgpO1xubGV0IF91bmxpc3RlbjtcblxuLy8gVE9ETzogdGhpcyBpcyBub3QgaWRlYWwgYmVjYXVzZSB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgbmF2aWdhdG9yXG4vLyBpcyBmdWxsIHNjcmVlbiwgaHdvZXZlciB3ZSBkb24ndCBoYXZlIGEgZ29vZCB3YXkgdG8gbWVhc3VyZSB0aGUgYWN0dWFsXG4vLyBzaXplIG9mIHRoZSBuYXZpZ2F0b3IgcmlnaHQgbm93LCBzbyB0aGlzIGlzIHRoZSBuZXh0IGJlc3QgdGhpbmcuXG5jb25zdCBTQ1JFRU5fV0lEVEggPSBEaW1lbnNpb25zLmdldCgnd2luZG93Jykud2lkdGg7XG5jb25zdCBTQ1JFRU5fSEVJR0hUID0gRGltZW5zaW9ucy5nZXQoJ3dpbmRvdycpLmhlaWdodDtcbmNvbnN0IFNDRU5FX0RJU0FCTEVEX05BVElWRV9QUk9QUyA9IHtcbiAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICBzdHlsZToge1xuICAgIC8vIHRvcDogU0NSRUVOX0hFSUdIVCxcbiAgICAvLyBib3R0b206IC1TQ1JFRU5fSEVJR0hULFxuICAgIG9wYWNpdHk6IDBcbiAgfSxcbn07XG5cbi8vIGxldCBfX3VpZCA9IDA7XG4vLyBmdW5jdGlvbiBnZXR1aWQoKSB7XG4vLyAgIHJldHVybiBfX3VpZCsrO1xuLy8gfVxuXG4vLyBzdHlsZXMgbW92ZWQgdG8gdGhlIHRvcCBvZiB0aGUgZmlsZSBzbyBnZXREZWZhdWx0UHJvcHMgY2FuIHJlZmVyIHRvIGl0XG5sZXQgc3R5bGVzID0gU3R5bGVTaGVldC5jcmVhdGUoe1xuICBjb250YWluZXI6IHtcbiAgICBmbGV4OiAxLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgfSxcbiAgZGVmYXVsdFNjZW5lU3R5bGU6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICB0b3A6IDAsXG4gICAgLy8gdmlzaWJpbGl0eTogJ3Zpc2libGUnXG4gIH0sXG4gIGJhc2VTY2VuZToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICB0b3A6IDAsXG4gIH0sXG4gIC8vIGRpc2FibGVkU2NlbmU6IHtcbiAgLy8gICB0b3A6IFNDUkVFTl9IRUlHSFQsXG4gIC8vICAgYm90dG9tOiAtU0NSRUVOX0hFSUdIVCxcbiAgLy8gfSxcbiAgdHJhbnNpdGlvbmVyOiB7XG4gICAgZmxleDogMSxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICB9XG59KTtcblxuY29uc3QgR0VTVFVSRV9BQ1RJT05TID0gW1xuICAncG9wJyxcbiAgJ2p1bXBCYWNrJyxcbiAgJ2p1bXBGb3J3YXJkJyxcbl07XG5cbi8qKlxuICogVXNlIGBOYXZpZ2F0b3JgIHRvIHRyYW5zaXRpb24gYmV0d2VlbiBkaWZmZXJlbnQgc2NlbmVzIGluIHlvdXIgYXBwLiBUb1xuICogYWNjb21wbGlzaCB0aGlzLCBwcm92aWRlIHJvdXRlIG9iamVjdHMgdG8gdGhlIG5hdmlnYXRvciB0byBpZGVudGlmeSBlYWNoXG4gKiBzY2VuZSwgYW5kIGFsc28gYSBgcmVuZGVyU2NlbmVgIGZ1bmN0aW9uIHRoYXQgdGhlIG5hdmlnYXRvciBjYW4gdXNlIHRvXG4gKiByZW5kZXIgdGhlIHNjZW5lIGZvciBhIGdpdmVuIHJvdXRlLlxuICpcbiAqIFRvIGNoYW5nZSB0aGUgYW5pbWF0aW9uIG9yIGdlc3R1cmUgcHJvcGVydGllcyBvZiB0aGUgc2NlbmUsIHByb3ZpZGUgYVxuICogYGNvbmZpZ3VyZVNjZW5lYCBwcm9wIHRvIGdldCB0aGUgY29uZmlnIG9iamVjdCBmb3IgYSBnaXZlbiByb3V0ZS4gU2VlXG4gKiBgTmF2aWdhdG9yLlNjZW5lQ29uZmlnc2AgZm9yIGRlZmF1bHQgYW5pbWF0aW9ucyBhbmQgbW9yZSBpbmZvIG9uXG4gKiBzY2VuZSBjb25maWcgb3B0aW9ucy5cbiAqXG4gKiAjIyMgQmFzaWMgVXNhZ2VcbiAqXG4gKiBgYGBcbiAqICAgPE5hdmlnYXRvclxuICogICAgIGluaXRpYWxSb3V0ZT17e25hbWU6ICdNeSBGaXJzdCBTY2VuZScsIGluZGV4OiAwfX1cbiAqICAgICByZW5kZXJTY2VuZT17KHJvdXRlLCBuYXZpZ2F0b3IpID0+XG4gKiAgICAgICA8TXlTY2VuZUNvbXBvbmVudFxuICogICAgICAgICBuYW1lPXtyb3V0ZS5uYW1lfVxuICogICAgICAgICBvbkZvcndhcmQ9eygpID0+IHtcbiAqICAgICAgICAgICBsZXQgbmV4dEluZGV4ID0gcm91dGUuaW5kZXggKyAxO1xuICogICAgICAgICAgIG5hdmlnYXRvci5wdXNoKHtcbiAqICAgICAgICAgICAgIG5hbWU6ICdTY2VuZSAnICsgbmV4dEluZGV4LFxuICogICAgICAgICAgICAgaW5kZXg6IG5leHRJbmRleCxcbiAqICAgICAgICAgICB9KTtcbiAqICAgICAgICAgfX1cbiAqICAgICAgICAgb25CYWNrPXsoKSA9PiB7XG4gKiAgICAgICAgICAgaWYgKHJvdXRlLmluZGV4ID4gMCkge1xuICogICAgICAgICAgICAgbmF2aWdhdG9yLnBvcCgpO1xuICogICAgICAgICAgIH1cbiAqICAgICAgICAgfX1cbiAqICAgICAgIC8+XG4gKiAgICAgfVxuICogICAvPlxuICogYGBgXG4gKlxuICogIyMjIE5hdmlnYXRvciBNZXRob2RzXG4gKlxuICogSWYgeW91IGhhdmUgYSByZWYgdG8gdGhlIE5hdmlnYXRvciBlbGVtZW50LCB5b3UgY2FuIGludm9rZSBzZXZlcmFsIG1ldGhvZHNcbiAqIG9uIGl0IHRvIHRyaWdnZXIgbmF2aWdhdGlvbjpcbiAqXG4gKiAgLSBgZ2V0Q3VycmVudFJvdXRlcygpYCAtIHJldHVybnMgdGhlIGN1cnJlbnQgbGlzdCBvZiByb3V0ZXNcbiAqICAtIGBqdW1wQmFjaygpYCAtIEp1bXAgYmFja3dhcmQgd2l0aG91dCB1bm1vdW50aW5nIHRoZSBjdXJyZW50IHNjZW5lXG4gKiAgLSBganVtcEZvcndhcmQoKWAgLSBKdW1wIGZvcndhcmQgdG8gdGhlIG5leHQgc2NlbmUgaW4gdGhlIHJvdXRlIHN0YWNrXG4gKiAgLSBganVtcFRvKHJvdXRlKWAgLSBUcmFuc2l0aW9uIHRvIGFuIGV4aXN0aW5nIHNjZW5lIHdpdGhvdXQgdW5tb3VudGluZ1xuICogIC0gYHB1c2gocm91dGUpYCAtIE5hdmlnYXRlIGZvcndhcmQgdG8gYSBuZXcgc2NlbmUsIHNxdWFzaGluZyBhbnkgc2NlbmVzXG4gKiAgICAgdGhhdCB5b3UgY291bGQgYGp1bXBGb3J3YXJkYCB0b1xuICogIC0gYHBvcCgpYCAtIFRyYW5zaXRpb24gYmFjayBhbmQgdW5tb3VudCB0aGUgY3VycmVudCBzY2VuZVxuICogIC0gYHJlcGxhY2Uocm91dGUpYCAtIFJlcGxhY2UgdGhlIGN1cnJlbnQgc2NlbmUgd2l0aCBhIG5ldyByb3V0ZVxuICogIC0gYHJlcGxhY2VBdEluZGV4KHJvdXRlLCBpbmRleClgIC0gUmVwbGFjZSBhIHNjZW5lIGFzIHNwZWNpZmllZCBieSBhbiBpbmRleFxuICogIC0gYHJlcGxhY2VQcmV2aW91cyhyb3V0ZSlgIC0gUmVwbGFjZSB0aGUgcHJldmlvdXMgc2NlbmVcbiAqICAtIGBpbW1lZGlhdGVseVJlc2V0Um91dGVTdGFjayhyb3V0ZVN0YWNrKWAgLSBSZXNldCBldmVyeSBzY2VuZSB3aXRoIGFuXG4gKiAgICAgYXJyYXkgb2Ygcm91dGVzXG4gKiAgLSBgcG9wVG9Sb3V0ZShyb3V0ZSlgIC0gUG9wIHRvIGEgcGFydGljdWxhciBzY2VuZSwgYXMgc3BlY2lmaWVkIGJ5IGl0c1xuICogICAgIHJvdXRlLiBBbGwgc2NlbmVzIGFmdGVyIGl0IHdpbGwgYmUgdW5tb3VudGVkXG4gKiAgLSBgcG9wVG9Ub3AoKWAgLSBQb3AgdG8gdGhlIGZpcnN0IHNjZW5lIGluIHRoZSBzdGFjaywgdW5tb3VudGluZyBldmVyeVxuICogICAgIG90aGVyIHNjZW5lXG4gKlxuICovXG5sZXQgTmF2aWdhdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGNvbmZpZ3VyYXRpb24gYWJvdXQgc2NlbmUgYW5pbWF0aW9ucyBhbmRcbiAgICAgKiBnZXN0dXJlcy4gV2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIHJvdXRlIGFuZCBzaG91bGQgcmV0dXJuIGEgc2NlbmVcbiAgICAgKiBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgICAqXG4gICAgICogYGBgXG4gICAgICogKHJvdXRlKSA9PiBOYXZpZ2F0b3IuU2NlbmVDb25maWdzLkZsb2F0RnJvbVJpZ2h0XG4gICAgICogYGBgXG4gICAgICovXG4gICAgY29uZmlndXJlU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyoqXG4gICAgICogUmVxdWlyZWQgZnVuY3Rpb24gd2hpY2ggcmVuZGVycyB0aGUgc2NlbmUgZm9yIGEgZ2l2ZW4gcm91dGUuIFdpbGwgYmVcbiAgICAgKiBpbnZva2VkIHdpdGggdGhlIHJvdXRlIGFuZCB0aGUgbmF2aWdhdG9yIG9iamVjdFxuICAgICAqXG4gICAgICogYGBgXG4gICAgICogKHJvdXRlLCBuYXZpZ2F0b3IpID0+XG4gICAgICogICA8TXlTY2VuZUNvbXBvbmVudCB0aXRsZT17cm91dGUudGl0bGV9IC8+XG4gICAgICogYGBgXG4gICAgICovXG4gICAgcmVuZGVyU2NlbmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IGEgcm91dGUgdG8gc3RhcnQgb24uIEEgcm91dGUgaXMgYW4gb2JqZWN0IHRoYXQgdGhlIG5hdmlnYXRvclxuICAgICAqIHdpbGwgdXNlIHRvIGlkZW50aWZ5IGVhY2ggc2NlbmUgdG8gcmVuZGVyLiBgaW5pdGlhbFJvdXRlYCBtdXN0IGJlXG4gICAgICogYSByb3V0ZSBpbiB0aGUgYGluaXRpYWxSb3V0ZVN0YWNrYCBpZiBib3RoIHByb3BzIGFyZSBwcm92aWRlZC4gVGhlXG4gICAgICogYGluaXRpYWxSb3V0ZWAgd2lsbCBkZWZhdWx0IHRvIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGBpbml0aWFsUm91dGVTdGFja2AuXG4gICAgICovXG4gICAgaW5pdGlhbFJvdXRlOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZSBhIHNldCBvZiByb3V0ZXMgdG8gaW5pdGlhbGx5IG1vdW50LiBSZXF1aXJlZCBpZiBubyBpbml0aWFsUm91dGVcbiAgICAgKiBpcyBwcm92aWRlZC4gT3RoZXJ3aXNlLCBpdCB3aWxsIGRlZmF1bHQgdG8gYW4gYXJyYXkgY29udGFpbmluZyBvbmx5IHRoZVxuICAgICAqIGBpbml0aWFsUm91dGVgXG4gICAgICovXG4gICAgaW5pdGlhbFJvdXRlU3RhY2s6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBVc2UgYG5hdmlnYXRpb25Db250ZXh0LmFkZExpc3RlbmVyKCd3aWxsZm9jdXMnLCBjYWxsYmFjaylgIGluc3RlYWQuXG4gICAgICpcbiAgICAgKiBXaWxsIGVtaXQgdGhlIHRhcmdldCByb3V0ZSB1cG9uIG1vdW50aW5nIGFuZCBiZWZvcmUgZWFjaCBuYXYgdHJhbnNpdGlvblxuICAgICAqL1xuICAgIG9uV2lsbEZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogVXNlIGBuYXZpZ2F0aW9uQ29udGV4dC5hZGRMaXN0ZW5lcignZGlkZm9jdXMnLCBjYWxsYmFjaylgIGluc3RlYWQuXG4gICAgICpcbiAgICAgKiBXaWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBuZXcgcm91dGUgb2YgZWFjaCBzY2VuZSBhZnRlciB0aGUgdHJhbnNpdGlvbiBpc1xuICAgICAqIGNvbXBsZXRlIG9yIGFmdGVyIHRoZSBpbml0aWFsIG1vdW50aW5nXG4gICAgICovXG4gICAgb25EaWRGb2N1czogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbGx5IHByb3ZpZGUgYSBuYXZpZ2F0aW9uIGJhciB0aGF0IHBlcnNpc3RzIGFjcm9zcyBzY2VuZVxuICAgICAqIHRyYW5zaXRpb25zXG4gICAgICovXG4gICAgbmF2aWdhdGlvbkJhcjogUHJvcFR5cGVzLm5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbGx5IHByb3ZpZGUgdGhlIG5hdmlnYXRvciBvYmplY3QgZnJvbSBhIHBhcmVudCBOYXZpZ2F0b3JcbiAgICAgKi9cbiAgICBuYXZpZ2F0b3I6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAvKipcbiAgICAgKiBTdHlsZXMgdG8gYXBwbHkgdG8gdGhlIGNvbnRhaW5lciBvZiBlYWNoIHNjZW5lXG4gICAgICovXG4gICAgc2NlbmVTdHlsZTogVmlldy5wcm9wVHlwZXMuc3R5bGUsXG4gIH0sXG5cbiAgc3RhdGljczoge1xuICAgIEJyZWFkY3J1bWJOYXZpZ2F0aW9uQmFyOiBOYXZpZ2F0b3JCcmVhZGNydW1iTmF2aWdhdGlvbkJhcixcbiAgICBOYXZpZ2F0aW9uQmFyOiBOYXZpZ2F0b3JOYXZpZ2F0aW9uQmFyLFxuICAgIFNjZW5lQ29uZmlnczogTmF2aWdhdG9yU2NlbmVDb25maWdzLFxuICB9LFxuXG4gIG1peGluczogW1RpbWVyTWl4aW4sIEludGVyYWN0aW9uTWl4aW4sIFN1YnNjcmliYWJsZS5NaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJlU2NlbmU6ICgpID0+IE5hdmlnYXRvclNjZW5lQ29uZmlncy5QdXNoRnJvbVJpZ2h0LFxuICAgICAgc2NlbmVTdHlsZTogc3R5bGVzLmRlZmF1bHRTY2VuZVN0eWxlLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9yZW5kZXJlZFNjZW5lTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgbGV0IHJvdXRlU3RhY2sgPSB0aGlzLnByb3BzLmluaXRpYWxSb3V0ZVN0YWNrIHx8IFt0aGlzLnByb3BzLmluaXRpYWxSb3V0ZV07XG4gICAgaW52YXJpYW50KFxuICAgICAgcm91dGVTdGFjay5sZW5ndGggPj0gMSxcbiAgICAgICdOYXZpZ2F0b3IgcmVxdWlyZXMgcHJvcHMuaW5pdGlhbFJvdXRlIG9yIHByb3BzLmluaXRpYWxSb3V0ZVN0YWNrLidcbiAgICApO1xuICAgIGxldCBpbml0aWFsUm91dGVJbmRleCA9IHJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBpZiAodGhpcy5wcm9wcy5pbml0aWFsUm91dGUpIHtcbiAgICAgIGluaXRpYWxSb3V0ZUluZGV4ID0gcm91dGVTdGFjay5pbmRleE9mKHRoaXMucHJvcHMuaW5pdGlhbFJvdXRlKTtcbiAgICAgIGludmFyaWFudChcbiAgICAgICAgaW5pdGlhbFJvdXRlSW5kZXggIT09IC0xLFxuICAgICAgICAnaW5pdGlhbFJvdXRlIGlzIG5vdCBpbiBpbml0aWFsUm91dGVTdGFjay4nXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc2NlbmVDb25maWdTdGFjazogcm91dGVTdGFjay5tYXAoXG4gICAgICAgIChyb3V0ZSkgPT4gdGhpcy5wcm9wcy5jb25maWd1cmVTY2VuZShyb3V0ZSlcbiAgICAgICksXG4gICAgICByb3V0ZVN0YWNrLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGluaXRpYWxSb3V0ZUluZGV4LFxuICAgICAgdHJhbnNpdGlvbkZyb21JbmRleDogbnVsbCxcbiAgICAgIGFjdGl2ZUdlc3R1cmU6IG51bGwsXG4gICAgICBwZW5kaW5nR2VzdHVyZVByb2dyZXNzOiBudWxsLFxuICAgICAgdHJhbnNpdGlvblF1ZXVlOiBbXSxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgLy8gVE9ETyh0NzQ4OTUwMyk6IERvbid0IG5lZWQgdGhpcyBvbmNlIEVTNiBDbGFzcyBsYW5kZWQuXG4gICAgdGhpcy5fX2RlZmluZUdldHRlcl9fKCduYXZpZ2F0aW9uQ29udGV4dCcsIHRoaXMuX2dldE5hdmlnYXRpb25Db250ZXh0KTtcblxuICAgIHRoaXMuX3N1YlJvdXRlRm9jdXMgPSBbXTtcbiAgICB0aGlzLnBhcmVudE5hdmlnYXRvciA9IHRoaXMucHJvcHMubmF2aWdhdG9yO1xuICAgIHRoaXMuX2hhbmRsZXJzID0ge307XG4gICAgdGhpcy5zcHJpbmdTeXN0ZW0gPSBuZXcgcmVib3VuZC5TcHJpbmdTeXN0ZW0oKTtcbiAgICB0aGlzLnNwcmluZyA9IHRoaXMuc3ByaW5nU3lzdGVtLmNyZWF0ZVNwcmluZygpO1xuICAgIHRoaXMuc3ByaW5nLnNldFJlc3RTcGVlZFRocmVzaG9sZCgwLjA1KTtcbiAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgdGhpcy5zcHJpbmcuYWRkTGlzdGVuZXIoe1xuICAgICAgb25TcHJpbmdFbmRTdGF0ZUNoYW5nZTogKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKSB7XG4gICAgICAgICAgdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUgPSB0aGlzLmNyZWF0ZUludGVyYWN0aW9uSGFuZGxlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblNwcmluZ1VwZGF0ZTogKCkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVTcHJpbmdVcGRhdGUoKTtcbiAgICAgIH0sXG4gICAgICBvblNwcmluZ0F0UmVzdDogKCkgPT4ge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZVRyYW5zaXRpb24oKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5wYW5HZXN0dXJlID0gUGFuUmVzcG9uZGVyLmNyZWF0ZSh7XG4gICAgICBvbk1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXI6IHRoaXMuX2hhbmRsZU1vdmVTaG91bGRTZXRQYW5SZXNwb25kZXIsXG4gICAgICBvblBhblJlc3BvbmRlckdyYW50OiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJHcmFudCxcbiAgICAgIG9uUGFuUmVzcG9uZGVyUmVsZWFzZTogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyUmVsZWFzZSxcbiAgICAgIG9uUGFuUmVzcG9uZGVyTW92ZTogdGhpcy5faGFuZGxlUGFuUmVzcG9uZGVyTW92ZSxcbiAgICAgIG9uUGFuUmVzcG9uZGVyVGVybWluYXRlOiB0aGlzLl9oYW5kbGVQYW5SZXNwb25kZXJUZXJtaW5hdGUsXG4gICAgfSk7XG4gICAgdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUgPSBudWxsO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3RoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhdKTtcbiAgICB0aGlzLmhhc2hDaGFuZ2VkID0gZmFsc2U7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2hhbmRsZVNwcmluZ1VwZGF0ZSgpO1xuICAgIHRoaXMuX2VtaXREaWRGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF0pO1xuXG4gICAgLy8gTk9URTogTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBjdXJyZW50IGxvY2F0aW9uLiBUaGVcbiAgICAvLyBsaXN0ZW5lciBpcyBjYWxsZWQgb25jZSBpbW1lZGlhdGVseS5cbiAgICBfdW5saXN0ZW4gPSBoaXN0b3J5Lmxpc3RlbihmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgbGV0IGRlc3RJbmRleCA9IDA7XG4gICAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignL3NjZW5lXycpICE9IC0xKSB7XG4gICAgICAgIGRlc3RJbmRleCA9IHBhcnNlSW50KGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoJy9zY2VuZV8nLCAnJykpO1xuICAgICAgfVxuICAgICAgaWYgKGRlc3RJbmRleCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGggJiYgZGVzdEluZGV4ICE9IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5oYXNoQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2p1bXBOKGRlc3RJbmRleCAtIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgICB0aGlzLmhhc2hDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX25hdmlnYXRpb25Db250ZXh0KSB7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2hlbiB5b3UncmUgZmluaXNoZWQsIHN0b3AgdGhlIGxpc3RlbmVyLlxuICAgIF91bmxpc3RlbigpO1xuXG4gIH0sXG5cbiAgX25leHRSb3V0ZUlEOiBmdW5jdGlvbiAocmVwbGFjZSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gKHJlcGxhY2UgPyAxIDogMClcbiAgfSxcblxuICBfZ2V0Um91dGVJRDogZnVuY3Rpb24gKHJvdXRlLCBhY3Rpb24pIHtcbiAgICBpZiAocm91dGUgPT09IG51bGwgfHwgdHlwZW9mIHJvdXRlICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIFN0cmluZyhyb3V0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1JvdXRlU3RhY2t9IG5leHRSb3V0ZVN0YWNrIE5leHQgcm91dGUgc3RhY2sgdG8gcmVpbml0aWFsaXplLiBUaGlzXG4gICAqIGRvZXNuJ3QgYWNjZXB0IHN0YWNrIGl0ZW0gYGlkYHMsIHdoaWNoIGltcGxpZXMgdGhhdCBhbGwgZXhpc3RpbmcgaXRlbXMgYXJlXG4gICAqIGRlc3Ryb3llZCwgYW5kIHRoZW4gcG90ZW50aWFsbHkgcmVjcmVhdGVkIGFjY29yZGluZyB0byBgcm91dGVTdGFja2AuIERvZXNcbiAgICogbm90IGFuaW1hdGUsIGltbWVkaWF0ZWx5IHJlcGxhY2VzIGFuZCByZXJlbmRlcnMgbmF2aWdhdGlvbiBiYXIgYW5kIHN0YWNrXG4gICAqIGl0ZW1zLlxuICAgKi9cbiAgaW1tZWRpYXRlbHlSZXNldFJvdXRlU3RhY2s6IGZ1bmN0aW9uKG5leHRSb3V0ZVN0YWNrKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICBjb25zdCBwcmV2TGVuZ3RoID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aFxuICAgIGxldCBkZXN0SW5kZXggPSBuZXh0Um91dGVTdGFjay5sZW5ndGggLSAxO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFJvdXRlU3RhY2ssXG4gICAgICBzY2VuZUNvbmZpZ1N0YWNrOiBuZXh0Um91dGVTdGFjay5tYXAoXG4gICAgICAgIHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmVcbiAgICAgICksXG4gICAgICBwcmVzZW50ZWRJbmRleDogZGVzdEluZGV4LFxuICAgICAgYWN0aXZlR2VzdHVyZTogbnVsbCxcbiAgICAgIHRyYW5zaXRpb25Gcm9tSW5kZXg6IG51bGwsXG4gICAgICB0cmFuc2l0aW9uUXVldWU6IFtdLFxuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIGlmIChwcmV2TGVuZ3RoKSBoaXN0b3J5LmdvKC1wcmV2TGVuZ3RoICsgMSlcblxuICAgICAgLy8gbmV4dFJvdXRlU3RhY2suZm9yRWFjaChmdW5jdGlvbiAocm91dGUsIGluZGV4KSB7XG4gICAgICAvLyAgIGNvbnN0IG1ldGhvZCA9IGluZGV4ID09PSBuZXh0Um91dGVTdGFjay5sZW5ndGggLSAxID8gJ3B1c2hTdGF0ZScgOiAncmVwbGFjZVN0YXRlJ1xuICAgICAgLy8gICBjb25zdCBhY3Rpb24gPSBtZXRob2QucmVwbGFjZSgnU3RhdGUnLCAnJylcbiAgICAgIC8vICAgaGlzdG9yeVttZXRob2RdKHsgaW5kZXggfSwgJy9zY2VuZV8nICsgc2VsZi5fZ2V0Um91dGVJRChyb3V0ZSkpO1xuICAgICAgLy8gfSlcblxuICAgICAgdGhpcy5faGFuZGxlU3ByaW5nVXBkYXRlKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3RyYW5zaXRpb25UbzogZnVuY3Rpb24oZGVzdEluZGV4LCB2ZWxvY2l0eSwganVtcFNwcmluZ1RvLCBjYikge1xuICAgIGlmIChkZXN0SW5kZXggPT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIHRoaXMuX2hpZGVTY2VuZXMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUucHVzaCh7XG4gICAgICAgIGRlc3RJbmRleCxcbiAgICAgICAgdmVsb2NpdHksXG4gICAgICAgIGNiLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICB0aGlzLnN0YXRlLnRyYW5zaXRpb25DYiA9IGNiO1xuICAgIHRoaXMuX29uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICAvLyBpZiAoQW5pbWF0aW9uc0RlYnVnTW9kdWxlKSB7XG4gICAgLy8gICBBbmltYXRpb25zRGVidWdNb2R1bGUuc3RhcnRSZWNvcmRpbmdGcHMoKTtcbiAgICAvLyB9XG4gICAgbGV0IHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3RoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleF0gfHxcbiAgICAgIHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1t0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4XTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBzY2VuZUNvbmZpZyxcbiAgICAgICdDYW5ub3QgY29uZmlndXJlIHNjZW5lIGF0IGluZGV4ICcgKyB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXhcbiAgICApO1xuICAgIGlmIChqdW1wU3ByaW5nVG8gIT0gbnVsbCkge1xuICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKGp1bXBTcHJpbmdUbyk7XG4gICAgfVxuICAgIHRoaXMuc3ByaW5nLnNldE92ZXJzaG9vdENsYW1waW5nRW5hYmxlZCh0cnVlKTtcbiAgICB0aGlzLnNwcmluZy5nZXRTcHJpbmdDb25maWcoKS5mcmljdGlvbiA9IHNjZW5lQ29uZmlnLnNwcmluZ0ZyaWN0aW9uO1xuICAgIHRoaXMuc3ByaW5nLmdldFNwcmluZ0NvbmZpZygpLnRlbnNpb24gPSBzY2VuZUNvbmZpZy5zcHJpbmdUZW5zaW9uO1xuICAgIHRoaXMuc3ByaW5nLnNldFZlbG9jaXR5KHZlbG9jaXR5IHx8IHNjZW5lQ29uZmlnLmRlZmF1bHRUcmFuc2l0aW9uVmVsb2NpdHkpO1xuICAgIHRoaXMuc3ByaW5nLnNldEVuZFZhbHVlKDEpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBUaGlzIGhhcHBlbnMgZm9yIGVhY2ggZnJhbWUgb2YgZWl0aGVyIGEgZ2VzdHVyZSBvciBhIHRyYW5zaXRpb24uIElmIGJvdGggYXJlXG4gICAqIGhhcHBlbmluZywgd2Ugb25seSBzZXQgdmFsdWVzIGZvciB0aGUgdHJhbnNpdGlvbiBhbmQgdGhlIGdlc3R1cmUgd2lsbCBjYXRjaCB1cCBsYXRlclxuICAgKi9cbiAgX2hhbmRsZVNwcmluZ1VwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgLy8gUHJpb3JpdGl6ZSBoYW5kbGluZyB0cmFuc2l0aW9uIGluIHByb2dyZXNzIG92ZXIgYSBnZXN0dXJlOlxuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCkge1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbkJldHdlZW4oXG4gICAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCxcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCxcbiAgICAgICAgdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgIT0gbnVsbCkge1xuICAgICAgbGV0IHByZXNlbnRlZFRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uQmV0d2VlbihcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCxcbiAgICAgICAgcHJlc2VudGVkVG9JbmRleCxcbiAgICAgICAgdGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKClcbiAgICAgICk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUaGlzIGhhcHBlbnMgYXQgdGhlIGVuZCBvZiBhIHRyYW5zaXRpb24gc3RhcnRlZCBieSB0cmFuc2l0aW9uVG8sIGFuZCB3aGVuIHRoZSBzcHJpbmcgY2F0Y2hlcyB1cCB0byBhIHBlbmRpbmcgZ2VzdHVyZVxuICAgKi9cbiAgX2NvbXBsZXRlVHJhbnNpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpICE9PSAxICYmIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpICE9PSAwKSB7XG4gICAgICAvLyBUaGUgc3ByaW5nIGhhcyBmaW5pc2hlZCBjYXRjaGluZyB1cCB0byBhIGdlc3R1cmUgaW4gcHJvZ3Jlc3MuIFJlbW92ZSB0aGUgcGVuZGluZyBwcm9ncmVzc1xuICAgICAgLy8gYW5kIHdlIHdpbGwgYmUgaW4gYSBub3JtYWwgYWN0aXZlR2VzdHVyZSBzdGF0ZVxuICAgICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcykge1xuICAgICAgICB0aGlzLnN0YXRlLnBlbmRpbmdHZXN0dXJlUHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9vbkFuaW1hdGlvbkVuZCgpO1xuICAgIGxldCBwcmVzZW50ZWRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgbGV0IGRpZEZvY3VzUm91dGUgPSB0aGlzLl9zdWJSb3V0ZUZvY3VzW3ByZXNlbnRlZEluZGV4XSB8fCB0aGlzLnN0YXRlLnJvdXRlU3RhY2tbcHJlc2VudGVkSW5kZXhdO1xuICAgIHRoaXMuX2VtaXREaWRGb2N1cyhkaWRGb2N1c1JvdXRlKTtcbiAgICAvLyBpZiAoQW5pbWF0aW9uc0RlYnVnTW9kdWxlKSB7XG4gICAgLy8gICBBbmltYXRpb25zRGVidWdNb2R1bGUuc3RvcFJlY29yZGluZ0ZwcyhEYXRlLm5vdygpKTtcbiAgICAvLyB9XG4gICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ID0gbnVsbDtcbiAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUoMCkuc2V0QXRSZXN0KCk7XG4gICAgdGhpcy5faGlkZVNjZW5lcygpO1xuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25DYikge1xuICAgICAgdGhpcy5zdGF0ZS50cmFuc2l0aW9uQ2IoKTtcbiAgICAgIHRoaXMuc3RhdGUudHJhbnNpdGlvbkNiID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2ludGVyYWN0aW9uSGFuZGxlKSB7XG4gICAgICB0aGlzLmNsZWFySW50ZXJhY3Rpb25IYW5kbGUodGhpcy5faW50ZXJhY3Rpb25IYW5kbGUpO1xuICAgICAgdGhpcy5faW50ZXJhY3Rpb25IYW5kbGUgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzKSB7XG4gICAgICAvLyBBIHRyYW5zaXRpb24gY29tcGxldGVkLCBidXQgdGhlcmUgaXMgYWxyZWFkeSBhbm90aGVyIGdlc3R1cmUgaGFwcGVuaW5nLlxuICAgICAgLy8gRW5hYmxlIHRoZSBzY2VuZSBhbmQgc2V0IHRoZSBzcHJpbmcgdG8gY2F0Y2ggdXAgd2l0aCB0aGUgbmV3IGdlc3R1cmVcbiAgICAgIGxldCBnZXN0dXJlVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICAgIHRoaXMuX2VuYWJsZVNjZW5lKGdlc3R1cmVUb0luZGV4KTtcbiAgICAgIHRoaXMuc3ByaW5nLnNldEVuZFZhbHVlKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25RdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGxldCBxdWV1ZWRUcmFuc2l0aW9uID0gdGhpcy5zdGF0ZS50cmFuc2l0aW9uUXVldWUuc2hpZnQoKTtcbiAgICAgIHRoaXMuX2VuYWJsZVNjZW5lKHF1ZXVlZFRyYW5zaXRpb24uZGVzdEluZGV4KTtcbiAgICAgIHRoaXMuX2VtaXRXaWxsRm9jdXModGhpcy5zdGF0ZS5yb3V0ZVN0YWNrW3F1ZXVlZFRyYW5zaXRpb24uZGVzdEluZGV4XSk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICAgIHF1ZXVlZFRyYW5zaXRpb24uZGVzdEluZGV4LFxuICAgICAgICBxdWV1ZWRUcmFuc2l0aW9uLnZlbG9jaXR5LFxuICAgICAgICBudWxsLFxuICAgICAgICBxdWV1ZWRUcmFuc2l0aW9uLmNiXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICBfZW1pdERpZEZvY3VzOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIHRoaXMubmF2aWdhdGlvbkNvbnRleHQuZW1pdCgnZGlkZm9jdXMnLCB7cm91dGU6IHJvdXRlfSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkRpZEZvY3VzKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkRm9jdXMocm91dGUpO1xuICAgIH1cbiAgfSxcblxuICBfZW1pdFdpbGxGb2N1czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLm5hdmlnYXRpb25Db250ZXh0LmVtaXQoJ3dpbGxmb2N1cycsIHtyb3V0ZTogcm91dGV9KTtcblxuICAgIGxldCBuYXZCYXIgPSB0aGlzLl9uYXZCYXI7XG4gICAgaWYgKG5hdkJhciAmJiBuYXZCYXIuaGFuZGxlV2lsbEZvY3VzKSB7XG4gICAgICBuYXZCYXIuaGFuZGxlV2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMub25XaWxsRm9jdXMpIHtcbiAgICAgIHRoaXMucHJvcHMub25XaWxsRm9jdXMocm91dGUpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogSGlkZXMgYWxsIHNjZW5lcyB0aGF0IHdlIGFyZSBub3QgY3VycmVudGx5IG9uLCBnZXN0dXJpbmcgdG8sIG9yIHRyYW5zaXRpb25pbmcgZnJvbVxuICAgKi9cbiAgX2hpZGVTY2VuZXM6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKSB7XG4gICAgICBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggfHxcbiAgICAgICAgICBpID09PSB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggfHxcbiAgICAgICAgICBpID09PSBnZXN0dXJpbmdUb0luZGV4KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGlzYWJsZVNjZW5lKGkpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUHVzaCBhIHNjZW5lIG9mZiB0aGUgc2NyZWVuLCBzbyB0aGF0IG9wYWNpdHk6MCBzY2VuZXMgd2lsbCBub3QgYmxvY2sgdG91Y2hlcyBzZW50IHRvIHRoZSBwcmVzZW50ZWQgc2NlbmVzXG4gICAqL1xuICBfZGlzYWJsZVNjZW5lOiBmdW5jdGlvbihzY2VuZUluZGV4KSB7XG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0gJiZcbiAgICB0aGlzLnJlZnNbJ3NjZW5lXycgKyBzY2VuZUluZGV4XS5zZXROYXRpdmVQcm9wcyhTQ0VORV9ESVNBQkxFRF9OQVRJVkVfUFJPUFMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQdXQgdGhlIHNjZW5lIGJhY2sgaW50byB0aGUgc3RhdGUgYXMgZGVmaW5lZCBieSBwcm9wcy5zY2VuZVN0eWxlLCBzbyB0cmFuc2l0aW9ucyBjYW4gaGFwcGVuIG5vcm1hbGx5XG4gICAqL1xuICBfZW5hYmxlU2NlbmU6IGZ1bmN0aW9uKHNjZW5lSW5kZXgpIHtcbiAgICAvLyBGaXJzdCwgZGV0ZXJtaW5lIHdoYXQgdGhlIGRlZmluZWQgc3R5bGVzIGFyZSBmb3Igc2NlbmVzIGluIHRoaXMgbmF2aWdhdG9yXG4gICAgbGV0IHNjZW5lU3R5bGUgPSBmbGF0dGVuU3R5bGUoW3N0eWxlcy5iYXNlU2NlbmUsIHRoaXMucHJvcHMuc2NlbmVTdHlsZV0pO1xuICAgIC8vIFRoZW4gcmVzdG9yZSB0aGUgcG9pbnRlciBldmVudHMgYW5kIHRvcCB2YWx1ZSBmb3IgdGhpcyBzY2VuZVxuICAgIGxldCBlbmFibGVkU2NlbmVOYXRpdmVQcm9wcyA9IHtcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdhdXRvJyxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHRvcDogc2NlbmVTdHlsZS50b3AsXG4gICAgICAgIGJvdHRvbTogc2NlbmVTdHlsZS5ib3R0b20sXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH0sXG4gICAgfTtcbiAgICBpZiAoc2NlbmVJbmRleCAhPT0gdGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICYmXG4gICAgICAgIHNjZW5lSW5kZXggIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIC8vIElmIHdlIGFyZSBub3QgaW4gYSB0cmFuc2l0aW9uIGZyb20gdGhpcyBpbmRleCwgbWFrZSBzdXJlIG9wYWNpdHkgaXMgMFxuICAgICAgLy8gdG8gcHJldmVudCB0aGUgZW5hYmxlZCBzY2VuZSBmcm9tIGZsYXNoaW5nIG92ZXIgdGhlIHByZXNlbnRlZCBzY2VuZVxuICAgICAgZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICBlbmFibGVkU2NlbmVOYXRpdmVQcm9wcy5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgICAgLy8gZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nXG4gICAgfVxuICAgIHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdICYmXG4gICAgdGhpcy5yZWZzWydzY2VuZV8nICsgc2NlbmVJbmRleF0uc2V0TmF0aXZlUHJvcHMoZW5hYmxlZFNjZW5lTmF0aXZlUHJvcHMpO1xuICB9LFxuXG4gIF9vbkFuaW1hdGlvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZXQgZnJvbUluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICBsZXQgdG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCAhPSBudWxsKSB7XG4gICAgICBmcm9tSW5kZXggPSB0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXg7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpIHtcbiAgICAgIHRvSW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgdGhpcy5fZGVsdGFGb3JHZXN0dXJlQWN0aW9uKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSk7XG4gICAgfVxuICAgIHRoaXMuX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkKGZyb21JbmRleCwgdHJ1ZSk7XG4gICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQodG9JbmRleCwgdHJ1ZSk7XG4gICAgbGV0IG5hdkJhciA9IHRoaXMuX25hdkJhcjtcbiAgICBpZiAobmF2QmFyICYmIG5hdkJhci5vbkFuaW1hdGlvblN0YXJ0KSB7XG4gICAgICBuYXZCYXIub25BbmltYXRpb25TdGFydChmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH1cbiAgfSxcblxuICBfb25BbmltYXRpb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBtYXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDw9IG1heDsgaW5kZXgrKykge1xuICAgICAgdGhpcy5fc2V0UmVuZGVyU2NlbmVUb0hhcmR3YXJlVGV4dHVyZUFuZHJvaWQoaW5kZXgsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLm9uQW5pbWF0aW9uRW5kKSB7XG4gICAgICBuYXZCYXIub25BbmltYXRpb25FbmQoKTtcbiAgICB9XG4gIH0sXG5cbiAgX3NldFJlbmRlclNjZW5lVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkOiBmdW5jdGlvbihzY2VuZUluZGV4LCBzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZSkge1xuICAgIGxldCB2aWV3QXRJbmRleCA9IHRoaXMucmVmc1snc2NlbmVfJyArIHNjZW5lSW5kZXhdO1xuICAgIGlmICh2aWV3QXRJbmRleCA9PT0gbnVsbCB8fCB2aWV3QXRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZpZXdBdEluZGV4LnNldE5hdGl2ZVByb3BzKCB7cmVuZGVyVG9IYXJkd2FyZVRleHR1cmVBbmRyb2lkOiBzaG91bGRSZW5kZXJUb0hhcmR3YXJlVGV4dHVyZX0pO1xuICB9LFxuXG4gIF9oYW5kbGVUb3VjaFN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzID0gR0VTVFVSRV9BQ1RJT05TO1xuICB9LFxuXG4gIF9oYW5kbGVNb3ZlU2hvdWxkU2V0UGFuUmVzcG9uZGVyOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgaWYgKCFzY2VuZUNvbmZpZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQgPSB0aGlzLl9tYXRjaEdlc3R1cmVBY3Rpb24odGhpcy5fZWxpZ2libGVHZXN0dXJlcywgc2NlbmVDb25maWcuZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSk7XG4gICAgcmV0dXJuICEhdGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50O1xuICB9LFxuXG4gIF9kb2VzR2VzdHVyZU92ZXJzd2lwZTogZnVuY3Rpb24oZ2VzdHVyZU5hbWUpIHtcbiAgICBsZXQgd291bGRPdmVyc3dpcGVCYWNrID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA8PSAwICYmXG4gICAgICAoZ2VzdHVyZU5hbWUgPT09ICdwb3AnIHx8IGdlc3R1cmVOYW1lID09PSAnanVtcEJhY2snKTtcbiAgICBsZXQgd291bGRPdmVyc3dpcGVGb3J3YXJkID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA+PSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gMSAmJlxuICAgICAgZ2VzdHVyZU5hbWUgPT09ICdqdW1wRm9yd2FyZCc7XG4gICAgcmV0dXJuIHdvdWxkT3ZlcnN3aXBlRm9yd2FyZCB8fCB3b3VsZE92ZXJzd2lwZUJhY2s7XG4gIH0sXG5cbiAgX2hhbmRsZVBhblJlc3BvbmRlckdyYW50OiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLl9leHBlY3RpbmdHZXN0dXJlR3JhbnQsXG4gICAgICAnUmVzcG9uZGVyIGdyYW50ZWQgdW5leHBlY3RlZGx5LidcbiAgICApO1xuICAgIHRoaXMuX2F0dGFjaEdlc3R1cmUodGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50KTtcbiAgICB0aGlzLl9vbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgdGhpcy5fZXhwZWN0aW5nR2VzdHVyZUdyYW50ID0gbnVsbDtcbiAgfSxcblxuICBfZGVsdGFGb3JHZXN0dXJlQWN0aW9uOiBmdW5jdGlvbihnZXN0dXJlQWN0aW9uKSB7XG4gICAgc3dpdGNoIChnZXN0dXJlQWN0aW9uKSB7XG4gICAgICBjYXNlICdwb3AnOlxuICAgICAgY2FzZSAnanVtcEJhY2snOlxuICAgICAgICByZXR1cm4gLTE7XG4gICAgICBjYXNlICdqdW1wRm9yd2FyZCc6XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaW52YXJpYW50KGZhbHNlLCAnVW5zdXBwb3J0ZWQgZ2VzdHVyZSBhY3Rpb24gJyArIGdlc3R1cmVBY3Rpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJSZWxlYXNlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgbGV0IHJlbGVhc2VHZXN0dXJlQWN0aW9uID0gdGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlO1xuICAgIGlmICghcmVsZWFzZUdlc3R1cmVBY3Rpb24pIHtcbiAgICAgIC8vIFRoZSBnZXN0dXJlIG1heSBoYXZlIGJlZW4gZGV0YWNoZWQgd2hpbGUgcmVzcG9uZGVyLCBzbyB0aGVyZSBpcyBubyBhY3Rpb24gaGVyZVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcmVsZWFzZUdlc3R1cmUgPSBzY2VuZUNvbmZpZy5nZXN0dXJlc1tyZWxlYXNlR2VzdHVyZUFjdGlvbl07XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICBpZiAodGhpcy5zcHJpbmcuZ2V0Q3VycmVudFZhbHVlKCkgPT09IDApIHtcbiAgICAgIC8vIFRoZSBzcHJpbmcgaXMgYXQgemVybywgc28gdGhlIGdlc3R1cmUgaXMgYWxyZWFkeSBjb21wbGV0ZVxuICAgICAgdGhpcy5zcHJpbmcuc2V0Q3VycmVudFZhbHVlKDApLnNldEF0UmVzdCgpO1xuICAgICAgdGhpcy5fY29tcGxldGVUcmFuc2l0aW9uKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gcmVsZWFzZUdlc3R1cmUuZGlyZWN0aW9uID09PSAndG9wLXRvLWJvdHRvbScgfHwgcmVsZWFzZUdlc3R1cmUuZGlyZWN0aW9uID09PSAnYm90dG9tLXRvLXRvcCc7XG4gICAgbGV0IGlzVHJhdmVsSW52ZXJ0ZWQgPSByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCByZWxlYXNlR2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICBsZXQgdmVsb2NpdHksIGdlc3R1cmVEaXN0YW5jZTtcbiAgICBpZiAoaXNUcmF2ZWxWZXJ0aWNhbCkge1xuICAgICAgdmVsb2NpdHkgPSBpc1RyYXZlbEludmVydGVkID8gLWdlc3R1cmVTdGF0ZS52eSA6IGdlc3R1cmVTdGF0ZS52eTtcbiAgICAgIGdlc3R1cmVEaXN0YW5jZSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLmR5IDogZ2VzdHVyZVN0YXRlLmR5O1xuICAgIH0gZWxzZSB7XG4gICAgICB2ZWxvY2l0eSA9IGlzVHJhdmVsSW52ZXJ0ZWQgPyAtZ2VzdHVyZVN0YXRlLnZ4IDogZ2VzdHVyZVN0YXRlLnZ4O1xuICAgICAgZ2VzdHVyZURpc3RhbmNlID0gaXNUcmF2ZWxJbnZlcnRlZCA/IC1nZXN0dXJlU3RhdGUuZHggOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgfVxuICAgIGxldCB0cmFuc2l0aW9uVmVsb2NpdHkgPSBjbGFtcCgtMTAsIHZlbG9jaXR5LCAxMCk7XG4gICAgaWYgKE1hdGguYWJzKHZlbG9jaXR5KSA8IHJlbGVhc2VHZXN0dXJlLm5vdE1vdmluZykge1xuICAgICAgLy8gVGhlIGdlc3R1cmUgdmVsb2NpdHkgaXMgc28gc2xvdywgaXMgXCJub3QgbW92aW5nXCJcbiAgICAgIGxldCBoYXNHZXN0dXJlZEVub3VnaFRvQ29tcGxldGUgPSBnZXN0dXJlRGlzdGFuY2UgPiByZWxlYXNlR2VzdHVyZS5mdWxsRGlzdGFuY2UgKiByZWxlYXNlR2VzdHVyZS5zdGlsbENvbXBsZXRpb25SYXRpbztcbiAgICAgIHRyYW5zaXRpb25WZWxvY2l0eSA9IGhhc0dlc3R1cmVkRW5vdWdoVG9Db21wbGV0ZSA/IHJlbGVhc2VHZXN0dXJlLnNuYXBWZWxvY2l0eSA6IC1yZWxlYXNlR2VzdHVyZS5zbmFwVmVsb2NpdHk7XG4gICAgfVxuICAgIGlmICh0cmFuc2l0aW9uVmVsb2NpdHkgPCAwIHx8IHRoaXMuX2RvZXNHZXN0dXJlT3ZlcnN3aXBlKHJlbGVhc2VHZXN0dXJlQWN0aW9uKSkge1xuICAgICAgLy8gVGhpcyBnZXN0dXJlIGlzIHRvIGFuIG92ZXJzd2lwZWQgcmVnaW9uIG9yIGRvZXMgbm90IGhhdmUgZW5vdWdoIHZlbG9jaXR5IHRvIGNvbXBsZXRlXG4gICAgICAvLyBJZiB3ZSBhcmUgY3VycmVudGx5IG1pZC10cmFuc2l0aW9uLCB0aGVuIHRoaXMgZ2VzdHVyZSB3YXMgYSBwZW5kaW5nIGdlc3R1cmUuIEJlY2F1c2UgdGhpcyBnZXN0dXJlIHRha2VzIG5vIGFjdGlvbiwgd2UgY2FuIHN0b3AgaGVyZVxuICAgICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvbkZyb21JbmRleCA9PSBudWxsKSB7XG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIGN1cnJlbnQgdHJhbnNpdGlvbiwgc28gd2UgbmVlZCB0byB0cmFuc2l0aW9uIGJhY2sgdG8gdGhlIHByZXNlbnRlZCBpbmRleFxuICAgICAgICBsZXQgdHJhbnNpdGlvbkJhY2tUb1ByZXNlbnRlZEluZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleDtcbiAgICAgICAgLy8gc2xpZ2h0IGhhY2s6IGNoYW5nZSB0aGUgcHJlc2VudGVkIGluZGV4IGZvciBhIG1vbWVudCBpbiBvcmRlciB0byB0cmFuc2l0aW9uVG8gY29ycmVjdGx5XG4gICAgICAgIHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggPSBkZXN0SW5kZXg7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgICAgICB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgsXG4gICAgICAgICAgLSB0cmFuc2l0aW9uVmVsb2NpdHksXG4gICAgICAgICAgMSAtIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBnZXN0dXJlIGhhcyBlbm91Z2ggdmVsb2NpdHkgdG8gY29tcGxldGUsIHNvIHdlIHRyYW5zaXRpb24gdG8gdGhlIGdlc3R1cmUncyBkZXN0aW5hdGlvblxuICAgICAgdGhpcy5fZW1pdFdpbGxGb2N1cyh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbZGVzdEluZGV4XSk7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICAgIGRlc3RJbmRleCxcbiAgICAgICAgdHJhbnNpdGlvblZlbG9jaXR5LFxuICAgICAgICBudWxsLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlbGVhc2VHZXN0dXJlQWN0aW9uID09PSAncG9wJykge1xuICAgICAgICAgICAgdGhpcy5fY2xlYW5TY2VuZXNQYXN0SW5kZXgoZGVzdEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuX2RldGFjaEdlc3R1cmUoKTtcbiAgfSxcblxuICBfaGFuZGxlUGFuUmVzcG9uZGVyVGVybWluYXRlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGRlc3RJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICB0aGlzLl9kZXRhY2hHZXN0dXJlKCk7XG4gICAgbGV0IHRyYW5zaXRpb25CYWNrVG9QcmVzZW50ZWRJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXg7XG4gICAgLy8gc2xpZ2h0IGhhY2s6IGNoYW5nZSB0aGUgcHJlc2VudGVkIGluZGV4IGZvciBhIG1vbWVudCBpbiBvcmRlciB0byB0cmFuc2l0aW9uVG8gY29ycmVjdGx5XG4gICAgdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA9IGRlc3RJbmRleDtcbiAgICB0aGlzLl90cmFuc2l0aW9uVG8oXG4gICAgICB0cmFuc2l0aW9uQmFja1RvUHJlc2VudGVkSW5kZXgsXG4gICAgICBudWxsLFxuICAgICAgMSAtIHRoaXMuc3ByaW5nLmdldEN1cnJlbnRWYWx1ZSgpXG4gICAgKTtcbiAgfSxcblxuICBfYXR0YWNoR2VzdHVyZTogZnVuY3Rpb24oZ2VzdHVyZUlkKSB7XG4gICAgdGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlID0gZ2VzdHVyZUlkO1xuICAgIGxldCBnZXN0dXJpbmdUb0luZGV4ID0gdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCArIHRoaXMuX2RlbHRhRm9yR2VzdHVyZUFjdGlvbih0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUpO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKGdlc3R1cmluZ1RvSW5kZXgpO1xuICB9LFxuXG4gIF9kZXRhY2hHZXN0dXJlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmUgPSBudWxsO1xuICAgIHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyA9IG51bGw7XG4gICAgdGhpcy5faGlkZVNjZW5lcygpO1xuICB9LFxuXG4gIF9oYW5kbGVQYW5SZXNwb25kZXJNb3ZlOiBmdW5jdGlvbihlLCBnZXN0dXJlU3RhdGUpIHtcbiAgICBsZXQgc2NlbmVDb25maWcgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2tbdGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleF07XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkge1xuICAgICAgbGV0IGdlc3R1cmUgPSBzY2VuZUNvbmZpZy5nZXN0dXJlc1t0aGlzLnN0YXRlLmFjdGl2ZUdlc3R1cmVdO1xuICAgICAgcmV0dXJuIHRoaXMuX21vdmVBdHRhY2hlZEdlc3R1cmUoZ2VzdHVyZSwgZ2VzdHVyZVN0YXRlKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoZWRHZXN0dXJlID0gdGhpcy5fbWF0Y2hHZXN0dXJlQWN0aW9uKEdFU1RVUkVfQUNUSU9OUywgc2NlbmVDb25maWcuZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSk7XG4gICAgaWYgKG1hdGNoZWRHZXN0dXJlKSB7XG4gICAgICB0aGlzLl9hdHRhY2hHZXN0dXJlKG1hdGNoZWRHZXN0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgX21vdmVBdHRhY2hlZEdlc3R1cmU6IGZ1bmN0aW9uKGdlc3R1cmUsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGxldCBpc1RyYXZlbFZlcnRpY2FsID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICd0b3AtdG8tYm90dG9tJyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCBpc1RyYXZlbEludmVydGVkID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgIGxldCBkaXN0YW5jZSA9IGlzVHJhdmVsVmVydGljYWwgPyBnZXN0dXJlU3RhdGUuZHkgOiBnZXN0dXJlU3RhdGUuZHg7XG4gICAgZGlzdGFuY2UgPSBpc1RyYXZlbEludmVydGVkID8gLSBkaXN0YW5jZSA6IGRpc3RhbmNlO1xuICAgIGxldCBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQgPSBnZXN0dXJlLmdlc3R1cmVEZXRlY3RNb3ZlbWVudDtcbiAgICBsZXQgbmV4dFByb2dyZXNzID0gKGRpc3RhbmNlIC0gZ2VzdHVyZURldGVjdE1vdmVtZW50KSAvXG4gICAgICAoZ2VzdHVyZS5mdWxsRGlzdGFuY2UgLSBnZXN0dXJlRGV0ZWN0TW92ZW1lbnQpO1xuICAgIGlmIChuZXh0UHJvZ3Jlc3MgPCAwICYmIGdlc3R1cmUuaXNEZXRhY2hhYmxlKSB7XG4gICAgICBsZXQgZ2VzdHVyaW5nVG9JbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggKyB0aGlzLl9kZWx0YUZvckdlc3R1cmVBY3Rpb24odGhpcy5zdGF0ZS5hY3RpdmVHZXN0dXJlKTtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25CZXR3ZWVuKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgsIGdlc3R1cmluZ1RvSW5kZXgsIDApO1xuICAgICAgdGhpcy5fZGV0YWNoR2VzdHVyZSgpO1xuICAgICAgaWYgKHRoaXMuc3RhdGUucGVuZGluZ0dlc3R1cmVQcm9ncmVzcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3ByaW5nLnNldEN1cnJlbnRWYWx1ZSgwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2RvZXNHZXN0dXJlT3ZlcnN3aXBlKHRoaXMuc3RhdGUuYWN0aXZlR2VzdHVyZSkpIHtcbiAgICAgIGxldCBmcmljdGlvbkNvbnN0YW50ID0gZ2VzdHVyZS5vdmVyc3dpcGUuZnJpY3Rpb25Db25zdGFudDtcbiAgICAgIGxldCBmcmljdGlvbkJ5RGlzdGFuY2UgPSBnZXN0dXJlLm92ZXJzd2lwZS5mcmljdGlvbkJ5RGlzdGFuY2U7XG4gICAgICBsZXQgZnJpY3Rpb25SYXRpbyA9IDEgLyAoKGZyaWN0aW9uQ29uc3RhbnQpICsgKE1hdGguYWJzKG5leHRQcm9ncmVzcykgKiBmcmljdGlvbkJ5RGlzdGFuY2UpKTtcbiAgICAgIG5leHRQcm9ncmVzcyAqPSBmcmljdGlvblJhdGlvO1xuICAgIH1cbiAgICBuZXh0UHJvZ3Jlc3MgPSBjbGFtcCgwLCBuZXh0UHJvZ3Jlc3MsIDEpO1xuICAgIGlmICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzID0gbmV4dFByb2dyZXNzO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nR2VzdHVyZVByb2dyZXNzKSB7XG4gICAgICB0aGlzLnNwcmluZy5zZXRFbmRWYWx1ZShuZXh0UHJvZ3Jlc3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNwcmluZy5zZXRDdXJyZW50VmFsdWUobmV4dFByb2dyZXNzKTtcbiAgICB9XG4gIH0sXG5cbiAgX21hdGNoR2VzdHVyZUFjdGlvbjogZnVuY3Rpb24oZWxpZ2libGVHZXN0dXJlcywgZ2VzdHVyZXMsIGdlc3R1cmVTdGF0ZSkge1xuICAgIGlmICghZ2VzdHVyZXMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hlZEdlc3R1cmUgPSBudWxsO1xuICAgIGVsaWdpYmxlR2VzdHVyZXMuc29tZSgoZ2VzdHVyZU5hbWUsIGdlc3R1cmVJbmRleCkgPT4ge1xuICAgICAgbGV0IGdlc3R1cmUgPSBnZXN0dXJlc1tnZXN0dXJlTmFtZV07XG4gICAgICBpZiAoIWdlc3R1cmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGdlc3R1cmUub3ZlcnN3aXBlID09IG51bGwgJiYgdGhpcy5fZG9lc0dlc3R1cmVPdmVyc3dpcGUoZ2VzdHVyZU5hbWUpKSB7XG4gICAgICAgIC8vIGNhbm5vdCBzd2lwZSBwYXN0IGZpcnN0IG9yIGxhc3Qgc2NlbmUgd2l0aG91dCBvdmVyc3dpcGluZ1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBsZXQgaXNUcmF2ZWxWZXJ0aWNhbCA9IGdlc3R1cmUuZGlyZWN0aW9uID09PSAndG9wLXRvLWJvdHRvbScgfHwgZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdib3R0b20tdG8tdG9wJztcbiAgICAgIGxldCBpc1RyYXZlbEludmVydGVkID0gZ2VzdHVyZS5kaXJlY3Rpb24gPT09ICdyaWdodC10by1sZWZ0JyB8fCBnZXN0dXJlLmRpcmVjdGlvbiA9PT0gJ2JvdHRvbS10by10b3AnO1xuICAgICAgbGV0IGN1cnJlbnRMb2MgPSBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLm1vdmVZIDogZ2VzdHVyZVN0YXRlLm1vdmVYO1xuICAgICAgbGV0IHRyYXZlbERpc3QgPSBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLmR5IDogZ2VzdHVyZVN0YXRlLmR4O1xuICAgICAgbGV0IG9wcG9zaXRlQXhpc1RyYXZlbERpc3QgPVxuICAgICAgICBpc1RyYXZlbFZlcnRpY2FsID8gZ2VzdHVyZVN0YXRlLmR4IDogZ2VzdHVyZVN0YXRlLmR5O1xuICAgICAgbGV0IGVkZ2VIaXRXaWR0aCA9IGdlc3R1cmUuZWRnZUhpdFdpZHRoO1xuICAgICAgaWYgKGlzVHJhdmVsSW52ZXJ0ZWQpIHtcbiAgICAgICAgY3VycmVudExvYyA9IC1jdXJyZW50TG9jO1xuICAgICAgICB0cmF2ZWxEaXN0ID0gLXRyYXZlbERpc3Q7XG4gICAgICAgIG9wcG9zaXRlQXhpc1RyYXZlbERpc3QgPSAtb3Bwb3NpdGVBeGlzVHJhdmVsRGlzdDtcbiAgICAgICAgZWRnZUhpdFdpZHRoID0gaXNUcmF2ZWxWZXJ0aWNhbCA/XG4gICAgICAgICAgLShTQ1JFRU5fSEVJR0hUIC0gZWRnZUhpdFdpZHRoKSA6XG4gICAgICAgICAgLShTQ1JFRU5fV0lEVEggLSBlZGdlSGl0V2lkdGgpO1xuICAgICAgfVxuICAgICAgbGV0IG1vdmVTdGFydGVkSW5SZWdpb24gPSBnZXN0dXJlLmVkZ2VIaXRXaWR0aCA9PSBudWxsIHx8XG4gICAgICAgIGN1cnJlbnRMb2MgPCBlZGdlSGl0V2lkdGg7XG4gICAgICBpZiAoIW1vdmVTdGFydGVkSW5SZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbGV0IG1vdmVUcmF2ZWxsZWRGYXJFbm91Z2ggPSB0cmF2ZWxEaXN0ID49IGdlc3R1cmUuZ2VzdHVyZURldGVjdE1vdmVtZW50O1xuICAgICAgaWYgKCFtb3ZlVHJhdmVsbGVkRmFyRW5vdWdoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBkaXJlY3Rpb25Jc0NvcnJlY3QgPSBNYXRoLmFicyh0cmF2ZWxEaXN0KSA+IE1hdGguYWJzKG9wcG9zaXRlQXhpc1RyYXZlbERpc3QpICogZ2VzdHVyZS5kaXJlY3Rpb25SYXRpbztcbiAgICAgIGlmIChkaXJlY3Rpb25Jc0NvcnJlY3QpIHtcbiAgICAgICAgbWF0Y2hlZEdlc3R1cmUgPSBnZXN0dXJlTmFtZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lbGlnaWJsZUdlc3R1cmVzID0gdGhpcy5fZWxpZ2libGVHZXN0dXJlcy5zbGljZSgpLnNwbGljZShnZXN0dXJlSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGVkR2VzdHVyZTtcbiAgfSxcblxuICBfdHJhbnNpdGlvblNjZW5lU3R5bGU6IGZ1bmN0aW9uKGZyb21JbmRleCwgdG9JbmRleCwgcHJvZ3Jlc3MsIGluZGV4KSB7XG4gICAgbGV0IHZpZXdBdEluZGV4ID0gdGhpcy5yZWZzWydzY2VuZV8nICsgaW5kZXhdO1xuICAgIGlmICh2aWV3QXRJbmRleCA9PT0gbnVsbCB8fCB2aWV3QXRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFVzZSB0b0luZGV4IGFuaW1hdGlvbiB3aGVuIHdlIG1vdmUgZm9yd2FyZHMuIFVzZSBmcm9tSW5kZXggd2hlbiB3ZSBtb3ZlIGJhY2tcbiAgICBsZXQgc2NlbmVDb25maWdJbmRleCA9IGZyb21JbmRleCA8IHRvSW5kZXggPyB0b0luZGV4IDogZnJvbUluZGV4O1xuICAgIGxldCBzY2VuZUNvbmZpZyA9IHRoaXMuc3RhdGUuc2NlbmVDb25maWdTdGFja1tzY2VuZUNvbmZpZ0luZGV4XTtcbiAgICAvLyB0aGlzIGhhcHBlbnMgZm9yIG92ZXJzd2lwaW5nIHdoZW4gdGhlcmUgaXMgbm8gc2NlbmUgYXQgdG9JbmRleFxuICAgIGlmICghc2NlbmVDb25maWcpIHtcbiAgICAgIHNjZW5lQ29uZmlnID0gdGhpcy5zdGF0ZS5zY2VuZUNvbmZpZ1N0YWNrW3NjZW5lQ29uZmlnSW5kZXggLSAxXTtcbiAgICB9XG4gICAgbGV0IHN0eWxlVG9Vc2UgPSB7fTtcbiAgICBsZXQgdXNlRm4gPSBpbmRleCA8IGZyb21JbmRleCB8fCBpbmRleCA8IHRvSW5kZXggP1xuICAgICAgc2NlbmVDb25maWcuYW5pbWF0aW9uSW50ZXJwb2xhdG9ycy5vdXQgOlxuICAgICAgc2NlbmVDb25maWcuYW5pbWF0aW9uSW50ZXJwb2xhdG9ycy5pbnRvO1xuICAgIGxldCBkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzID0gZnJvbUluZGV4IDwgdG9JbmRleCA/IHByb2dyZXNzIDogMSAtIHByb2dyZXNzO1xuICAgIGxldCBkaWRDaGFuZ2UgPSB1c2VGbihzdHlsZVRvVXNlLCBkaXJlY3Rpb25BZGp1c3RlZFByb2dyZXNzKTtcbiAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICB2aWV3QXRJbmRleC5zZXROYXRpdmVQcm9wcyh7c3R5bGU6IHN0eWxlVG9Vc2V9KTtcbiAgICB9XG4gIH0sXG5cbiAgX3RyYW5zaXRpb25CZXR3ZWVuOiBmdW5jdGlvbihmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvblNjZW5lU3R5bGUoZnJvbUluZGV4LCB0b0luZGV4LCBwcm9ncmVzcywgZnJvbUluZGV4KTtcbiAgICB0aGlzLl90cmFuc2l0aW9uU2NlbmVTdHlsZShmcm9tSW5kZXgsIHRvSW5kZXgsIHByb2dyZXNzLCB0b0luZGV4KTtcbiAgICBsZXQgbmF2QmFyID0gdGhpcy5fbmF2QmFyO1xuICAgIGlmIChuYXZCYXIgJiYgbmF2QmFyLnVwZGF0ZVByb2dyZXNzICYmIHRvSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPj0gMCkge1xuICAgICAgbmF2QmFyLnVwZGF0ZVByb2dyZXNzKHByb2dyZXNzLCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH1cbiAgfSxcblxuICBfaGFuZGxlUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgX2dldERlc3RJbmRleFdpdGhpbkJvdW5kczogZnVuY3Rpb24obikge1xuICAgIGxldCBjdXJyZW50SW5kZXggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4O1xuICAgIGxldCBkZXN0SW5kZXggPSBjdXJyZW50SW5kZXggKyBuO1xuICAgIGludmFyaWFudChcbiAgICAgIGRlc3RJbmRleCA+PSAwLFxuICAgICAgJ0Nhbm5vdCBqdW1wIGJlZm9yZSB0aGUgZmlyc3Qgcm91dGUuJ1xuICAgICk7XG4gICAgbGV0IG1heEluZGV4ID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCAtIDE7XG4gICAgaW52YXJpYW50KFxuICAgICAgbWF4SW5kZXggPj0gZGVzdEluZGV4LFxuICAgICAgJ0Nhbm5vdCBqdW1wIHBhc3QgdGhlIGxhc3Qgcm91dGUuJ1xuICAgICk7XG4gICAgcmV0dXJuIGRlc3RJbmRleDtcbiAgfSxcblxuICBfanVtcE46IGZ1bmN0aW9uKG4pIHtcbiAgICBsZXQgZGVzdEluZGV4ID0gdGhpcy5fZ2V0RGVzdEluZGV4V2l0aGluQm91bmRzKG4pO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKGRlc3RJbmRleCk7XG4gICAgY29uc3Qgcm91dGUgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2tbZGVzdEluZGV4XVxuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXMocm91dGUpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhkZXN0SW5kZXgpO1xuICAgIGlmICghdGhpcy5oYXNoQ2hhbmdlZCkge1xuICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsgaW5kZXg6IGRlc3RJbmRleCB9LCAnL3NjZW5lXycgKyB0aGlzLl9nZXRSb3V0ZUlEKHJvdXRlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LmdvKG4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBpZiAobiA8IDApIHtcbiAgICAvLyAgIC8vIF9fdWlkIHNob3VsZCBiZSBub24tbmVnYXRpdmVcbiAgICAvLyAgIF9fdWlkID0gTWF0aC5tYXgoX191aWQgKyBuLCAwKTtcbiAgICAvLyB9XG4gIH0sXG5cbiAganVtcFRvOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIGxldCBkZXN0SW5kZXggPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2suaW5kZXhPZihyb3V0ZSk7XG4gICAgaW52YXJpYW50KFxuICAgICAgZGVzdEluZGV4ICE9PSAtMSxcbiAgICAgICdDYW5ub3QganVtcCB0byByb3V0ZSB0aGF0IGlzIG5vdCBpbiB0aGUgcm91dGUgc3RhY2snXG4gICAgKTtcbiAgICB0aGlzLl9qdW1wTihkZXN0SW5kZXggLSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICBqdW1wRm9yd2FyZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fanVtcE4oMSk7XG4gIH0sXG5cbiAganVtcEJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2p1bXBOKC0xKTtcbiAgfSxcblxuICBwdXNoOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgIGludmFyaWFudCghIXJvdXRlLCAnTXVzdCBzdXBwbHkgcm91dGUgdG8gcHVzaCcpO1xuICAgIGxldCBhY3RpdmVMZW5ndGggPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ICsgMTtcbiAgICBsZXQgYWN0aXZlU3RhY2sgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgYWN0aXZlTGVuZ3RoKTtcbiAgICBsZXQgYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2sgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgYWN0aXZlTGVuZ3RoKTtcbiAgICBsZXQgbmV4dFN0YWNrID0gYWN0aXZlU3RhY2suY29uY2F0KFtyb3V0ZV0pO1xuICAgIGxldCBkZXN0SW5kZXggPSBuZXh0U3RhY2subGVuZ3RoIC0gMTtcbiAgICBsZXQgbmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrID0gYWN0aXZlQW5pbWF0aW9uQ29uZmlnU3RhY2suY29uY2F0KFtcbiAgICAgIHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpLFxuICAgIF0pO1xuICAgIHRoaXMuX2VtaXRXaWxsRm9jdXMobmV4dFN0YWNrW2Rlc3RJbmRleF0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcm91dGVTdGFjazogbmV4dFN0YWNrLFxuICAgICAgc2NlbmVDb25maWdTdGFjazogbmV4dEFuaW1hdGlvbkNvbmZpZ1N0YWNrLFxuICAgICAgcHJlc2VudGVkSW5kZXg6IGRlc3RJbmRleFxuICAgIH0sICgpID0+IHtcbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsgaW5kZXg6IGRlc3RJbmRleCB9LCAnL3NjZW5lXycgKyB0aGlzLl9nZXRSb3V0ZUlEKHJvdXRlKSk7XG4gICAgICB0aGlzLl9lbmFibGVTY2VuZShkZXN0SW5kZXgpO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvblRvKGRlc3RJbmRleCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3BvcE46IGZ1bmN0aW9uKG4pIHtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gbiA+PSAwLFxuICAgICAgJ0Nhbm5vdCBwb3AgYmVsb3cgemVybydcbiAgICApO1xuICAgIGxldCBwb3BJbmRleCA9IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXggLSBuO1xuICAgIHRoaXMuX2VuYWJsZVNjZW5lKHBvcEluZGV4KTtcbiAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHRoaXMuc3RhdGUucm91dGVTdGFja1twb3BJbmRleF0pO1xuICAgIHRoaXMuX3RyYW5zaXRpb25UbyhcbiAgICAgIHBvcEluZGV4LFxuICAgICAgbnVsbCwgLy8gZGVmYXVsdCB2ZWxvY2l0eVxuICAgICAgbnVsbCwgLy8gbm8gc3ByaW5nIGp1bXBpbmdcbiAgICAgICgpID0+IHtcbiAgICAgICAgaGlzdG9yeS5nbygtbik7XG4gICAgICAgIHRoaXMuX2NsZWFuU2NlbmVzUGFzdEluZGV4KHBvcEluZGV4KTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIHBvcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudHJhbnNpdGlvblF1ZXVlLmxlbmd0aCkge1xuICAgICAgLy8gVGhpcyBpcyB0aGUgd29ya2Fyb3VuZCB0byBwcmV2ZW50IHVzZXIgZnJvbSBmaXJpbmcgbXVsdGlwbGUgYHBvcCgpYFxuICAgICAgLy8gY2FsbHMgdGhhdCBtYXkgcG9wIHRoZSByb3V0ZXMgYmV5b25kIHRoZSBsaW1pdC5cbiAgICAgIC8vIEJlY2F1c2UgYHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhgIGRvZXMgbm90IHVwZGF0ZSB1bnRpbCB0aGVcbiAgICAgIC8vIHRyYW5zaXRpb24gc3RhcnRzLCB3ZSBjYW4ndCByZWxpYWJseSB1c2UgYHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXhgXG4gICAgICAvLyB0byBrbm93IHdoZXRoZXIgd2UgY2FuIHNhZmVseSBrZWVwIHBvcHBpbmcgdGhlIHJvdXRlcyBvciBub3QgYXQgdGhpc1xuICAgICAgLy8gIG1vbWVudC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5wcmVzZW50ZWRJbmRleCA+IDApIHtcbiAgICAgIHRoaXMuX3BvcE4oMSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGEgcm91dGUgaW4gdGhlIG5hdmlnYXRpb24gc3RhY2suXG4gICAqXG4gICAqIGBpbmRleGAgc3BlY2lmaWVzIHRoZSByb3V0ZSBpbiB0aGUgc3RhY2sgdGhhdCBzaG91bGQgYmUgcmVwbGFjZWQuXG4gICAqIElmIGl0J3MgbmVnYXRpdmUsIGl0IGNvdW50cyBmcm9tIHRoZSBiYWNrLlxuICAgKi9cbiAgcmVwbGFjZUF0SW5kZXg6IGZ1bmN0aW9uKHJvdXRlLCBpbmRleCwgY2IpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHJlcGxhY2UnKTtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICBpbmRleCArPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIDw9IGluZGV4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLnN0YXRlLnJvdXRlU3RhY2subGVuZ3RoIC0gaW5kZXggLSAxXG4gICAgbGV0IG5leHRSb3V0ZVN0YWNrID0gdGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLnNsaWNlKCk7XG4gICAgbGV0IG5leHRBbmltYXRpb25Nb2RlU3RhY2sgPSB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoKTtcbiAgICBuZXh0Um91dGVTdGFja1tpbmRleF0gPSByb3V0ZTtcbiAgICBuZXh0QW5pbWF0aW9uTW9kZVN0YWNrW2luZGV4XSA9IHRoaXMucHJvcHMuY29uZmlndXJlU2NlbmUocm91dGUpO1xuXG4gICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICB0aGlzLl9lbWl0V2lsbEZvY3VzKHJvdXRlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByb3V0ZVN0YWNrOiBuZXh0Um91dGVTdGFjayxcbiAgICAgIHNjZW5lQ29uZmlnU3RhY2s6IG5leHRBbmltYXRpb25Nb2RlU3RhY2ssXG4gICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXgsXG4gICAgICB0cmFuc2l0aW9uRnJvbUluZGV4OiBudWxsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KSB7XG4gICAgICAgIHRoaXMuX2VtaXREaWRGb2N1cyhyb3V0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXN0YW5jZSkgaGlzdG9yeS5nbygtZGlzdGFuY2UpXG5cbiAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHsgaW5kZXggfSwgJy9zY2VuZV8nICsgdGhpcy5fZ2V0Um91dGVJRChyb3V0ZSkpO1xuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIGN1cnJlbnQgc2NlbmUgaW4gdGhlIHN0YWNrLlxuICAgKi9cbiAgcmVwbGFjZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgY3VycmVudCByb3V0ZSdzIHBhcmVudC5cbiAgICovXG4gIHJlcGxhY2VQcmV2aW91czogZnVuY3Rpb24ocm91dGUpIHtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gMSk7XG4gIH0sXG5cbiAgcG9wVG9Ub3A6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucG9wVG9Sb3V0ZSh0aGlzLnN0YXRlLnJvdXRlU3RhY2tbMF0pO1xuICB9LFxuXG4gIHBvcFRvUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgbGV0IGluZGV4T2ZSb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5pbmRleE9mKHJvdXRlKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBpbmRleE9mUm91dGUgIT09IC0xLFxuICAgICAgJ0NhbGxpbmcgcG9wVG9Sb3V0ZSBmb3IgYSByb3V0ZSB0aGF0IGRvZXNuXFwndCBleGlzdCEnXG4gICAgKTtcbiAgICBsZXQgbnVtVG9Qb3AgPSB0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4IC0gaW5kZXhPZlJvdXRlO1xuICAgIHRoaXMuX3BvcE4obnVtVG9Qb3ApO1xuICB9LFxuXG4gIHJlcGxhY2VQcmV2aW91c0FuZFBvcDogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yb3V0ZVN0YWNrLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXBsYWNlUHJldmlvdXMocm91dGUpO1xuICAgIHRoaXMucG9wKCk7XG4gIH0sXG5cbiAgcmVzZXRUbzogZnVuY3Rpb24ocm91dGUpIHtcbiAgICBpbnZhcmlhbnQoISFyb3V0ZSwgJ011c3Qgc3VwcGx5IHJvdXRlIHRvIHB1c2gnKTtcbiAgICB0aGlzLnJlcGxhY2VBdEluZGV4KHJvdXRlLCAwLCAoKSA9PiB7XG4gICAgICAvLyBEbyBub3QgdXNlIHBvcFRvUm91dGUgaGVyZSwgYmVjYXVzZSByYWNlIGNvbmRpdGlvbnMgY291bGQgcHJldmVudCB0aGVcbiAgICAgIC8vIHJvdXRlIGZyb20gZXhpc3RpbmcgYXQgdGhpcyB0aW1lLiBJbnN0ZWFkLCBqdXN0IGdvIHRvIGluZGV4IDBcbiAgICAgIGlmICh0aGlzLnN0YXRlLnByZXNlbnRlZEluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLl9wb3BOKHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGdldEN1cnJlbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsb25lIGJlZm9yZSByZXR1cm5pbmcgdG8gYXZvaWQgY2FsbGVyIG11dGF0aW5nIHRoZSBzdGFja1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoKTtcbiAgfSxcblxuICBfY2xlYW5TY2VuZXNQYXN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IG5ld1N0YWNrTGVuZ3RoID0gaW5kZXggKyAxO1xuICAgIC8vIFJlbW92ZSBhbnkgdW5uZWVkZWQgcmVuZGVyZWQgcm91dGVzLlxuICAgIGlmIChuZXdTdGFja0xlbmd0aCA8IHRoaXMuc3RhdGUucm91dGVTdGFjay5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2VuZUNvbmZpZ1N0YWNrOiB0aGlzLnN0YXRlLnNjZW5lQ29uZmlnU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICByb3V0ZVN0YWNrOiB0aGlzLnN0YXRlLnJvdXRlU3RhY2suc2xpY2UoMCwgbmV3U3RhY2tMZW5ndGgpLFxuICAgICAgICBwcmVzZW50ZWRJbmRleDogaW5kZXhcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVyU2NlbmU6IGZ1bmN0aW9uKHJvdXRlLCBpKSB7XG4gICAgLy8gbGV0IGRpc2FibGVkU2NlbmVTdHlsZSA9IG51bGw7XG4gICAgbGV0IHBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgaWYgKGkgIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgIC8vIGRpc2FibGVkU2NlbmVTdHlsZSA9IHN0eWxlcy5kaXNhYmxlZFNjZW5lO1xuICAgICAgcG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICB9XG5cbiAgICBjb25zdCByb3V0ZUlkID0gdGhpcy5fZ2V0Um91dGVJRChyb3V0ZSlcbiAgICByZXR1cm4gKFxuICAgICAgPFZpZXdcbiAgICAgICAga2V5PXsnc2NlbmVfJyArIHJvdXRlSWR9XG4gICAgICAgIHJlZj17J3NjZW5lXycgKyByb3V0ZUlkfVxuICAgICAgICBvblN0YXJ0U2hvdWxkU2V0UmVzcG9uZGVyQ2FwdHVyZT17KCkgPT4ge1xuICAgICAgICAgIHJldHVybiAodGhpcy5zdGF0ZS50cmFuc2l0aW9uRnJvbUluZGV4ICE9IG51bGwpIHx8ICh0aGlzLnN0YXRlLnRyYW5zaXRpb25Gcm9tSW5kZXggIT0gbnVsbCk7XG4gICAgICAgIH19XG4gICAgICAgIHBvaW50ZXJFdmVudHM9e3BvaW50ZXJFdmVudHN9XG4gICAgICAgIHN0eWxlPXtbc3R5bGVzLmJhc2VTY2VuZSwgdGhpcy5wcm9wcy5zY2VuZVN0eWxlLyosIGRpc2FibGVkU2NlbmVTdHlsZSovXX0+XG4gICAgICAgIHt0aGlzLnByb3BzLnJlbmRlclNjZW5lKFxuICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKX1cbiAgICAgIDwvVmlldz5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uQmFyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMubmF2aWdhdGlvbkJhcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQodGhpcy5wcm9wcy5uYXZpZ2F0aW9uQmFyLCB7XG4gICAgICByZWY6IChuYXZCYXIpID0+IHtcbiAgICAgICAgdGhpcy5fbmF2QmFyID0gbmF2QmFyO1xuICAgICAgfSxcbiAgICAgIG5hdmlnYXRvcjogdGhpcyxcbiAgICAgIG5hdlN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgbGV0IG5ld1JlbmRlcmVkU2NlbmVNYXAgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHNjZW5lcyA9IHRoaXMuc3RhdGUucm91dGVTdGFjay5tYXAoKHJvdXRlLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHJlbmRlcmVkU2NlbmU7XG4gICAgICBpZiAodGhpcy5fcmVuZGVyZWRTY2VuZU1hcC5oYXMocm91dGUpICYmXG4gICAgICAgICAgaW5kZXggIT09IHRoaXMuc3RhdGUucHJlc2VudGVkSW5kZXgpIHtcbiAgICAgICAgcmVuZGVyZWRTY2VuZSA9IHRoaXMuX3JlbmRlcmVkU2NlbmVNYXAuZ2V0KHJvdXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmVkU2NlbmUgPSB0aGlzLl9yZW5kZXJTY2VuZShyb3V0ZSwgaW5kZXgpO1xuICAgICAgfVxuICAgICAgbmV3UmVuZGVyZWRTY2VuZU1hcC5zZXQocm91dGUsIHJlbmRlcmVkU2NlbmUpO1xuICAgICAgcmV0dXJuIHJlbmRlcmVkU2NlbmU7XG4gICAgfSk7XG4gICAgdGhpcy5fcmVuZGVyZWRTY2VuZU1hcCA9IG5ld1JlbmRlcmVkU2NlbmVNYXA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxWaWV3IHN0eWxlPXtbc3R5bGVzLmNvbnRhaW5lciwgdGhpcy5wcm9wcy5zdHlsZV19PlxuICAgICAgICA8Vmlld1xuICAgICAgICAgIHN0eWxlPXtzdHlsZXMudHJhbnNpdGlvbmVyfVxuICAgICAgICAgIHsuLi50aGlzLnBhbkdlc3R1cmUucGFuSGFuZGxlcnN9XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0PXt0aGlzLl9oYW5kbGVUb3VjaFN0YXJ0fVxuICAgICAgICAgIG9uUmVzcG9uZGVyVGVybWluYXRpb25SZXF1ZXN0PXtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVJlc3BvbmRlclRlcm1pbmF0aW9uUmVxdWVzdFxuICAgICAgICAgIH0+XG4gICAgICAgICAge3NjZW5lc31cbiAgICAgICAgPC9WaWV3PlxuICAgICAgICB7dGhpcy5fcmVuZGVyTmF2aWdhdGlvbkJhcigpfVxuICAgICAgPC9WaWV3PlxuICAgICk7XG4gIH0sXG5cbiAgX2dldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX25hdmlnYXRpb25Db250ZXh0KSB7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uQ29udGV4dCA9IG5ldyBOYXZpZ2F0aW9uQ29udGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvbkNvbnRleHQ7XG4gIH1cbn0pO1xuXG5OYXZpZ2F0b3IuaXNSZWFjdE5hdGl2ZUNvbXBvbmVudCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRvcjtcbiJdfQ==