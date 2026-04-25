export interface Message {
  messageId?: number;
  chatId: number;
  sender: "thisUser" | "other";
  senderId?: number;
  text: string;
  date?: Date;
  status?: string;
}
