// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')
const Chrome = require('selenium-webdriver/chrome')


module.exports = class User {
	constructor (email, password, notifier, driverPath) {
		this.email = email;
		this.password = password;
		// Add option to specify chrome/gecko driver
		this.driver = this.getDriver(driverPath);
		this.wait = 1500;
		this.token = null;
		this.notifier = notifier;
	}

	classifyDriver() {
		// Classify as Chrome or Gecko
	}

	// Set up appropriate driver
	getDriver(driverPath) {
		console.log(driverPath)
		return new Builder()
		.forBrowser('firefox')
		// .setFirefoxOptions(new Firefox.Options().headless())
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

		} catch (exc) {
			// Throw notification that token was not obtained
			console.error('ERR', exc)
		} finally {
				await this.driver.quit();
		}
	}

	queryInbox(){
		$.ajax({
			type: 'GET',
			url: `https://api.stackexchange.com/2.2/inbox/unread?key=U4DMV*8nvpm3EOpvf69Rxw((&page=1&pagesize=5&
			filter=default&access_token=${this.token}`,
			success: result => {
				this.parseInboxResults(result)
			},
			error: err => {
				console.error(err)
			}
		})
	}

	parseInboxResults(results) {
		// If new msgs exists, throw notif
		console.log(JSON.stringify(results));
	}

	queryAchievements() {
		// Available in API ?
	}
}
