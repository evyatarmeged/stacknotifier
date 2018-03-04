const fs = require('fs'),
	path = require('path'),
	invalidQueryInterval = 'Invalid query interval parameter. Specify' +
		' a number between 0.5 and 60',
		invalidTags = 'Tags must be comma separated, no spaces, valid Stackoverflow tags.\n' +
			'Not sure about your tag ? look it up here: https://stackoverflow.com/tags';


const invalidArguments = err => {
	process.stdout.write(err + '\r\n');
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


function validateArgs(interval, tags) {
	// The 2 promises should be chained and use a joint catch
	intervalValidation(interval)
		.then(() => {
			tagValidation(tags)
				.catch(e => {
					invalidArguments(e)
				})
		})
		.catch(e => {
			invalidArguments(e)
		})
	return true;
}


module.exports = {validateArgs}