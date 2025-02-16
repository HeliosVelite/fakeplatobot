const fs = require('fs');
const { prefix } = require('../config.json');

const baseRating = 1000;

const calcK = elo =>{
	if(elo < 1100) {
		return 80;
	}
	else if(elo < 1300) {
		return 50;
	}
	else if(elo < 1600) {
		return 40;
	}
	else {
		return 32;
	}
};

function newUserTemplate() {
	return {
		rating: baseRating,
		infractions: 0,
		firstPlaces: [],
		history: [],
	};
}

function calcNewRating(winnerRating, loserRating) {
	// elo system
	const P_winner = (1.0 / (1.0 + Math.pow(10, ((loserRating - winnerRating) / 400))));
	const P_loser = (1.0 / (1.0 + Math.pow(10, ((winnerRating - loserRating) / 400))));

	const newWinnerRating = winnerRating + (calcK(winnerRating) * (1 - P_winner)) + 2;
	let newLoserRating = loserRating + (calcK(loserRating) * (0 - P_loser));

	if(newLoserRating < baseRating) {
		newLoserRating = baseRating;
	}

	return [Math.round(newWinnerRating), Math.round(newLoserRating)];
}

module.exports = {
	name: 'result',
	description: 'Riporta il risultato di un match.',
	// permessi necessari a utilizzare il comando
	accepted_roles: ['moderatori', 'testmod', 'admin'],
	usage: '[utente1] vince contro [utente2] -infraction (*-infraction* è opzionale e da usare solo in caso di vittoria per inattività).',
	execute(message, args) {
		// synchronusly retrieve the tourHistory array from the info file
		const tourHistory = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).tourHistory;

		// array containing the mentioned users
		let mentionedMembers = [];
		const infraction = message.content.includes('-infraction');
		// checks if there are exactly two users mentioned, if not return a syntax error
		if(message.mentions.members.size !== 2 && !(message.mentions.members.size === 1 && infraction)) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			// gets the id from argument
			mentionedMembers = args.filter(curString => curString.search(/\d+>/) > 1).map(curString => {
				curString = curString.trim();
				curString = curString.substring(curString.search(/\d+>/), curString.length);
				curString = curString.replace(/>.+/g, '');
				curString = curString.replace('>', '');
				return curString;
			});
		}
		let [winnerId, loserId] = [null, null];

		// asynchronusly gets the usersDatabase
		fs.readFile(__dirname + '/data/users.json', 'utf8', (err, jsonString) => {
			if (err) {
				message.reply('Si è verificato un errore (006)');
				throw err;
			}
			let usersDatabase = {};
			// try-catch block used to parse the response
			try {
				usersDatabase = JSON.parse(jsonString);
			}
			catch(err) {
				message.reply('Si è verificato un errore (001)');
				throw err;
			}

			// forEach cicle used to check if everything is correct
			mentionedMembers.forEach(memberId => {
				// register a new user if it isn't in the database
				if(!(memberId in usersDatabase)) {
					usersDatabase[memberId] = newUserTemplate();
				}
				// checks if the current tournamente is in the user's tournamente history, if not adds it
				if(tourHistory.length > 0 && !(usersDatabase[memberId].history.includes(tourHistory[tourHistory.length - 1]))) {
					usersDatabase[memberId].history.push(tourHistory[tourHistory.length - 1]);
				}
			});

			// caso in cui l'utente non è più sul server
			if(infraction && mentionedMembers.length === 1) {
				winnerId = mentionedMembers[0];
				// call the function used to calc the new rating
				// gives half the points
				let [winnerRatingFinal, loserRatingFinal] = calcNewRating(usersDatabase[winnerId].rating, usersDatabase[winnerId].rating);
				const winnerDelta = Math.round((winnerRatingFinal - usersDatabase[winnerId].rating) / 2);
				usersDatabase[winnerId].rating = usersDatabase[winnerId].rating + winnerDelta;
				message.channel.send('Punteggio di <@' + winnerId + '> aggiornato: ' + usersDatabase[winnerId].rating + ' *(+' + winnerDelta + ')*');
			}
			// caso in cui entrambi gli utenti sono sul server
			if(mentionedMembers.length === 2) {
				[winnerId, loserId] = mentionedMembers;
				const [winnerRatingBefore, loserRatingBefore] = [usersDatabase[winnerId].rating, usersDatabase[loserId].rating];
				// call the function used to calc the new rating
				const [winnerRatingFinal, loserRatingFinal] = calcNewRating(winnerRatingBefore, loserRatingBefore);
				usersDatabase[winnerId].rating = winnerRatingFinal;
				usersDatabase[loserId].rating = loserRatingFinal;
				// checks if infraction is true
				if(infraction && mentionedMembers.length > 1) {
					usersDatabase[loserId].infractions += 1;
				}
				const winnerDelta = winnerRatingFinal - winnerRatingBefore;
				const loserDelta = loserRatingBefore - loserRatingFinal;
				message.channel.send('Punteggi aggiornati: <@' + winnerId + '>: ' + winnerRatingFinal + ' *(+' + winnerDelta + ')* ' + ' <@' + loserId + '>: ' + loserRatingFinal + ' *(-' + loserDelta + ')*' + (infraction ? ' (infrazione)' : ''));
			}

			// update the users file
			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (002)');
					throw err;
				}
				else if(infraction) {
					message.channel.send('Vinci a tavolino ciaoo');
				}
			});
		});
	},
};