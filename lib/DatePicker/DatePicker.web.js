/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * @providesModule ReactDatePicker
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convert a Date to a timestamp.
 */
function _toMillis(options, key) {
  var dateVal = options[key];
  // Is it a Date object?
  if ((typeof dateVal === 'undefined' ? 'undefined' : _typeof(dateVal)) === 'object' && typeof dateVal.getMonth === 'function') {
    options[key] = dateVal.getTime();
  }
}

/**
 * Opens the standard Android date picker dialog.
 *
 * ### Example
 *
 * ```
 * try {
 *   const {action, year, month, day} = await DatePickerAndroid.open({
 *     // Use `new Date()` for current date.
 *     // May 25 2020. Month 0 is January.
 *     date: new Date(2020, 4, 25)
 *   });
 *   if (action !== DatePickerAndroid.dismissedAction) {
 *     // Selected year, month (0-11), day
 *   }
 * } catch ({code, message}) {
 *   console.warn('Cannot open date picker', message);
 * }
 * ```
 */

var DatePicker = function () {
  function DatePicker() {
    _classCallCheck(this, DatePicker);
  }

  _createClass(DatePicker, null, [{
    key: 'open',

    /**
     * Opens the standard Android date picker dialog.
     *
     * The available keys for the `options` object are:
     *   * `date` (`Date` object or timestamp in milliseconds) - date to show by default
     *   * `minDate` (`Date` or timestamp in milliseconds) - minimum date that can be selected
     *   * `maxDate` (`Date` object or timestamp in milliseconds) - minimum date that can be selected
     *
     * Returns a Promise which will be invoked an object containing `action`, `year`, `month` (0-11),
     * `day` if the user picked a date. If the user dismissed the dialog, the Promise will
     * still be resolved with action being `DatePickerAndroid.dismissedAction` and all the other keys
     * being undefined. **Always** check whether the `action` before reading the values.
     *
     * Note the native date picker dialog has some UI glitches on Android 4 and lower
     * when using the `minDate` and `maxDate` options.
     */
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(options) {
        var optionsMs;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                optionsMs = options;

                if (optionsMs) {
                  _toMillis(options, 'date');
                  _toMillis(options, 'minDate');
                  _toMillis(options, 'maxDate');
                }
                // TODO

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function open(_x) {
        return _ref.apply(this, arguments);
      }

      return open;
    }()

    /**
     * A date has been selected.
     */

  }, {
    key: 'dateSetAction',
    get: function get() {
      return 'dateSetAction';
    }
    /**
     * The dialog has been dismissed.
     */

  }, {
    key: 'dismissedAction',
    get: function get() {
      return 'dismissedAction';
    }
  }]);

  return DatePicker;
}();

exports.default = DatePicker;