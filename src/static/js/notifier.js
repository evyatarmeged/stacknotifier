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

	genericNotify(n, url) {
		let notif = new Notification(`Got ${n} new questions.`)
		notif.onclick = event => {
			event.preventDefault();
			open(url)
		}
	};

	notifyQuestion(question) {
		new Notification(question.title, {
			body: `${question.body}'\r\n\r\n'Asked by: ${question.asker}
			'\r\n'${Notifier.getDateTimeFromTimestamp(question.ts)}`,
			icon: $('#sof').attr('src')
		}).onclick = event => {
			event.preventDefault();
			open(question.url)
		};
	}

	notifyInbox(content, quota) {
		new Notification("Unread Inbox Message", {
			body: `For question: ${content.title}\r\nType: ${content.item_type}\r\nRemaining API Quota: ${quota}`,
			icon: $('#msg').attr('src')
		}).onclick = event => {
			event.preventDefault();
			open(content.link)
		}
	}

	errorNotify(msg) {
		new Notification('Stackoverflow notifier has encountered an error', {body:msg})
	};
}
