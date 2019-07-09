const fs = require('fs');
const { prefix, idCreator } = require('../config.json');

module.exports = {
	name: 'profile',
	description: 'Mostra quanto schifo si è fatto negli ultimi tornei.',
	accepted_roles: ['@everyone'],
	usage: '[utente] (opzionale)',
	execute(message) {
		const ladder = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).ladder;
		const usersDatabase = JSON.parse(fs.readFileSync(__dirname + '/data/users.json', 'utf8'));
		let userId = null;

		if(message.mentions.members.size > 1) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else if(message.mentions.members.size === 1) {
			userId = message.mentions.members.map(curMember => curMember.id).toString();
		}
		else {
			userId = message.author.id;
		}

		let isUserChamp = false;

		let newEmbed = {
			color: 0xbf1f0b,
			url: 'https://discord.js.org',
			title: 'Profilo utente',
			description: 'Si, non abbiamo investito molto sulla grafica...\nNon mi hanno pagato abbastanza per questa cosa.',
			author: {
				name: 'HeliosVelite',
				icon_url: 'https://i.imgur.com/wSTFkRM.png',
				url: 'https://discord.js.org',
			},
			thumbnail: {
				url: 'https://i.imgur.com/wSTFkRM.png',
			},
			fields: [],
			timestamp: new Date(),
			footer: {
				text: 'Creato con javascript e amore da HeliosVelite',
				icon_url: 'https://i.imgur.com/wSTFkRM.png',
			},
		};
		if(userId in usersDatabase) {
			let ladderIndex = ladder.includes(userId) ? (ladder.indexOf(userId) + 1) : 'Aspetta la fine del torneo per la ladder aggiornate, tanto di sicuro lee ti supera.';
			let role = null;
			if(usersDatabase[userId].rating < 1100) {
				role = 'Cristallo';
			}
			else if(usersDatabase[userId].rating < 1200) {
				role = 'Ambra';
			}
			else if(usersDatabase[userId].rating < 1300) {
				role = 'Ametista';
			}
			else if(usersDatabase[userId].rating < 1400) {
				role = 'Topazio';
			}
			else if(usersDatabase[userId].rating < 1500) {
				role = 'Zaffiro';
			}
			else if(usersDatabase[userId].rating < 1600) {
				role = 'Rubino';
			}
			else if(usersDatabase[userId].rating < 1700) {
				role = 'Smeraldo';
			}
			else if(usersDatabase[userId].rating < 1800) {
				role = 'Argento';
			}
			else if(usersDatabase[userId].rating < 1900) {
				role = 'Oro';
			}
			else if(usersDatabase[userId].rating < 1600) {
				role = 'Platino';
			}
			else {
				role = 'Diamante';
			}
			newEmbed.fields.push({
				name: 'Punteggio:',
				value: usersDatabase[userId].rating,
				inline: true,
			});
			newEmbed.fields.push({
				name: 'Posizione in classifica:',
				value: ladderIndex,
				inline: true,
			});
			newEmbed.fields.push({
				name: 'Rango attuale:',
				value: role,
				inline: true,
			});
			newEmbed.fields.push({
				name: 'Tornei a cui ha partecipato:',
				value: usersDatabase[userId].history.join('\n'),
			});
			let firstPlacesString = usersDatabase[userId].firstPlaces.join('\n') + (parseInt(userId) === 275577756094431234 ? '\n*(suca lee)*' : '');
			newEmbed.fields.push({
				name: 'Primi posti:',
				value: firstPlacesString !== '' ? firstPlacesString : 'Dai, forse un giorno ce la farai.',
			});
			newEmbed.fields.push({
				name: 'Infrazioni:',
				value: usersDatabase[userId].infractions + (usersDatabase[userId].infractions > 0 ? ' (Gli admin hanno il ban hammer sempre pronto, stai attento.)' : ''),
			});
			if(usersDatabase[userId].firstPlaces.length !== 0) {
				isUserChamp = true;
			}
		}
		else {
			message.channel.send('Almeno partecipa a un torneo...');
			return null;
		}

		message.channel.send({ embed: newEmbed });
		if(parseInt(userId) !== idCreator && parseInt(userId) !== 275577756094431234 && !isUserChamp) {
			message.channel.send('É inutile che controlli, tanto non sarai mai campione lmao.');
		}
	},
};