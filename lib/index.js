var Router = exports.Router = require('./router')

require('./routes')
require('./dispatcher')

module.exports = function (options) {
  return new Router(options || {})
}
