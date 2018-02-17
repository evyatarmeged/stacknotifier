
const open = require('open');

module.exports = class Notifier {

	getDateTimeFromTimestamp(unixTimeStamp) {
		let date = new Date(unixTimeStamp);
		return ('0' + date.getDate()).slice(-2) +
			'/' + ('0' + (date.getMonth() + 1)).slice(-2) +
			'/' + date.getFullYear() + ' ' +
			('0' + date.getHours()).slice(-2) + ':' +
			('0' + date.getMinutes()).slice(-2);
	}

	genericNotify(n, quesArr) {
		let notif = new Notification('Got ' + n + ' new questions. Click to create notifications.')
		notif.onclick = event => {
			for (let q of quesArr) {
				// Replace with notification & for range of new questions only
				console.log(q.title)
			}
		}
	}

	notify(question) {
		new Notification(question.title, {
			body: 'Asked by: ' + question.asker +
			'\r\n\r\n' + this.getDateTimeFromTimestamp(question.ts),
			icon: 'sof.png'
		}).onclick = event => {
			open(question.url)
		};
	}
}
