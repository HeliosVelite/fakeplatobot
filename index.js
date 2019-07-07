const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commands) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	// if the syntax is uncorrect or the message author is a bot, then null is returned
	if(!(message.content.startsWith(prefix)) || message.author.bot) {
		return null;
	}

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	const isAuthorized = message.member.roles.some(curRole => {
		return command.accepted_roles.includes(curRole.name.toLowerCase());
	});

	try {
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
});

client.login(token);