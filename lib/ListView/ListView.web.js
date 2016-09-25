/**
 * Copyright (c) 2015-present, Alibaba Group Holding Limited.
 * All rights reserved.
 *
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * @providesModule ReactListView
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

var _ReactListViewDataSource = require('./ListViewDataSource.web');

var _ReactListViewDataSource2 = _interopRequireDefault(_ReactListViewDataSource);

var _ReactScrollView = require('../ScrollView/ScrollView.web');

var _ReactScrollView2 = _interopRequireDefault(_ReactScrollView);

var _ReactScrollResponder = require('./ScrollResponder.web');

var _ReactScrollResponder2 = _interopRequireDefault(_ReactScrollResponder);

var _ReactStaticRenderer = require('./StaticRenderer.web');

var _ReactStaticRenderer2 = _interopRequireDefault(_ReactStaticRenderer);

var _reactTimerMixin = require('react-timer-mixin');

var _reactTimerMixin2 = _interopRequireDefault(_reactTimerMixin);

var _reactMixin = require('react-mixin');

var _reactMixin2 = _interopRequireDefault(_reactMixin);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_PAGE_SIZE = 1;
var DEFAULT_INITIAL_ROWS = 10;
var DEFAULT_SCROLL_RENDER_AHEAD = 1000;
var DEFAULT_END_REACHED_THRESHOLD = 1000;
var DEFAULT_SCROLL_CALLBACK_THROTTLE = 50;
var SCROLLVIEW_REF = 'listviewscroll';

/**
 * ListView - A core component designed for efficient display of vertically
 * scrolling lists of changing data.  The minimal API is to create a
 * `ListView.DataSource`, populate it with a simple array of data blobs, and
 * instantiate a `ListView` component with that data source and a `renderRow`
 * callback which takes a blob from the data array and returns a renderable
 * component.
 *
 * Minimal example:
 *
 * ```
 * getInitialState: function() {
 *   let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
 *   return {
 *     dataSource: ds.cloneWithRows(['row 1', 'row 2']),
 *   };
 * },
 *
 * render: function() {
 *   return (
 *     <ListView
 *       dataSource={this.state.dataSource}
 *       renderRow={(rowData) => <Text>{rowData}</Text>}
 *     />
 *   );
 * },
 * ```
 *
 * ListView also supports more advanced features, including sections with sticky
 * section headers, header and footer support, callbacks on reaching the end of
 * the available data (`onEndReached`) and on the set of rows that are visible
 * in the device viewport change (`onChangeVisibleRows`), and several
 * performance optimizations.
 *
 * There are a few performance operations designed to make ListView scroll
 * smoothly while dynamically loading potentially very large (or conceptually
 * infinite) data sets:
 *
 *  * Only re-render changed rows - the rowHasChanged function provided to the
 *    data source tells the ListView if it needs to re-render a row because the
 *    source data has changed - see ListViewDataSource for more details.
 *
 *  * Rate-limited row rendering - By default, only one row is rendered per
 *    event-loop (customizable with the `pageSize` prop).  This breaks up the
 *    work into smaller chunks to reduce the chance of dropping frames while
 *    rendering rows.
 */

var ListView = function (_Component) {
  _inherits(ListView, _Component);

  function ListView() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ListView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ListView.__proto__ || Object.getPrototypeOf(ListView)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      curRenderedRowsCount: _this.props.initialListSize,
      highlightedRow: {}
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * You must provide a renderRow function. If you omit any of the other render
   * functions, ListView will simply skip rendering them.
   *
   * - renderRow(rowData, sectionID, rowID, highlightRow);
   * - renderSectionHeader(sectionData, sectionID);
   */


  /**
   * React life cycle hooks.
   */

  _createClass(ListView, [{
    key: 'getMetrics',


    /**
     * Exports some data, e.g. for perf investigations or analytics.
     */
    value: function getMetrics() {
      return {
        contentLength: this.scrollProperties.contentLength,
        totalRows: this.props.dataSource.getRowCount(),
        renderedRows: this.state.curRenderedRowsCount,
        visibleRows: Object.keys(this._visibleRows).length
      };
    }

    /**
     * Provides a handle to the underlying scroll responder.
     * Note that the view in `SCROLLVIEW_REF` may not be a `ScrollView`, so we
     * need to check that it responds to `getScrollResponder` before calling it.
     */

  }, {
    key: 'getScrollResponder',
    value: function getScrollResponder() {
      return this.refs[SCROLLVIEW_REF] && this.refs[SCROLLVIEW_REF].getScrollResponder && this.refs[SCROLLVIEW_REF].getScrollResponder();
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo() {
      var _refs$SCROLLVIEW_REF;

      this.refs[SCROLLVIEW_REF] && this.refs[SCROLLVIEW_REF].scrollTo && (_refs$SCROLLVIEW_REF = this.refs[SCROLLVIEW_REF]).scrollTo.apply(_refs$SCROLLVIEW_REF, arguments);
    }
  }, {
    key: 'setNativeProps',
    value: function setNativeProps(props) {
      this.refs[SCROLLVIEW_REF] && this.refs[SCROLLVIEW_REF].setNativeProps(props);
    }
  }, {
    key: 'getInnerViewNode',
    value: function getInnerViewNode() {
      return this.refs[SCROLLVIEW_REF].getInnerViewNode();
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      // this data should never trigger a render pass, so don't put in state
      this.scrollProperties = {
        visibleLength: null,
        contentLength: null,
        offset: 0
      };
      this._childFrames = [];
      this._visibleRows = {};
      this._prevRenderedRowsCount = 0;
      this._sentEndForContentLength = null;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      // do this in animation frame until componentDidMount actually runs after
      // the component is laid out
      this.requestAnimationFrame(function () {
        _this2._measureAndUpdateScrollProps();
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this3 = this;

      if (this.props.dataSource !== nextProps.dataSource || this.props.initialListSize !== nextProps.initialListSize) {
        this.setState(function (state, props) {
          _this3._prevRenderedRowsCount = 0;
          return {
            curRenderedRowsCount: Math.min(Math.max(state.curRenderedRowsCount, props.initialListSize), props.dataSource.getRowCount())
          };
        }, function () {
          return _this3._renderMoreRowsIfNeeded();
        });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _this4 = this;

      this.requestAnimationFrame(function () {
        _this4._measureAndUpdateScrollProps();
      });
    }
  }, {
    key: 'onRowHighlighted',
    value: function onRowHighlighted(sectionID, rowID) {
      this.setState({ highlightedRow: { sectionID: sectionID, rowID: rowID } });
    }
  }, {
    key: 'render',
    value: function render() {
      var bodyComponents = [];

      var dataSource = this.props.dataSource;
      var allRowIDs = dataSource.rowIdentities;
      var rowCount = 0;
      var sectionHeaderIndices = [];

      var header = this.props.renderHeader && this.props.renderHeader();
      var footer = this.props.renderFooter && this.props.renderFooter();
      var totalIndex = header ? 1 : 0;

      for (var sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
        var sectionID = dataSource.sectionIdentities[sectionIdx];
        var rowIDs = allRowIDs[sectionIdx];
        if (rowIDs.length === 0) {
          continue;
        }

        if (this.props.renderSectionHeader) {
          var shouldUpdateHeader = rowCount >= this._prevRenderedRowsCount && dataSource.sectionHeaderShouldUpdate(sectionIdx);
          bodyComponents.push(_react2.default.createElement(_ReactStaticRenderer2.default, {
            key: 's_' + sectionID,
            shouldUpdate: !!shouldUpdateHeader,
            render: this.props.renderSectionHeader.bind(null, dataSource.getSectionHeaderData(sectionIdx), sectionID)
          }));
          sectionHeaderIndices.push(totalIndex++);
        }

        for (var rowIdx = 0; rowIdx < rowIDs.length; rowIdx++) {
          var rowID = rowIDs[rowIdx];
          var comboID = sectionID + '_' + rowID;
          var shouldUpdateRow = rowCount >= this._prevRenderedRowsCount && dataSource.rowShouldUpdate(sectionIdx, rowIdx);
          var row = _react2.default.createElement(_ReactStaticRenderer2.default, {
            key: 'r_' + comboID,
            shouldUpdate: !!shouldUpdateRow,
            render: this.props.renderRow.bind(null, dataSource.getRowData(sectionIdx, rowIdx), sectionID, rowID, this.onRowHighlighted)
          });
          bodyComponents.push(row);
          totalIndex++;

          if (this.props.renderSeparator && (rowIdx !== rowIDs.length - 1 || sectionIdx === allRowIDs.length - 1)) {
            var adjacentRowHighlighted = this.state.highlightedRow.sectionID === sectionID && (this.state.highlightedRow.rowID === rowID || this.state.highlightedRow.rowID === rowIDs[rowIdx + 1]);
            var separator = this.props.renderSeparator(sectionID, rowID, adjacentRowHighlighted);
            if (separator) {
              bodyComponents.push(separator);
              totalIndex++;
            }
          }
          if (++rowCount === this.state.curRenderedRowsCount) {
            break;
          }
        }
        if (rowCount >= this.state.curRenderedRowsCount) {
          break;
        }
      }

      var _props = this.props;
      var renderScrollComponent = _props.renderScrollComponent;

      var props = _objectWithoutProperties(_props, ['renderScrollComponent']);

      if (!props.scrollEventThrottle) {
        props.scrollEventThrottle = DEFAULT_SCROLL_CALLBACK_THROTTLE;
      }
      if (props.removeClippedSubviews === undefined) {
        props.removeClippedSubviews = true;
      }
      (0, _objectAssign2.default)(props, {
        onScroll: this._onScroll,
        stickyHeaderIndices: this.props.stickyHeaderIndices.concat(sectionHeaderIndices),

        // Do not pass these events downstream to ScrollView since they will be
        // registered in ListView's own ScrollResponder.Mixin
        onKeyboardWillShow: undefined,
        onKeyboardWillHide: undefined,
        onKeyboardDidShow: undefined,
        onKeyboardDidHide: undefined
      });

      // TODO(ide): Use function refs so we can compose with the scroll
      // component's original ref instead of clobbering it
      return _react2.default.cloneElement(renderScrollComponent(props), {
        ref: SCROLLVIEW_REF,
        onContentSizeChange: this._onContentSizeChange,
        onLayout: this._onLayout
      }, header, bodyComponents, footer);
    }

    /**
     * Private methods
     */

  }, {
    key: '_measureAndUpdateScrollProps',
    value: function _measureAndUpdateScrollProps() {
      var scrollComponent = this.getScrollResponder();
      if (!scrollComponent || !scrollComponent.getInnerViewNode) {
        return;
      }

      // RCTScrollViewManager.calculateChildFrames is not available on
      // every platform
      // RCTScrollViewManager && RCTScrollViewManager.calculateChildFrames &&
      //   RCTScrollViewManager.calculateChildFrames(
      //     React.findNodeHandle(scrollComponent),
      //     this._updateVisibleRows,
      //   );
    }
  }, {
    key: '_onContentSizeChange',
    value: function _onContentSizeChange(width, height) {
      var contentLength = !this.props.horizontal ? height : width;
      if (contentLength !== this.scrollProperties.contentLength) {
        this.scrollProperties.contentLength = contentLength;
        this._updateVisibleRows();
        this._renderMoreRowsIfNeeded();
      }
      this.props.onContentSizeChange && this.props.onContentSizeChange(width, height);
    }
  }, {
    key: '_onLayout',
    value: function _onLayout(event) {
      var _event$nativeEvent$la = event.nativeEvent.layout;
      var width = _event$nativeEvent$la.width;
      var height = _event$nativeEvent$la.height;

      var visibleLength = !this.props.horizontal ? height : width;
      if (visibleLength !== this.scrollProperties.visibleLength) {
        this.scrollProperties.visibleLength = visibleLength;
        this._updateVisibleRows();
        this._renderMoreRowsIfNeeded();
      }
      this.props.onLayout && this.props.onLayout(event);
    }
  }, {
    key: '_maybeCallOnEndReached',
    value: function _maybeCallOnEndReached(event) {
      if (this.props.onEndReached && this.scrollProperties.contentLength !== this._sentEndForContentLength && this._getDistanceFromEnd(this.scrollProperties) < this.props.onEndReachedThreshold && this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()) {
        this._sentEndForContentLength = this.scrollProperties.contentLength;
        this.props.onEndReached(event);
        return true;
      }
      return false;
    }
  }, {
    key: '_renderMoreRowsIfNeeded',
    value: function _renderMoreRowsIfNeeded() {
      if (this.scrollProperties.contentLength === null || this.scrollProperties.visibleLength === null || this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()) {
        this._maybeCallOnEndReached();
        return;
      }

      var distanceFromEnd = this._getDistanceFromEnd(this.scrollProperties);
      if (distanceFromEnd < this.props.scrollRenderAheadDistance) {
        this._pageInNewRows();
      }
    }
  }, {
    key: '_pageInNewRows',
    value: function _pageInNewRows() {
      var _this5 = this;

      this.setState(function (state, props) {
        var rowsToRender = Math.min(state.curRenderedRowsCount + props.pageSize, props.dataSource.getRowCount());
        _this5._prevRenderedRowsCount = state.curRenderedRowsCount;
        return {
          curRenderedRowsCount: rowsToRender
        };
      }, function () {
        _this5._measureAndUpdateScrollProps();
        _this5._prevRenderedRowsCount = _this5.state.curRenderedRowsCount;
      });
    }
  }, {
    key: '_getDistanceFromEnd',
    value: function _getDistanceFromEnd(scrollProperties) {
      return scrollProperties.contentLength - scrollProperties.visibleLength - scrollProperties.offset;
    }
  }, {
    key: '_updateVisibleRows',
    value: function _updateVisibleRows(updatedFrames) {
      // if (!this.props.onChangeVisibleRows) {
      //   return; // No need to compute visible rows if there is no callback
      // }
      // if (updatedFrames) {
      //   updatedFrames.forEach((newFrame) => {
      //     this._childFrames[newFrame.index] = merge(newFrame);
      //   });
      // }
      // let isVertical = !this.props.horizontal;
      // let dataSource = this.props.dataSource;
      // let visibleMin = this.scrollProperties.offset;
      // let visibleMax = visibleMin + this.scrollProperties.visibleLength;
      // let allRowIDs = dataSource.rowIdentities;
      //
      // let header = this.props.renderHeader && this.props.renderHeader();
      // let totalIndex = header ? 1 : 0;
      // let visibilityChanged = false;
      // let changedRows = {};
      // for (let sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
      //   let rowIDs = allRowIDs[sectionIdx];
      //   if (rowIDs.length === 0) {
      //     continue;
      //   }
      //   let sectionID = dataSource.sectionIdentities[sectionIdx];
      //   if (this.props.renderSectionHeader) {
      //     totalIndex++;
      //   }
      //   let visibleSection = this._visibleRows[sectionID];
      //   if (!visibleSection) {
      //     visibleSection = {};
      //   }
      //   for (let rowIdx = 0; rowIdx < rowIDs.length; rowIdx++) {
      //     let rowID = rowIDs[rowIdx];
      //     let frame = this._childFrames[totalIndex];
      //     totalIndex++;
      //     if (!frame) {
      //       break;
      //     }
      //     let rowVisible = visibleSection[rowID];
      //     let min = isVertical ? frame.y : frame.x;
      //     let max = min + (isVertical ? frame.height : frame.width);
      //     if (min > visibleMax || max < visibleMin) {
      //       if (rowVisible) {
      //         visibilityChanged = true;
      //         delete visibleSection[rowID];
      //         if (!changedRows[sectionID]) {
      //           changedRows[sectionID] = {};
      //         }
      //         changedRows[sectionID][rowID] = false;
      //       }
      //     } else if (!rowVisible) {
      //       visibilityChanged = true;
      //       visibleSection[rowID] = true;
      //       if (!changedRows[sectionID]) {
      //         changedRows[sectionID] = {};
      //       }
      //       changedRows[sectionID][rowID] = true;
      //     }
      //   }
      //   if (!isEmpty(visibleSection)) {
      //     this._visibleRows[sectionID] = visibleSection;
      //   } else if (this._visibleRows[sectionID]) {
      //     delete this._visibleRows[sectionID];
      //   }
      // }
      // visibilityChanged && this.props.onChangeVisibleRows(this._visibleRows, changedRows);
    }
  }, {
    key: '_onScroll',
    value: function _onScroll(e) {
      var isVertical = !this.props.horizontal;
      // this.scrollProperties.visibleLength = e.nativeEvent.layoutMeasurement[
      //   isVertical ? 'height' : 'width'
      // ];
      // this.scrollProperties.contentLength = e.nativeEvent.contentSize[
      //   isVertical ? 'height' : 'width'
      // ];
      // this.scrollProperties.offset = e.nativeEvent.contentOffset[
      //   isVertical ? 'y' : 'x'
      // ];

      var target = _reactDom2.default.findDOMNode(this.refs[SCROLLVIEW_REF]);
      this.scrollProperties.visibleLength = target[isVertical ? 'offsetHeight' : 'offsetWidth'];
      this.scrollProperties.contentLength = target[isVertical ? 'scrollHeight' : 'scrollWidth'];
      this.scrollProperties.offset = target[isVertical ? 'scrollTop' : 'scrollLeft'];
      // this._updateVisibleRows(e.nativeEvent.updatedChildFrames);
      if (!this._maybeCallOnEndReached(e)) {
        this._renderMoreRowsIfNeeded();
      }

      if (this.props.onEndReached && this._getDistanceFromEnd(this.scrollProperties) > this.props.onEndReachedThreshold) {
        // Scrolled out of the end zone, so it should be able to trigger again.
        this._sentEndForContentLength = null;
      }

      this.props.onScroll && this.props.onScroll(e);
    }
  }]);

  return ListView;
}(_react.Component);

ListView.DataSource = _ReactListViewDataSource2.default;
ListView.propTypes = _extends({}, _ReactScrollView2.default.propTypes, {

  dataSource: _react.PropTypes.instanceOf(_ReactListViewDataSource2.default).isRequired,
  /**
   * (sectionID, rowID, adjacentRowHighlighted) => renderable
   *
   * If provided, a renderable component to be rendered as the separator
   * below each row but not the last row if there is a section header below.
   * Take a sectionID and rowID of the row above and whether its adjacent row
   * is highlighted.
   */
  renderSeparator: _react.PropTypes.func,
  /**
   * (rowData, sectionID, rowID, highlightRow) => renderable
   *
   * Takes a data entry from the data source and its ids and should return
   * a renderable component to be rendered as the row.  By default the data
   * is exactly what was put into the data source, but it's also possible to
   * provide custom extractors. ListView can be notified when a row is
   * being highlighted by calling highlightRow function. The separators above and
   * below will be hidden when a row is highlighted. The highlighted state of
   * a row can be reset by calling highlightRow(null).
   */
  renderRow: _react.PropTypes.func.isRequired,
  /**
   * How many rows to render on initial component mount.  Use this to make
   * it so that the first screen worth of data appears at one time instead of
   * over the course of multiple frames.
   */
  initialListSize: _react.PropTypes.number,
  /**
   * Called when all rows have been rendered and the list has been scrolled
   * to within onEndReachedThreshold of the bottom.  The native scroll
   * event is provided.
   */
  onEndReached: _react.PropTypes.func,
  /**
   * Threshold in pixels (virtual, not physical) for calling onEndReached.
   */
  onEndReachedThreshold: _react.PropTypes.number,
  /**
   * Number of rows to render per event loop. Note: if your 'rows' are actually
   * cells, i.e. they don't span the full width of your view (as in the
   * ListViewGridLayoutExample), you should set the pageSize to be a multiple
   * of the number of cells per row, otherwise you're likely to see gaps at
   * the edge of the ListView as new pages are loaded.
   */
  pageSize: _react.PropTypes.number,
  /**
   * () => renderable
   *
   * The header and footer are always rendered (if these props are provided)
   * on every render pass.  If they are expensive to re-render, wrap them
   * in StaticContainer or other mechanism as appropriate.  Footer is always
   * at the bottom of the list, and header at the top, on every render pass.
   */
  renderFooter: _react.PropTypes.func,
  renderHeader: _react.PropTypes.func,
  /**
   * (sectionData, sectionID) => renderable
   *
   * If provided, a sticky header is rendered for this section.  The sticky
   * behavior means that it will scroll with the content at the top of the
   * section until it reaches the top of the screen, at which point it will
   * stick to the top until it is pushed off the screen by the next section
   * header.
   */
  renderSectionHeader: _react.PropTypes.func,
  /**
   * (props) => renderable
   *
   * A function that returns the scrollable component in which the list rows
   * are rendered. Defaults to returning a ScrollView with the given props.
   */
  renderScrollComponent: _react2.default.PropTypes.func.isRequired,
  /**
   * How early to start rendering rows before they come on screen, in
   * pixels.
   */
  scrollRenderAheadDistance: _react2.default.PropTypes.number,
  /**
   * (visibleRows, changedRows) => void
   *
   * Called when the set of visible rows changes.  `visibleRows` maps
   * { sectionID: { rowID: true }} for all the visible rows, and
   * `changedRows` maps { sectionID: { rowID: true | false }} for the rows
   * that have changed their visibility, with true indicating visible, and
   * false indicating the view has moved out of view.
   */
  onChangeVisibleRows: _react2.default.PropTypes.func,
  /**
   * A performance optimization for improving scroll perf of
   * large lists, used in conjunction with overflow: 'hidden' on the row
   * containers.  This is enabled by default.
   */
  removeClippedSubviews: _react2.default.PropTypes.bool,
  /**
   * An array of child indices determining which children get docked to the
   * top of the screen when scrolling. For example, passing
   * `stickyHeaderIndices={[0]}` will cause the first child to be fixed to the
   * top of the scroll view. This property is not supported in conjunction
   * with `horizontal={true}`.
   * @platform ios
   */
  stickyHeaderIndices: _react.PropTypes.arrayOf(_react.PropTypes.number)
});
ListView.defaultProps = {
  initialListSize: DEFAULT_INITIAL_ROWS,
  pageSize: DEFAULT_PAGE_SIZE,
  renderScrollComponent: function renderScrollComponent(props) {
    return _react2.default.createElement(_ReactScrollView2.default, props);
  },
  scrollRenderAheadDistance: DEFAULT_SCROLL_RENDER_AHEAD,
  onEndReachedThreshold: DEFAULT_END_REACHED_THRESHOLD,
  stickyHeaderIndices: []
};


_reactMixin2.default.onClass(ListView, _ReactScrollResponder2.default.Mixin);
_reactMixin2.default.onClass(ListView, _reactTimerMixin2.default);
(0, _autobindDecorator2.default)(ListView);

ListView.isReactNativeComponent = true;

exports.default = ListView;