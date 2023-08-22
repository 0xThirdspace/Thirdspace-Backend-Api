import { PrismaClient, Chat } from '@prisma/client';

const prisma = new PrismaClient();

class ChatService {
  static async findChatByMembers(firstId: string, secondId: string): Promise<Chat | null> {
    const chat = await prisma.chat.findFirst({
      where: {
        members: {
          hasEvery: [firstId, secondId],
        },
      },
    });

    return chat;
  }

  
  static async createChat(firstId: string, secondId: string): Promise<Chat> {
    const chat = await prisma.chat.create({
      data: {
        members: [firstId, secondId],
      },
    });

    return chat;
  }


  static async findUserChats(userId: string): Promise<Chat[]> {
    const userChats = await prisma.chat.findMany({
      where: {
        members: {
          has: userId,
        },
      },
    });

    return userChats;
  }
}

export default ChatService;
