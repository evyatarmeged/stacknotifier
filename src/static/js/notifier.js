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

	notifyMultipleQuestions(n, url) {
		let notif = new Notification(`Got ${n} new questions.`, {icon: $('#sof').attr('src')})
		notif.onclick = event => {
			event.preventDefault();
			open(url)
		}
	};

	notifyQuestion(question) {
		new Notification(question.title, {
			body: `${question.body}\r\n\r\nAsked by: ${question.asker}\r\n'${Notifier.getDateTimeFromTimestamp(question.ts)}`,
		}).onclick = event => {
			event.preventDefault();
			open(question.url)
		};
	}

	notifyInboxMsg(content, quota) {
		new Notification("Unread Inbox Message", {
			body: `${content.title}\r\n\r\nType: ${content.item_type}\r\nRemaining API Quota: ${quota}`,
			icon: $('#msg').attr('src')
		}).onclick = event => {
			// Goto msg URL
			event.preventDefault();
			open(content.link)
		}
	}

	notifyMultipleMsgs(n, quota) {
		new Notification(`Got {n} Unread Inbox Messages`, {
			body: `Remaining API Quota: ${quota}`,
			icon: $('#msg').attr('src')
		}).onclick = event => {
			// Open user inbox ?
		}
	}

	errorNotify(msg) {
		new Notification('Stackoverflow notifier has encountered an error', {body:msg})
	};
}
