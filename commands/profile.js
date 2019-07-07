const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
	name: 'profile',
	description: 'Profile!',
	accepted_roles: ['@everyone'],
	usage: '[utente]',
	execute(message, args) {
		const ladder = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).ladder;
		const usersDatabase = JSON.parse(fs.readFileSync(__dirname + '/data/users.json', 'utf8'));

		let userId = null;
		if(args[0] === undefined) {
			userId = message.author.id;
		}
		else {
			let mentionedMembers = args.map(curString => {
				curString = curString.trim();
				if(curString.search(/<@\d+>/) === 0) {
					return curString.substring(2, curString.lastIndexOf('>'));
				}
			}).filter(curMember => curMember !== undefined);
			if(mentionedMembers.length === 0) {
				message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
				return null;
			}
			else {
				userId = mentionedMembers[0];
			}
		}

		if(!(userId in usersDatabase)) {
			console.log(userId);
			message.channel.send('Il profilo di <@' + userId + '> non esiste!');
			return null;
		}

		let newEmbed = {
			color: 0x0099ff,
			url: 'https://discord.js.org',
			description: '',
			author: {
				name: 'Some name',
				icon_url: 'https://i.imgur.com/wSTFkRM.png',
				url: 'https://discord.js.org',
			},
			thumbnail: {
				url: 'https://i.imgur.com/wSTFkRM.png',
			},
			fields: [],
			image: {
				url: 'https://i.imgur.com/wSTFkRM.png',
			},
			timestamp: new Date(),
			footer: {
				text: 'Creato con javascript e amore da HeliosVelite',
				icon_url: 'https://i.imgur.com/wSTFkRM.png',
			},
		};
		message.guild.fetchMember(userId).then(memberObj => {
			newEmbed.title = 'Profilo di ' + memberObj.displayName;
			newEmbed.fields.push({
				name: 'Tornei a cui ha partecipato:',
				value: usersDatabase[userId].history.length !== 0 ? usersDatabase[userId].history.map(curTour => {
					let stringsArr = curTour.split('-');
					return stringsArr[0] + ' - ' + stringsArr[1];
				}).join('\n') : 'Non ha partecipata a nessun torneo, che tristezza',
			});
			newEmbed.fields.push({
				name: 'Titoli di campione:',
				value: usersDatabase[userId].firstPlaces.length !== 0 ? usersDatabase[userId].firstPlaces.map(curTour => {
					let stringsArr = curTour.split('-');
					return stringsArr[0] + ' - ' + stringsArr[1];
				}).join('\n') : 'Probabilemente li ha rubati lee',
			});
			newEmbed.fields.push({
				name: 'Posizione in classifica:',
				value: ladder.includes(userId) ? parseInt(ladder.indexOf(userId) + 1) : 'A quanto pare non è ancora in classifica',
			});
			newEmbed.fields.push({
				name: 'Punti:',
				value: usersDatabase[userId].rating,
			});

			message.channel.send({ embed: newEmbed });
		}).catch(err => {
			console.log(err);
			console.log(userId);
			message.channel.send('Sembra che ci sia qualche problema con il profilo di <@' + userId + '>');
		});
	},
};