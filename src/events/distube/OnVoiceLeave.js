import { Events } from "distube";

export default {
  name: Events.EMPTY,
  async execute(queue) {
    try {
      queue.client.removeQueue(queue.id);
      await queue.voice.leave();
    } catch (error) {
      console.error("Error sending message in channel:", error);
    }
  },
};
