require('dotenv').config();
const Discord = require('discord.js');
const poker = require('./pokerGame.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;


bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  // bot.guilds.get('822858977523138640').emojis.forEach(emoji => console.log(emoji.animated ? '<a:' + emoji.name + ':' + emoji.id + '>' : '<:' + emoji.name + ':' + emoji.id + '>'));
});



const decipherCommand = async message => {

  if(message.content.startsWith('/')){

    switch(message.content.substr(1)){
      case('hi'):
        message.reply('hello there');
      break;
      case('stats'):
        db.saveToDynamo(docClient, db.getDataObject(message));
        message.reply('ultimate master poker player');
      break;
    }

  }
  else if (message.content.startsWith('!')){
    var deck = poker.getDeck();
    switch(message.content.substr(1)){
      case('kick'):
        if (message.mentions.users.size) {
          const taggedUser = msg.mentions.users.first();
          message.channel.send(`You wanted to kick: ${taggedUser.username}`);
        } else {
          message.reply('Please tag a valid user!');
        }
      break;

      case('poker'):
        poker.startPokerGame(message,deck);
      break;
      case('start'):
      await poker.createGame(message,deck, (message2,newDeck2) =>
          await poker.startPokerGame(message2,newDeck2, (message,db,docClient)=>
              await db.scanFromDynamo(message,docClient,'pokerGame')));
      
      break;
    }
  
  }
}

bot.on('message', msg => {
  decipherCommand(msg);
});
