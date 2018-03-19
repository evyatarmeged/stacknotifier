const fs = require('fs'),
	path = require('path'),
	invalidQueryInterval = `Invalid query interval parameter. Specify a number between 0.5 and 60`,
	invalidTags = `Tags must be comma separated, no spaces, valid Stackoverflow tags. 
		Not sure about your tag ? look it up here: https://stackoverflow.com/tags`,
	invalidCredentials = `Username or Password are missing or invalid`,
	invalidWebdriver = `Webdriver path was not provided or driver is invalid.`;


const webdriverValidation = driver => {
	driver = driver.toLowerCase();
	return new Promise((resolve, reject) => {
		if (!driver || (!driver.includes('chromedriver') && !driver.includes('geckodriver'))) {
			reject(invalidWebdriver)
		}
		resolve()
	})

}

const credentialsValidation = (username, password) => {
	return new Promise((resolve, reject) => {
		if (!username || !password) {
			reject(invalidCredentials)
		}
		resolve()
	})
}

const invalidArguments = err => {
	process.stdout.write(`${err}\r\n`);
	window.close();
	process.exit(1)
};


const intervalValidation = interval => {
	return new Promise((resolve, reject) => {
		if (isNaN(interval) || interval < 0.5 || interval > 60) {
			reject(invalidQueryInterval)
		}
		resolve()
	})
}


const tagValidation = tags => {
	return new Promise((resolve, reject) => {
		if (!tags) resolve();

		fs.readFile(path.join(__dirname, '../tags.txt'), (err, content) => {
			if (err) throw (err);
			let fileContent = content.toString().split('\r\n');
			tags.split(',').forEach(tag => {
				if (!fileContent.includes(tag)) {
					reject(invalidTags)
				}
			})
			resolve()
		})
	})
}


function validateRequired(interval, tags) {
	Promise.all([intervalValidation(interval), tagValidation(tags)])
		.then(() => {
			return true;
		})
		.catch(e => {
			invalidArguments(e)
		})
}

function validateOptional(user, pass, dpath) {
	Promise.all([credentialsValidation(user, pass), webdriverValidation(dpath)])
		.then(() => {
			return true;
		})
		.catch(e => {
			invalidArguments(e)
		})
}


let validator = {
	validateRequired, validateOptional
}

module.exports = {validator}