fs = require 'fs'
path = require 'path'
util = require 'util'
Discord = require 'discord.js'

inputDir = path.resolve("input")

discordConfig = null
discordClient = null
discordGuild = null

fatalError = (reason) ->
  console.error "FATAL [shout]: #{reason}"
  process.exit(1)

send = (channelName, text) ->
  channel = discordClient.channels.cache.find (c) ->
    (c.name == channelName) and (c.type == 'text')
  if channel?
    channel.send(text)
  else
    util.log "Can't find channel: #{channelName}"
  return

checkForMessages = ->
  filenames = fs.readdirSync(inputDir).sort()
  for filename in filenames
    fullFilename = path.join(inputDir, filename)
    text = fs.readFileSync(fullFilename, "utf8")
    fs.unlinkSync(fullFilename)
    if text.length > 0
      send(discordConfig.channel, text)
  return

onTick = ->
  checkForMessages()

main = ->
  if not fs.existsSync("shout.json")
    fatalError "Can't find shout.json"

  try
    fs.mkdirSync inputDir
  catch
    # directory probably already exists

  discordConfig = JSON.parse(fs.readFileSync("shout.json", "utf8"))
  discordClient = new Discord.Client()
  discordClient.on 'ready', ->
    util.log "Logged in: #{discordClient.user.tag}"
    discordClient.guilds.fetch(discordConfig.guild).then (guild) ->
      discordGuild = guild
      util.log "Server: #{discordGuild.name}"
      util.log "Listening for messages here: #{inputDir}"
      setInterval onTick, (discordConfig.interval * 1000)

  util.log "Logging in..."
  discordClient.login(discordConfig.token)

module.exports = main
