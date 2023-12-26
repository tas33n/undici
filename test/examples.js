'use strict'

const { createServer } = require('http')
const { test } = require('tap')
const examples = require('../examples/request.js')

test('request examples', async (t) => {
  let lastReq
  const exampleServer = createServer((req, res) => {
    lastReq = req
    if (req.method === 'DELETE') {
      res.statusCode = 204
      return res.end()
    } else if (req.method === 'POST') {
      res.statusCode = 200
      if (req.url === '/json') {
        res.setHeader('content-type', 'application/json')
        res.end('{"hello":"JSON Response"}')
      } else {
        res.end('hello=form')
      }
    } else {
      res.statusCode = 200
      res.end('hello')
    }
  })

  const errorServer = createServer((req, res) => {
    lastReq = req
    res.statusCode = 400
    res.setHeader('content-type', 'application/json')
    res.end('{"error":"an error"}')
  })

  t.teardown(exampleServer.close.bind(exampleServer))
  t.teardown(errorServer.close.bind(errorServer))

  await exampleServer.listen(0)
  await errorServer.listen(0)

  await examples.getRequest(exampleServer.address().port)
  t.equal(lastReq.method, 'GET')

  await examples.postJSONRequest(exampleServer.address().port)
  t.equal(lastReq.method, 'POST')
  t.equal(lastReq.headers['content-type'], 'application/json')

  await examples.postFormRequest(exampleServer.address().port)
  t.equal(lastReq.method, 'POST')
  t.equal(lastReq.headers['content-type'], 'application/x-www-form-urlencoded')

  await examples.deleteRequest(exampleServer.address().port)
  t.equal(lastReq.method, 'DELETE')

  await examples.deleteRequest(errorServer.address().port)
  t.equal(lastReq.method, 'DELETE')

  t.end()
})
