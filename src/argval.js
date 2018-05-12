const invalidQueryInterval = `Invalid query interval parameter. Specify a number between 0.5 and 60`
const invalidTags = `Tags must be comma separated, valid Stack Overflow tags
Not sure about your tag ? look it up here: https://stackoverflow.com/tags`
const remote = require('electron').remote

function invalidArguments (err) {
  process.stdout.write(`${err}${remote.getGlobal('EOL')}`)
  window.close()
  process.exit(1)
}

function intervalValidation (interval) {
  return new Promise((resolve, reject) => {
    if (!interval || Number.isNaN(interval) || interval < 0.5 || interval > 60) {
      reject(invalidQueryInterval)
    }
    resolve()
  })
}

function tagValidation (tags) {
  return new Promise((resolve, reject) => {
    if (!tags) reject()

    fs.readFile(path.join(__dirname, '/static/tags.txt'), (err, content) => {
      if (err) throw (err)
      let fileContent = content.toString().split('\r\n')
      tags.split(',').forEach(tag => {
        if (!fileContent.includes(tag)) {
          reject(`Unknown tag "${tag}". ${invalidTags}`)
        }
      })
      resolve()
    })
  })
}

function validateRequired (interval, tags) {
  Promise.all([intervalValidation(interval), tagValidation(tags)])
    .then(() => {})
    .catch(e => {
      invalidArguments(e)
    })
}

module.exports = {
  validateRequired
}
