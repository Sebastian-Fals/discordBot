import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("limpiar-canal")
    .setDescription("Elimina todos los mensajes del canal actual.")
    .setDefaultMemberPermissions(0x0000000000000008), // 0 significa que solo los administradores pueden usar este comando
  async execute(interaction) {
    // Verifica si el usuario tiene permisos de administrador
    if (!interaction.member.permissions.has(0x0000000000000008)) {
      return interaction.reply({
        content: "No tienes permiso para usar este comando.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Intenta eliminar los mensajes del canal
    try {
      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      await interaction.channel.bulkDelete(fetched, true);
      return interaction.reply({
        content: `Se han eliminado ${fetched.size} mensajes.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error al eliminar mensajes:", error);
      return interaction.reply({
        content: "Ocurrió un error al intentar eliminar los mensajes.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
