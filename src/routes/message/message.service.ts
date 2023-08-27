import { PrismaClient, Message } from '@prisma/client';

const prisma = new PrismaClient();

class MessageService {
  static async createMessage(chatId: string, senderId: string, text: string, imageUrl?: string | null): Promise<Message> {
    // Check if the chat with the given chatId exists
    const chatExists = await prisma.chat.findUnique({
      where: { id: chatId }, // Provide the correct field name and value to identify the chat
    });
  
    if (!chatExists) {
      throw new Error(`Chat with id ${chatId} does not exist.`);
    }
  
    const data: {
      chatId: string;
      senderId: string;
      text: string;
      imageUrl?: string | null; 
    } = {
      chatId,
      senderId,
      text,
    };
  
    if (imageUrl !== undefined) {
      data.imageUrl = imageUrl; 
    }
  
    const createdMessage = await prisma.message.create({
      data,
    });
  
    return createdMessage;
  }
  
  static async getMessagesByChatId(chatId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return messages;
  }
  static async editMessage(messageId: string, text: string): Promise<Message> {
    // Find the message by its ID
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // Check if the message exists
    if (!existingMessage) {
      throw new Error(`Message with id ${messageId} does not exist.`);
    }

    // Update the message text
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        text,
      },
    });

    return updatedMessage;
  }
  static async deleteMessage(messageId: string): Promise<void> {
    // Find the message by its ID
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // Check if the message exists
    if (!existingMessage) {
      throw new Error(`Message with id ${messageId} does not exist.`);
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });
  }

  static async deleteAllMessagesAndChat(chatId: string): Promise<void> {
    // Delete all messages associated with the chat
    await prisma.message.deleteMany({
      where: { chatId },
    });

    // Delete the chat itself
    await prisma.chat.delete({
      where: { id: chatId },
    });
  }

}

export default MessageService;
