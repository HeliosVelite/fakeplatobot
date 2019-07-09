const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'lee',
	description: 'Ti dice quante volte sei stato arato da qwello lee.',
	// permessi necessari a utilizzare il comando
	accepted_roles: ['@everyone'],
	usage: '',
	execute(message) {
		const usersDatabase = JSON.parse(fs.readFileSync(__dirname + '/data/users.json', 'utf8'));
		const userId = message.author.id;
		if(userId === 275577756094431234) {
			message.reply('Suca lee.');
			return null;
		}
		if(!(userId in usersDatabase)) {
			message.reply('Oh wow, a quanto pare lee ha distrutto perfino il tuo profilo, big F.');
			return null;
		}
		else {
			let sucatoDaLeeArr = [];
			let nonSucatoDaLeeArr = [];
			usersDatabase[userId].history.forEach(curTour => {
				usersDatabase[userId].firstPlaces.includes(curTour) ? nonSucatoDaLeeArr.push(curTour) : sucatoDaLeeArr.push(curTour);
			});
			message.reply((sucatoDaLeeArr.length > 0 ? ('Hai sucato nei tornei: ' + sucatoDaLeeArr.join(', ')) : '') +
			(nonSucatoDaLeeArr.length > 0 ? ('\nOh wow, a quanto pare lee non ha partecipato a questi tornei: ' + nonSucatoDaLeeArr.join(', ')) : ''));
		}
	},
};