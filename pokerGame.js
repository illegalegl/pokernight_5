const AWS = require('aws-sdk');
const constants = require('./constants.js');

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const docClient = new AWS.DynamoDB.DocumentClient();

const db = require('./dbActions.js');

let getDeck = () => {
    let newDeck = [];
    constants.suits.forEach(x => newDeck.push(constants.cards.map(y=> x + y)));

    return newDeck;

}

let drawCard = deck => {
    var rand = Math.round(Math.random()*(deck.length-1));
    var rand2 = Math.round(Math.random()*(deck[rand].length-1));
    return deck[rand].splice(rand2,1);
}

let getRiverCard = (message, river, callback) => {

    message.channel.send(`\n[${river.splice(0,1)}]`);

    callback(message,river);
}


module.exports ={

    createGame: function(message,deck, callback){
        message.react('👍').then(() => message.react('👎'));
        message.channel.send('If you would like to join, react with a thumbs-up!');

        const filter = (reaction) => reaction.emoji.name === '👍';
        const collector = message.createReactionCollector(filter, { time: 7000 });
        collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
        collector.on('end', collected => {console.log(`Collected ${collected.size} items`)

        let players = collector.users.array().slice(1);

        message.channel.send(players + '\n Let\'s get ready to play!');

        players.forEach(async (x,index)=>{

            
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

        if(callback instanceof Function){
            callback(message,deck);
        }
    });


    },

     startPokerGame: async function(message,deck, callback){

        let riverCards = [drawCard(deck),drawCard(deck),drawCard(deck),drawCard(deck),drawCard(deck)];

        
       // message.channel.send('You had\n' +card1 + '\n' + card2);
       console.log(JSON.stringify(riverCards));
        let dealerData = `{ "Hand" : ${JSON.stringify(riverCards)} }`;
       await db.saveToDynamo(docClient,'DEALER','pokerGame', dealerData);
       
    let promise = await getRiverCard(message,riverCards,(message1,river1)=>{
        getRiverCard(message1,river1,(message2,river2)=>{
            getRiverCard(message2,river2,(message3,river3)=>{
                getRiverCard(message3,river3,(message4,river4)=>{
                    getRiverCard(message4,river4,(resolve,reject)=>{
                        return resolve ? resolve : reject;
                    })
                })
            })
        })
    })



        //await message.channel.send(river);

       //  message.reply('\n Remaining cards: ' + deck);
       return callback(message,db,docClient, riverCards);
       
    },

    getDeck: function(){
        return getDeck();
    }
}