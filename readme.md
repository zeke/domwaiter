# domwaiter

> A well-behaved URL scraper that brings you delicious DOM objects

Do you have a large collection of URLs you want to scrape? Scraping one page at a time is too slow, and scraping all the pages at once could put too much stress on the website you're scraping, and it could also crash your Node.js process due to excess memory usage. That's where this package comes in: it has a built-in rate limiter which allows you to quickly (and respectfully) collect those pages, and an event-emitting API to keep memory usage low.

## Features

- Uses Promises so it's async/await friendly
- Event-emitting API to keep a low memory footprint
- Supports fetching JSON too (instead of HTML DOM)
- Rate limiting powered by [bottleneck](https://ghub.io/bottleneck)
- DOM parsing powered by [cheerio](https://ghub.io/cheerio)
- HTTP requests powered by [got](https://ghub.io/got)

## Installation

```sh
npm install domwaiter
```

## Usage

```js
const domwaiter = require('domwaiter')

const pages = [
  { url: 'https://help.github.com/en', language: 'English' },
  { url: 'https://help.github.com/ja', language: 'Japanese' },
  { url: 'https://help.github.com/cn', language: 'Chinese' }
]

domwaiter(pages)
  .on('page', (page) => {
    console.log(page.language, page.$('title').text())
  })
  .on('error', (err) => {
    console.error(err)
  })
  .on('done', () => {
    console.log('Done!')
  })
```

## API

This module exports a single function `domwaiter`:

### `domwaiter(pages, [opts])`

- `pages` Array (required) - Each item in the array must have a `url` property with a fully-qualified HTTP(S) URL. These object can optionally have other properties, which will be included in the emitted `page` events. See below.
- `opts` Object (optional)
  - `json` Boolean - Set to `true` if you're fetching JSON instead of HTML. If `true`, a `json` property will be present on each emitted `page` object (and the `$` and `body` properties will NOT be present).
  - `maxConcurrent` Number - How many jobs can be executing at the same time. Defaults to `5`. This option is passed to the underlying [bottleneck](https://ghub.io/bottleneck#docs) instance.
  - `minTime`: Number - How long to wait after launching a job before launching another one. Defaults to `500` (milliseconds). This option is passed to the underlying [bottleneck](https://ghub.io/bottleneck#docs) instance.

### Events

The `domwaiter` function returns an event emitter which emits the following events:

- `page` - Emitted as each page has been requested and parsed. Returns an object which is a shallow clone of the original `page` object you provided, but with two added properties:
  - `body`: the raw HTTP response body text
  - `$`: The body parsed into a jQuery-like [cheerio](https://ghub.io/cheerio) DOM object.
- `error` - Emitted when an error occurs fetching a URL
- `done` - Emitted when all the pages have been fetched.

## Tests

```sh
npm install
npm test
```

## Dependencies

- [bottleneck](https://ghub.io/bottleneck): Distributed task scheduler and rate limiter
- [cheerio](https://ghub.io/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [got](https://ghub.io/got): Human-friendly and powerful HTTP request library for Node.js

## Dev Dependencies

- [jest](https://ghub.io/jest): Delightful JavaScript Testing.
- [nock](https://ghub.io/nock): HTTP server mocking and expectations library for Node.js
- [standard](https://ghub.io/standard): JavaScript Standard Style