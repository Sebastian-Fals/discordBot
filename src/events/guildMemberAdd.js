import { Events, EmbedBuilder } from "discord.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(interaction) {
    const guild = interaction.guild;
    const channel = guild.channels.cache.find(
      (channel) => channel.id === "1375506459625783477"
    );
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(
        `¡Bienvenido ${interaction.user.username} al servidor oficial de Secondor!`
      )
      .setDescription(
        `
*Donde la comunidad cobra vida y el contenido nunca se detiene.*

👾 **¿Quiénes somos?**  
Este es el punto de encuentro de la comunidad de **Secondor**, donde nos reunimos para charlar, compartir, jugar y disfrutar de todo lo relacionado con mis streams de **Twitch** y los videos de **YouTube**.

📺 **¿Qué puedes encontrar aquí?**
- 🔴 Anuncios de streams y nuevos videos  
- 🎮 Eventos exclusivos y partidas con la comunidad  
- 💬 Canales para charlas, memes, clips y más  
- ⭐ Roles especiales para los más activos y suscriptores

💡 **Tips para empezar:**  
✅ Lee las reglas en \`#📜reglas\`  
✅ Preséntate en \`#👋presentaciones\`  
✅ Únete a la charla en \`#💬general\`  
✅ ¡Y no olvides activar las notificaciones para no perderte nada!

🚀 **Gracias por ser parte de esta aventura**  
¡Tu presencia hace que esta comunidad sea más épica cada día!

🔗 [Twitch](https://www.twitch.tv/secondor29)  
🔗 [YouTube](https://www.youtube.com/@Secondor)
`
      )
      .setThumbnail(interaction.user.displayAvatarURL());

    channel.send({ embeds: [welcomeEmbed] });
  },
};
