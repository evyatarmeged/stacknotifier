const Notifier = require(path.join(__dirname, 'js/notifier.js')),
	User = require(path.join(__dirname, '/js/user.js')),
	validator = require(path.join(__dirname, 'js/argval.js')),
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


let [interval, tags, username, password] = assignVarArgs()


const sortByTimeStamp = (a,b) => {
	if (a.ts < b.ts) {
		return 1
	}
	if (a.ts > b.ts) {
		return -1
	}
	return 0
}

const noToken = () => {
	process.stdout.write(`Unable to grab token for ${user.email}. Will not query inbox.\n`)
}

const questionExists = (arr, question) => {
	let result = arr.find(element => element.ts === question.ts)
	return result !== undefined && result.title === question.title
}

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
	urlTagString += tags

	/* Deal with trailing comma breaking the script
	 e.g tag: Java, would cause a urlTagString of questions/tagged/java+ <-- this would get no results
  */
	if (urlTagString.endsWith('+')) {
		let pos = urlTagString.lastIndexOf('+')
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
					newQuestionsCount = 0

				questions.reverse().each((_, item) => {
					let questionObj = parseQuestionToObject(item)
					if (queue.length !== 15) {
						queue.push(questionObj)
					} else if (!questionExists(queue, questionObj) && newerThanNewest(queue[0], questionObj)) {
						queue.unshift(questionObj);
						queue.pop();
						newQuestionsCount++
					}
				})
				queue.sort(sortByTimeStamp)
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
	}

	function execute() {
		getQuestionPage();
		if (user && user.token) {
			makeAPIcalls();
		}
		setTimeout(() => {execute()}, interval)
	}

	// 'Main'
	if (user) {
		process.stdout.write(`Trying to get token for ${user.email}. This may take a few seconds\n`);
		user.getToken()
			.then(() => {
				if (!user.token) {
					noToken();
				} else {
					process.stdout.write(`API token for ${user.email} obtained successfully.\n`)
					process.stdout.write(`Getting accountID for inbox/reputation queries...\n`)
						.then(() => {
					user.getId()
							if (!user.accountID) {
								process.stdout.write(`Could not get accountID. Inbox & reputation on-click events will not work.\n`)
							} else {
								process.stdout.write(`Done\n`)
							}
						})
				}
				execute()
			})
			.catch(e => noToken())
	} else {
		execute()
	}
})
