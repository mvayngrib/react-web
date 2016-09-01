/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * @providesModule ReactTouchableHighlight
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ReactView = require('../View/View.web');

var _ReactView2 = _interopRequireDefault(_ReactView);

var _reactTimerMixin = require('react-timer-mixin');

var _reactTimerMixin2 = _interopRequireDefault(_reactTimerMixin);

var _ReactTouchableWithoutFeedback = require('./TouchableWithoutFeedback.web');

var _ReactTouchableWithoutFeedback2 = _interopRequireDefault(_ReactTouchableWithoutFeedback);

var _ReactTouchable = require('./Touchable');

var _NativeMethodsMixin = require('../Utilties/NativeMethodsMixin.web');

var _ReactStyleSheet = require('../StyleSheet/StyleSheet.web');

var _ReactStyleSheet2 = _interopRequireDefault(_ReactStyleSheet);

var _reactMixin = require('react-mixin');

var _reactMixin2 = _interopRequireDefault(_reactMixin);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_PROPS = {
  activeOpacity: 0.8,
  underlayColor: 'black',
  style: {
    cursor: 'pointer'
  }
};

var PRESS_RECT_OFFSET = { top: 20, left: 20, right: 20, bottom: 30 };
var CHILD_REF = 'childRef';
var UNDERLAY_REF = 'underlayRef';
var INACTIVE_CHILD_PROPS = {
  style: _ReactStyleSheet2.default.create({ x: { opacity: 1.0 } }).x
};
var INACTIVE_UNDERLAY_PROPS = {
  style: _ReactStyleSheet2.default.create({ x: { backgroundColor: 'transparent' } }).x
};

var TouchableHighlight = function (_Component) {
  _inherits(TouchableHighlight, _Component);

  function TouchableHighlight() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, TouchableHighlight);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(TouchableHighlight)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = _extends({}, _this.touchableGetInitialState(), _this.computeSyntheticState(_this.props)), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(TouchableHighlight, [{
    key: 'computeSyntheticState',


    // Performance optimization to avoid constantly re-generating these objects.
    value: function computeSyntheticState(props) {
      return {
        activeProps: {
          style: {
            opacity: props.activeOpacity
          }
        },
        activeUnderlayProps: {
          style: {
            backgroundColor: props.underlayColor
          }
        },
        underlayStyle: [INACTIVE_UNDERLAY_PROPS.style, props.style]
      };
    }

    // componentDidMount() {
    //   // ensurePositiveDelayProps(this.props);
    //   // ensureComponentIsNative(this.refs[CHILD_REF]);
    // },

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // ensureComponentIsNative(this.refs[CHILD_REF]);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // ensurePositiveDelayProps(nextProps);
      if (nextProps.activeOpacity !== this.props.activeOpacity || nextProps.underlayColor !== this.props.underlayColor || nextProps.style !== this.props.style) {
        this.setState(this.computeSyntheticState(nextProps));
      }
    }

    /**
     * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
     * defined on your component.
     */

  }, {
    key: 'touchableHandleActivePressIn',
    value: function touchableHandleActivePressIn(e) {
      this.clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
      this._showUnderlay();
      this.props.onPressIn && this.props.onPressIn(e);
    }
  }, {
    key: 'touchableHandleActivePressOut',
    value: function touchableHandleActivePressOut(e) {
      if (!this._hideTimeout) {
        this._hideUnderlay();
      }
      this.props.onPressOut && this.props.onPressOut(e);
    }
  }, {
    key: 'touchableHandlePress',
    value: function touchableHandlePress(e) {
      this.clearTimeout(this._hideTimeout);
      this._showUnderlay();
      this._hideTimeout = this.setTimeout(this._hideUnderlay, this.props.delayPressOut || 100);

      var touchBank = e.touchHistory.touchBank[e.touchHistory.indexOfSingleActiveTouch];
      if (touchBank) {
        var offset = Math.sqrt(Math.pow(touchBank.startPageX - touchBank.currentPageX, 2) + Math.pow(touchBank.startPageY - touchBank.currentPageY, 2));
        var velocity = offset / (touchBank.currentTimeStamp - touchBank.startTimeStamp) * 1000;
        if (velocity < 100) this.props.onPress && this.props.onPress(e);
      } else {
        this.props.onPress && this.props.onPress(e);
      }
    }
  }, {
    key: 'touchableHandleLongPress',
    value: function touchableHandleLongPress(e) {
      this.props.onLongPress && this.props.onLongPress(e);
    }
  }, {
    key: 'touchableGetPressRectOffset',
    value: function touchableGetPressRectOffset() {
      return PRESS_RECT_OFFSET; // Always make sure to predeclare a constant!
    }
  }, {
    key: 'touchableGetHighlightDelayMS',
    value: function touchableGetHighlightDelayMS() {
      return this.props.delayPressIn;
    }
  }, {
    key: 'touchableGetLongPressDelayMS',
    value: function touchableGetLongPressDelayMS() {
      return this.props.delayLongPress;
    }
  }, {
    key: 'touchableGetPressOutDelayMS',
    value: function touchableGetPressOutDelayMS() {
      return this.props.delayPressOut;
    }
  }, {
    key: '_showUnderlay',
    value: function _showUnderlay() {
      // if (!this.isMounted()) {
      //   return;
      // }

      this.refs[UNDERLAY_REF].setNativeProps(this.state.activeUnderlayProps);
      this.refs[CHILD_REF].setNativeProps(this.state.activeProps);
      this.props.onShowUnderlay && this.props.onShowUnderlay();
    }
  }, {
    key: '_hideUnderlay',
    value: function _hideUnderlay() {
      this.clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
      if (this.refs[UNDERLAY_REF]) {
        this.refs[CHILD_REF].setNativeProps(INACTIVE_CHILD_PROPS);
        this.refs[UNDERLAY_REF].setNativeProps(_extends({}, INACTIVE_UNDERLAY_PROPS, {
          style: this.state.underlayStyle
        }));
        this.props.onHideUnderlay && this.props.onHideUnderlay();
      }
    }
  }, {
    key: 'render',
    value: function render() {

      return _react2.default.createElement(
        _ReactView2.default,
        {
          accessible: true,
          accessibilityComponentType: this.props.accessibilityComponentType,
          accessibilityTraits: this.props.accessibilityTraits,
          ref: UNDERLAY_REF,
          style: this.state.underlayStyle,
          onLayout: this.props.onLayout,
          onStartShouldSetResponder: this.touchableHandleStartShouldSetResponder,
          onResponderTerminationRequest: this.touchableHandleResponderTerminationRequest,
          onResponderGrant: this.touchableHandleResponderGrant,
          onResponderMove: this.touchableHandleResponderMove,
          onResponderRelease: this.touchableHandleResponderRelease,
          onResponderTerminate: this.touchableHandleResponderTerminate,
          testID: this.props.testID },
        _react2.default.cloneElement(_react2.default.Children.only(this.props.children), {
          ref: CHILD_REF
        })
      );
    }
  }]);

  return TouchableHighlight;
}(_react.Component);

TouchableHighlight.propTypes = _extends({}, _ReactTouchableWithoutFeedback2.default.propTypes, {
  /**
   * Determines what the opacity of the wrapped view should be when touch is
   * active.
   */
  activeOpacity: _react2.default.PropTypes.number,
  /**
   * The color of the underlay that will show through when the touch is
   * active.
   */
  underlayColor: _react2.default.PropTypes.string,
  /**
   * Called immediately after the underlay is shown
   */
  onShowUnderlay: _react2.default.PropTypes.func,
  /**
   * Called immediately after the underlay is hidden
   */
  onHideUnderlay: _react2.default.PropTypes.func
});
TouchableHighlight.defaultProps = DEFAULT_PROPS;
;

_reactMixin2.default.onClass(TouchableHighlight, _reactTimerMixin2.default);
_reactMixin2.default.onClass(TouchableHighlight, _ReactTouchable.Mixin);
_reactMixin2.default.onClass(TouchableHighlight, _NativeMethodsMixin.Mixin);
(0, _autobindDecorator2.default)(TouchableHighlight);

module.exports = TouchableHighlight;