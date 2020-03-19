const domwaiter = require('.')

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
