import { Router, Request, Response, NextFunction } from "express";
import authenticateToken from "../../middleware/isAuth";
import TaskService from "./tasks.service";
import { kenbanUpload } from "../../middleware/cloudinary";

const taskRouter = Router();

taskRouter.post(
  "/",
  authenticateToken,
  kenbanUpload.any(),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { title, description, due_date, KenbanId } = req.body;

      const userId = (req as any).userId;

      if (!title || !description || !due_date || !KenbanId) {
        throw new Error("All fields must be provided");
      }

      let attachments: any = null;

      if (files?.length > 0) {
        const file = files[0];
        attachments = file.path;
      }

      const task = await TaskService.createTask(
        userId,
        title,
        description,
        due_date,
        KenbanId,
        attachments
      );

      return res.status(201).json(task);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
);

taskRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const tasks = await TaskService.getAllTasks();
    res.status(201).json(tasks);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
});

taskRouter.get(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const taskId = req.params.id;
      const task = await TaskService.getTaskById(taskId);

      if (!task) {
        res.status(404).json("Task not found");
      }

      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
);

taskRouter.post(
  "/join/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const taskId = req.params.id;
      const userId = (req as any).userId;
      const { assigned } = req.body;

      const task = await TaskService.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }

      const isAssigned = await TaskService.isMemberAssigned(taskId, assigned);

      if (isAssigned) {
        return res
          .status(400)
          .json({ message: "You are already assigned to this task." });
      }
      const user_assigned = await TaskService.addAssignees(taskId, assigned);

      res.status(200).json({
        message: "Added participant Successfully",
        assigned: user_assigned,
      });
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
);

taskRouter.put(
  "/:id",
  authenticateToken,
  kenbanUpload.any(),
  async (req: Request, res: Response) => {
    const taskId: string = req.params.id;
    try {
      const task = req.body;
      const userId = (req as any).userId;

      const files = req.files as Express.Multer.File[];
      let attachments = null;

      const isTask = await TaskService.getTaskById(taskId);
      if (!isTask) {
        return res.status(404).json("Task does not exist");
      }

      if (files.length > 0) {
        const file = files[0];
        attachments = file.path;
      }

      const updatedTask = await TaskService.updateTask(userId, taskId, task);
      return res.status(201).json(updatedTask);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
);

taskRouter.get(
  "/query/todo",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const todoTasks = await TaskService.getTodoTasks();

      return res.status(201).json(todoTasks);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
);

export default taskRouter;
