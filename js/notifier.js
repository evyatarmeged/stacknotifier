
module.exports = {

	notify: function(quesArr, tags) {
		if (quesArr !== undefined && quesArr.length !== 0) {

			let notif = new Notification('New Questions. Click to view', {
				body: quesArr[0].title + '\r\n' + 'Asked by: ' + quesArr[0].asker,
				icon: 'sof.png'
			})

			notif.onclick = function(event) {
				event.preventDefault();
				window.open(quesArr[0].url, '_blank');
			}
		}
	}
}