'use strict';

const path = require('path'),
	notifier = require(path.join(__dirname, 'js/notifier.js')),
	baseUrl = 'https://stackoverflow.com/',
	suffix = '?sort=newest&pageSize=15',
	tagString = 'questions/tagged/' + $('#tags').text().replace(/,/g, '+').toLowerCase(),
	qryInterval = $('#query-interval').text(),
	completeUrl = baseUrl + tagString + suffix;

let queue = [];


const sortByTimeStamp = (a,b) => {
	if (a.ts < b.ts)
		return 1;
	if (a.ts > b.ts)
		return -1;
	return 0;
};


const addToQueue = element => {
	// Enforce max size on queue
	if (queue.length === 15) {
		queue.pop()
	}
	queue.unshift(element)
};


const getDateTimeFromTimestamp = unixTimeStamp => {
	let date = new Date(unixTimeStamp);
	return ('0' + date.getDate()).slice(-2) +
		'/' + ('0' + (date.getMonth() + 1)).slice(-2) +
		'/' + date.getFullYear() + ' ' +
		('0' + date.getHours()).slice(-2) + ':' +
		('0' + date.getMinutes()).slice(-2);
};


const isQuestionExists = (arr, questionObj) => {
	let result = arr.find(element => element.ts === questionObj.ts);
	return result !== undefined && result.title === questionObj.title;
};


const parseQuestionToObject = item => {
	let $item = $(item);
	return {
		title: $item.find('h3 > a').text(),
		asker: $item.find('.user-details > a').text(),
		url: baseUrl + $item.find('.question-hyperlink').attr('href'),
		ts: Date.parse($item.find('.user-action-time > span').attr('title'))
	}
};

// Flow
$(function() {

	function getNewBatch(page) {
		return new Promise((resolve, reject) => {
			let $page = $(page),
				questions = $page.find('.question-summary'),
				newQuestionsCount = 0;

			$.each(questions, (_, item) => {
				let questionObj = parseQuestionToObject(item);
				// First run to collect base case data to compare against
				if (queue.length !== 15) {
					queue.push(questionObj)
				} else if (isQuestionExists(queue, questionObj)) {
					addToQueue(questionObj);
					newQuestionsCount++;
				}
			});
			queue.sort(sortByTimeStamp);
			// TODO: Test new isQuestionExist to see if accurate ts' are being used
			resolve(newQuestionsCount);
		})
	}

	const getQuestionPage = () => {
		// Life is good without CORS

		$.ajax({
			type: 'GET',
			url: completeUrl,
			success: page => {
				getNewBatch(page)
					.then(() => {
						console.log(queue);
						queue.forEach((el) => {
							console.log(getDateTimeFromTimestamp(el.ts))
						})
						// notifier.notify(newQuesCount, queue)
					})
					.catch((err) => {
						console.error(err)
					})
			},
			error: err => {
				console.log(err)
			}
		})
	};

	const callAll = () => {
		// Urgent: find a better name than "callAll" :<
		getQuestionPage();
		setTimeout(() => {
			callAll()
		}, 120000)};


	callAll()

});