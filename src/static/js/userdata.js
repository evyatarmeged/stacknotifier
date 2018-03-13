// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')


class User {
	constructor (email, password) {
		this.email = email;
		this.password = password;
		this.driver = this.getDriver();
		this.token = null;
	}

	// Chrome/Gecko driver should be a cli arg / read from cfg (yaml)
	getDriver() {
		return new Builder()
		.forBrowser('firefox')
		.build()
	}

	async getToken() {
		let authWindow, parentWindow;
		let accessTokenCss = '.load-access-token',
			googleCss = '.major-provider.google-login',
			userInputCss = '#identifierId',
			passwordInputCss = '.whsOnd.zHQkBf';


		this.driver.get('https://api.stackexchange.com/docs/inbox-unread')
		parentWindow = await this.driver.getWindowHandle();
		this.driver.findElement(By.css(accessTokenCss)).click()
		let windows = await this.driver.getAllWindowHandles();
		await windows.forEach(window => {
			if (window !== parentWindow) {
				authWindow = window
			}
		})
		await this.driver.switchTo().window(authWindow).catch(e => console.error(e))
		await this.driver.wait(() => {
			return this.driver.findElement(By.css(googleCss)).then(el =>  {
				return el;
			})
		}, 5000, 'Failed to wait for 5 secs')

		await this.driver.quit()
	}

	queryInbox(){}

	queryAchievements(){}

}

let user = new User();
user.getToken()