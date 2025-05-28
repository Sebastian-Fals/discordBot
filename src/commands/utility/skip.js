const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saltar")
    .setDescription("Salta la canción actual en la lista de reproducción"),
  async execute(interaction) {
    try {
      let song = await interaction.client.distube.skip(interaction);
      const channel = interaction.guild.channels.cache.find(
        (channel) => channel.id === "1377088834512097340"
      );
      channel.send(
        `**Canción saltada, ahora sonando:** ${song.name} - \`${song.formattedDuration}\``
      );
    } catch (e) {
      console.error(e);
      const channel = interaction.guild.channels.cache.find(
        (channel) => channel.id === "1377088834512097340"
      );
      channel.send({
        embeds: [
          {
            color: 0x5865f2,
            title: "Error al saltar canción",
            description: `Error: \`${e.message}\``,
          },
        ],
      });
      interaction.reply("Ocurrio un error", { flags: MessageFlags.Ephemeral });
    }
  },
};
