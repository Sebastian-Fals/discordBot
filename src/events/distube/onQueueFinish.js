import { Events } from "distube";

export default {
  name: Events.FINISH,
  async execute(queue) {
    try {
      // Deja el canal de voz
      await queue.voice.leave();

      // ID del canal donde quieres borrar los mensajes
      const canalId = "1377088834512097340";

      // Buscar el canal
      const canal = queue.client.channels.cache.get(canalId);

      // Verifica si es un canal de texto
      if (canal && canal.isTextBased()) {
        // Obtener y borrar hasta 100 mensajes
        const mensajes = await canal.messages.fetch({ limit: 100 });
        await canal.bulkDelete(mensajes, true); // true ignora mensajes de más de 14 días
      } else {
        console.error("No se encontró el canal o no es de texto.");
      }
    } catch (error) {
      console.error(
        "Error al borrar mensajes o salir del canal de voz:",
        error
      );
    }
  },
};
