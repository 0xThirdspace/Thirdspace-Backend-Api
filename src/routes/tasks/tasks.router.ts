import { Router, Request, Response, NextFunction } from "express";
import authenticateToken from "../../middleware/isAuth";
import TaskService from "./tasks.service";

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      due_date,
      comments,
      KenbanBoard_id,
      attachments,
    } = req.body;
    const userId = (req as any).userId;

    if (
      !title ||
      !description ||
      !due_date ||
      !comments ||
      !KenbanBoard_id ||
      !attachments
    ) {
      throw new Error("All fields must be provided");
    }

    const task = await TaskService.createTask(
      userId,
      title,
      description,
      due_date,
      comments,
      KenbanBoard_id,
      attachments
    );

    res.status(201).json(task);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const tasks = await TaskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = await TaskService.getTaskById(taskId);

    if (!task) {
      res.status(404).json("Task not found");
    }

    return task;
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

export default router;
