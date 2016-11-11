/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 */
'use strict';

import getVendorPropertyName from 'domkit/getVendorPropertyName';
import CSSProperty from 'CSSProperty';

var shorthandProperties = {
  margin: true,
  padding: true,
  borderWidth: true,
  borderRadius: true,
};

// some number that react not auto add px
var numberProperties = {
  lineHeight: true
};

var boxProperties = {
  paddingHorizontal: true,
  paddingVertical: true,
  marginHorizontal: true,
  marginVertical: true,
};

var borderProperties = {
  borderColor: true,
  borderWidth: true,
  borderTopColor: true,
  borderRightColor: true,
  borderBottomColor: true,
  borderLeftColor: true,
  borderTopWidth: true,
  borderRightWidth: true,
  borderBottomWidth: true,
  borderLeftWidth: true,
};

// prefix 2009 spec
var flexboxProperties = {
  flex: 'WebkitBoxFlex',
  order: 'WebkitBoxOrdinalGroup',
  // https://github.com/postcss/autoprefixer/blob/master/lib/hacks/flex-direction.coffee
  flexDirection: 'WebkitBoxOrient',
  // https://github.com/postcss/autoprefixer/blob/master/lib/hacks/align-items.coffee
  alignItems: 'WebkitBoxAlign',
  // https://github.com/postcss/autoprefixer/blob/master/lib/hacks/justify-content.coffee
  justifyContent: 'WebkitBoxPack',
  flexWrap: null,
  alignSelf: null,
};

var oldFlexboxValues = {
  'flex-end': 'end',
  'flex-start': 'start',
  'space-between': 'justify',
  'space-around': 'distribute',
};

var builtinStyle = document.createElement('div').style;
var flexboxSpec;
if ('alignSelf' in builtinStyle) flexboxSpec = 'final';
else if ('webkitAlignSelf' in builtinStyle) flexboxSpec = 'finalVendor';
else flexboxSpec = '2009';

// FIXME: UCBrowser is cheat
const isUCBrowser = /UCBrowser/i.test(navigator.userAgent);
if (isUCBrowser) flexboxSpec = '2009';

const isIE = /Trident/i.test(navigator.userAgent);
const isSafari =
  navigator.userAgent.indexOf('Safari') !== -1 &&
  navigator.userAgent.indexOf('Chrome') === -1

const FLEX_AUTO = '1 1 auto'
const FLEX_INITIAL = '0 1 auto'
const DEFAULT_BASIS = isIE || isSafari ? 'auto' : '0%'
const DEFAULT_SHRINK = isSafari ? '0' : '1'

// TODO: cache the result
function prefixOldFlexbox(property, value, result) {

  if (flexboxSpec === '2009') {
    var oldValue = oldFlexboxValues[value] || value;
    var oldProperty = flexboxProperties[property] || property;
    if (oldProperty === 'WebkitBoxOrient') {
      // boxOrient
      if (value.indexOf('row') != -1) {
        oldValue = 'horizontal';
      } else {
        oldValue = 'vertical';
      }
      // boxDirection
      var dir = '';
      if (value.indexOf('reverse') != -1) {
        dir = 'reverse';
      } else {
        dir = 'normal';
      }
      result.WebkitBoxDirection = dir;
    }
    return result[oldProperty] = oldValue;

  } else if (flexboxSpec === 'finalVendor') {
    return result[getVendorPropertyName(property)] = value;

  } else {
    return result[property] = value;

  }
}

// https://github.com/philipwalton/flexbugs
//     Declaration           What it should mean     What it means in IE 10
// 1.  (no flex declaration) flex: 0 1 auto          flex: 0 0 auto
// 2.  flex: 1               flex: 1 1 0%            flex: 1 0 0px
// 3.  flex: auto            flex: 1 1 auto          flex: 1 0 auto
// 4.  flex: initial         flex: 0 1 auto          flex: 0 0 auto

function getFlexExpansion (style) {
  // https://roland.codes/blog/ie-flex-collapse-bug/
  const flex = style.flex
  if (flex == null) {
    if (style.flexGrow == null && style.flexShrink == null && style.flexBasis == null) {
      return FLEX_INITIAL
    }

    // ^ line 1
    const grow = style.flexGrow || '0'
    const shrink = style.flexShrink || DEFAULT_SHRINK
    const basis = style.flexBasis || DEFAULT_BASIS
    return `${grow} ${shrink} ${basis}`
  }

  // ^ line 2
  // if flex is a number or a stringified number
  if (!isNaN(flex)) {
    return `${flex} ${DEFAULT_SHRINK} ${DEFAULT_BASIS}`
  }

  // ^ lines 3, 4
  if (flex === 'auto') {
    return FLEX_AUTO
  } else if (flex === 'initial') {
    return FLEX_INITIAL
  }

  result.flex = flex;
}

function extendBoxProperties(property, value, result) {
  var padding = 'padding';
  var margin = 'margin';
  var horizontal = 'Horizontal';
  var vertical = 'Vertical';
  var type = property.indexOf(margin) == 0 ? margin : padding;
  var directionType = property.indexOf(vertical) !== -1 ? vertical : horizontal;

  if (directionType == horizontal) {
    result[type + 'Left'] = result[type + 'Right'] = value;
  } else if (directionType == vertical) {
    result[type + 'Top'] = result[type + 'Bottom'] = value;
  }
}

function isValidValue(value) {
  return value !== '' && value !== null && value !== undefined;
}

function processValueForProp(value, prop) {

  if (typeof value == 'number') {
    // transform less then 1px value to 1px, 0.5 to be 1
    if (!CSSProperty.isUnitlessNumber[prop] && value > 0 && value < 1) {
      value = 1;
    }

    // Add px to numeric values
    if (numberProperties[prop] && typeof value == 'number') {
      value += 'px';
    }
  }

  // [
  //   {scaleX: 2},
  //   {scaleY: 2}
  // ] => scaleX(2) scaleY(2)

  if (shorthandProperties[prop] && typeof value == 'string') {
    value = value.replace(/\d*\.?\d+(rem|em|in|cm|mm|pt|pc|px|vh|vw|vmin|vmax|%)*/g, function(val, unit) {
      return unit ? val : val + 'px';
    });
  }

  return value;
}

function defaultBorderStyle(style, result) {
  if (!style.borderStyle && !result.borderStyle) {
    result.borderStyle = 'solid';
  }

  if (!style.borderWidth && !result.borderWidth) {
    result.borderWidth = 0;
  }

  if (!style.borderColor && !result.borderColor) {
    result.borderColor = 'black';
  }
}

function extendProperties(style) {
  var result = {};

  for (var property in style) {
    var value = style[property];
    if (!isValidValue(value)) {
      continue;
    }
    // set a default border style if there has border about property
    if (borderProperties[property]) {
      defaultBorderStyle(style, result);
    }

    if (boxProperties[property]) {
      extendBoxProperties(property, value, result);
    } else if (flexboxProperties[property]) {
      prefixOldFlexbox(property, value, result);
      // https://roland.codes/blog/ie-flex-collapse-bug/
      if (property === 'flex' && isIE) {
        defaultFlexExpansion(style, result);
      }
    } else {
      value = processValueForProp(value, property);
      property = getVendorPropertyName(property);
      result[property] = value;
    }
  }

  return result;
}

module.exports = extendProperties;
