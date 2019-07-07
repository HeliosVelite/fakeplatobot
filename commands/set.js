const fs = require('fs');
const { tourHistory } = require('./data/info.json');
const { prefix } = require('../config.json');

const baseRating = 1000;

function newUserTemplate() {
	let history = [];
	if(tourHistory.length !== 0) {
		history.push(tourHistory[tourHistory.length - 1]);
	}
	return {
		rating: baseRating,
		firstPlaces: [],
		// add to the history the current tournament
		history: [...history],
	};
}

module.exports = {
	name: 'set',
	description: 'Set!',
	accepted_roles: ['moderatore', 'admin'],
	usage: '[utenti] ? [punteggio]',
	execute(message) {
		// array che immagazzina gli utenti menzionati
		let mentionedMembers = [];

		let newRating = parseInt(message.content.split('?').pop());

		if(message.mentions.members.size === 0 || isNaN(newRating)) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			mentionedMembers = message.mentions.members.map(curMember => curMember.id);
		}

		if(newRating < 1000) {
			newRating = 1000;
		}

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
				}
				usersDatabase[memberId].rating = newRating;
			});

			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (004)');
					throw err;
				}
				else {
					message.channel.send('Nuovo punteggio per ' + mentionedMembers.map(curId => {
						return '<@' + curId + '>';
					}).join(' ') + ' : ' + newRating);
				}
			});
		});
	},
};