var request = require('supertest')
var koa = require('koa')

var router = require('..')()

var app = koa()

app.use(function* (next) {
  try {
    router.assertImplementsMethod().apply(this)
  } catch (err) {
    this.status = 501
    return
  }

  yield* next
})

app.use(router.dispatcher())

var server = app.listen()

router.get('/', function* (next) {
  this.status = 204
})

router.search('/kasdjflkajsdf', function* (next) {
  this.status = 204
})

describe('request.assertImplementsMethod()', function () {
  it('should throw if not implemented', function (done) {
    request(server)
      .patch('/')
      .expect(501, done)
  })

  it('should not throw if implemented', function (done) {
    request(server)
      .get('/')
      .expect(204, done)
  })
})

describe('OPTIONS', function () {
  it('should send Allow', function (done) {
    request(server)
      .options('/')
      .expect('Allow', /\bGET\b/)
      .expect('Allow', /\bHEAD\b/)
      .expect('Allow', /\bOPTIONS\b/)
      .expect(204, done)
  })
})

describe('405 Method Not Allowed', function () {
  it('should send Allow', function (done) {
    request(server)
      .search('/')
      .expect('Allow', /\bGET\b/)
      .expect('Allow', /\bHEAD\b/)
      .expect('Allow', /\bOPTIONS\b/)
      .expect(405, done)
  })
})

describe('HEAD', function () {
  it('should respond with GET if not defined', function (done) {
    request(server)
      .head('/')
      .expect(204, done)
  })
})