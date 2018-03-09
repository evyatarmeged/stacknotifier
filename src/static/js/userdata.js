// A try at implementing data scraping of personal user inbox & achievement updates


class User {
	constructor (email, password) {
		this.email = email;
		this.password = password;
		this.id = null;
		this.sessionCookie = null;
	}

	getSessionCookie() {}

	getUserId(){}

	queryInbox(){}

	queryAchievements(){}

}