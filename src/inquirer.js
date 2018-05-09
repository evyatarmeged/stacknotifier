const Notifier = require(path.join(__dirname, '../notifier.js')),
	User = require(path.join(__dirname, '../user.js')),
	validator = require(path.join(__dirname, '../argval.js')),
	baseUrl = 'https://stackoverflow.com/',
	suffix = '?sort=newest&pageSize=15';


let urlTagString = 'questions/tagged/';
let user;

function assignVarArgs() {
	let interval, tags, username, password;

	interval = $('#query-interval').text();
	tags = $('#tags').text().toLowerCase();
	username = $('#username').text();
	password = $('#password').text();

	return [interval, tags, username, password]
}


let [interval, tags, username, password] = assignVarArgs();
let timeUnit = interval >=1 ? 'minutes' : 'minute';

const sortByTimeStamp = (a,b) => {
	if (a.ts < b.ts) {
		return 1
	}
	if (a.ts > b.ts) {
		return -1
	}
	return 0
};

const questionExists = (arr, question) => {
	let result = arr.find(element => element.ts === question.ts);
	return result !== undefined && result.title === question.title
};

function parseQuestionToObject(item) {
	let $item = $(item);
	return {
		title: $item.find('h3 > a').text(),
		body: $item.find('.excerpt').text().trim().split(' ').splice(0, 15).join(' ') + '...',
		asker: $item.find('.user-details > a').text(),
		url: baseUrl + $item.find('.question-hyperlink').attr('href'),
		ts: Date.parse($item.find('.user-action-time > span').attr('title'))
	}
}

const newerThanNewest = (newest, current) => {
	return current.ts > newest.ts
};

function stringifyTags(tags) {
	let stringified = '';
	if (!tags.includes('+')) {
		stringified = `[${tags[0].toUpperCase()}${tags.slice(1)}]`
	} else {
		tags.split('+').forEach((tag) => {
			stringified += `[${tag[0].toUpperCase()}${tag.slice(1)}]`
		});
	}
	return stringified
}

// Flow
$(function() {

	validator.validateRequired(interval, tags);

	if (username && password) {
		validator.validateOptional(username, password)
	}

	$.fn.reverse = [].reverse;

	interval *= 60000;
	tags = tags.replace(/,/g, '+');
	urlTagString += tags;

	/* Deal with trailing comma breaking the script
	 e.g tag: Java, would cause a urlTagString of questions/tagged/java+ <-- this would get no results
  */
	if (urlTagString.endsWith('+')) {
		let pos = urlTagString.lastIndexOf('+');
		urlTagString = `${urlTagString.substring(0, pos)}${urlTagString.substring(pos+1)}`
	}

	let completeUrl = baseUrl + urlTagString + suffix,
		queue = [];

	const notifier = new Notifier();
	if (username && password) {
		user = new User(username, password, notifier);
	}



	function getNewBatch(page) {
		return new Promise((resolve, reject) => {
			try {
				let $page = $(page),
					questions = $page.find('.question-summary'),
					newQuestionsCount = 0;

				questions.reverse().each((_, item) => {
					let questionObj = parseQuestionToObject(item);
					if (queue.length !== 15) {
						queue.push(questionObj)
					} else if (!questionExists(queue, questionObj) && newerThanNewest(queue[0], questionObj)) {
						queue.unshift(questionObj);
						queue.pop();
						newQuestionsCount++
					}
				});
				queue.sort(sortByTimeStamp);
				resolve(newQuestionsCount)

			} catch (e) {
				reject(e)
			}
		})
	}

	function getQuestionPage() {
		// Life is good without CORS
		$.ajax({
			type: 'GET',
			url: completeUrl,
			success: page => {
				getNewBatch(page)
					.then((result) => {
						if (result > 0) {
							result > 1 ? notifier.notifyMultipleQuestions(result, completeUrl) : notifier.notifyQuestion(queue[0])
						}
					})
					.catch((err) => {
						console.error(err)
					})
			},
			error: err => {
				let $err = $(err.responseText),
					status = err.status;
				notifier.errorNotify(status + '\r\n' + $err[1].text)
			}
		})
	}

	const makeAPIcalls = () => {
		// user.queryReputationChanges();
		user.queryInbox();
	};

	function execute() {
		getQuestionPage();
		if (user && user.token) {
			makeAPIcalls();
		}
		setTimeout(() => {execute()}, interval)
	}
	
	// 'Main'
	if (user) {
		try {
			process.stdout.write(`Trying to get token for ${user.email}. This may take a few seconds\n`);
			user.getToken()
					.then(() => {
						if (!user.token) throw new Error(`Could not obtain token for ${user.email}. Will not query inbox.\r\n`);
						process.stdout.write(`API token for ${user.email} obtained successfully.\n`);
						process.stdout.write(`Getting accountID for inbox queries...\n`);
						user.getId()
								.then(() => {
									if (!user.accountID) throw new Error(`Could not obtain account id. \
									Inbox on-click events will not work.`);
									process.stdout.write(`Done\n`);
									process.stdout.write(`Fetching ${stringifyTags(tags)} questions every ${interval / 60000} \
									${timeUnit}\n`)
									
								})
								.catch(e => {
									process.stdout.write(`${e}\r\n`)
								})
					})
					.catch(e => process.stdout.write(`${e.toString()}`));
			// No support for Promise.finally() even in electron 2.0.0 ¯\_(ツ)_/¯
		} catch (e) {
			console.error(`Error grabbing API credentials :\n${e}`);
		} finally {
			execute()
		}
	} else {
		process.stdout.write(`Fetching ${stringifyTags(tags)} questions every ${interval / 60000} ${timeUnit}\r\n`);
		execute()
	}
});
