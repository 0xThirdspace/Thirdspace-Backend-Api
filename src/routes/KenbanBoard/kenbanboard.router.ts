import { Router, Request, Response, NextFunction } from "express";
import authenticateToken from "../../middleware/isAuth";
import KenbanBoardService from "./kenbanboard.service";

const router = Router();

router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, workspaceId } = req.body;
      const userId = (req as any).userId;

      if (!name || !workspaceId) {
        throw new Error("All fields must be provided");
      }

      const board = await KenbanBoardService.createKanbanBoard(
        userId,
        workspaceId,
        name
      );
      res.status(201).json(board);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kenbanBoardId = req.params.id;

      const board = await KenbanBoardService.getKenbanBoardById(kenbanBoardId);

      if (!board) {
        return res.status(404).json({ message: "Bounty not found" });
      }

      res.status(201).json(board);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const kenbanBoardId = req.params.id;

      const board = await KenbanBoardService.getKenbanBoardById(kenbanBoardId);

      if (!board) {
        return res.status(404).json({ message: "Bounty not found" });
      }

      //check if user created board
      const createdBoard = await KenbanBoardService.getBoardCreated(userId);

      if (!createdBoard) {
        return res
          .status(404)
          .json({ message: "You do not have a created board to delete." });
      }
      if (!createdBoard.userId == userId) {
        return res
          .status(400)
          .json({ message: "You cannot delete this board." });
      }

      await KenbanBoardService.deleteBoard(userId, kenbanBoardId);
      return res.status(200).json({ message: "Delete successfully" });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
);

export default router;
