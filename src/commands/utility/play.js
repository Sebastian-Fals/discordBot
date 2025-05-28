const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reproducir")
    .setDescription("Reproduce una canción en el canal de voz")
    .addStringOption((opt) =>
      opt
        .setName("nombre")
        .setDescription("Nombre o URL de la canción a reproducir")
        .setRequired(true)
    )
    .addBooleanOption((opt) =>
      opt
        .setName("saltar")
        .setDescription("Si se establece, saltará la canción actual")
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("pocision")
        .setDescription("Pocision en la lista de reproducción")
        .setRequired(false)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("nombre", true);
    const skip = interaction.options.getBoolean("saltar", false) ?? false;
    const position =
      interaction.options.getInteger("pocision", false) ?? undefined;
    const vc = interaction.member.voice.channel;
    const channel = interaction.guild.channels.cache.find(
      (channel) => channel.id === "1377088834512097340"
    );
    if (!vc) return; // Handled by inVoiceChannel property
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await interaction.client.distube
      .play(vc, input, {
        skip,
        position,
        textChannel: interaction.channel ?? undefined,
        member: interaction.member,
        metadata: { interaction },
      })
      .catch((e) => {
        console.error(e);
        channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle("Error al reproducir canción")
              .setDescription(`Error: \`${e.message}\``),
          ],
        });
        interaction.editReply(
          "Ocurrió un error al intentar reproducir la canción."
        );
      });
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("Reproduciendo canción")
          .addFields({
            name: "Solicitada por",
            value: interaction.user.displayName,
            inline: true,
          })
          .setDescription(
            `Reproduciendo: \`${input}\`${
              skip ? " (Saltando la canción actual)" : ""
            }${position ? ` en la posición ${position}` : ""}`
          ),
      ],
    });
    interaction.editReply("Reproduciendo canción...");
  },
};
