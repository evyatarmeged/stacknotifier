// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')


class User {
	constructor (email, password) {
		this.email = email;
		this.password = password;
		this.driver = null;
		this.token = null;

	}

	waitForElement(el) {
		return new Promise((resolve, reject) => {
			this.driver.wait(until.elementIsVisible(el), 5000).then(() => {
				resolve(el)
			}).catch(e => {
				reject(e)
			})
		})

	}

	async initDriverAndGetToken() {
		let authWindow, parentWindow;
		let accessTokenCss = '.load-access-token',
			googleCss = '.major-provider.google-login',
			userInputCss = '#identifierId',
			passwordInputCss = '.whsOnd.zHQkBf';

		this.driver = await new Builder()
			.forBrowser('firefox')
			.build()
		parentWindow = await this.driver.getWindowHandle();
		this.driver.get('https://api.stackexchange.com/docs/inbox-unread')
		this.driver.findElement(By.css(accessTokenCss)).click()
		let windows = await this.driver.getAllWindowHandles();
		await windows.forEach(window => {
			if (window !== parentWindow) {
				authWindow = window
			}
		})
		await this.driver.switchTo().window(authWindow)

	}

	queryInbox(){}

	queryAchievements(){}

}

let user = new User();
user.initDriverAndGetToken()