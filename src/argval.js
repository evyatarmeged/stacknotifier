const invalidQueryInterval = `Invalid query interval parameter. Specify a number between 0.5 and 60`,
	invalidTags = `Tags must be comma separated, valid Stackoverflow tags.
Not sure about your tag ? look it up here: https://stackoverflow.com/tags`,
	invalidCredentials = `Username or Password are missing or invalid`;


function credentialsValidation(username, password) {
	return new Promise((resolve, reject) => {
		if (!(username && password)) {
			reject(invalidCredentials)
		}
		resolve()
	})
}

function invalidArguments(err) {
	process.stdout.write(`${err}\r\n`);
	// window.close();
	// process.exit(1)
}


function intervalValidation(interval) {
	return new Promise((resolve, reject) => {
		if (isNaN(interval) || interval < 0.5 || interval > 60) {
			reject(invalidQueryInterval)
		}
		resolve()
	})
}


function tagValidation(tags) {
	return new Promise((resolve, reject) => {
		if (!tags) reject();

		fs.readFile(path.join(__dirname, './static/tags.txt'), (err, content) => {
			if (err) throw (err);
			let fileContent = content.toString().split('\r\n');
			tags.split(',').forEach(tag => {
				if (!fileContent.includes(tag)) {
					reject(invalidTags)
				}
			});
			resolve()
		})
	})
}


function validateRequired(interval, tags) {
	Promise.all([intervalValidation(interval), tagValidation(tags)])
		.then(() => {})
		.catch(e => {
			invalidArguments(e)
		})
}

function validateOptional(user, pass) {
	Promise.all([credentialsValidation(user, pass)])
		.then(() => {})
		.catch(e => {
			invalidArguments(e)
		})
}

module.exports = {
	validateRequired, validateOptional
};
