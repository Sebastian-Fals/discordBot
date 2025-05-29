import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("parar")
    .setDescription("Detiene la canción actual en reproducción"),
  async execute(interaction) {
    try {
      await interaction.client.distube.stop(interaction);
      await interaction.reply({
        content: "La reproducción ha sido detenida.",
        flags: MessageFlags.Ephemeral,
      });
      await interaction.client.distube.voices.leave(interaction.guild.id);
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: "Ocurrió un error al intentar detener la reproducción.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
