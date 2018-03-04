const open = require('open');

module.exports = class Notifier {

	static getDateTimeFromTimestamp(unixTimeStamp) {
		let date = new Date(unixTimeStamp);
		return ('0' + date.getDate()).slice(-2) +
			'/' + ('0' + (date.getMonth() + 1)).slice(-2) +
			'/' + date.getFullYear() + ' ' +
			('0' + date.getHours()).slice(-2) + ':' +
			('0' + date.getMinutes()).slice(-2);
	};

	genericNotify(n, quesArr) {
		let notif = new Notification('Got ' + n + ' new questions. Click to create notifications.')
		notif.onclick = event => {
			for (let i=0; i < n; i++) {
				this.notify(quesArr[i])
			}
		}
	};

	notify(question, body='') {
		let newline = body ? '\r\n\r\n' : '\r\n';
		new Notification(question.title, {
			body: body + newline + 'Asked by: ' + question.asker +
			'\r\n' + Notifier.getDateTimeFromTimestamp(question.ts),
			icon: $('img').attr('src')
		}).onclick = event => {
			// Testing purposes
			event.preventDefault();
			open(question.url)
g		};
	}

	errorNotify(msg) {
		new Notification('Stackoverflow notifier has encountered an error', {body:msg})
	};
}
