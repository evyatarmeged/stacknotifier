// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')


class User {
	constructor (email, password) {
		this.email = email;
		this.password = password;
		// Add option to specify chrome/gecko driver
		this.driver = this.getDriver();
		this.wait = 1500;
		this.token = null;
	}

	// Chrome/Gecko driver should be a cli arg / read from cfg (yaml)
	getDriver() {
		return new Builder()
		.forBrowser('firefox')
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

		} catch (exc) {
			// Throw notification that token was not obtained
			console.error('ERR', exc)

		} finally {
			await this.driver.switchTo().window(parentWindow)
			this.driver.sleep(this.wait * 3)
			this.driver.executeScript(tokenizeString).then(token => {
				this.token = token;
				console.log(this.token)
				this.driver.quit();
			})
		}
	}

	queryInbox(){}

	queryAchievements(){}

}

let user = new User();
user.getToken()
