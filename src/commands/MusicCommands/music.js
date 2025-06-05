import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";

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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("aleatorizar")
        .setDescription("Aleatoriza la cola de reproducción")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("repetir")
        .setDescription("Hace que la cola de reproducción se repita")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.guild.channels.cache.get("1377088834512097340"); // Canal 'musica'

    switch (subcommand) {
      case "reproducir": {
        const input = interaction.options.getString("nombre", true); // Obtiene el nombre o URL de la canción
        const skip = interaction.options.getBoolean("saltar") ?? false; // Si se debe saltar la canción actual
        const position =
          interaction.options.getInteger("pocision") ?? undefined; // Posición de la canción en la cola
        const vc = interaction.member.voice.channel; // Canal de voz del usuario
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
              let Song = queue?.songs[queue.songs.length - 1];
              let embed = new EmbedBuilder()
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
          let button_confirmar = new ButtonBuilder()
            .setCustomId("confirmar")
            .setLabel("Confirmar")
            .setStyle(ButtonStyle.Primary);

          let button_cancelar = new ButtonBuilder()
            .setCustomId("cancelar")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Secondary);

          let row = new ActionRowBuilder().addComponents(
            button_confirmar,
            button_cancelar
          );

          let reply = await interaction.editReply({
            content:
              "¿Estás seguro de que quieres detener la reproducción?, tal vez otras personas lo estan escuchando.",
            components: [row],
            fetchReply: true,
          });

          let collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000, // 15 segundos para responder
          });

          collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
              await i.reply({
                content: "Este botón no es para ti.",
                flags: MessageFlags.Ephemeral,
              });
            }

            if (i.customId === "confirmar") {
              await interaction.client.distube
                .getQueue(interaction.guild.id)
                .remove();
              await interaction.client.distube.voices.leave(
                interaction.guild.id
              );
              await interaction.editReply({
                content: "La reproducción ha sido detenida.",
                components: [],
              });
              await channel.send({
                content: `<@${interaction.user.id}> Ha detenido la cola de reproduccion`,
              });
              collector.stop("confirmed");
            } else if (i.customId === "cancelar") {
              await interaction.editReply({
                content: "Esta bien, no se detuvo la reproducción.",
                flags: MessageFlags.Ephemeral,
                components: [],
              });
              collector.stop("cancelled");
            }
          });

          collector.on("end", (collected, reason) => {
            if (reason === "time") {
              interaction.editReply({
                content: "Tiempo agotado, no se detuvo la reproducción.",
                components: [],
              });
            }
          });
        } catch (e) {
          console.error(e);
          await interaction.editReply({
            content: "Ocurrió un error al intentar detener la reproducción.",
          });
        }
        break;
      }
      case "saltar": {
        let button_confirmar = new ButtonBuilder()
          .setCustomId("confirmar")
          .setLabel("Confirmar")
          .setStyle(ButtonStyle.Primary);

        let button_cancelar = new ButtonBuilder()
          .setCustomId("cancelar")
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Secondary);

        let row = new ActionRowBuilder().addComponents(
          button_confirmar,
          button_cancelar
        );

        let reply = await interaction.editReply({
          content: "¿Estás seguro de que quieres saltar la canción actual?",
          components: [row],
          fetchReply: true,
        });

        let collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000, // 15 segundos para responder
        });

        collector.on("collect", async (i) => {
          if (i.customId === "confirmar") {
            let actualSong = interaction.client.distube.getQueue(
              interaction.guild.id
            )?.songs[0];

            if (!actualSong) {
              interaction.editReply({
                content: "No hay nada reproduciendose actualmente.",
                components: [],
              });
            }

            await interaction.client.distube
              .skip(interaction)
              .then((song) => {
                channel.send({
                  content: `<@${interaction.user.id}> Canción saltada: **${actualSong.name}**`,
                  embeds: [
                    new EmbedBuilder()
                      .setColor(0x5865f2)
                      .setTitle("Ahora reproduciendo:")
                      .addFields(
                        {
                          name: "Nombre",
                          value: song.name || "Desconocido",
                          inline: true,
                        },
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
                      .setDescription("**Información de la canción:**")
                      .setImage(song.thumbnail || ""),
                  ],
                });
                interaction.editReply({
                  content: `Canción saltada`,
                  components: [],
                });
              })
              .catch(async (e) => {
                if (e.errorCode === "NO_UP_NEXT") {
                  let row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("confirmar")
                      .setLabel("Confirmar")
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setCustomId("cancelar")
                      .setLabel("Cancelar")
                      .setStyle(ButtonStyle.Secondary)
                  );

                  let reply2 = await interaction.editReply({
                    content:
                      "No hay canciones en la cola para saltar. ¿Deseas parar la reproducción?",
                    components: [row2],
                    fetchReply: true,
                  });

                  let collector2 = reply2.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 15000, // 15 segundos para responder
                  });

                  collector2.on("collect", async (i2) => {
                    if (i2.customId === "confirmar") {
                      await interaction.client.distube
                        .getQueue(interaction.guild.id)
                        .remove();
                      await interaction.client.distube.voices.leave(
                        interaction.guild.id
                      );
                      await channel.send({
                        content: `<@${interaction.user.id}> Ha detenido la cola de reproduccion`,
                      });
                      await interaction.editReply({
                        content: "La reproducción ha sido detenida.",
                        components: [],
                      });
                      collector2.stop("confirmed");
                    } else if (i2.customId === "cancelar") {
                      await interaction.editReply({
                        content: "Esta bien, no se paró la reproducción.",
                        components: [],
                      });
                      collector2.stop("cancelled");
                    }

                    collector2.on("end", (collected, reason) => {
                      if (reason === "time") {
                        interaction.editReply({
                          content:
                            "Tiempo agotado, no se detuvo la reproducción.",
                          components: [],
                        });
                      }
                    });
                  });
                }
              });
            collector.stop("confirmed");
          } else if (i.customId === "cancelar") {
            await interaction.editReply({
              content: "Esta bien, no se saltó la canción.",
              components: [],
            });
            collector.stop("cancelled");
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            interaction.editReply({
              content: "Tiempo agotado, no se saltó la canción.",
              components: [],
            });
          }
        });

        break;
      }
      case "pausar": {
        let row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("pausar")
            .setLabel("Pausar")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("cancelar")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Secondary)
        );

        let reply = await interaction.editReply({
          content: "¿Estás seguro de que quieres pausar la cola?",
          components: [row],
          fetchReply: true,
        });

        let collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000, // 15 segundos para responder
        });

        collector.on("collect", async (i) => {
          if (i.customId === "pausar") {
            try {
              await interaction.client.distube.pause(interaction);
              await interaction.editReply({
                content: "La canción ha sido pausada.",
                components: [],
              });
              channel.send({
                content: `<@${interaction.user.id}> Ha pausado la canción actual.`,
              });
            } catch (e) {
              console.error(e);
              await interaction.editReply({
                content: "Ocurrió un error al intentar pausar la canción.",
                components: [],
              });
            }
            collector.stop("paused");
          } else if (i.customId === "cancelar") {
            await interaction.editReply({
              content: "Esta bien, no se pausó la canción.",
              components: [],
            });
            collector.stop("cancelled");
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            interaction.editReply({
              content: "Tiempo agotado, no se pausó la canción.",
              components: [],
            });
          }
        });

        break;
      }
      case "reanudar": {
        let row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("reanudar")
            .setLabel("Reanudar")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("cancelar")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Secondary)
        );
        let reply = await interaction.editReply({
          content: "¿Estás seguro de que quieres reanudar la canción?",
          components: [row],
          fetchReply: true,
        });
        let collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000, // 15 segundos para responder
        });

        collector.on("collect", async (i) => {
          if (i.customId === "reanudar") {
            try {
              await interaction.client.distube.resume(interaction);
              await interaction.editReply({
                content: "La canción ha sido reanudada.",
                components: [],
              });
              channel.send({
                content: `<@${interaction.user.id}> Ha reanudado la canción actual.`,
              });
            } catch (e) {
              console.error(e);
              await interaction.editReply({
                content: "Ocurrió un error al intentar reanudar la canción.",
                components: [],
              });
            }
            collector.stop("resumed");
          } else if (i.customId === "cancelar") {
            await interaction.editReply({
              content: "Esta bien, no se reanudó la canción.",
              components: [],
            });
            collector.stop("cancelled");
          }
        });
        break;
      }
      case "aleatorizar": {
        let row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("aleatorizar")
            .setLabel("Aleatorizar")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("cancelar")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Secondary)
        );

        let reply = await interaction.editReply({
          content: "¿Estás seguro de que quieres aleatorizar la cola?",
          components: [row],
          fetchReply: true,
        });

        let collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 15000, // 15 segundos para responder
        });

        collector.on("collect", async (i) => {
          if (i.customId === "aleatorizar") {
            try {
              await interaction.client.distube.shuffle(interaction);
              await interaction.editReply({
                content: "La cola ha sido aleatorizada.",
                components: [],
              });
              channel.send({
                content: `<@${interaction.user.id}> Ha aleatorizado la cola de reproducción.`,
              });
            } catch (e) {
              console.error(e);
              await interaction.editReply({
                content: "Ocurrió un error al intentar aleatorizar la cola.",
                components: [],
              });
            }
            collector.stop("shuffled");
          } else if (i.customId === "cancelar") {
            await interaction.editReply({
              content: "Esta bien, no se aleatorizó la cola.",
              components: [],
            });
            collector.stop("cancelled");
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            interaction.editReply({
              content: "Tiempo agotado, no se aleatorizó la cola.",
              components: [],
            });
          }
        });
        break;
      }
      case "repetir": {
        let queue = interaction.client.distube.getQueue(interaction.guild.id);

        if (queue.repeatMode === 0) {
          let row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("repetir")
              .setLabel("Repetir")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("cancelar")
              .setLabel("Cancelar")
              .setStyle(ButtonStyle.Secondary)
          );

          let reply = await interaction.editReply({
            content:
              "¿Estás seguro de que quieres activar la repetición de la cola?",
            components: [row],
            fetchReply: true,
          });

          let collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000, // 15 segundos para responder
          });

          collector.on("collect", async (i) => {
            if (i.customId === "repetir") {
              try {
                await interaction.client.distube.setRepeatMode(interaction, 2);
                await interaction.editReply({
                  content: "La cola ahora se repetirá.",
                  components: [],
                });
                channel.send({
                  content: `<@${interaction.user.id}> Ha activado la repetición de la cola.`,
                });
              } catch (e) {
                console.error(e);
                await interaction.editReply({
                  content:
                    "Ocurrió un error al intentar activar la repetición.",
                  components: [],
                });
              }
              collector.stop("repeated");
            } else if (i.customId === "cancelar") {
              await interaction.editReply({
                content: "Esta bien, no se activó la repetición.",
                components: [],
              });
              collector.stop("cancelled");
            }
          });
          collector.on("end", (collected, reason) => {
            if (reason === "time") {
              interaction.editReply({
                content: "Tiempo agotado, no se activó la repetición.",
                components: [],
              });
            }
          });
        } else if (queue.repeatMode === 2) {
          let row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("desactivar")
              .setLabel("Desactivar")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("cancelar")
              .setLabel("Cancelar")
              .setStyle(ButtonStyle.Secondary)
          );

          let reply = await interaction.editReply({
            content: "La cola ya se esta repitiendo, ¿quieres desactivarla?",
            components: [row],
            fetchReply: true,
          });

          let collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000, // 15 segundos para responder
          });

          collector.on("collect", async (i) => {
            if (i.customId === "desactivar") {
              try {
                await interaction.client.distube.setRepeatMode(interaction, 0);
                await interaction.editReply({
                  content: "La repetición de la cola ha sido desactivada.",
                  components: [],
                });
                channel.send({
                  content: `<@${interaction.user.id}> Ha desactivado la repetición de la cola.`,
                });
              } catch (e) {
                console.error(e);
                await interaction.editReply({
                  content:
                    "Ocurrió un error al intentar desactivar la repetición.",
                  components: [],
                });
              }
              collector.stop("deactivated");
            } else if (i.customId === "cancelar") {
              await interaction.editReply({
                content: "Esta bien, no se desactivó la repetición.",
                components: [],
              });
              collector.stop("cancelled");
            }
          });
          collector.on("end", (collected, reason) => {
            if (reason === "time") {
              interaction.editReply({
                content: "Tiempo agotado, no se activó la repetición.",
                components: [],
              });
            }
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
