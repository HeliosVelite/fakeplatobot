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
			const { name, description, usage } = require(`../commands/${file}`);
			return {
				name: name,
				description: description,
				usage: usage,
			};
		});
		let newEmbed = {
			color: 0xbf1f0b,
			url: 'https://discord.js.org',
			title: 'Comandi del bot',
			description: 'Si, non abbiamo investito molto sulla grafica...',
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
		newEmbed.fields = commandsObj.map(curCommand => {
			return {
				name: curCommand.name,
				value: 'Usage: ' + prefix + curCommand.name + ' ' + curCommand.usage + '\nDescrizione: ' + curCommand.description,
			};
		});
		message.channel.send({ embed: newEmbed });
		message.channel.send('Big fan Plato Bot');
	},
};