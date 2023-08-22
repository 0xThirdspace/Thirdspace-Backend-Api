import { Router, Request, Response, NextFunction } from "express";
import authenticateToken from "../../middleware/isAuth";
import WorkspaceService from "./workspace.service";
import { upload } from "../../middleware/cloudinary";
import { sendMail } from "../../../utils/emailUtils";


class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

const router = Router();

// POST / - Create a new workspace
router.post(
  "/",
  authenticateToken,
  upload.any(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { workspace_name } = req.body;
      const userId = (req as any).userId;
      let imageUrl = null;

      if (files.length > 0) {
        const image = files[0];
        imageUrl = image.path;
      }

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const workspace = await WorkspaceService.createWorkspace(
        userId,
        workspace_name,
        imageUrl
      );
      res.status(201).json(workspace);
    } catch (error) {
      console.log(error);
      if ((error as Error).message === "Workspace name already exists") {
        next({ status: 409, message: "The workspace name is not available" });
      } else if (
        (error as Error).message === "You need to provide a workspace name"
      ) {
        next({
          status: 400,
          message: "Bad Request: You need to provide a workspace name",
        });
      } else {
        next(error as Error);
      }
    }
  }
);

// GET / - Get user workspace by name
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceName = req.headers["workspace-name"] as string;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const workspace = await WorkspaceService.getWorkspaceByName(
        userId,
        workspaceName
      );

      if (workspace) {
        res.status(200).json(workspace);
      } else {
        res.status(404).json({ message: "Workspace not found" });
      }
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);

// PUT /:workspaceId - Update a workspace
router.put(
  "/:workspaceId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { workspace_name, image } = req.body;
      const userId = (req as any).userId;

      const updatedWorkspace = await WorkspaceService.updateWorkspace(
        userId,
        workspaceId,
        workspace_name,
        image
      );

      if (!updatedWorkspace) {
        throw new BadRequestError("Workspace not found");
      }

      res.status(200).json(updatedWorkspace);
    } catch (error) {
      console.log(error);
      if ((error as Error).message === "Workspace not found") {
        next({ status: 404, message: "Workspace not found" });
      } else {
        next(error as Error);
      }
    }
  },
  // DELETE /:workspaceId - Delete a workspace
router.delete(
  "/:workspaceId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as any).userId;

      // Check if the workspace has any associated bounties
      const hasBounties = await WorkspaceService.hasBounties(workspaceId);

      if (hasBounties) {
        // If there are associated bounties, check if any of them have a status other than 'closed'
        const areBountiesOpen = await WorkspaceService.areBountiesOpen(workspaceId);

        if (areBountiesOpen) {
          // If any of the associated bounties are not closed, prevent workspace deletion
          return res.status(403).json({ message: "Cannot delete workspace with active bounties" });
        }

        // Delete the workspace and associated closed bounties
        const deletedWorkspace = await WorkspaceService.deleteWorkspace(
          workspaceId,
          userId
        );

        if (!deletedWorkspace) {
          throw new BadRequestError("Workspace not found");
        }

        res.status(200).json({ message: "Workspace deleted successfully" });
      }
    } catch (error) {
      console.log(error);
      if ((error as Error).message === "Workspace not found") {
        next({ status: 404, message: "Workspace not found" });
      } else {
        next(error as Error);
      }
    }
  }
)
);


// POST /invite/:workspaceId/:email - Send invitation to join workspace
router.post(
  "/invite/:workspaceId/:email",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, email } = req.params;
      const userId = (req as any).userId;

      // Assuming the role and department are passed as JSON in the request body
      const { role, department } = req.body;

      if (!role || !department) {
        return res.status(400).json({ message: "Role and department are required." });
      }
  // Check if the user sending the invite is the owner of the workspace
  const ownerRole = await WorkspaceService.getUserTeamRole(workspaceId, userId);
  if (ownerRole !== "owner") {
    return res.status(403).json({ message: "Only the owner can send invitations to the workspace." });
  }


      // Create an object with the user data to be embedded in the invitation link
      const userData = JSON.stringify({ email, role, department });

      // Convert the user data to base64 and add it to the invitation link
      const encodedUserData = Buffer.from(userData).toString("base64");
      const invitationLink = `http://localhost:6000/workspaces/accept-invite/${workspaceId}/${encodedUserData}`;

      // Send the invitation email
      await sendMail(email, invitationLink);

      res.status(200).json({ message: "Invite has been successfully sent." });
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
),

// GET /accept-invite/:workspaceId/:encodedUserData - Accept the invitation and join workspace
router.get(
  "/accept-invite/:workspaceId/:encodedUserData",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, encodedUserData } = req.params;

      // Decode the user data from base64
      const decodedUserData = Buffer.from(encodedUserData, "base64").toString();
      const { email, role, department } = JSON.parse(decodedUserData);

  
      // Perform necessary checks on the invitation link and user data, e.g., validate workspaceId, email, etc.
      // Here you can also check if the user is allowed to join based on their role and department
       // Check if the user accepting the invitation is the same as the one specified in the invitation email
 
    
      // Add the user to the workspace with their role and department
      await WorkspaceService.addUserToWorkspace(workspaceId, email, role, department, req);

      res.status(200).json({ message: "You have joined the team successfully." });
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);

// GET /users/:workspaceId - Get all users associated with the workspace
router.get(
  "/users/:workspaceId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const users = await WorkspaceService.getUsersByWorkspaceId(workspaceId);

      if (users && users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(404).json({ message: "Users not found for the team" });
      }
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);

// DELETE /users/:workspaceId/:userId - Delete a user from the team associated with a workspace
router.delete(
  "/users/:workspaceId/:userId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, userId } = req.params;
      const ownerId = (req as any).userId;

      // Check if the user trying to delete another user is the owner of the workspace
      const ownerRole = await WorkspaceService.getUserTeamRole(workspaceId, ownerId);

      if (ownerRole !== "owner") {
        return res.status(403).json({ message: "Only the owner can delete users from the team." });
      }

      // Delete the user from the team
      const deletedUser = await WorkspaceService.deleteUserFromTeam(workspaceId, userId);

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found in team." });
      }

      res.status(200).json({ message: "User deleted successfully from the team." });
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);
// DELETE /users/:workspaceId - Delete all users from the team associated with a workspace
router.delete(
  "/users/:workspaceId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as any).userId;

      // Check if the user trying to delete all users is the owner of the team
      const ownerRole = await WorkspaceService.getUserTeamRole(workspaceId, userId);

      if (ownerRole !== "owner") {
        return res.status(403).json({ message: "Only the owner can delete all users from the team." });
      }

      // Delete all users from the team
      const deletedUsers = await WorkspaceService.deleteAllUsersFromTeam(workspaceId);

      res.status(200).json({ message: "All users deleted successfully from the team." });
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);
// PUT /users/:workspaceId/:userId - Update user information on the team table
router.put(
  "/users/:workspaceId/:userId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, userId } = req.params;
      const ownerId = (req as any).userId;

      // Check if the user trying to update user information is the owner of the workspace
      const ownerRole = await WorkspaceService.getUserTeamRole(workspaceId, ownerId);

      if (ownerRole !== "owner") {
        return res.status(403).json({ message: "Only the owner can update user information in the team." });
      }

      // Update the user information on the team table
      const { role, department } = req.body;
      const updatedUser = await WorkspaceService.updateUserInformationOnTeam(
        workspaceId,
        userId,
        role,
        department
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      next(error as Error);
    }
  }
);

export default router;