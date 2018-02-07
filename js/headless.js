// bzz

$(function() {

	const BASE_URL = 'https://stackoverflow.com/',
		SUFFIX = '?sort=newest&pageSize=15',
		TAGS = 'questions/tagged/' + $('#tags').text().replace(/,/g, '+').toLowerCase(),
		QRY_INTERVAL = $('#query-interval').text(),
		URL = BASE_URL + TAGS + SUFFIX;

	let queue = [];


	const addToQueue = item => {
		// Enforce max size on queue
		if (queue.length === 15) {
			queue.shift()
		}
		queue.push(item)
	}

	const timeStampComparison = (a, b) => {
		const tsA = a.ts,
			tsB = b.ts;

		let comparison = 0;
		if (tsA > tsB) {
			comparison = 1;
		} else if (tsB > tsA) {
			comparison = -1;
		}
		return comparison;
	}

	const parseQuestions = page => {
		let $page = $(page),
			questions = $page.find('.question-summary');
		$.each(questions, (index, item) => {
			let $item = $(item),
				title = $item.find('h3 > a').text(),
				asker = $item.find('.user-details > a').text(),
				url = BASE_URL + $item.find('.question-hyperlink').attr('href')
				ts = Date.parse($item.find('.user-action-time > span').attr('title'));

			let questionObj = {
				title: title,
				asker: asker,
				url: url,
				ts: ts
			}

			if (queue.includes(questionObj)) {
				console.log('Question ' + questionObj.title + ' with time stamp ' + questionObj.ts + ' is in the queue')
			} else {
				console.log('not in q(???)')
				queue.push(questionObj)
			}
		})

		queue.sort(timeStampComparison)
	}

	const isQuestionExists = () => {

	}

	const replaceOldQuestions = () => {
		// Out with the old in with the new
	}

	const getQuestionPage = () => {
		// Life is good with no CORS

		$.ajax({
			type: 'GET',
			url: URL,
			success: page => {
				parseQuestions(page)
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
		}, QRY_INTERVAL)}

	callAll()

})