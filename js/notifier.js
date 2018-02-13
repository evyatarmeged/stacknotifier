
const open = require('open');

module.exports = {

	genericNotify: function(n, quesArr) {
		let notif = new Notification('Got ' + n + ' New Questions. Click to {{something}}')
		// onclick logic
	},
	notify: function(question) {
			let notif = new Notification(question.title, {
				// Scrape body too ?
				// body: question[0].title + '\r\n\r\n' + 'Asked by: ' + question[0].asker,
				icon: 'sof.png'
			})

			notif.onclick = function(event) {
				// Is there a default ?
				event.preventDefault();
				open(question.url);
			}
	},
	notifyAll: function() {
	}
}