/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 */
'use strict';

var _EventPluginRegistry = require('react/lib/EventPluginRegistry');

var _EventPluginRegistry2 = _interopRequireDefault(_EventPluginRegistry);

var _ResponderEventPlugin = require('react/lib/ResponderEventPlugin');

var _ResponderEventPlugin2 = _interopRequireDefault(_ResponderEventPlugin);

var _EventConstants = require('react/lib/EventConstants');

var _EventConstants2 = _interopRequireDefault(_EventConstants);

var _ResponderTouchHistoryStore = require('react/lib/ResponderTouchHistoryStore');

var _ResponderTouchHistoryStore2 = _interopRequireDefault(_ResponderTouchHistoryStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var topLevelTypes = _EventConstants2.default.topLevelTypes;

var eventTypes = _ResponderEventPlugin2.default.eventTypes;
eventTypes.startShouldSetResponder.dependencies = [topLevelTypes.topTouchStart];

eventTypes.scrollShouldSetResponder.dependencies = [topLevelTypes.topScroll];

eventTypes.selectionChangeShouldSetResponder.dependencies = [topLevelTypes.topSelectionChange];

eventTypes.moveShouldSetResponder.dependencies = [topLevelTypes.topTouchMove];

['responderStart', 'responderMove', 'responderEnd', 'responderRelease', 'responderTerminationRequest', 'responderGrant', 'responderReject', 'responderTerminate'].forEach(function (type) {
  var dependencies = void 0;
  if ('ontouchstart' in window) {
    dependencies = [topLevelTypes.topTouchStart, topLevelTypes.topTouchCancel, topLevelTypes.topTouchEnd, topLevelTypes.topTouchMove];
  } else {
    // TODO: support move event
    dependencies = [topLevelTypes.topMouseDown, topLevelTypes.topMouseUp];
  }

  eventTypes[type].dependencies = dependencies;
});

function toArray(collection) {
  return collection && Array.prototype.slice.call(collection) || [];
}

function fixIdentifier(identifier) {
  // Safari identifier is a large number
  if (identifier > 20) {
    return identifier % 20;
  }

  return identifier;
}

var normalizeTouches = function normalizeTouches(touches, nativeEvent) {
  var timestamp = nativeEvent.timestamp || nativeEvent.timeStamp;

  return toArray(touches).map(function (touch) {
    // Cloned touch
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      force: touch.force,
      pageX: touch.pageX,
      pageY: touch.pageY,
      radiusX: touch.radiusX,
      radiusY: touch.radiusY,
      rotationAngle: touch.rotationAngle,
      screenX: touch.screenX,
      screenY: touch.screenY,
      target: touch.target,
      timestamp: timestamp,
      identifier: fixIdentifier(touch.identifier)
    };
  });
};

var originRecordTouchTrack = _ResponderTouchHistoryStore2.default.recordTouchTrack;
_ResponderTouchHistoryStore2.default.recordTouchTrack = function (topLevelType, nativeEvent) {

  originRecordTouchTrack.call(_ResponderTouchHistoryStore2.default, topLevelType, {
    changedTouches: normalizeTouches(nativeEvent.changedTouches, nativeEvent),
    touches: normalizeTouches(nativeEvent.touches, nativeEvent)
  });
};

_EventPluginRegistry2.default.injectEventPluginsByName({
  ResponderEventPlugin: _ResponderEventPlugin2.default
});