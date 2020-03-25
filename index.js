const Bottleneck = require('bottleneck')
const got = require('got')
const cheerio = require('cheerio')
const EventEmitter = require('events')

module.exports = function domwaiter (pages, opts = {}) {
  const emitter = new EventEmitter()

  const defaults = {
    json: false,
    maxConcurrent: 5,
    minTime: 500
  }
  opts = Object.assign(defaults, opts)

  const limiter = new Bottleneck(opts)

  pages.forEach(page => {
    limiter.schedule(getPage, page, emitter, opts)
  })

  limiter
    .on('idle', () => {
      emitter.emit('done')
    })
    .on('error', (err) => {
      emitter.emit('error', err)
    })

  return emitter
}

async function getPage (page, emitter, opts) {
  if (opts.json) {
    try {
      const json = await got(page.url).json()
      const pageCopy = Object.assign({}, page, { json })
      emitter.emit('page', pageCopy)
    } catch (err) {
      emitter.emit('error', err)
    }
  } else {
    try {
      const body = (await got(page.url)).body
      const $ = cheerio.load(body)
      const pageCopy = Object.assign({}, page, { body, $ })
      emitter.emit('page', pageCopy)
    } catch (err) {
      emitter.emit('error', err)
    }
  }
}