import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reanudar")
    .setDescription("Reanuda la canción actual en reproducción"),
  async execute(interaction) {
    try {
      await interaction.client.distube.resume(interaction);
      await interaction.reply({
        content: "La canción ha sido reanudada.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: "Ocurrió un error al intentar reanudar la canción.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
