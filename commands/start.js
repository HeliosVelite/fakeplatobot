const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'start',
	description: 'Start!',
	accepted_roles: ['moderatore', 'admin'],
	usage: '[nome del torneo]',
	execute(message, args) {
		if(args[0] === '' || args[0] === undefined) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		fs.readFile(__dirname + '/data/info.json', 'utf8', (err, jsonString) => {
			if (err) {
				message.reply('Si è verificato un errore (007)');
				throw err;
			}
			let infoDatabase = {};
			// try-catch block used to parse the response
			try {
				infoDatabase = JSON.parse(jsonString);
			}
			catch(err) {
				message.reply('Si è verificato un errore (008)');
				throw err;
			}

			const date = new Date();
			const dd = String(date.getDate()).padStart(2, '0');
			// January is 0!
			const mm = String(date.getMonth() + 1).padStart(2, '0');
			const yyyy = date.getFullYear();

			const newTourName = args[0] + '-' + mm + '/' + dd + '/' + yyyy;
			if(!(infoDatabase.tourHistory.includes(newTourName))) {
				infoDatabase.tourHistory.push(newTourName);
			}
			else {
				message.channel.send('Questo torneo è già stato creato');
				return null;
			}

			fs.writeFile(__dirname + '/data/info.json', JSON.stringify(infoDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (009)');
					throw err;
				}
				else {
					message.channel.send('Il torneo è iniziato!');
				}
			});
		});
		const usersDatabase = require('./data/users.json');
		fs.writeFile(__dirname + '/data/backup.json', JSON.stringify(usersDatabase), err => {
			if (err) {
				message.reply('Si è verificato un errore (013)');
				throw err;
			}
		});
	},
};