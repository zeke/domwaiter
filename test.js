const domwaiter = require('.')
const nock = require('nock')

// disallow any real network activity
nock.disableNetConnect()

describe('domwaiter', () => {
  test('exports a function', () => {
    expect(typeof domwaiter).toBe('function')
  })

  test('emits `page` and `done` events', (done) => {
    const mock = nock('https://example.com')
      .get('/foo')
      .reply(200, '<html><title>Hello, foo</title></html>')
      .get('/bar')
      .reply(200, '<html><title>Hello, bar</title></html>')

    const pages = [
      { url: 'https://example.com/foo' },
      { url: 'https://example.com/bar' }
    ]

    const waiter = domwaiter(pages, { minTime: 10 })
    const results = []

    waiter
      .on('page', (page) => {
        results.push(page)
      })
      .on('done', () => {
        expect(mock.isDone()).toBe(true)
        expect(results.length).toBe(2)
        const titles = results.map(result => result.$('title').text())
        expect(titles.length).toBe(2)
        expect(titles).toContain('Hello, foo')
        expect(titles).toContain('Hello, bar')
        done()
      })
      .on('error', (err) => {
        console.error('domwaiter error')
        console.error(err)
      })
  })

  test('emits a `beforePageLoad` event with page object', (done) => {
    const mock = nock('https://example.com')
      .get('/foo')
      .reply(200)

    const pages = [
      { url: 'https://example.com/foo' }
    ]

    const waiter = domwaiter(pages, { minTime: 10 })

    waiter
      .on('beforePageLoad', (page) => {
        expect(mock.isDone())
        expect(page && page.url)
        done()
      })
  })

  test('emits errors for failed requests', (done) => {
    const mock = nock('https://example.com')
      .get('/foo')
      .reply(200, '<html><title>Hello, foo</title></html>')
      .get('/bar')
      .reply(404)
      .get('/baz')
      .reply(500)

    const pages = [
      { url: 'https://example.com/foo' },
      { url: 'https://example.com/bar' },
      { url: 'https://example.com/baz' }
    ]

    const waiter = domwaiter(pages, { minTime: 10 })
    const errors = []

    waiter
      .on('done', () => {
        expect(mock.isDone()).toBe(true)
        expect(errors.length).toBe(2)
        expect(errors[0].name).toBe('HTTPError')
        done()
      })
      .on('error', (err) => {
        errors.push(err)
      })
  })

  test('allows `parseDOM` option to skip cheerio parsing', (done) => {
    const mock = nock('https://example.com')
      .get('/foo')
      .reply(200, '<html><title>Hello, foo</title></html>')

    const pages = [
      { url: 'https://example.com/foo' }
    ]

    const waiter = domwaiter(pages, { minTime: 10, parseDOM: false })
    const results = []

    waiter
      .on('page', (page) => {
        results.push(page)
      })
      .on('done', () => {
        expect(mock.isDone()).toBe(true)
        expect(results.length).toBe(1)
        expect(results[0].body).toContain('Hello, foo')
        expect(results[0].$).toBe(undefined)
        done()
      })
      .on('error', (err) => {
        console.error('domwaiter error')
        console.error(err)
      })
  })

  test('supports json responses', (done) => {
    const mock = nock('https://example.com')
      .get('/foo')
      .reply(200, { foo: 123 })
      .get('/bar')
      .reply(200, { bar: 456 })

    const pages = [
      { url: 'https://example.com/foo' },
      { url: 'https://example.com/bar' }
    ]

    const waiter = domwaiter(pages, { json: true, minTime: 10 })
    const results = []

    waiter
      .on('page', (page) => {
        results.push(page)
      })
      .on('done', () => {
        expect(mock.isDone()).toBe(true)
        expect(results.length).toBe(2)
        expect(results.find(result => result.url.endsWith('/foo')).json).toEqual({ foo: 123 })
        expect(results.find(result => result.url.endsWith('/bar')).json).toEqual({ bar: 456 })
        done()
      })
      .on('error', (err) => {
        console.error('domwaiter error')
        console.error(err)
      })
  })
})
