import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class WorkspaceService {
  static async createWorkspace(
    userId: string,
    workspaceName: string,
    imageUrl?: any
  ) {
    if (!workspaceName) {
      throw new Error("You need to provide a workspace name");
    }

    const existingWorkspaceName = await prisma.workspace.findFirst({
      where: {
        workspace_name: workspaceName,
      },
    });

    if (existingWorkspaceName) {
      throw new Error("Workspace name already exists");
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        userId,
      },
    });

    if (existingWorkspace) {
      throw new Error("User can only create a single workspace.");
    }

    const workspace = await prisma.workspace.create({
      data: {
        workspace_name: workspaceName,
        userId,
        imageUrl,
      },
      include: {
        user: false,
      },
    });

    return workspace;
  }
  
  static async updateWorkspace(
    userId: string,
    workspaceId: string,
    workspaceName?: string,
    imageUrl?: any
  ) {
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    });

    if (!existingWorkspace) {
      return null;
    }
    const existingWorkspaceName = await prisma.workspace.findFirst({
      where: {
        workspace_name: workspaceName,
      },
    });

    if (existingWorkspaceName) {
      throw new Error("Workspace name already exists you can't use this name ");
    }
    const updateData: any = {};

    if (workspaceName) {
      updateData.workspace_name = workspaceName;
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: updateData,
      include: {
        user: false,
      },
    });

    return updatedWorkspace;
  }

  static async getWorkspaceByName(userId: string, workspaceName: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        userId,
        workspace_name: {
          contains: workspaceName,
          mode: 'insensitive', 
        },
      },
      include: {
        user: false,
      },
    });

    return workspace;
  }
  static async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    });

    if (!workspace) {
      return null;
    }

    // Delete associated closed bounties
    await prisma.bounty.deleteMany({
      where: {
        workspaceId,
        status: "closed",
      },
    });

    // Delete the workspace
    const deletedWorkspace = await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return deletedWorkspace;
  }

  static async hasBounties(workspaceId: string) {
    const bounties = await prisma.bounty.findMany({
      where: {
        workspaceId,
      },
    });

    return bounties.length > 0;
  }

  static async areBountiesOpen(workspaceId: string) {
    const openBounties = await prisma.bounty.findFirst({
      where: {
        workspaceId,
        status: {
          not: "closed",
        },
      },
    });

    return openBounties !== null;
  }
}

export default WorkspaceService;
export const hasBounties = WorkspaceService.hasBounties;
export const areBountiesOpen = WorkspaceService.areBountiesOpen;