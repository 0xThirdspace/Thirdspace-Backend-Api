import {
  KenbanBoard,
  KenbanBoardPayload,
  PrismaClient,
  Tasks,
} from "@prisma/client";

const prisma = new PrismaClient();

interface ErrorResponse {
  error: string;
  statusCode?: number;
  userId?: string;
}

class KenbanBoardService {
  static async createKanbanBoard(
    userId: string,
    workspaceId: string,
    name: string
  ): Promise<KenbanBoard | ErrorResponse> {
    try {
      const board = await prisma.kenbanBoard.create({
        data: {
          userId,
          workspaceId,
          name,
        },
        include: {
          workspace: true,
          createdBy: true,
        },
      });

      return board;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while creating Kenban Board" };
    }
  }

  static async getKenbanBoardById(
    kenbanBoardId: string
  ): Promise<KenbanBoard | null | ErrorResponse> {
    try {
      const board = await prisma.kenbanBoard.findUnique({
        where: {
          id: kenbanBoardId,
        },
        include: {
          createdBy: true,
          workspace: true,
        },
      });

      return board;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while retrieving the board." };
    }
  }

  static async getBoardCreated(userId: string): Promise<KenbanBoard | null> {
    try {
      const board = await prisma.kenbanBoard.findFirst({
        where: {
          userId,
        },
      });

      return board;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return null;
    }
  }

  static async deleteBoard(
    userId: string,
    kenbanBoardId: string
  ): Promise<KenbanBoard | null | ErrorResponse> {
    try {
      const board = await prisma.kenbanBoard.findFirst({
        where: {
          id: kenbanBoardId,
          userId,
        },
        include: {
          createdBy: true,
          workspace: true,
        },
      });

      if (!board) {
        return null;
      }

      await prisma.kenbanBoard.delete({
        where: {
          id: kenbanBoardId,
        },
      });

      return board;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while deleting the board." };
    }
  }
}

export default KenbanBoardService;
