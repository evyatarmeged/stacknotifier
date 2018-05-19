// Api calling and parsing with obtained user data and credentials

module.exports = class APICalls {
  constructor (notifier, user) {
    this._notifier = notifier
    this._inboxURL = "https://api.stackexchange.com/2.2/inbox/unread?key=U4DMV*8nvpm3EOpvf69Rxw((&filter=default"
    this._repURL = "https://api.stackexchange.com/2.2/me/reputation/\
?site=stackoverflow&key=U4DMV*8nvpm3EOpvf69Rxw((&filter=default"
    this._exchangeBaseURL = null
    this._problemNotified = false
    this._lastRepChange = null
    this._repAlerts = 0
    this.tokenize(user)
  }
  
  tokenize(user) {
    this._inboxURL += `&access_token=${user.token}`
    this._repURL += `&access_token=${user.token}`
    this._exchangeBaseURL = `https://stackexchange.com/users/${user.accountID}?tab=`
  }
  
  _queryAPI (url) {
    $.ajax({
      type: 'GET',
      url: url,
      success: result => {
        url.includes('inbox') ? this._parseInboxResults(result) : this._parseReputationResults(result)
      },
      error: e => {
        if (!this._problemNotified) {
          this._notifier.errorNotify(`API Error:\n${e.responseText}`)
          this._problemNotified = true
        }
      }
    })
  }
  
  queryInbox () {
    this._queryAPI(this._inboxURL)
  }
  
  _parseInboxResults (results) {
    let totalMessages = results.items.length
    // Test for new msgs
    if (totalMessages !== 0) {
      if (totalMessages > 1) {
        this._notifier.notifyMultipleMsgs(totalMessages, results.quota_remaining, `${this._exchangeBaseURL}inbox`)
      } else {
        this._notifier.notifyInboxMsg(results.items[0], results.quota_remaining)
      }
    }
  }
  
  queryReputationChanges () {
    this._queryAPI(this._repURL)
  }
  
  _parseReputationResults (results) {
    let lastChange = results.items[0]['on_date']
    if (!this._lastRepChange) {
      this._lastRepChange = lastChange
      
    } else if (this._repAlerts > 0 ) {
      this._repAlerts >= 3 ? this._repAlerts = 0 : this._repAlerts += 1
      this._notifier.notifyReputationChange(results.quota_remaining, `${this._exchangeBaseURL}reputation`, this)
      
    } else if (this._lastRepChange !== lastChange) {
      this._repAlerts += 1
      this._lastRepChange = lastChange
      this._notifier.notifyReputationChange(results.quota_remaining, `${this._exchangeBaseURL}reputation`, this)
    }
  }
}