// TODO: Read https://api.stackexchange.com/docs/authentication

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