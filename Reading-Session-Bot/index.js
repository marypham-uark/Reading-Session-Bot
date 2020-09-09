const Discord = require('discord.js');
const bot = new Discord.Client();
const passages = require('./passages.js');
const Points = require("./models/points.js");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Points');

const token = '';
const PREFIX = '//';

bot.on('ready', () =>{
    console.log('Online!');
})

let waitlist = {};

let beginnerPassage = "";
let intermediatePassage = "";
let advancedPassage = "";

bot.on('message', message=>{
    
    let args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0]){
        case 'commands':
            const commandsList = new Discord.MessageEmbed()
            .setColor('#f0a8bf')
            .setTitle('Commands List')
            .addFields(
                { name: 'Passages', value: '//beginner, //intermediate, //advanced' },
                { name: 'User Points', value: '//info <@user>' },
                { name: 'Add yourself to waitlist', value: '//signup'},
                { name: 'View Waitlist', value: '//waitlist'},
                { name: 'View Leaderboard', value: '//leaderboard, //top'},
                { name: 'Next session date and time', value: '//event'}
            )
            .setFooter('Other commands reserved for mods only. For any other questions please DM @marynara.')
            message.channel.send(commandsList)
            break;
        case 'beginner':
            message.channel.send(beginnerPassage)
            break;
        case 'intermediate':
            message.channel.send(intermediatePassage)
            break;
        case 'advanced':
            message.channel.send(advancedPassage)
            break;
        case 'info':
            InfoUser(message,args)
            break;
        case 'help':
            message.channel.send('type //commands or DM @marynara')
            break;
        case 'clear':
            if(!args[1]) return message.reply('please define second argument')
            message.channel.bulkDelete(args[1]);
            break;
        case 'score':
            scorecommand(message,args)
            break;
        case 'leaderboard':
            QueryLeaderBoard(message,args)
            break;
        case 'top':
            QueryLeaderBoard(message,args)
            break;
        case 'hi':
            message.reply('howdy')
            break;
        case 'signup':
            signup(message,args)
            break;
        case 'waitlist':
            showWaitlist(message,args)
            break;
        case 'next':
            next(message,args)
            break;
        case 'save':
            savePassage(message,args)
            break;
        case 'event':
            const eventInfo = new Discord.MessageEmbed()
            eventInfo.setColor('#f0a8bf')
            .setTitle('Reading Session')
            .addFields(
                {name: 'Date & Time', value: 'Wednesday, August 12th at 10:30pm to 11:30pm Brasilia Time'},
            )
            .setFooter('For any other questions please DM @marynara.')
            message.channel.send(eventInfo)
            break;
    }

})

bot.login(token);

function scorecommand(message,args){
    console.log('itpassedhere');
        if(message.author.id !== "168918552785453056"){
        return message.reply("You are not allowed to execute this command");
        }
        if(args.length !== 3) {
        message.reply("Command syntax:\n//score <@user> <points>");
        return;
        }
        if(message.mentions.users.size< 1) {
        message.reply("You must provide a user");
        return;
        }
        let userMentioned = message.mentions.users.first();
        let points = parseInt(args[2]);
        if(isNaN(points)) {
        message.reply("You did not provide a valid number");
        return;
        }

        let member = message.member.guild.member(userMentioned);
        
        console.log(member.roles);

        var userLevel = "";

        if(member.roles.cache.has("706630465984921641"))
        userLevel = "beginner";
        if(member.roles.cache.has("706630497933066261"))
        userLevel = "intermediate";
        if(member.roles.cache.has("706630528282918973"))
        userLevel = "advanced";
        if(member.roles.cache.has("352598146028666880"))
        userLevel = "beginner";
        if(member.roles.cache.has("352598105369214978"))
        userLevel = "intermediate";
        if(member.roles.cache.has("352598204484681739"))
        userLevel = "advanced";
        

    const point = new Points({
        _id: mongoose.Types.ObjectId(),
        username: userMentioned.username,
        userId: userMentioned.id,
        level: userLevel,
        points: points
    })

    point.save()
    .then(result => console.log(result))
    .catch(err => console.log(err));

    message.reply("The points have been added for user " + userMentioned.username);
}

function InfoUser(message,args){
    //structure //score @user
    try{
        if(args.length !== 2) {
            message.reply("Command syntax:\n//info <@user>");
            return;
        }
        if(message.mentions.users.size< 1) {
            message.reply("You must provide a user");
            return;
        }
        let userMentioned = message.mentions.users.first();

        Points.aggregate(
            [
                { "$match": { "userId": userMentioned.id } },
                { "$group": { 
                    "_id" : "$userId",
                    "total": {"$sum": "$points" }
                }}
            ],
            function(err,results){
                try{
                if (err) throw err;
                console.log(results);
                if(results[0].total > 0){
                    message.reply("The user " + userMentioned.username + " has " + results[0].total + " points.");
                    return;
                    }
                else{
                    message.reply("The user " + userMentioned.username + " has 0 points.");
                    return;
                    }
                }
                catch(err){}
            })
    }
    catch(err){}
}

async function QueryLeaderBoard(message,args){

    console.log("querying leaderboard");

    let embed = new Discord.MessageEmbed()
    .setTitle("Leaderboard")
    .setColor("#f0a8bf");

    await Points.aggregate(
        [           
            { "$group": { 
                "_id" : "$userId",
                "username": { "$first": "$username" },
                "total": {"$sum": "$points" }
            }},
            { "$sort": { "total": -1 } }
        ],
        function(err,results){
             try{
            if (err) throw err;

            let counter = 1;
            results.forEach(element => {
                console.log("yes");
                embed.addField(counter + ". " + element.username, element.total + " points");
                counter++;
            });
            }
            catch(err){}
        });

        message.channel.send(embed);
   
}

function signup(message,args){

    let author = message.author;
    let member = message.member.guild.member(author);

    if(member.roles.cache.has("706630465984921641")){ 
        message.reply("Thank you for signing up.");
    }
    else if(member.roles.cache.has("706630497933066261")){ 
        message.reply("Thank you for signing up.");
    }
    else if(member.roles.cache.has("706630528282918973")){
        message.reply("Thank you for signing up.");
    }
    else if(member.roles.cache.has("352598146028666880")){ 
        message.reply("Thank you for signing up.");
    }
    else if(member.roles.cache.has("352598105369214978")){ 
        message.reply("Thank you for signing up.");
    }
    else if(member.roles.cache.has("352598204484681739")){
        message.reply("Thank you for signing up.");
    }
    else {
        message.reply("You are not able to sign up. Please go to #server-commands and type -role followed by beginner, intermediate, or advanced to make sure you have a fluency role.")
        return;
    }
    waitlist[message.author.id] = message.author.username;

}

function showWaitlist(message,args){

    if(waitlist.length == 0){
        message.reply("No users have signed up.")
        return;
    }

    let embed = new Discord.MessageEmbed()
    .setTitle("Waitlist")
    .setColor("#f0a8bf");

    let keys = Object.keys(waitlist);
    let counter = 1;
    for(let element of keys){
  
    embed.addField(counter + ". " , waitlist[element]); 
    counter++;

    };

    message.channel.send(embed);

}

function next(message,args){

    if(message.author.id !== "168918552785453056"){
        message.reply("You are not allowed to execute this command");
        return;
    }

    let keys = Object.keys(waitlist);

    if(keys.length == 0){
        message.reply("there are no users left.")
        return;
    }
        
    message.channel.send("<@" + keys[0] + ">, it is now your turn. You have 30 seconds to enter the reading session channel or your turn will be forfeited.");
    delete waitlist[keys[0]];

}

function savePassage(message,args){

    if(message.author.id !== "168918552785453056"){
        message.reply("You are not allowed to execute this command");
        return;
    }

    if(args.length <= 2) {
        message.reply("Command syntax:\n//save <level> <passage> \n <level> = b/i/a");
        return;
    }

    if(args[1] === "b") {
        beginnerPassage = args.slice(2).join(" ");
    }
    else if(args[1] === "i") {
        intermediatePassage = args.slice(2).join(" ");
    }
    else if(args[1] === "a") {
        advancedPassage = args.slice(2).join(" ");
    }
    else {
        message.reply("Command syntax:\n//save <level> <passage> \n <level> = b/i/a");
        return;
    }

    return message.reply("Passage saved.")
}
 