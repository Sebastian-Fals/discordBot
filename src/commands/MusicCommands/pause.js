import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pausar")
    .setDescription("Pausa la canción actual en reproducción"),
  async execute(interaction) {
    try {
      await interaction.client.distube.pause(interaction);
      await interaction.reply({
        content: "La canción ha sido pausada.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: "Ocurrió un error al intentar pausar la canción.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
