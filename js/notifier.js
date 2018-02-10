
const open = require('open');

module.exports = {

	notify: function(newQuesCount, quesArr) {
		if (newQuesCount > 0) {
			let notif = new Notification('New Questions. Click to view', {
				body: quesArr[0].title + '\r\n\r\n' + 'Asked by: ' + quesArr[0].asker,
				icon: 'sof.png'
			})

			notif.onclick = function(event) {
				event.preventDefault();
				open(quesArr[0].url);
			}
		}
	}
}