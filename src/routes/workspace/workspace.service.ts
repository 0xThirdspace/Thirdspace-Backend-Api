import { PrismaClient, Role, Department, User } from "@prisma/client";


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

    // Fetch the user information of the workspace owner
    const user: (User | null) = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

     // Create the workspace
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
    
     // Add the workspace owner to the team table with role "Owner" (or any role you prefer)
     await prisma.team.create({
      data: {
        email: user.email,
        role: "owner",
        department: "management",
        workspaceId: workspace.id,
        userId: user.id,
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
  static async getWorkspaceById(workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      include: {
        user: false,
      },
    });
  
    return workspace;
  }
  static async addUserToWorkspace(
    workspaceId: string,
    email: string,
    role: Role,
    department: Department,
    req: any
  ) {
    // Check if the user with the given email exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if the workspace with the given ID exists in the database
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
    });

    if (!existingWorkspace) {
      throw new Error("Workspace not found");
    }

    // Check if the user is already a member of the workspace
    const existingMember = await prisma.team.findFirst({
      where: {
        workspaceId,
        userId: existingUser.id,
      },
    });

    
    if (existingMember) {
      throw new Error("You have already joined the team");
    }
 // Retrieve the current logged-in user's email using the userId from the request
 const loggedInUserId = (req as any).userId;
 const loggedInUser = await prisma.user.findUnique({
   where: {
     id: loggedInUserId,
   },
 });

 if (!loggedInUser) {
   throw new Error("User not found");
 }

 // Check if the email of the current logged-in user matches the invitation email
 if (loggedInUser.email !== email) {
   throw new Error("You are not authorized to accept this invitation.");
 }
    // Create a new team entry to associate the user with the workspace
    const newMember = await prisma.team.create({
      data: {
        email: existingUser.email,
        role,
        department,
        workspaceId,
        userId: existingUser.id,
      },
    });

    return newMember;
  }

  static async getUsersByWorkspaceId(workspaceId: string) {
    const users = await prisma.team.findMany({
      where: {
        workspaceId,
      },
      select: {
        role: true,
        department: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return users;
  }
  static async getUserTeamRole(workspaceId: string, userId: string) {
    // Check if the user with the given ID exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  
    if (!existingUser) {
      throw new Error("User not found");
    }
  
    // Check if the workspace with the given ID exists in the database
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
    });
  
    if (!existingWorkspace) {
      throw new Error("Workspace not found");
    }
  
    // Check if the user is a member of the workspace
    const teamMember = await prisma.team.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  
    if (!teamMember) {
      throw new Error("User is not a member of this workspace");
    }
  
    // Return the role of the user in the workspace
    return teamMember.role;
  }
  
  static async deleteUserFromTeam(workspaceId: string, userId: string) {
    // Check if the user with the given ID exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  
    if (!existingUser) {
      throw new Error("User not found");
    }
  
    // Check if the workspace with the given ID exists in the database
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
    });
  
    if (!existingWorkspace) {
      throw new Error("Workspace not found");
    }
  
    // Check if the user is a member of the workspace
    const teamMember = await prisma.team.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  
    if (!teamMember) {
      throw new Error("User is not a member of this workspace");
    }
  
    // Delete the user from the team
    const deletedUser = await prisma.team.delete({
      where: {
        id: teamMember.id,
      },
    });
  
    return deletedUser;
  }
  static async deleteAllUsersFromTeam(workspaceId: string) {
    // Check if the workspace with the given ID exists in the database
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
    });
  
    if (!existingWorkspace) {
      throw new Error("Workspace not found");
    }
  
    // Delete all users from the team except those with the role "owner"
    const deletedUsers = await prisma.team.deleteMany({
      where: {
        workspaceId,
        NOT: {
          role: 'owner',
        },
      },
    });
  
    return deletedUsers;
  }
  static async updateUserInformationOnTeam(
    workspaceId: string,
    userId: string,
    role: Role,
    department: Department
  ) {
    // Check if the user is a member of the workspace
    const teamMember = await prisma.team.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  
    if (!teamMember) {
      return null;
    }
  
    // Update the user information on the team table
    const updatedUser = await prisma.team.update({
      where: {
        id: teamMember.id,
      },
      data: {
        role,
        department,
      },
    });
  
    return updatedUser;
  }
}





export default WorkspaceService;
export const hasBounties = WorkspaceService.hasBounties;
export const areBountiesOpen = WorkspaceService.areBountiesOpen;
