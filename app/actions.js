// app/actions.js
"use server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function sendMessage(text) {
  // 1. Logic to save 'text' to MySQL goes here (Prisma/Drizzle)
  // await db.message.create({ data: { content: text } })

  // 2. Tell Pusher to broadcast the message
  await pusher.trigger("chat-channel", "message-event", {
    message: text,
    sender: "Anonymous",
    time: new Date().toISOString(),
  });
}
