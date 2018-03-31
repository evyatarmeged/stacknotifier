// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')
require('geckodriver')


module.exports = class User {
	constructor (email, password, notifier) {
		this.email = email;
		this.password = password;
		this.driver = this.getDriver();
		this.wait = 1500;
		this.token = null;
		this.notifier = notifier;
		this.problemNotified = false;
	}

	getDriver() {
		return new Builder()
			.forBrowser('firefeox')
			.withCapabilities(Capabilities.firefox())
			.setFirefoxOptions(new Firefox.Options().headless())
			.build()
	}


	waitForElementAndExecute(selector, input='') {
		let webElement= By.css(selector);
		this.driver.wait(until.elementLocated(webElement, this.wait * 3));
		let el = this.driver.findElement(webElement);
		this.driver.wait(until.elementIsVisible(el), this.wait * 3).then(el => {
			this.driver.sleep(this.wait);
			!input ? el.click() : el.sendKeys(input, Key.ENTER)
			this.driver.sleep(this.wait)
		})
	}

	async getToken() {
		let authWindow, parentWindow;
		let accessTokenCss = '.load-access-token',
			googleCss = '.major-provider.google-login',
			userInputCss = '#identifierId',
			passwordInputCss = '.whsOnd.zHQkBf',
			tokenizeString = "return $('#param-access_token').attr('value');";

		try {
			this.driver.get('https://api.stackexchange.com/docs/inbox-unread')
			parentWindow = await this.driver.getWindowHandle();
			this.waitForElementAndExecute(accessTokenCss);
			let windows = await this.driver.getAllWindowHandles();
			await windows.forEach(window => {
				if (window !== parentWindow) {
					authWindow = window
				}
			})
			await this.driver.switchTo().window(authWindow)
			this.waitForElementAndExecute(googleCss)
			this.waitForElementAndExecute(userInputCss, this.email)
			this.waitForElementAndExecute(passwordInputCss, this.password)
			// Finished authentication, grab token
			await this.driver.switchTo().window(parentWindow)
			this.driver.sleep(this.wait * 3)
			this.driver.executeScript(tokenizeString).then(token => {
				this.token = token;
			})

		} catch (e) {
			// Throw notification that token was not obtained
			this.notifier.errorNotify(e)
		} finally {
				await this.driver.quit();
		}
	}

	queryInbox(){
		$.ajax({
			type: 'GET',
			url: `https://api.stackexchange.com/2.2/inbox/unread?key=U4DMV*8nvpm3EOpvf69Rxw((&page=1&pagesize=10&
			filter=default&access_token=${this.token}`,
			success: result => {
				this.parseInboxResults(result)
			},
			error: e => {
				if (!this.problemNotified) {
					this.notifier.errorNotify(e);
					this.problemNotified = true;
				}
			}
		})
	}

	// All unread unread inbox who generated from the same question should be merged to a single HTML5 notif.
	parseInboxResults(results) {
		let totalMessages = results.items;
		// Test for new msgs
		if (totalMessages.length !== 0) {
			if (totalMessages.length > 1) {
				this.notifier.notifyMultipleMsgs(totalMessages.length, results.quota)
			} else {
				this.notifier.notifyInboxMsg(totalMessages[0], results.quota)
			}
		}
	}

	queryReputationChanges() {
		// TODO: Implement a call to /2.2/me/reputation?site=stackoverflow and parse results
	}
}
