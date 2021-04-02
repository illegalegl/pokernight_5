const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const docClient = new AWS.DynamoDB.DocumentClient();

const db = require('./dbActions.js');

let cards = [
    'Ace',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'Jack',
    'Queen',
    'King'
]

let suits = [
    '<:clobz:823753747300614214>',
    '<:dimmadimonds:823753747372703785>',
    '<:hertz:823753747574292521>',
    '<:spudz:823753747385286676>'
]

let getDeck = () => {
    let newDeck = [];
    suits.forEach(x => newDeck.push(cards.map(y=> x + y)));

    return newDeck;

}

let drawCard = deck => {
    var rand = Math.round(Math.random()*(deck.length-1));
    var rand2 = Math.round(Math.random()*(deck[rand].length-1));
    return deck[rand].splice(rand2,1);
}

let getRiverCard = (message, river, index) => {

    message.channel.send(`\n[${river.slice(index,index+1)}]`);

}

module.exports ={

    createGame: async function(message,deck, callback){
        message.react('👍').then(() => message.react('👎'));
        message.channel.send('If you would like to join, react with a thumbs-up!');

        const filter = (reaction) => reaction.emoji.name === '👍';
        const collector = message.createReactionCollector(filter, { time: 7000 });
        collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
        collector.on('end', collected => {console.log(`Collected ${collected.size} items`)

        let players = collector.users.array().slice(1);

        message.channel.send(players + '\n Let\'s get ready to play!');

        players.forEach((x,index)=>{

            
            let card1 = drawCard(deck);
            let card2 = drawCard(deck);
            let handData = '{ "Hand" : ["' + card1+'","'+card2+'"]}';
            let userData = '{ "userId" : "' + players[index].id + '"}'
            let allData = '[' + handData + ',' + userData + ']';

            await db.saveToDynamo(docClient,players[index].username,'pokerGame', JSON.parse(allData));
            x.send('\n Hand:\n'+ card1 + '\n' + card2);
            db.saveToDynamo(docClient,x.username,'players', players)
        });
        
        message.channel.send('Starting poker game for ' + players);

        callback(message,deck);
    });


    },

     startPokerGame: function(message,deck){
        let players =db.scanFromDynamo(message,docClient,'pokerGame');


        console.log("startgame:" + players.toString());
        let river = [drawCard(deck),drawCard(deck),drawCard(deck),drawCard(deck),drawCard(deck)];

        // function getItemFromDynamo(message, docClient){
        //     let result = db.scanFromDynamo(message, docClient,'277622752196689921','pokerGame');
        //     message.channel.send('<@' + result.Item.id + '>' + ' had ' + result.Item.info.Hand);
        //     console.log(result);
        // }

       // players.forEach(getItemFromDynamo);
       // message.author.send('\n Hand:\n'+ card1 + '\n' + card2);

        // message.channel.send('\n-----{1st}-----')
        // getRiverCard(message, river,0);
        // message.channel.send('\n-----{2nd}-----')
        // getRiverCard(message, river,1);
        // message.channel.send('\n-----{3rd}-----')
        // getRiverCard(message, river,2);
        // message.channel.send('\n-----{4th}-----')
        // getRiverCard(message, river,3);
        // message.channel.send('\n-----{5th}-----')
        // getRiverCard(message, river,4);

       // message.channel.send('You had\n' +card1 + '\n' + card2);

        message.channel.send(river);

       //  message.reply('\n Remaining cards: ' + deck);
    },

    getDeck: function(){
        return getDeck();
    }
}