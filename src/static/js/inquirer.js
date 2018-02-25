'use strict'

const path = require('path'),
	Notifier = require(path.join(__dirname, 'js/notifier.js')),
	baseUrl = 'https://stackoverflow.com/',
	suffix = '?sort=newest&pageSize=15',
	tagString = 'questions/tagged/' + $('#tags').text().replace(/,/g, '+').toLowerCase(),
	qryInterval = $('#query-interval').text(),
	completeUrl = baseUrl + tagString + suffix


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
	let $item = $(item)
	return {
		title: $item.find('h3 > a').text(),
		body: $item.find('.excerpt').text().trim(),
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

	$.fn.reverse = [].reverse;

	let notifier = new Notifier(),
		queue = []


	function getNewBatch(page) {
		return new Promise((resolve, reject) => {
			try {
				let $page = $(page),
					questions = $page.find('.question-summary'),
					newQuestionsCount = 0

				questions.reverse().each((_, item) => {
					let questionObj = parseQuestionToObject(item)
					// First run to collect base case data to compare against
					if (queue.length !== 15) {
						queue.push(questionObj)

						/* Test if the question exists in queue and if its timestamp is larger than the
						newest question or it's just a question that propagated up due to deletion, etc. */
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
						// ### Notify all new questions ###
						let last = queue[0]
						// To be removed
						console.log(result)
						queue.forEach((item) => {
							console.log(notifier.getDateTimeFromTimestamp(item.ts, item.title))
						})
						// End to be removed

						if (result > 0) {
							result > 1 ? notifier.genericNotify(result, queue) : notifier.notify(last, last.body)
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

	const execute = () => {
		getQuestionPage()
		setTimeout(() => {
			execute()
		}, 300000)}

	execute()
})

// Add tags list and validation
