const Notifier = require(path.join(__dirname, '../notifier.js'))
const User = require(path.join(__dirname, '../user.js'))
const APICalls = require(path.join(__dirname, '../apicalls.js'))
const validator = require(path.join(__dirname, '../argval.js'))
const baseUrl = 'https://stackoverflow.com/'
const suffix = '?sort=newest&pageSize=15'

let urlTagString = 'questions/tagged/'
let user
let apiCalls
let timeUnit = stackInterval > 1 ? 'minutes' : 'minute'

// URL encode C# and friends
stackTags = stackTags.replace(/#/g, '%23')

const write = args => process.stdout.write(args)

const sortByTimeStamp = (a, b) => {
  if (a.ts < b.ts) {
    return 1
  }
  if (a.ts > b.ts) {
    return -1
  }
  return 0
}

const questionExists = (arr, question) => {
  let result = arr.find(element => element.ts === question.ts)
  return result !== undefined && result.title === question.title
}

function parseQuestionToObject (item) {
  let $item = $(item)
  return {
    title: $item.find('h3 > a').text(),
    body: $item.find('.excerpt').text().trim().split(' ').splice(0, 15).join(' ') + '...',
    asker: $item.find('.user-details > a').text(),
    url: baseUrl + $item.find('.question-hyperlink').attr('href'),
    ts: Date.parse($item.find('.user-action-time > span').attr('title'))
  }
}

const newerThanNewest = (newest, current) => {
  return current.ts > newest.ts
}

function stringifyTags (tags) {
  let stringified = ''
  if (!tags.includes('+')) {
    stringified = `[${tags[0].toUpperCase()}${tags.slice(1)}]`
  } else {
    tags.split('+').forEach((tag) => {
      stringified += `[${tag[0].toUpperCase()}${tag.slice(1)}]`
    })
  }
  return stringified
}

// Flow
$(function () {
  validator.validateRequired(stackInterval, stackTags)
  
  $.fn.reverse = [].reverse
  
  stackInterval *= 60000
  stackTags = stackTags.replace(/,/g, '+')
  urlTagString += stackTags
  
  /* Deals with trailing comma breaking the script
	 e.g tag: Java, would cause a urlTagString of questions/tagged/java+ <-- this would get no results
  */
  if (urlTagString.endsWith('+')) {
    let pos = urlTagString.lastIndexOf('+')
    urlTagString = `${urlTagString.substring(0, pos)}${urlTagString.substring(pos + 1)}`
  }
  
  let completeUrl = baseUrl + urlTagString + suffix
  let queue = []
  
  const notifier = new Notifier()
  if (stackUser && stackPassword) {
    user = new User(stackUser, stackPassword)
  }
  
  function isTokenValid() {
    // Test if token was obtained in the last 24h
    // Username & password write modifies the file but removes token so this won't be called
    let now = new Date()
    let mtime = fs.statSync(confPath).mtime;
    let lastModified = new Date(mtime);
    // Tested valid tokens for 24 hours, might be possible to use longer
    return (now - lastModified) / 1000 / 60 / 60 < 24;
  }
  
  function getNewBatch (page) {
    return new Promise((resolve, reject) => {
      try {
        let $page = $(page),
          questions = $page.find('.question-summary'),
          newQuestionsCount = 0
        
        questions.reverse().each((_, item) => {
          let questionObj = parseQuestionToObject(item)
          if (queue.length !== 15) {
            queue.push(questionObj)
          } else if (!questionExists(queue, questionObj) && newerThanNewest(queue[0], questionObj)) {
            queue.unshift(questionObj)
            queue.pop()
            newQuestionsCount++
          }
        })
        queue.sort(sortByTimeStamp)
        resolve(newQuestionsCount)
      } catch (e) {
        reject(e)
      }
    })
  }
  
  function getQuestionPage () {
    // Life is good without CORS
    $.ajax({
      type: 'GET',
      url: completeUrl,
      success: page => {
        getNewBatch(page)
          .then((result) => {
            if (result > 0) {
              result > 1 ? notifier.notifyMultipleQuestions(result, completeUrl) : notifier.notifyQuestion(queue[0])
            }
          })
          .catch((err) => {
            console.error(err)
          })
      },
      error: err => {
        let $err = $(err.responseText),
          status = err.status
        if (parseInt(status) === 403) notifier.errorNotify(`${status}${EOL}Too much requests`)
        else notifier.errorNotify(`${status}${EOL}${$err[1].text}`)
      }
    })
  }
  
  const makeAPIcalls = () => {
    apiCalls.queryReputationChanges()
    apiCalls.queryInbox()
  }
  
  function execute () {
    getQuestionPage()
    if (apiCalls) {
      makeAPIcalls()
    }
    setTimeout(() => { execute() }, stackInterval)
  }
  
  let initStr = `Fetching ${stringifyTags(stackTags)} questions every ${stackInterval / 60000} ${timeUnit}${EOL}`
  
  // 'Main'
  if (user) {
    try {
      if (stackToken && isTokenValid(stackToken)) {
        user.token = stackToken
        user.getId()
          .then(() => {
            if (!user.accountID) {
              throw new Error(`Could not obtain account id. \
                Inbox and reputation on-click events will not work.`)
            }
            apiCalls = new APICalls(notifier, user)
            write(`Last obtained token still valid. Using it${EOL}${initStr}${EOL}`)
  
          })
          .catch(e => {
            write(`${e}${EOL}`)
          })
      } else {
          write(`Trying to get new token for ${user.email}. This may take a few seconds${EOL}`)
          user.getToken()
          .then(() => {
            if (!user.token) throw new Error(`Could not obtain token for ${user.email}. Will not perform API calls.${EOL}`)
            
            try {
              fs.writeFileSync(confPath,
                yaml.safeDump({username: stackUser, password: stackPassword, token: user.token}))
            
            } catch (e) {
              if (e instanceof Error) write(`Error saving new token to ${confPath}: Permission Denied.\
            ${EOL}Try running with sudo${EOL}`)
            }
            
            write(`API token for ${user.email} obtained successfully.${EOL}`)
            write(`Extracting accountID...${EOL}`)
            
            user.getId()
            .then(() => {
              if (!user.accountID) {
                throw new Error(`Could not obtain account id. \
                Inbox and reputation on-click events will not work.`)
              }
              apiCalls = new APICalls(notifier, user)
              write(`Done.${EOL}${initStr}${EOL}`)
            })
            .catch(e => {
              write(`${e}${EOL}`)
            })
          })
          .catch(e => write(`${e.toString()}`))
        // No support for Promise.finally() even in electron 2.0.0 ¯\_(ツ)_/¯
      }
      
    } catch (e) {
      console.error(`Error grabbing API credentials :${EOL}${e}`)
    } finally {
      execute()
    }
  
  } else {
    write(`${initStr}${EOL}`)
    execute()
  }
})
