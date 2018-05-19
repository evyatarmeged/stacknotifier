// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver')
const Firefox = require('selenium-webdriver/firefox')
require('geckodriver')

module.exports = class User {
  constructor (email, password) {
    this.email = email
    this.password = password
    this._driver = this._getDriver()
    this._wait = 1500
    this.token = null
    this.accountID = null
  }

  _getDriver () {
    return new Builder()
      .forBrowser('firefeox')
      .withCapabilities(Capabilities.firefox())
      .setFirefoxOptions(new Firefox.Options().headless())
      .build()
  }

  // Must use async/await or 1st inbox query won't open as accountID will be null still
  async _assignId (accountId) {
    this.accountID = await accountId
    this.exchangeBaseUrl = await `https://stackexchange.com/users/${this.accountID}?tab=`
  }

  getId () {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        url: `https://api.stackexchange.com/2.2/me?key=U4DMV*8nvpm3EOpvf69Rxw((&site=stackoverflow&order=desc&sort=\
			reputation&access_token=${this.token}&filter=default`,
        // Scope not bound
        success: result => {
          this._assignId(result.items[0]['account_id'])
            .then(() => resolve())
        },
        error: e => reject(e)
      })
    })
  }

  _waitForElementAndExecute (selector, input = '') {
    let webElement = By.css(selector)
    this._driver.wait(until.elementLocated(webElement, this._wait * 3))
    let el = this._driver.findElement(webElement)
    this._driver.wait(until.elementIsVisible(el), this._wait * 3).then(el => {
      this._driver.sleep(this._wait)
      !input ? el.click() : el.sendKeys(input, Key.ENTER)
      this._driver.sleep(this._wait)
    })
  }
  
  async getToken () {
    let authWindow, parentWindow
    let accessTokenCss = '.load-access-token',
      googleCss = '.major-provider.google-login',
      userInputCss = '#identifierId',
      passwordInputCss = '.whsOnd.zHQkBf',
      tokenizeString = "return $('#param-access_token').attr('value');"

    try {
      this._driver.get('https://api.stackexchange.com/docs/inbox-unread')
      parentWindow = await this._driver.getWindowHandle()
      this._waitForElementAndExecute(accessTokenCss)
      let windows = await this._driver.getAllWindowHandles()
      await windows.forEach(window => {
        if (window !== parentWindow) {
          authWindow = window
        }
      })

      await this._driver.switchTo().window(authWindow)
      this._waitForElementAndExecute(googleCss)
      this._waitForElementAndExecute(userInputCss, this.email)
      this._waitForElementAndExecute(passwordInputCss, this.password)

      // Finished authentication, grab token
      await this._driver.switchTo().window(parentWindow)
      this._driver.sleep(this._wait * 3)

      this._driver.executeScript(tokenizeString).then(token => {
        this.token = token
      })
    } catch (e) {
      process.stdout.write(`${e.toString()}\n`)
    } finally {
      await this._driver.quit()
    }
  }
}
