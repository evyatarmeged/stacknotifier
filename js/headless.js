// Scraping, parsing & notifying logic goes here. Using jQuery AJAX requests (no CORS limitation). yay

$(function() {

	const BASE_URL = 'https://stackoverflow.com/questions/tagged/',
		SUFFIX = '?sort=newest&pageSize=15',
		TAGS = $('#tags').text().split(' ').join('+'),
		qryInterval = $('#query-interval').text(),
		URL = BASE_URL + TAGS + SUFFIX;

	let newQuestions = new Set();

	function getNotifications() {
		// (h3 > a).text() = question title
		// (.user-details > a).text() = asker
		// (.user-action-time > span).getAttribute(title) = timestamp
		// OMMFG PROGRESS

		$.ajax({
			type: 'GET',
			url: URL,
			success: (page) => {
				console.log()
				let questions = $(page).find('.question-summary');
				$.each(questions, (index, item) => {
					console.log($(item).find('h3 > a').text());
				})
			},
			error: (err) => {
				console.log(err)
			}
		})
	}

	getNotifications()



})