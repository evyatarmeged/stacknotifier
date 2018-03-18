'use strict'

const path = require('path'),
	Notifier = require(path.join(__dirname, 'js/notifier.js')),
	User = require(path.join(__dirname, './user.js')),
	argval = require(path.join(__dirname, 'js/argval.js')),
	baseUrl = 'https://stackoverflow.com/',
	suffix = '?sort=newest&pageSize=15';


let isCommandLine = !!$('title').text().includes('cli');
let urlTagString = 'questions/tagged/';

function assignVarArgs() {
	let interval, tags;

	if (isCommandLine) {
		interval = $('#query-interval').text();
			tags = $('#tags').text().toLowerCase()
	} else {
		interval = $('#query-interval').val();
			tags = $('#tags').val().toLowerCase()
	}
	return [interval, tags]
}


let [qryInterval, _tags] = assignVarArgs()


const sortByTimeStamp = (a,b) => {
	if (a.ts < b.ts) {
		return 1
	}
	if (a.ts > b.ts) {
		return -1
	}
	return 0
}

const questionExists = (arr, question) => {
	let result = arr.find(element => element.ts === question.ts)
	return result !== undefined && result.title === question.title
}

const parseQuestionToObject = item => {
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

	argval.validateArgs(qryInterval, _tags);
	$.fn.reverse = [].reverse;

	qryInterval *= 60000;
	_tags = _tags.replace(/,/g, '+');
	urlTagString += _tags

	let completeUrl = baseUrl + urlTagString + suffix,
		queue = [];

	const notifier = new Notifier(completeUrl),
			user = new User;

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

	const getQuestionPage = () => {
		// Life is good without CORS
		$.ajax({
			type: 'GET',
			url: completeUrl,
			success: page => {
				getNewBatch(page)
					.then((result) => {
						// To be removed
						console.log(result)
						queue.forEach((item) => {
							console.log(Notifier.getDateTimeFromTimestamp(item.ts))
						})
						// End to be removed
						if (result > 0) {
							result > 1 ? notifier.genericNotify(result) : notifier.notify(queue[0])
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

	const MakeAPIcall = () => {
		user.queryAchievements();
		user.queryInbox();
	}

	const execute = () => {
		getQuestionPage()
		setTimeout(() => {
			execute()
		}, 120000)}

	execute()
})
