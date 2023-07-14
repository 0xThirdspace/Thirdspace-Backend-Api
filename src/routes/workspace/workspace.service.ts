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
}

export default WorkspaceService;
