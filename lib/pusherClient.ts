// lib/pusher.js
import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export const getPusherClient = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusherInstance;
};
