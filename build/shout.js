// Generated by CoffeeScript 2.5.1
(function() {
  var Discord, checkForMessages, discordClient, discordConfig, discordGuild, fatalError, fs, inputDir, main, onTick, path, send;

  fs = require('fs');

  path = require('path');

  Discord = require('discord.js');

  inputDir = path.resolve("input");

  discordConfig = null;

  discordClient = null;

  discordGuild = null;

  fatalError = function(reason) {
    console.error(`FATAL [shout]: ${reason}`);
    return process.exit(1);
  };

  send = function(channelName, text) {
    var channel;
    channel = discordClient.channels.cache.find(function(c) {
      return (c.name === channelName) && (c.type === 'text');
    });
    if (channel != null) {
      channel.send(text);
    } else {
      console.log(`Can't find channel: ${channelName}`);
    }
  };

  checkForMessages = function() {
    var filename, filenames, fullFilename, i, len, text;
    filenames = fs.readdirSync(inputDir).sort();
    for (i = 0, len = filenames.length; i < len; i++) {
      filename = filenames[i];
      fullFilename = path.join(inputDir, filename);
      text = fs.readFileSync(fullFilename, "utf8");
      fs.unlinkSync(fullFilename);
      if (text.length > 0) {
        send(discordConfig.channel, text);
      }
    }
  };

  onTick = function() {
    return checkForMessages();
  };

  main = function() {
    if (!fs.existsSync("shout.json")) {
      fatalError("Can't find shout.json");
    }
    try {
      fs.mkdirSync(inputDir);
    } catch (error) {

    }
    // directory probably already exists
    discordConfig = JSON.parse(fs.readFileSync("shout.json", "utf8"));
    discordClient = new Discord.Client();
    discordClient.on('ready', function() {
      console.log(`Logged in: ${discordClient.user.tag}`);
      return discordClient.guilds.fetch(discordConfig.guild).then(function(guild) {
        discordGuild = guild;
        console.log(`Server: ${discordGuild.name}`);
        console.log(`Listening for messages here: ${inputDir}`);
        return setInterval(onTick, discordConfig.interval * 1000);
      });
    });
    console.log("Logging in...");
    return discordClient.login(discordConfig.token);
  };

  module.exports = main;

}).call(this);