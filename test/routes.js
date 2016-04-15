var METHODS = require('methods').map(function (method) {
  return method.toUpperCase()
})
var request = require('supertest')
var assert = require('assert')
var koa = require('koa')

var router = require('..')()

var app = koa()

app.use(router.dispatcher())

var server = app.listen()

describe('router[method]()', function () {
  it('should work', function (done) {
    router.get('/home', function* (next) {
      this.status = 204
    })

    request(server)
      .get('/home')
      .expect(204, done)
  })

  it('should throw on non-gen-funs', function () {
    assert.throws(function () {
      router.get('/home', function () {
      })
    })
  })

  it('should match params', function (done) {
    router.get('/:a(one)/:b(two)', function* (next) {
      this.params.a.should.equal('one')
      this.params.b.should.equal('two')
      this.status = 204
    })

    request(server)
      .get('/one/two')
      .expect(204, done)
  })

  it('should still have this.params with no matched params', function (done) {
    router.get('/asdfasdf', function* (next) {
      this.params.should.eql({})
      this.status = 204
    })

    request(server)
      .get('/asdfasdf')
      .expect(204, done)
  })

  it('should have all the methods defined', function () {
    METHODS.forEach(function (method) {
      router[method.toLowerCase()].should.be.a.Function
    })

    router.del.should.be.a.Function
  })

  describe('when defining nested routes', function () {
    router.get(['/stack/one', ['/stack/two', '/stack/three']], function* (next) {
      this.status = 204
    })

    it('the first should work', function (done) {
      request(server)
        .get('/stack/one')
        .expect(204, done)
    })

    it('the second should work', function (done) {
      request(server)
        .get('/stack/two')
        .expect(204, done)
    })

    it('the third should work', function (done) {
      request(server)
        .get('/stack/three')
        .expect(204, done)
    })
  })

  describe('when defining nested middleware', function (done) {
    router.get('/two', noop, [noop, noop], function* (next) {
      this.status = 204
    })

    request(server)
      .get('/two')
      .expect(204, done)
  })
})

describe('router.route()', function () {
  it('should work', function (done) {
    router.route('/something').get(function* (next) {
      this.status = 204
    })

    request(server)
      .get('/something')
      .expect(204, done)
  })

  it('should have all the methods defined', function () {
    var route = router.route('/kajsdlfkjasldkfj')

    METHODS.forEach(function (method) {
      route[method.toLowerCase()].should.be.a.Function
    })

    route.del.should.be.a.Function
  })

  describe('when defining nested routes', function () {
    router
      .route(['/stack2/one', ['/stack2/two', '/stack2/three']])
      .get(function* (next) {
        this.status = 204
      })

    it('the first should work', function (done) {
      request(server)
        .get('/stack2/one')
        .expect(204, done)
    })

    it('the second should work', function (done) {
      request(server)
        .get('/stack2/two')
        .expect(204, done)
    })

    it('the third should work', function (done) {
      request(server)
        .get('/stack2/three')
        .expect(204, done)
    })
  })

  describe('when defining nested middleware', function (done) {
    router
      .route('/monkey')
      .get(noop, [noop, noop], function* (next) {
        this.status = 204
      })

    request(server)
      .get('/monkey')
      .expect(204, done)
  })
})

describe('404', function () {
  it('should 404 when not matched', function (done) {
    request(server)
      .get('/asdf')
      .expect(404, done)
  })

  it('should 404 when not matched', function (done) {
    request(server)
      .get('/%')
      .expect(404, done)
  })

  it('should 404 when not matched w/ superior route', function (done) {
    router
      .get('/app/home', function* (next) {
        this.status = 204
      })

    request(server)
      .get('/app')
      .expect(404, done)
  })
})

it('should 404 for uncaught malformed url', function (done) {
  router.get('/', function* (next) {
    this.status = 204
  })

  request(server)
    .get('/%')
    .expect(404, done)
})

it('should throw catchable error for malformed url', function (done) {
  var app2 = koa()
  app2.use(function* (next) {
    try {
      yield next
    } catch (e) {
      if (e.code == 'MALFORMEDURL') {
        this.body = 'malformed URL'
      }
    }
  })
  var router2 = require('../')()
  app2.use(function* () {
    yield router2.dispatcher()
  })

  router2.get('/', function* (next) {
    this.status = 204
  })

  request(app2.listen())
    .get('/%%')
    .expect(200, function (err, res) {
      assert.equal(res.text, 'malformed URL')
    })
    .end(done)
})

describe('regressions', function () {
  it('should not 404 with child routes', function (done) {
    router
      .get('/a', function* () {
        this.response.status = 204
      })
      .get('/a/b', function* () {
        this.response.status = 204
      })
      .get('/a/b/c', function* () {
        this.response.status = 204
      })

    request(server)
      .get('/a')
      .expect(204, function (err, res) {
        assert.ifError(err)

        request(server)
          .get('/a/b')
          .expect(204, function (err, res) {
            assert.ifError(err)

            request(server)
              .get('/a/b/c')
              .expect(204, done)
          })
      })
  })
})

function* noop (next) {
  yield* next
}
