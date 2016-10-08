





'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _react=require('react');var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var

StaticRenderer=function(_Component){_inherits(StaticRenderer,_Component);function StaticRenderer(){_classCallCheck(this,StaticRenderer);return _possibleConstructorReturn(this,(StaticRenderer.__proto__||Object.getPrototypeOf(StaticRenderer)).apply(this,arguments));}_createClass(StaticRenderer,[{key:'shouldComponentUpdate',value:function shouldComponentUpdate(





nextProps){
return nextProps.shouldUpdate;
}},{key:'render',value:function render()

{
return this.props.render();
}}]);return StaticRenderer;}(_react.Component);StaticRenderer.propTypes={shouldUpdate:_react.PropTypes.bool.isRequired,render:_react.PropTypes.func.isRequired};
;exports.default=

StaticRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXRpY1JlbmRlcmVyLndlYi5qcyJdLCJuYW1lcyI6WyJTdGF0aWNSZW5kZXJlciIsIm5leHRQcm9wcyIsInNob3VsZFVwZGF0ZSIsInByb3BzIiwicmVuZGVyIiwicHJvcFR5cGVzIiwiYm9vbCIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQSxhOztBQUVBLDRCOztBQUVNQSxjOzs7Ozs7QUFNa0JDLFMsQ0FBVztBQUMvQixNQUFPQSxXQUFVQyxZQUFqQjtBQUNELEM7O0FBRVE7QUFDUCxNQUFPLE1BQUtDLEtBQUwsQ0FBV0MsTUFBWCxFQUFQO0FBQ0QsQyw4Q0FaR0osYyxDQUNHSyxTLENBQVksQ0FDakJILGFBQWMsaUJBQVVJLElBQVYsQ0FBZUMsVUFEWixDQUVqQkgsT0FBUSxpQkFBVUksSUFBVixDQUFlRCxVQUZOLEM7QUFZcEIsQzs7QUFFY1AsYyIsImZpbGUiOiJTdGF0aWNSZW5kZXJlci53ZWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBBbGliYWJhIEdyb3VwIEhvbGRpbmcgTGltaXRlZC5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIFJlYWN0U3RhdGljUmVuZGVyZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIFN0YXRpY1JlbmRlcmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzaG91bGRVcGRhdGU6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgcmVuZGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcykge1xuICAgIHJldHVybiBuZXh0UHJvcHMuc2hvdWxkVXBkYXRlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJlbmRlcigpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTdGF0aWNSZW5kZXJlcjtcbiJdfQ==