// TODO: Read https://api.stackexchange.com/docs/authentication
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const Firefox = require('selenium-webdriver/firefox')


class User {
	constructor (email, password) {
		this.email = email;
		this.password = password;
		this.driver = this.getDriver();
		this.wait = 5000;
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
		try {
			await this.driver.switchTo().window(authWindow)
			await this.driver.sleep(this.wait)
			await this.driver.findElement(By.css(googleCss)).click();
			await this.driver.sleep(this.wait)
			await this.driver.findElement(By.css(userInputCss)).sendKeys(this.email, Key.ENTER);
			await this.driver.sleep(this.wait)
			await this.driver.findElement(By.css(passwordInputCss)).sendKeys(this.password, Key.ENTER);
			await this.driver.switchTo().window(parentWindow)
			await this.driver.sleep(this.wait)
		} catch (exc) {
			console.log(exc)
		} finally {
			// await this.driver.quit()
			console.log('lolz')
		}
	}

	queryInbox(){}

	queryAchievements(){}

}

let user = new User();
user.getToken()