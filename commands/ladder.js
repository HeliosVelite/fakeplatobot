const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'ladder',
	description: 'Mostra la classifica dei migliori 100 utenti.',
	accepted_roles: ['moderatori', 'testmod', 'admin'],
	usage: '',
	execute(message, args) {
		const ladder = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).ladder;
		const usersDatabase = JSON.parse(fs.readFileSync(__dirname + '/data/users.json', 'utf8'));
		let newEmbed = null;
		async function BuildEmbed() {
			async function addField(memberId, ladderIndex) {
				try {
					let role = null;
					if(usersDatabase[memberId].rating < 1100) {
						role = 'Cristallo';
					}
					else if(usersDatabase[memberId].rating < 1200) {
						role = 'Ambra';
					}
					else if(usersDatabase[memberId].rating < 1300) {
						role = 'Ametista';
					}
					else if(usersDatabase[memberId].rating < 1400) {
						role = 'Topazio';
					}
					else if(usersDatabase[memberId].rating < 1500) {
						role = 'Zaffiro';
					}
					else if(usersDatabase[memberId].rating < 1600) {
						role = 'Rubino';
					}
					else {
						role = 'Smeraldo';
					}
					const memberObj = await message.guild.fetchMember(memberId);
					newEmbed.fields.push({
						name: ladderIndex + ' | ' + memberObj.displayName + ' - ' + role,
						value: usersDatabase[memberId].rating,
					});
				}
				catch (err) {
					console.log(err);
					return null;
				}
			}
			try {
				newEmbed = {
					color: 0xbf1f0b,
					url: 'https://discord.js.org',
					title: 'Ladder!',
					description: 'Ladder ufficiale (circa) di Pokémon Next.\nNon mi hanno pagato abbastanza per questa cosa.',
					author: {
						name: 'HeliosVelite',
						icon_url: 'https://i.imgur.com/wSTFkRM.png',
						url: 'https://discord.js.org',
					},
					thumbnail: {
						url: 'https://i.imgur.com/wSTFkRM.png',
					},
					fields: [
						{
							name: 'Informazioni sulle targhette:',
							value: 'Le targhette, assegnate in base al punteggio, sono:\n- Cristallo: 1000 - 1099\n- Ambra: 1100 - 1199\n- Ametista: 1200 - 1299\n- Topazio: 1300 - 1399\n- Zaffiro: 1400 - 1499\n- Rubino: 1500 - 1599\n- Smeraldo: 1600 - 1699\n- Argento: 1700 - 1799\n- Oro: 1800 - 1899\n- Platino: 1900 - 1999\n- Diamante: sopra 2000 punti',
						},
					],
					timestamp: new Date(),
					footer: {
						text: 'Creato con javascript e amore da HeliosVelite',
						icon_url: 'https://i.imgur.com/wSTFkRM.png',
					},
				};

				for(let memberId of ladder) {
					let ladderIndex = ladder.indexOf(memberId) + 1;
					await addField(memberId, ladderIndex);
					if(ladderIndex === 100) {
						break;
					}
				}
				message.channel.send({ embed: newEmbed });
			}
			catch (err) {
				console.log(err);
			}
		}
		BuildEmbed();

	},
};