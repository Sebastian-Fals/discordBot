const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("santry")
    .setDescription("Santry es gay certificado"),
  async execute(interaction) {
    await interaction.reply("Santry es gay certificado");
  },
};
