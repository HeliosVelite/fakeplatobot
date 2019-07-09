const fs = require('fs');
const { prefix } = require('../config.json');

const baseRating = 1000;

function newUserTemplate() {
	return {
		rating: baseRating,
		infractions: 0,
		firstPlaces: [],
		// add to the history the current tournament
		history: [],
	};
}

module.exports = {
	name: 'infraction',
	description: 'Segnala una infrazione da parte degli utenti menzionati.',
	// permessi necessari a utilizzare il comando
	accepted_roles: ['moderatori', 'testmod', 'admin'],
	usage: '[utenti]',
	execute(message) {
		// array che immagazzina gli utenti menzionati
		let mentionedMembers = [];
		// checks if the syntax is correct
		if(message.mentions.members.size === 0) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			mentionedMembers = message.mentions.members.map(curMember => curMember.id);
		}
		// asynchronusly gets the usersDatabase
		fs.readFile(__dirname + '/data/users.json', 'utf8', (err, jsonString) => {
			if (err) {
				message.reply('Si è verificato un errore (005)');
				throw err;
			}
			let usersDatabase = {};
			// try-catch block used to parse the response
			try {
				usersDatabase = JSON.parse(jsonString);
			}
			catch(err) {
				message.reply('Si è verificato un errore (003)');
				throw err;
			}

			mentionedMembers.forEach(memberId => {
				// register a new user if it isn't in the database
				if(!(memberId in usersDatabase)) {
					usersDatabase[memberId] = newUserTemplate();
					// synchronusly retrieve the tourHistory array from the info file
					const tourHistory = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).tourHistory;
					// adds the current tournament to the history property
					usersDatabase[memberId].history.push(tourHistory[tourHistory.length - 1]);
				}
				// sets the new rating
				usersDatabase[memberId].infractions += 1;
			});
			// updates the users file
			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (004)');
					throw err;
				}
				else {
					message.channel.send('Infrazione da parte di ' + mentionedMembers.map(curId => {
						return '<@' + curId + '>';
					}).join(', '));
				}
			});
		});
	},
};