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
}

const addToQueue = item => {
	// Enforce max size on queue
	if (queue.length === 15) {
		queue.pop()
	}
	queue.unshift(item)
}


const getDateTimeFromTimestamp = unixTimeStamp => {
	let date = new Date(unixTimeStamp);
	return ('0' + date.getDate()).slice(-2) +
		'/' + ('0' + (date.getMonth() + 1)).slice(-2) +
		'/' + date.getFullYear() + ' ' +
		('0' + date.getHours()).slice(-2) + ':' +
		('0' + date.getMinutes()).slice(-2);
}

const isQuestionExists = questionObj => {
	let exists = false,
		index = 0;
	while (!exists && index < queue.length) {
		let current = queue[index];
		exists = compare(questionObj, current)
		index ++;
	}
	return exists;
}

const compare = (a, b) => {
	return a.title === b.title && a.ts === b.ts
}


// Flow
$(function() {


	async function parseQuestions(page) {
		let $page = $(page),
			questions = $page.find('.question-summary'),
			newQuestions = [],
			newQuesCount = 0;

		$.each(questions, (index, item) => {
			let $item = $(item),
				title = $item.find('h3 > a').text(),
				asker = $item.find('.user-details > a').text(),
				url = baseUrl + $item.find('.question-hyperlink').attr('href'),
				ts = Date.parse($item.find('.user-action-time > span').attr('title'));

			let questionObj = {
				title: title,
				asker: asker,
				url: url,
				ts: ts
			}

			if (queue.length !== 15) {
				queue.push(questionObj)
			} else {
				newQuestions.push(questionObj);
				if (!isQuestionExists(questionObj)) {
					newQuesCount ++;
				}
			}
		})

		// TODO: Fix questions not being in the right order (newest -> oldest) after 1st run
		// queue.sort(sortByTimeStamp)

		// if (newQuestions.length !== 0) {
		// 	newQuestions.reverse().forEach((obj) => {
		// 		addToQueue(obj)
		// 	})

			// queue.forEach((item) => {
			// 	console.log(getDateTimeFromTimestamp(item.ts))
			// })
		// }
		if (newQuestions === 15) {
			queue = newQuestions;
		}
		console.log(newQuesCount);
		return newQuesCount;
	}

	const getQuestionPage = () => {
		// Life is good without CORS

		$.ajax({
			type: 'GET',
			url: completeUrl,
			success: page => {
				parseQuestions(page)
					.then((newQuesCount) => {
						notifier.notify(newQuesCount, queue)
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

	const callAll = () => {
		// Urgent: find a better name than "callAll" :<
		getQuestionPage()
		setTimeout(() => {
			callAll()
		}, 20000)}


	callAll()

})