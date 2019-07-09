const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, idCreator, idChatTorneo, idSpam } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const prefixCommands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of prefixCommands) {
	const prefixCommand = require(`./commands/${file}`);
	client.commands.set(prefixCommand.name, prefixCommand);
}

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('impressionare platobot');
});

client.on('message', message => {
	// if the syntax is uncorrect or the message author is a bot, then null is returned
	if(message.author.bot) {
		return null;
	}
	if(!(message.content.startsWith(prefix))) {
		if(parseInt(message.channel.id) === idChatTorneo && message.content.toLowerCase().search(/non[(\s)(\smi\s)(\sha\s)]+rispo/) > -1) {
			message.channel.send('Friendly reminder: se il tuo avversario non risponde entro la fine del turno perde a tavolino.');
		}
		if(parseInt(message.channel.id) === idChatTorneo && message.content.toLowerCase().search(/<@[\w\d\s]+/g) === -1 && message.content.toLowerCase().search(/@[\w\d\s]+/g) > -1) {
			message.channel.send('https://support.discordapp.com/hc/it/articles/222495948-Come-posso-controllare-se-sono-stato-citato-di-recente-');
		}
		if(message.content.toLowerCase().search(/\s(bot)/g) > -1 && message.content.toLowerCase().search(/((scem)|(stupid)|(stronz)|(schifo))/) > -1) {
			message.channel.send('Non osare mai più. Anche noi abbiamo dei sentimenti.');
		}
		if(parseInt(message.channel.id) === idChatTorneo && message.content.toLowerCase().search(/(mi)\s.+(addormentato)/) > -1) {
			message.channel.send('Ben svegliata principessa.');
		}
		if(message.content.toLowerCase().search(/[?!]help/) > -1) {
			setTimeout(() => message.channel.send('Ben detto plato bot, hai visto che sfigato (sempre dato statistico, nulla di personale).'), 800);
		}
		if(message.content.toLowerCase().search(/(smett)\w|(finisc)\w/) > -1 && message.content.toLowerCase().search(/\s(tu)|\s(te)|\s(lui)|\s(lei)|\s(voi)|\s(loro)/) > -1
		&& message.content.toLowerCase().search(/(invece)|(prima)|(ora)/) > -1) {
			message.channel.send('E invece smetterai te lmao');
		}
		if(parseInt(message.channel.id) === idChatTorneo && message.content.toLowerCase().search(/\s(hax)|\s(sculato)/) > -1) {
			message.channel.send('Niente hax, se hai perso è perchè sei scarso lmao (dato statistico, nulla di personale).');
		}
		if(message.content.toLowerCase().search(/\s(bot)/g) > -1 && message.content.toLowerCase().search(/((zitto)|(fanculo))/) > -1 && message.content.toLowerCase().search(/((scem)|(stupid)|(stronz)|(schifo))/) === -1) {
			message.channel.send('No te.');
		}
		return null;
	}

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	try {
		const command = client.commands.get(commandName);
		try {
			let isAuthorized = message.member.roles.some(curRole => {
				return command.accepted_roles.includes(curRole.name.toLowerCase());
			});
			if(parseInt(message.author.id) === idCreator) {
				isAuthorized = true;
			}
			if(isAuthorized) {
				command.execute(message, args);
			}
			else {
				message.reply('non hai abbastanza permessi (suca)');
			}
		}
		catch (err) {
			console.log(err);
			message.reply('there was an error trying to execute that command!');
		}
	}
	catch (err) {
		console.log(err);
		return null;
	}
});

client.login(token);