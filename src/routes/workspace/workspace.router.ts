import { Router, Request, Response, NextFunction } from "express";
import authenticateToken from "../../middleware/isAuth";
import WorkspaceService from "./workspace.service";
import upload from "../../middleware/cloudinary";

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
   const files = req.files as Express.Multer.File[];
    const image = files[0];
    try {
      const { workspace_name } = req.body;
      const imageUrl = image.path;
      const userId = (req as any).userId;

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
          return res.status(403).json({ message: "Cannot delete workspace with open bounties" });
        }
      }

      // Delete the workspace and associated closed bounties
      const deletedWorkspace = await WorkspaceService.deleteWorkspace(workspaceId, userId);

      if (!deletedWorkspace) {
        throw new BadRequestError("Workspace not found");
      }

      res.status(200).json({ message: "Workspace deleted successfully" });
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


export default router;
