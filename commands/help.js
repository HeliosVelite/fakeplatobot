const fs = require('fs');
const { prefix } = require('../config.json');
const commands = fs.readdirSync(__dirname).filter(file => (file.endsWith('.js') && file !== 'help.js'));

module.exports = {
	name: 'help',
	description: 'help!',
	accepted_roles: ['@everyone'],
	usage: '',
	execute(message) {
		const commandsObj = commands.map(file => {
			const { name, description, usage, accepted_roles } = require(`../commands/${file}`);
			return {
				name: name,
				description: description,
				usage: usage,
				accepted_roles: accepted_roles,
			};
		});
		let newEmbed = {
			color: 0xbf1f0b,
			url: 'https://discord.js.org',
			title: 'Comandi del bot',
			description: 'Si, non abbiamo investito molto sulla grafica...\nNon mi hanno pagato abbastanza per questa cosa',
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
		message.channel.send('Big fan Plato Bot');
		newEmbed.fields = commandsObj.map(curCommand => {
			return {
				name: curCommand.name,
				value: 'Usage: ' + prefix + curCommand.name + ' ' + curCommand.usage + '\nDescrizione: ' + curCommand.description + '\nPermessi necessari: ' + curCommand.accepted_roles.join(' - '),
			};
		});
		message.channel.send({ embed: newEmbed });
	},
};