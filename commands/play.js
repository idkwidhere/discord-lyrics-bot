const { SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("dicord.js");
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays your song!")
    .addSubcommand(subcommand => {
        subcommand.setName("search")
        .setDescription("Search for your song!")
        .addStringOption(option => {
            option.setName("searchterms").setDescription("search keywords").setRequired(true);
        })
    })

    .addSubcommand(subcommand => {
        subcommand.setName("playlist").setDescription("Plays playlist from Youtube.")
        .addStringOption(option => {
            option.setName("url")
            .setDescription("playlist url")
            .setRequired(true);
        })
    })
    .addSubcommand(subcommand => {
        subcommand.setName("song")
        .setDescription("Plays song from Youtube!")
        .addStringOption(option => {
            option.setName("url").setDescription("song url")
            .setRequired(true);
        })
    }),

    execute: async({client, interaction}) => {
        if(!interaction.member.voice.channel){
            await interaction.reply("You must be in #strugglin-alone to use this command.");
            return;
        }

        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        
        let embed = new MessageEmbed();
        if(interaction.options.getSubcommand() === "song"){
            let url = interaction.options.getString("url");
            
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            if(result.tracks.length === 0){
                await interaction.reply("No result found!");
                return;
            }

            const song = result.track[0]
            await queue.addTrack(song);

            embed.setDescription(`Added ${song.title} ${song.url} to the queue.`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`});
        } else if(interaction.options.getSubcommand() === "playlist"){
            let url = interaction.options.getString("url");
            
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if(result.tracks.length === 0){
                await interaction.reply("No playlist found!");
                return;
            }

            const playlist = result.playlist;
            await queue.addTracks(playlist);

            embed.setDescription(`Added ${playlist.title} ${playlist.url} to the queue.`)
            .setThumbnail(playlist.thumbnail)
            .setFooter({text: `Duration: ${playlist.duration}`});
        } else if(interaction.options.getSubcommand() === "searchterms"){
            let url = interaction.options.getString("url");
            
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });

            if(result.tracks.length === 0){
                await interaction.reply("No results found!");
                return;
            }

            const song = result.tracks[0];
            await queue.addTracks(song);

            embed.setDescription(`Added ${song.title} ${song.url} to the queue.`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`});
        }

        if(!queue.playing) await queue.play();

        await interaction.reply({
            embeds: [embed]
        })
    }
}