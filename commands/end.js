const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'end',
	description: 'End!',
	accepted_roles: ['moderatore', 'admin'],
	usage: '[campione]',
	execute(message) {
		const tourHistory = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).tourHistory;
		let championId = null;
		if(message.mentions.members.size !== 1) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			championId = message.mentions.members.map(curMember => curMember.id).toString();
		}
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

			if(!(championId in usersDatabase)) {
				message.channel.send('<@' + championId + '> ascolta non barare...');
				return null;
			}

			if(tourHistory.length > 0) {
				usersDatabase[championId].firstPlaces.push(tourHistory[tourHistory.length - 1]);
			}

			for(let memberId in usersDatabase) {
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
				const roles = ['Cristallo', 'Ambra', 'Ametista', 'Topazio', 'Zaffiro', 'Rubino', 'Smeraldo', 'Campione'].map(curRole => {
					return message.guild.roles.find(curGuildRole => curGuildRole.name === curRole);
				});
				const role = message.guild.roles.find(curRole => curRole.name === newRole);
				// da usare await poi
				message.guild.fetchMember(memberId).then(member => {
					member.removeRoles(roles).then(()=>{
						member.addRole(role);
						if(memberId === championId) {
							member.addRole(message.guild.roles.find(curRole => curRole.name === 'Campione'));
						}
					});
				}).catch(err => {
					console.log(err);
					delete usersDatabase[memberId];
				});
			}

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

				let newLadder = [];
				for(let memberId in usersDatabase) {
					newLadder.push(memberId);
				}
				newLadder.sort((idA, idB) => {
					return usersDatabase[idA].rating - usersDatabase[idB].rating;
				});
				newLadder.reverse();
				infoDatabase.ladder = newLadder;

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

			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (012)');
					throw err;
				}
				else {
					message.channel.send('*I ruoli sono stati aggiornati!*\nCongratulazioni a <@' + championId + '> per aver vinto il torneo!');
				}
			});
			fs.writeFile(__dirname + '/data/backup.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (013)');
					throw err;
				}
			});
		});
	},
};