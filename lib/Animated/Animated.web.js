/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * @providesModule ReactAnimated
 * 
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _animated = require('animated');

var _animated2 = _interopRequireDefault(_animated);

var _CSSPropertyOperations = require('react/lib/CSSPropertyOperations');

var _CSSPropertyOperations2 = _interopRequireDefault(_CSSPropertyOperations);

var _ReactFlattenStyle = require('../StyleSheet/flattenStyle.web');

var _ReactFlattenStyle2 = _interopRequireDefault(_ReactFlattenStyle);

var _ReactImage = require('../Image/Image.web');

var _ReactImage2 = _interopRequireDefault(_ReactImage);

var _ReactText = require('../Text/Text.web');

var _ReactText2 = _interopRequireDefault(_ReactText);

var _ReactView = require('../View/View.web');

var _ReactView2 = _interopRequireDefault(_ReactView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// { scale: 2 } => 'scale(2)'
function mapTransform(t) {
  var k = Object.keys(t)[0];
  return k + '(' + t[k] + ')';
}

// NOTE(lmr):
// Since this is a hot code path, right now this is mutative...
// As far as I can tell, this shouldn't cause any unexpected behavior.
function mapStyle(style) {
  if (style && style.transform && typeof style.transform !== 'string') {
    // TODO(lmr): this doesn't attempt to use vendor prefixed styles
    style.transform = style.transform.map(mapTransform).join(' ');
  }
  return style;
}

function ApplyAnimatedValues(instance, props) {
  if (instance.setNativeProps) {
    instance.setNativeProps(props);
  } else if (instance.nodeType && instance.setAttribute !== undefined) {
    _CSSPropertyOperations2.default.setValueForStyles(instance, mapStyle(props.style));
  } else {
    return false;
  }
}

/* eslint-disable */
_animated2.default.inject.ApplyAnimatedValues(ApplyAnimatedValues);
_animated2.default.inject.FlattenStyle(_ReactFlattenStyle2.default);
/* eslint-enable */

exports.default = _extends({}, _animated2.default, {
  View: _animated2.default.createAnimatedComponent(_ReactView2.default),
  Text: _animated2.default.createAnimatedComponent(_ReactText2.default),
  Image: _animated2.default.createAnimatedComponent(_ReactImage2.default)
});