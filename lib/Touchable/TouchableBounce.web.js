/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * @providesModule ReactTouchableBounce
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ReactAnimated = require('../Animated/Animated.web');

var _ReactAnimated2 = _interopRequireDefault(_ReactAnimated);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ReactTouchable = require('./Touchable');

var _reactMixin = require('react-mixin');

var _reactMixin2 = _interopRequireDefault(_reactMixin);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * When the scroll view is disabled, this defines how far your touch may move
 * off of the button, before deactivating the button. Once deactivated, try
 * moving it back and you'll see that the button is once again reactivated!
 * Move it back and forth several times while the scroll view is disabled.
 */
var PRESS_RECT_OFFSET = { top: 20, left: 20, right: 20, bottom: 30 };
/**
 * Example of using the `TouchableMixin` to play well with other responder
 * locking views including `ScrollView`. `TouchableMixin` provides touchable
 * hooks (`this.touchableHandle*`) that we forward events to. In turn,
 * `TouchableMixin` expects us to implement some abstract methods to handle
 * interesting interactions such as `handleTouchablePress`.
 */

var TouchableBounce = function (_Component) {
  _inherits(TouchableBounce, _Component);

  function TouchableBounce() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, TouchableBounce);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(TouchableBounce)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = _extends({}, _this.touchableGetInitialState(), {
      scale: new _ReactAnimated2.default.Value(1)
    }), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(TouchableBounce, [{
    key: 'bounceTo',
    value: function bounceTo(value, velocity, bounciness, callback) {
      _ReactAnimated2.default.spring(this.state.scale, {
        toValue: value,
        velocity: velocity,
        bounciness: bounciness
      }).start(callback);
    }

    /**
     * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
     * defined on your component.
     */

  }, {
    key: 'touchableHandleActivePressIn',
    value: function touchableHandleActivePressIn(e) {
      this.bounceTo(0.93, 0.1, 0);
      this.props.onPressIn && this.props.onPressIn(e);
    }
  }, {
    key: 'touchableHandleActivePressOut',
    value: function touchableHandleActivePressOut(e) {
      this.bounceTo(1, 0.4, 0);
      this.props.onPressOut && this.props.onPressOut(e);
    }
  }, {
    key: 'touchableHandlePress',
    value: function touchableHandlePress(e) {
      var _this2 = this;

      var onPressWithCompletion = this.props.onPressWithCompletion;
      if (onPressWithCompletion) {
        onPressWithCompletion(function () {
          _this2.state.scale.setValue(0.93);
          _this2.bounceTo(1, 10, 10, _this2.props.onPressAnimationComplete);
        });
        return;
      }

      this.bounceTo(1, 10, 10, this.props.onPressAnimationComplete);
      this.props.onPress && this.props.onPress(e);
    }
  }, {
    key: 'touchableGetPressRectOffset',
    value: function touchableGetPressRectOffset() {
      return PRESS_RECT_OFFSET; // Always make sure to predeclare a constant!
    }
  }, {
    key: 'touchableGetHighlightDelayMS',
    value: function touchableGetHighlightDelayMS() {
      return 0;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _ReactAnimated2.default.View,
        {
          style: [{ transform: [{ scale: this.state.scale }] }, this.props.style],
          accessible: true,
          testID: this.props.testID,
          onStartShouldSetResponder: this.touchableHandleStartShouldSetResponder,
          onResponderTerminationRequest: this.touchableHandleResponderTerminationRequest,
          onResponderGrant: this.touchableHandleResponderGrant,
          onResponderMove: this.touchableHandleResponderMove,
          onResponderRelease: this.touchableHandleResponderRelease,
          onResponderTerminate: this.touchableHandleResponderTerminate },
        this.props.children
      );
    }
  }]);

  return TouchableBounce;
}(_react.Component);

TouchableBounce.propTypes = {
  onPress: _react2.default.PropTypes.func,
  onPressIn: _react2.default.PropTypes.func,
  onPressOut: _react2.default.PropTypes.func,
  // The function passed takes a callback to start the animation which should
  // be run after this onPress handler is done. You can use this (for example)
  // to update UI before starting the animation.
  onPressWithCompletion: _react2.default.PropTypes.func,
  // the function passed is called after the animation is complete
  onPressAnimationComplete: _react2.default.PropTypes.func
};
;

_reactMixin2.default.onClass(TouchableBounce, _ReactTouchable.Mixin);
(0, _autobindDecorator2.default)(TouchableBounce);

module.exports = TouchableBounce;