const {Builder, By, Key, until} = require('selenium-webdriver');
const request = require('request');


// Gecko driver built in ? hmmmmmm
(async function obtainAccessToken() {
	// TODO: Add headless option when finished
	// TODO: Chain to promises
	// TODO: Export to function that returns token
	// TODO: Close driver @ flow end
	let driver = await new Builder().forBrowser('firefox').build();
	let authWindow;
	try {
		await driver.get('https://api.stackexchange.com/docs/inbox-unread');
		let parentWindow = driver.getWindowHandle();
		await driver.findElement(By.css('.load-access-token')).click();
		let windows = await driver.getAllWindowHandles();
		await windows.forEach(window => {
			if (window !== parentWindow) {
				authWindow = window
			}
		})
		// Get credentials from cli args / GUI
		await driver.switchTo().window(authWindow)
		await driver.sleep(2500)
		await driver.findElement(By.css('.major-provider.google-login')).click();
		await driver.sleep(2500)
		await driver.findElement(By.css('#identifierId')).sendKeys(user, Key.ENTER);
		await driver.sleep(2500)
		await driver.findElement(By.css('.whsOnd.zHQkBf')).sendKeys(password, Key.ENTER);
		await driver.switchTo().window(parentWindow)
		await driver.sleep(7500)
	} finally {
		// Is this the Stack exchange API anonymous/public key ? => U4DMV*8nvpm3EOpvf69Rxw((
		driver.executeScript("return $('#param-access_token').attr('value');").then(token => {
			request({url:'https://api.stackexchange.com/2.2/inbox/unread?key=U4DMV*8nvpm3EOpvf69Rxw((&page=1&pagesize=5&filter=default&access_token='+token,
				headers: {'accept-encoding': 'gzip'}, gzip: true}, (err, res, body) => {
					console.log(res.statusCode);
					console.log(body);
			})

		}).catch(e => {
			console.log(e)
		})
	}
})();
