/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * @providesModule ReactScrollView
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ReactScrollResponder = require('../ListView/ScrollResponder.web');

var _ReactScrollResponder2 = _interopRequireDefault(_ReactScrollResponder);

var _ReactStyleSheet = require('../StyleSheet/StyleSheet.web');

var _ReactStyleSheet2 = _interopRequireDefault(_ReactStyleSheet);

var _ReactView = require('../View/View.web');

var _ReactView2 = _interopRequireDefault(_ReactView);

var _throttle = require('domkit/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _reactMixin = require('react-mixin');

var _reactMixin2 = _interopRequireDefault(_reactMixin);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCROLLVIEW = 'ScrollView';
var INNERVIEW = 'InnerScrollView';
var CONTENT_EXT_STYLE = ['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'];

/**
 * Component that wraps platform ScrollView while providing
 * integration with touch locking "responder" system.
 *
 * Keep in mind that ScrollViews must have a bounded height in order to work,
 * since they contain unbounded-height children into a bounded container (via
 * a scroll interaction). In order to bound the height of a ScrollView, either
 * set the height of the view directly (discouraged) or make sure all parent
 * views have bounded height. Forgetting to transfer `{flex: 1}` down the
 * view stack can lead to errors here, which the element inspector makes
 * easy to debug.
 *
 * Doesn't yet support other contained responders from blocking this scroll
 * view from becoming the responder.
 */

var ScrollView = function (_Component) {
  _inherits(ScrollView, _Component);

  function ScrollView() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, ScrollView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ScrollView)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = _this.scrollResponderMixinGetInitialState(), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ScrollView, [{
    key: 'getScrollResponder',


    /**
     * Returns a reference to the underlying scroll responder, which supports
     * operations like `scrollTo`. All ScrollView-like components should
     * implement this method so that they can be composed while providing access
     * to the underlying scroll responder's methods.
     */
    value: function getScrollResponder() {
      return this;
    }
  }, {
    key: 'getInnerViewNode',
    value: function getInnerViewNode() {
      return this.refs[INNERVIEW];
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(destY, destX) {
      // $FlowFixMe - Don't know how to pass Mixin correctly. Postpone for now
      // this.getScrollResponder().scrollResponderScrollTo(destX || 0, destY || 0);
      this.scrollWithoutAnimationTo(destY, destX);
    }
  }, {
    key: 'scrollWithoutAnimationTo',
    value: function scrollWithoutAnimationTo(destY, destX) {
      // $FlowFixMe - Don't know how to pass Mixin correctly. Postpone for now
      // this.getScrollResponder().scrollResponderScrollWithouthAnimationTo(
      //   destX || 0,
      //   destY || 0,
      // );

      var scrollView = _reactDom2.default.findDOMNode(this.refs[SCROLLVIEW]);
      scrollView.scrollTop = destY || 0;
      scrollView.scrollLeft = destX || 0;
    }
  }, {
    key: 'handleScroll',
    value: function handleScroll(e) {
      // if (__DEV__) {
      //   if (this.props.onScroll && !this.props.scrollEventThrottle) {
      //     console.log(
      //       'You specified `onScroll` on a <ScrollView> but not ' +
      //       '`scrollEventThrottle`. You will only receive one event. ' +
      //       'Using `16` you get all the events but be aware that it may ' +
      //       'cause frame drops, use a bigger number if you don\'t need as ' +
      //       'much precision.'
      //     );
      //   }
      // }
      // if (Platform.OS === 'android') {
      //   if (this.props.keyboardDismissMode === 'on-drag') {
      //     dismissKeyboard();
      //   }
      // }

      this.props.onScroll && this.props.onScroll(e);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var style = _props.style;

      var otherProps = _objectWithoutProperties(_props, ['style']);

      var contentContainerExtStyle = {};

      if (style) {
        for (var i = 0; i < CONTENT_EXT_STYLE.length; i++) {
          if (typeof style[CONTENT_EXT_STYLE[i]] === 'number') {
            contentContainerExtStyle[CONTENT_EXT_STYLE[i]] = style[CONTENT_EXT_STYLE[i]];
          }
        }
      }

      var contentContainerStyle = [styles.contentContainer, this.props.horizontal && styles.contentContainerHorizontal, this.props.contentContainerStyle, contentContainerExtStyle];
      // if (__DEV__ && this.props.style) {
      //   let style = flattenStyle(this.props.style);
      //   let childLayoutProps = ['alignItems', 'justifyContent']
      //     .filter((prop) => style && style[prop] !== undefined);
      //   invariant(
      //     childLayoutProps.length === 0,
      //     'ScrollView child layout (' + JSON.stringify(childLayoutProps) +
      //       ') must by applied through the contentContainerStyle prop.'
      //   );
      // }

      var contentContainer = _react2.default.createElement(
        _ReactView2.default,
        {
          ref: INNERVIEW,
          style: contentContainerStyle,
          removeClippedSubviews: this.props.removeClippedSubviews,
          collapsable: false },
        this.props.children
      );

      var alwaysBounceHorizontal = this.props.alwaysBounceHorizontal !== undefined ? this.props.alwaysBounceHorizontal : this.props.horizontal;

      var alwaysBounceVertical = this.props.alwaysBounceVertical !== undefined ? this.props.alwaysBounceVertical : !this.props.horizontal;

      var handleScroll = function handleScroll() {};
      if (this.props.scrollEventThrottle && this.props.onScroll) {
        handleScroll = (0, _throttle2.default)(this.handleScroll, this.props.scrollEventThrottle);
      }

      var props = _extends({}, otherProps, {
        alwaysBounceHorizontal: alwaysBounceHorizontal,
        alwaysBounceVertical: alwaysBounceVertical,
        style: [styles.base, this.props.style],
        onTouchStart: this.scrollResponderHandleTouchStart,
        onTouchMove: this.scrollResponderHandleTouchMove,
        onTouchEnd: this.scrollResponderHandleTouchEnd,
        onScrollBeginDrag: this.scrollResponderHandleScrollBeginDrag,
        onScrollEndDrag: this.scrollResponderHandleScrollEndDrag,
        onMomentumScrollBegin: this.scrollResponderHandleMomentumScrollBegin,
        onMomentumScrollEnd: this.scrollResponderHandleMomentumScrollEnd,
        onStartShouldSetResponder: this.scrollResponderHandleStartShouldSetResponder,
        onStartShouldSetResponderCapture: this.scrollResponderHandleStartShouldSetResponderCapture,
        // onScrollShouldSetResponder: this.scrollResponderHandleScrollShouldSetResponder,
        // onScroll: handleScroll,
        onScrollShouldSetResponder: handleScroll,
        // replace onScroll in the props
        onScroll: function onScroll() {},
        onResponderGrant: this.scrollResponderHandleResponderGrant,
        onResponderTerminationRequest: this.scrollResponderHandleTerminationRequest,
        onResponderTerminate: this.scrollResponderHandleTerminate,
        onResponderRelease: this.scrollResponderHandleResponderRelease,
        onResponderReject: this.scrollResponderHandleResponderReject
      });

      return _react2.default.createElement(
        _ReactView2.default,
        _extends({}, props, { ref: SCROLLVIEW }),
        contentContainer
      );
    }
  }]);

  return ScrollView;
}(_react.Component);

;

var styles = _ReactStyleSheet2.default.create({
  base: {
    overflow: 'scroll',
    WebkitOverflowScrolling: 'touch',
    flex: 1
  },
  contentContainer: {
    position: 'absolute',
    minWidth: '100%'
  },
  contentContainerHorizontal: {
    alignSelf: 'flex-start',
    flexDirection: 'row'
  }
});

_reactMixin2.default.onClass(ScrollView, _ReactScrollResponder2.default.Mixin);
(0, _autobindDecorator2.default)(ScrollView);

ScrollView.isReactNativeComponent = true;

exports.default = ScrollView;