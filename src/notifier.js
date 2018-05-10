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
		new Notification(`Got ${n} new questions.`, {
			icon: $('#sof').attr('src')
		}).onclick = event => {
			event.preventDefault();
			open(url)
		}
	};

	notifyQuestion(question) {
		let notif = new Notification(question.title, {
			body: `${question.body}\r\nAsked by: ${question.asker}\r\n${Notifier.getDateTimeFromTimestamp(question.ts)}`,
			icon: $('#sof').attr('src'),
		})
		console.log(notif)
		notif.onclick = event => {
			event.preventDefault();
			open(question.url)
		};
	}

	notifyInboxMsg(content, quota) {
		new Notification("Unread Inbox Message\r\n", {
			body: `Title: ${content.title}\r\nType: ${content.item_type}\r\nRemaining API Quota: ${quota}`,
			icon: $('#msg').attr('src')
		}).onclick = event => {
			// Goto msg URL
			event.preventDefault();
			open(content.link)
		}
	}

	notifyMultipleMsgs(n, quota, inboxURL) {
		new Notification(`Got ${n} Unread Inbox Messages\r\n`, {
			body: `Remaining API Quota: ${quota}`,
			icon: $('#msg').attr('src')
		}).onclick = event => {
			event.preventDefault();
			if (inboxURL) {
				open(inboxURL)
			}
		}
	}
	
	notifyReputationChange(quota, repURL) {
		new Notification(`New reputation changes\r\n`, {
			body: `Remaining API Quota: ${quota}\r\n`,
			icon: $('#trophy').attr('src')
		}).onclick = event => {
			event.preventDefault();
			if (repURL) {
				open(repURL)
			}
		}
	}
	errorNotify(msg) {
		new Notification('Stack Overflow Notifier has encountered an error\r\n', {body:msg})
	};
};
