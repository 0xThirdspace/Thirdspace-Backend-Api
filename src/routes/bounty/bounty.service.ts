import { PrismaClient, Bounty, User } from "@prisma/client";

const prisma = new PrismaClient();

enum Status {
  PENDING = "pending",
  ACTIVE = "active",
  CLOSED = "closed",
}

interface ErrorResponse {
  error: string;
  statusCode?: number;
  userId?: string;
}
  
interface Participant {
    id: string;
}


class BountyService {
  static async createBounty(
    userId: string,
    workspaceId: string,
    title: string,
    repo_link: string,
    amount: number,
    start_date: Date,
    end_date: Date,
    bounty_description: string
  ): Promise<Bounty | ErrorResponse> {
    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          user: { id: userId },
        },
      });

      if (!workspace) {
        return {
          error: "Current login user is not the owner of the workspace.",
        };
      }

      const bounty = await prisma.bounty.create({
        data: {
          title,
          repo_link,
          amount,
          start_date,
          end_date,
          bounty_description,
          userId,
          workspaceId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return bounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while creating bounties" };
    }
  }

  static async getAllBounties(): Promise<(Bounty | ErrorResponse)[]> {
    try {
      const bounties = await prisma.bounty.findMany({
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return bounties;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return [{ error: "An error occurred while retrieving all bounties." }];
    }
  }

  static async getBountiesCreatedByUser(
    userId: string
  ): Promise<(Bounty | ErrorResponse)[]> {
    try {
      const bounties = await prisma.bounty.findMany({
        where: {
          userId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return bounties;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return [
        {
          error:
            "An error occurred while retrieving the bounties created by the user.",
        },
      ];
    }
  }

  static async getBountyById(
    bountyId: string
  ): Promise<Bounty | null | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findUnique({
        where: {
          id: bountyId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return bounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while retrieving the bounty." };
    }
  }

  static async isParticipantJoined(
    bountyId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const bounty = await prisma.bounty.findUnique({
        where: {
          id: bountyId,
        },
        include: {
          participants: true,
        },
      });
  
      if (!bounty) {
        return false;
      }
  
      const participants: Participant[] = bounty.participants;
      const isUserParticipant = participants.some((participant) => participant.id === userId);
  
      return isUserParticipant;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async deleteBounty(
    userId: string,
    bountyId: string
  ): Promise<Bounty | null | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findFirst({
        where: {
          id: bountyId,
          userId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      if (!bounty) {
        return null;
      }

      if (bounty.status !== "closed") {
        return null;
      }

      await prisma.bounty.delete({
        where: {
          id: bountyId,
        },
      });

      return bounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while deleting the bounty." };
    }
  }

  static async deleteAllBountiesCreatedByUser(
    userId: string
  ): Promise<ErrorResponse | void> {
    try {
      await prisma.bounty.deleteMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return {
        error:
          "An error occurred while deleting the bounties created by the user.",
      };
    }
  }

  static async getExistingBounty(userId: string): Promise<Bounty | null> {
    try {
      const bounty = await prisma.bounty.findFirst({
        where: {
          userId,
        },
      });

      return bounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return null;
    }
  }

  static async updateBountyStatus(
    userId: string,
    bountyId: string,
    status: Status | undefined
  ): Promise<Bounty | null | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findFirst({
        where: {
          id: bountyId,
          userId,
        },
      });

      if (!bounty) {
        return null;
      }

      const updatedBounty = await prisma.bounty.update({
        where: {
          id: bountyId,
        },
        data: {
          status,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return updatedBounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while updating the bounty status." };
    }
  }

  static async updateBounty(
    userId: string,
    bountyId: string,
    updateObject: Partial<Bounty>
  ): Promise<Bounty | null | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findFirst({
        where: {
          id: bountyId,
          createdByUser: {
            id: userId,
          },
        },
      });

      if (!bounty) {
        return null;
      }

      const updatedBounty = await prisma.bounty.update({
        where: {
          id: bountyId,
        },
        data: updateObject,
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return updatedBounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return { error: "An error occurred while updating the bounty." };
    }
  }

  static async addParticipant(
    bountyId: string,
    userId: string
  ): Promise<Bounty | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findUnique({
        where: {
          id: bountyId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      if (!bounty) {
        return { error: "Bounty not found.", statusCode: 404 };
      }

      if (bounty.createdByUser.id === userId) {
        return { error: "You cannot join your own bounty.", statusCode: 403 };
      }

      const participant = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!participant) {
        return { error: "User not found.", statusCode: 404 };
      }

      const updatedBounty = await prisma.bounty.update({
        where: {
          id: bountyId,
        },
        data: {
          participants: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });

      return updatedBounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return {
        error: "An error occurred while adding the participant to the bounty.",
        statusCode: 500,
      };
    }
  }
  static async getAllParticipants(
    bountyId: string
  ): Promise<(User | ErrorResponse)[]> {
    try {
      const bounty = await prisma.bounty.findUnique({
        where: {
          id: bountyId,
        },
        include: {
          participants: true,
        },
      });

      if (!bounty) {
        return [];
      }

      const participants = bounty.participants;

      return participants;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes

      return [
        { error: "An error occurred while retrieving the participants." },
      ];
    }
  }

  static async removeParticipant(
    bountyId: string,
    userId: string
  ): Promise<Bounty | ErrorResponse> {
    try {
      const bounty = await prisma.bounty.findUnique({
        where: {
          id: bountyId,
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });
  
      if (!bounty) {
        return { error: 'Bounty not found.', statusCode: 404 };
      }
  
      if (bounty.createdByUser.id === userId) {
        return { error: 'You cannot remove yourself from your own bounty.', statusCode: 403 };
      }
  
      const participant = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!participant) {
        return { error: 'User not found.', statusCode: 404 };
      }
  
      const updatedBounty = await prisma.bounty.update({
        where: {
          id: bountyId,
        },
        data: {
          participants: {
            disconnect: {
              id: userId,
            },
          },
        },
        include: {
          createdByUser: true,
          workspace: true,
          participants: true,
        },
      });
  
      return updatedBounty;
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
  
      return { error: 'An error occurred while removing the participant from the bounty.', statusCode: 500 };
    }
  }
}

export default BountyService;
