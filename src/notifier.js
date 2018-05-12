const open = require('open')
const EOL = remote.getGlobal('EOL')


module.exports = class Notifier {
  static getDateTimeFromTimestamp (unixTimeStamp) {
    let date = new Date(unixTimeStamp)
    return (`0` + date.getDate()).slice(-2) +
      '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
      '/' + date.getFullYear() + ' ' +
      ('0' + date.getHours()).slice(-2) + ':' +
      ('0' + date.getMinutes()).slice(-2)
  };

  notifyMultipleQuestions (n, url) {
    new Notification(`Got ${n} new questions.`, {
      icon: $('#sof').attr('src')
    }).onclick = event => {
      event.preventDefault()
      open(url)
    }
  };

  notifyQuestion (question) {
    new Notification(question.title, {
      body: `${question.body}${EOL}Asked by: ${question.asker}${EOL}${Notifier.getDateTimeFromTimestamp(question.ts)}`,
      icon: $('#sof').attr('src')
    }).onclick = event => {
      event.preventDefault()
      open(question.url)
    }
  }

  notifyInboxMsg (content, quota) {
    new Notification(`Unread Inbox Message${EOL}`, {
      body: `Title: ${content.title}${EOL}Type: ${content.item_type}${EOL}Remaining API Quota: ${quota}`,
      icon: $('#msg').attr('src')
    }).onclick = event => {
      // Goto msg URL
      event.preventDefault()
      open(content.link)
    }
  }

  notifyMultipleMsgs (n, quota, inboxURL) {
    new Notification(`Got ${n} Unread Inbox Messages${EOL}`, {
      body: `Remaining API Quota: ${quota}`,
      icon: $('#msg').attr('src')
    }).onclick = event => {
      event.preventDefault()
      if (inboxURL) {
        open(inboxURL)
      }
    }
  }

  notifyReputationChange (quota, repURL) {
    new Notification(`New reputation changes${EOL}`, {
      body: `Remaining API Quota: ${quota}${EOL}`,
      icon: $('#trophy').attr('src')
    }).onclick = event => {
      event.preventDefault()
      if (repURL) {
        open(repURL)
      }
    }
  }
  errorNotify (msg) {
    new Notification(`Stack Overflow Notifier has encountered an error${EOL}`, {body: msg})
  };
}
