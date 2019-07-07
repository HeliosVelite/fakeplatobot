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
		firstPlaces: [],
		// add to the history the current tournament
		history: [],
	};
}

function calcNewRating(winnerRating, loserRating) {
	// elo system
	const P_winner = (1.0 / (1.0 + Math.pow(10, ((loserRating - winnerRating) / 400))));
	const P_loser = (1.0 / (1.0 + Math.pow(10, ((winnerRating - loserRating) / 400))));

	const newWinnerRating = winnerRating + (calcK(winnerRating) * (1 - P_winner));
	let newLoserRating = loserRating + (calcK(loserRating) * (0 - P_loser));

	if(newLoserRating < baseRating) {
		newLoserRating = baseRating;
	}

	return [Math.round(newWinnerRating), Math.round(newLoserRating)];
}

module.exports = {
	name: 'result',
	description: 'Result!',
	accepted_roles: ['moderatore', 'admin'],
	usage: '[utente1] vince contro [utente2]',
	execute(message, args) {
		// array che immagazzina gli utenti menzionati
		let mentionedMembers = [];

		const tourHistory = JSON.parse(fs.readFileSync(__dirname + '/data/info.json', 'utf8')).tourHistory;

		if(message.mentions.members.size !== 2) {
			message.channel.send('Sintassi invalida, prova così: \n' + prefix + this.name + ' ' + this.usage);
			return null;
		}
		else {
			mentionedMembers = args.map(curString => {
				curString = curString.trim();
				if(curString.search(/<@\d+>/) === 0) {
					return curString.substring(2, curString.lastIndexOf('>'));
				}
			}).filter(curMember => curMember !== undefined);
		}

		const [winnerId, loserId] = mentionedMembers;

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

			const [winnerRatingBefore, loserRatingBefore] = [usersDatabase[winnerId].rating, usersDatabase[loserId].rating];

			const [winnerRatingFinal, loserRatingFinal] = calcNewRating(winnerRatingBefore, loserRatingBefore);
			usersDatabase[winnerId].rating = winnerRatingFinal;
			usersDatabase[loserId].rating = loserRatingFinal;

			fs.writeFile(__dirname + '/data/users.json', JSON.stringify(usersDatabase), err => {
				if (err) {
					message.reply('Si è verificato un errore (002)');
					throw err;
				}
				else {
					const winnerDelta = winnerRatingFinal - winnerRatingBefore;
					const loserDelta = loserRatingBefore - loserRatingFinal;
					message.channel.send('Punteggi aggiornati: <@' + winnerId + '>: ' + winnerRatingFinal + ' *(+' + winnerDelta + ')* ' + ' <@' + loserId + '>: ' + loserRatingFinal + ' *(-' + loserDelta + ')*');
				}
			});
		});
	},
};