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

export default router;
