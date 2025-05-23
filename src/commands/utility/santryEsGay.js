const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("santry")
    .setDescription("Easter egg de santry"),
  async execute(interaction) {
    await interaction.reply("@santryx_ es gay certificado");
  },
};
