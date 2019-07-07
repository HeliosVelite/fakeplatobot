const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'end',
	description: 'Da usare alla fine del torneo, aggiorna le targhette e la ladder(WIP).',
	// permessi necessari a usare il comando
	accepted_roles: ['moderatore', 'admin'],
	usage: '[campione]',
	execute(message) {
		// synchronusly gets the tourHistory array
		const tourHistory = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).tourHistory;
		// checks if the syntax is correct
		let championId = null;
		if(message.mentions.members.size !== 1) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			// gets the id of the new champion
			championId = message.mentions.members.map(curMember => curMember.id).toString();
		}
		// asynchronusly gets the usersDatabase
		fs.readFile(__dirname + '/data/users.json', 'utf8', (err, jsonString) => {
			if (err) {
				message.reply('Si è verificato un errore (010)');
				throw err;
			}
			let usersDatabase = {};
			// try-catch block used to parse the response
			try {
				usersDatabase = JSON.parse(jsonString);
			}
			catch(err) {
				message.reply('Si è verificato un errore (011)');
				throw err;
			}
			// checks if id given exists inside usersDatabase
			if(!(championId in usersDatabase)) {
				message.channel.send('<@' + championId + '> ascolta non barare...');
				return null;
			}
			// checks the length of the tourHistory arr, if grater than 0 set the champion's object's firstPlaces property, if not returns a warning
			if(tourHistory.length > 0) {
				// checks if the current tournament is already inside the firstPlaces property, if true returns a warning
				const lastTour = tourHistory[tourHistory.length - 1];
				if(usersDatabase[championId].firstPlaces.includes(lastTour)) {
					message.reply('<@' + championId + '> è già campione di questo torneo!');
					return null;
				}
				else {
					usersDatabase[championId].firstPlaces.push(lastTour);
				}
			}
			else {
				message.reply('Non è ancora stato creato nessun torneo in questo server!');
				return null;
			}
			// array containing the users who are no longer in the server (infraction)
			let usersToIncreaseInfractions = [];
			// async function used to manage the roles
			async function manageRoles(memberId) {
				let newRole = null;
				if(usersDatabase[memberId].rating < 1100) {
					newRole = 'Cristallo';
				}
				else if(usersDatabase[memberId].rating < 1200) {
					newRole = 'Ambra';
				}
				else if(usersDatabase[memberId].rating < 1300) {
					newRole = 'Ametista';
				}
				else if(usersDatabase[memberId].rating < 1400) {
					newRole = 'Topazio';
				}
				else if(usersDatabase[memberId].rating < 1500) {
					newRole = 'Zaffiro';
				}
				else if(usersDatabase[memberId].rating < 1600) {
					newRole = 'Rubino';
				}
				else {
					newRole = 'Smeraldo';
				}
				// get the rolesObjects from the guild object
				const rolesObjectsArr = ['Cristallo', 'Ambra', 'Ametista', 'Topazio', 'Zaffiro', 'Rubino', 'Smeraldo', 'Campione'].map(curRole => {
					return message.guild.roles.find(curGuildRole => curGuildRole.name === curRole);
				});
				// get the roleObject to assign
				const roleObj = message.guild.roles.find(curRole => curRole.name === newRole);
				// try-catch block for the async function
				try {
					const memberObj = await message.guild.fetchMember(memberId);
					await memberObj.removeRoles(rolesObjectsArr);
					memberObj.addRole(roleObj);
					// if member id is equal to champion id, then it gives that the 'Campione' role
					if(memberId === championId) {
						memberObj.addRole(message.guild.roles.find(curRole => curRole.name === 'Campione'));
					}
				}
				catch (err) {
					console.log(err);
					// if the function wasn't able to get the memberObj then it push the current member id to the usersToIncreaseInfractions array
					usersToIncreaseInfractions.push(memberId);
				}
			}
			// for cycle used to loop through every user inside the usersDatabase
			for(let memberId in usersDatabase) {
				manageRoles(memberId);
			}

			usersToIncreaseInfractions.forEach(memberId => {
				usersDatabase[memberId].infractions += 1;
			});
			// asynchronusly gets the info file in order to update the ladder
			fs.readFile(__dirname + '/data/info.json', 'utf8', (err, infoJsonString) => {
				if (err) {
					message.reply('Si è verificato un errore (007)');
					throw err;
				}
				let infoDatabase = {};
				// try-catch block used to parse the response
				try {
					infoDatabase = JSON.parse(infoJsonString);
				}
				catch(err) {
					message.reply('Si è verificato un errore (008)');
					throw err;
				}
				// the block below pushes every member inside an array and sort the by highest rating
				let newLadder = [];
				for(let memberId in usersDatabase) {
					newLadder.push(memberId);
				}
				newLadder.sort((idA, idB) => {
					return usersDatabase[idA].rating - usersDatabase[idB].rating;
				});
				newLadder.reverse();
				infoDatabase.ladder = newLadder;
				// the new info file is now saved
				fs.writeFile(__dirname + '/data/info.json', JSON.stringify(infoDatabase), err => {
					if (err) {
						message.reply('Si è verificato un errore (014)');
						throw err;
					}
					else {
						message.channel.send('*Ladder aggiornata!*');
					}
				});
			});
			// updates the users file
			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (012)');
					throw err;
				}
				else {
					message.channel.send('*I ruoli sono stati aggiornati!*\nCongratulazioni a <@' + championId + '> per aver vinto il torneo!');
				}
			});
			// updates the backup copy of the users file
			fs.writeFile(__dirname + '/data/backup.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (013)');
					throw err;
				}
			});
		});
	},
};