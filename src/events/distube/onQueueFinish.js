const { Events } = require("distube");

module.exports = {
  name: Events.FINISH,
  async execute(queue) {
    try {
      await queue.voice.leave();
    } catch (error) {
      console.error("Error sending message in channel:", error);
    }
  },
};
