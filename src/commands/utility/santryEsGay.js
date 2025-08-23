import { SlashCommandBuilder, userMention } from "discord.js";

const mentionId = "409487890557698070";

export default {
  data: new SlashCommandBuilder()
    .setName("santry")
    .setDescription("Easter egg de santry"),
  async execute(interaction) {
    await interaction.reply(userMention(mentionId) + "es gay certificado");
  },
};
