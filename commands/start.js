const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'start',
	description: 'Da usare nel momento di inizio di un torneo, lo aggiunge alla lista dei tornei creati.',
	accepted_roles: ['moderatore', 'admin'],
	usage: '[nome del torneo]',
	execute(message, args) {
		// checks if the syntax is correct, if not gives a warning
		if(args[0] === '' || args[0] === undefined) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		// asynchronusly gets the info file
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
			// the block below gets the current date and set the tour id
			const date = new Date();
			const dd = String(date.getDate()).padStart(2, '0');
			// January is 0!
			const mm = String(date.getMonth() + 1).padStart(2, '0');
			const yyyy = date.getFullYear();

			const newTourId = args[0] + '-' + mm + '/' + dd + '/' + yyyy;
			// checks if this tournament already exists
			if(!(infoDatabase.tourHistory.includes(newTourId))) {
				infoDatabase.tourHistory.push(newTourId);
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
		// asynchronusly gets the users file
		fs.readFile(__dirname + '/data/users.json', 'utf8', (err, jsonString) => {
			if (err) {
				message.reply('Si è verificato un errore (007)');
				throw err;
			}
			let usersDatabase = {};
			// try-catch block used to parse the response
			try {
				usersDatabase = JSON.parse(jsonString);
			}
			catch(err) {
				message.reply('Si è verificato un errore (008)');
				throw err;
			}
			// creates a backup of the users file
			fs.writeFile(__dirname + '/data/backup.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (013)');
					throw err;
				}
			});
		});
	},
};