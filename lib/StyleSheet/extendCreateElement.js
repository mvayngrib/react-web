/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function extendCreateElement(React, processor) {
  var originalCreateElement = React.createElement;
  React.createElement = function (type, props) {
    var args = arguments;

    if (props && props.style && (Array.isArray(props.style) || _typeof(props.style) === 'object') && type.isReactNativeComponent
    // (type.isReactNativeComponent || (type.prototype && type.prototype.setNativeProps))
    ) {
        var style = processor(props.style);
        // should copy it, props is read only
        var target = {};
        for (var key in props) {
          if (Object.prototype.hasOwnProperty.call(props, key)) {
            target[key] = props[key];
          }
        }
        target.style = style;
        props = target;
      }

    return originalCreateElement.apply(this, [type, props].concat(Array.prototype.slice.call(args, 2)));
  };
}

module.exports = extendCreateElement;