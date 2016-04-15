# Trie Koa Router

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

[Trie](http://en.wikipedia.org/wiki/Trie) routing for Koa based on [routington](https://github.com/jonathanong/routington), a fork of [Koa Trie Router](https://github.com/koajs/trie-router).

## Features

- `OPTIONS` support
- `405 Method Not Allowed` support
- `501 Not Implemented` support

Routes are generally orthogonal, so the order of definition generally doesn't matter.
See [routington](https://github.com/jonathanong/routington) for more details.

## Installation

```js
var app = require('koa')()
var router = require('trie-koa-router')()
app.use(router.dispatcher())

router.route('/').get(function* (next) {
  this.body = 'homepage'
})

router.post('/images', function* (next) {
  var image = yield* this.request.buffer('25mb')
})
```

## API

### router.assertImplementsMethod()

Checks if the server implements a particular method and throws a `501` error otherwise.
This is not middleware, so you would have to use it in your own middleware.

```js
app.use(myCustomErrorHandler)

app.use(function* (next) {
  router.assertImplementsMethod().apply(this) // throws otherwise
  yield next
})
```

### app.use(router.dispatcher())

If you do not do `app.use(router.dispatcher())` ever,
routing will never work.

### router.route(paths)\[method\]\(middleware...\)

`paths` can be a nested stack of string paths:

```js
router.route('/one', [
  '/two',
  ['/three', '/four']
])
```

You can then chain `[method](middleware...)` calls.

```js
router.route('/')
.get(function* (next) {

})
.post(function* (next) {

})
.patch(function* (next) {

})
```

### router\[method\]\(paths, middleware...\)

Similar to above, but you define `paths` as the first argument:

```js
router.get([
  '/one',
  '/two'
], function* (next) {

})
```

### this.params

`this.params` will be defined with any matched parameters.

```js
router.get('/user/:name', function* (next) {
  var name = this.params.name
  var user = yield User.get(name)
  yield next
})
```

### Error handling

The middleware throws an error with `code` _MALFORMEDURL_ when it encounters
a malformed path. An application can _try/catch_ this upstream, identify the error
by its code, and handle it however the developer chooses in the context of the
application- for example, re-throw as a 404.

### Path Definitions

For path definitions, see [routington](https://github.com/jonathanong/routington).

## Usage

In `trie-router`, routes are orthogonal and strict. Unlike regexp routing, there's no wildcard routing and you can't `next` to the next matching route.

[npm-image]: https://img.shields.io/npm/v/trie-koa-router.svg?style=flat
[npm-url]: https://npmjs.org/package/trie-koa-router
[travis-image]: https://img.shields.io/travis/theicebear/trie-router.svg?style=flat
[travis-url]: https://travis-ci.org/theicebear/trie-router
[coveralls-image]: https://img.shields.io/coveralls/theicebear/trie-router.svg?style=flat
[coveralls-url]: https://coveralls.io/r/theicebear/trie-router?branch=master


