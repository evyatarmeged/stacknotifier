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


const isQuestionExists = (arr, questionObj) => {
	let result = arr.find(element => element.ts === questionObj.ts)
	return result !== undefined && result.title === questionObj.title
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


// Flow
$(function() {

	let notifier = new Notifier(),
		queue = []


	function getNewBatch(page) {
		return new Promise((resolve, reject) => {
			let $page = $(page),
				questions = $page.find('.question-summary'),
				newQuestionsCount = 0

			$.each(questions, (_, item) => {
				let questionObj = parseQuestionToObject(item)
				// First run to collect base case data to compare against
				if (queue.length !== 15) {
					queue.push(questionObj)
				} else if (!isQuestionExists(queue, questionObj)) {

					// Still lacking. Needs improvement.

					queue.unshift(questionObj);
					queue.pop();
					newQuestionsCount++
				}
			})

			queue.sort(sortByTimeStamp)
			// TODO: Test new isQuestionExist to see if accurate ts' are being used
			resolve(newQuestionsCount)
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
						console.log(result)
						queue.forEach((item) => {
							console.log(notifier.getDateTimeFromTimestamp(item.ts))
						})
					})
					.catch((err) => {
						console.error(err)
					})
			},
			error: err => {
				console.log(err)
			}
		})
	}

	const execute = () => {
		getQuestionPage()
		setTimeout(() => {
			execute()
		}, 120000)}

	execute()

})
