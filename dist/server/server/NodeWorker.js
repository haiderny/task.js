'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _GeneralWorker2 = require('../GeneralWorker');

var _GeneralWorker3 = _interopRequireDefault(_GeneralWorker2);

var _webworkerThreads = require('webworker-threads');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var NodeWorker = function (_GeneralWorker) {
	_inherits(NodeWorker, _GeneralWorker);

	function NodeWorker($config) {
		_classCallCheck(this, NodeWorker);

		var _this = _possibleConstructorReturn(this, _GeneralWorker.apply(this, arguments));

		_this.WORKER_SOURCE = function () {
			this.onmessage = function (event) {
				var message = event.data;

				var args = Object.keys(message).filter(function (key) {
					return key.match(/^argument/);
				}).sort(function (a, b) {
					return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
				}).map(function (key) {
					return message[key];
				});

				try {
					postMessage({ id: message.id, result: eval('(' + message.func + ')').apply(null, args) });
				} catch (error) {
					postMessage({ id: message.id, error: error.message });
				}
			};
		};

		_this._onMessage = function (event) {
			var message = event.data;
			_this.handleWorkerMessage(message);
		};

		_this.postMessage = function (message, options) {
			_this._log('sending tid(' + message.id + ') to worker process');
			_this._worker.postMessage(message, options);
		};

		_this.terminate = function () {
			_this._log('terminated');
			_this._worker.terminate();
		};

		_this._worker = new _webworkerThreads.Worker(_this.WORKER_SOURCE);
		_this._worker.onmessage = _this._onMessage;

		_this._log('initialized');
		return _this;
	}

	NodeWorker.prototype._log = function _log(message) {
		if (this._debug) {
			this._logger('task.js:worker[mid(' + this.managerId + ') wid(' + this.id + ')]: ' + message);
		}
	};

	return NodeWorker;
}(_GeneralWorker3.default);

module.exports = NodeWorker;