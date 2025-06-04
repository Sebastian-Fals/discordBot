import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("musica")
    .setDescription("Comandos de música")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reproducir")
        .setDescription("Busca y reproduce una canción")
        .addStringOption((option) =>
          option
            .setName("nombre")
            .setDescription("Nombre o URL de la canción a reproducir")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("saltar")
            .setDescription(
              "Si se debe saltar la canción que esta sonando actualmente (opcional)"
            )
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("pocision")
            .setDescription("Posición de la canción en la cola (opcional)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("parar").setDescription("Detiene la canción actual")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("saltar").setDescription("Salta la canción actual")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("pausar").setDescription("Pausa la canción actual")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("reanudar").setDescription("Reanuda la canción actual")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "reproducir": {
        const input = interaction.options.getString("nombre", true); // Obtiene el nombre o URL de la canción
        const skip = interaction.options.getBoolean("saltar") ?? false; // Si se debe saltar la canción actual
        const position =
          interaction.options.getInteger("pocision") ?? undefined; // Posición de la canción en la cola
        const vc = interaction.member.voice.channel; // Canal de voz del usuario
        const channel = interaction.guild.channels.cache.get(
          "1377088834512097340"
        ); // Canal 'musica'

        // Revisa si el usuario está en un canal de voz
        if (!vc) {
          return interaction.editReply({
            content: "Debes estar en un canal de voz para reproducir música.",
          });
        }

        // Revisa si el bot esta intentando acceder a spotify
        if (input.includes("spotify")) {
          return interaction.editReply({
            content: "No se pueden reproducir canciones de Spotify.",
          });
        }

        try {
          await interaction.client.distube.play(vc, input, {
            skip,
            position,
            textChannel: interaction.channel ?? undefined,
            member: interaction.member,
            metadata: { interaction },
          });

          if (channel) {
            const queue = interaction.client.distube.getQueue(
              interaction.guild.id
            );

            const Song = queue?.songs[queue.songs.length - 1];

            const embeds = [];
            // Verificamos si es una playlist por una mejor condición
            const isPlaylist =
              queue?.songs.length > 1 && input.includes("playlist");

            if (isPlaylist) {
              const maxToShow = 20;
              const songsAdded = queue.songs.slice(-maxToShow); // Últimas N canciones añadidas
              const embedsToSend = [];

              for (const song of songsAdded) {
                const embed = new EmbedBuilder()
                  .setColor(0x5865f2)
                  .setTitle(song.name || "Canción sin título")
                  .addFields(
                    {
                      name: "Duración",
                      value: song.formattedDuration || "Desconocida",
                      inline: true,
                    },
                    {
                      name: "Fuente",
                      value: song.source || "Desconocida",
                      inline: true,
                    },
                    {
                      name: "Solicitada por",
                      value:
                        interaction.user.displayName ||
                        interaction.user.username,
                      inline: true,
                    },
                    {
                      name: "URL",
                      value: song.url
                        ? `[Enlace](${song.url})`
                        : "No disponible",
                      inline: false,
                    }
                  )
                  .setDescription("**Canción añadida de la playlist:**")
                  .setImage(song.thumbnail || "");

                embedsToSend.push(embed);
              }

              // Agrupa en bloques de 10 por el límite de Discord
              for (let i = 0; i < embedsToSend.length; i += 10) {
                const chunk = embedsToSend.slice(i, i + 10);
                await channel.send({
                  content: `<@${
                    interaction.user.id
                  }> Playlist añadida a la cola (${i + 1} - ${
                    i + chunk.length
                  })`,
                  embeds: chunk,
                });
              }

              if (queue.songs.length > maxToShow) {
                await channel.send({
                  content: `⚠️ Se han omitido ${
                    queue.songs.length - maxToShow
                  } canciones para evitar spam.`,
                });
              }
            } else {
              // Una sola canción añadida
              const Song = queue?.songs[queue.songs.length - 1];
              const embed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle("Añadiendo canción a la cola")
                .addFields(
                  {
                    name: "Nombre",
                    value: Song?.name || "Desconocido",
                    inline: true,
                  },
                  {
                    name: "Duración",
                    value: Song?.formattedDuration || "Desconocida",
                    inline: true,
                  },
                  {
                    name: "Fuente",
                    value: Song?.source || "Desconocida",
                    inline: true,
                  },
                  {
                    name: "Solicitada por",
                    value:
                      interaction.user.displayName || interaction.user.username,
                    inline: true,
                  },
                  {
                    name: "URL",
                    value: Song?.url
                      ? `[Enlace](${Song.url})`
                      : "No disponible",
                    inline: false,
                  }
                )
                .setDescription("**Información de la canción:**")
                .setImage(Song?.thumbnail || "");

              await channel.send({
                content: `<@${interaction.user.id}> Canción añadida a la cola:`,
                embeds: [embed],
              });
            }
          }

          await interaction.editReply("Reproduciendo canción...");
        } catch (e) {
          console.error(e);
          if (channel) {
            channel.send({
              content: `<@${interaction.user.id}>`,
              embeds: [
                new EmbedBuilder()
                  .setColor(0x5865f2)
                  .setTitle("Error al reproducir canción")
                  .setDescription(`Error: \`${e.message}\``),
              ],
            });
          }
          await interaction.editReply(
            "Ocurrió un error al intentar reproducir la canción."
          );
        }
        break;
      }
      case "parar": {
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
        break;
      }
      case "saltar": {
        try {
          let song = await interaction.client.distube.skip(interaction);
          const channel = interaction.guild.channels.cache.find(
            (channel) => channel.id === "1377088834512097340"
          );
          interaction.reply({
            content: "Se ha saltado la canción actual",
            flags: MessageFlags.Ephemeral,
          });
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
          interaction.reply("Ocurrio un error", {
            flags: MessageFlags.Ephemeral,
          });
        }
        break;
      }
      case "pausar": {
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
        break;
      }
      case "reanudar": {
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
        break;
      }
      default: {
        await interaction.editReply("Comando no reconocido.");
        break;
      }
    }
  },
};
