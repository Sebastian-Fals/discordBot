import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";

export default {
  data: new SlashCommandBuilder()
    .setName("dialogar")
    .setDescription("Habla con el bot de cualquier tema")
    .addStringOption((option) =>
      option
        .setName("mensaje")
        .setDescription("El mensaje que quieres enviar al bot")
        .setRequired(true)
    ),
  async execute(interaction) {
    // Mensaje que se enviará al modelo de IA
    const message =
      `Este mensaje fue escrito por ${interaction.user.username} con id ${interaction.user.id} en el canal ${interaction.channel}:` +
      interaction.options.getString("mensaje");

    // Agregar el mensaje del usuario al historial de mensajes
    interaction.client.historialDeMensajes.push({
      role: "user",
      content: message,
    });

    // Configurar el cliente de OpenAI con la clave de API y el endpoint personalizado
    const openAiModel = new OpenAI({
      apiKey: process.env.grokKey,
      baseURL: "https://api.x.ai/v1" /*"https://api.deepseek.com"*/,
    });

    // Inicia el proceso de respuesta a discord
    await interaction.deferReply();

    // Llamar al modelo de IA con el historial de mensajes
    const response = await openAiModel.chat.completions.create({
      model: "grok-3-mini",
      messages: interaction.client.historialDeMensajes,
      temperature: 0.8,
    });

    // Obtener la respuesta del modelo y enviarla a Discord
    const respuestaDelBot = response.choices[0].message.content;

    // Agregar la respuesta del bot al historial de mensajes
    interaction.client.historialDeMensajes.push({
      role: "assistant",
      content: respuestaDelBot,
    });

    // Envia la respuesta a discord
    await interaction.editReply(respuestaDelBot);
  },
};
