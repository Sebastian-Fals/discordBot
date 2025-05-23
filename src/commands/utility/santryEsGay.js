const { SlashCommandBuilder, userMention } = require("discord.js");

const mentionId = "1099786341321035917";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("santry")
    .setDescription("Easter egg de santry"),
  async execute(interaction) {
    await interaction.reply(userMention(mentionId) + "es gay certificado");
  },
};
