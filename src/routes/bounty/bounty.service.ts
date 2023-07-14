import { PrismaClient, Bounty, Status } from '@prisma/client';

const prisma = new PrismaClient();

interface ErrorResponse {
  error: string;
  statusCode?: number;
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
        return { error: "Current login user is not the owner of the workspace." };
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

      return [{ error: 'An error occurred while retrieving all bounties.' }];
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
        { error: 'An error occurred while retrieving the bounties created by the user.' },
      ];
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
      });

      if (!bounty) {
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

      return { error: 'An error occurred while deleting the bounty.' };
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
        error: 'An error occurred while deleting the bounties created by the user.',
      };
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

      if (status && status !== 'completed' && status !== 'inprogress') {
        throw new Error('Invalid status. Only "completed" and "inprogress" are allowed.');
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

      return { error: 'An error occurred while updating the bounty status.' };
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

      return { error: 'An error occurred while updating the bounty.' };
    }
  }

 
}

export default BountyService;
