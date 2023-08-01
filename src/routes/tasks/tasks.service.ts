import { KenbanBoard, PrismaClient, Tasks, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

interface ErrorResponse {
  error: string;
  statusCode?: number;
  userId?: string;
}

enum Status {
  todo = "todo",
  INPROGRESS = "in progress",
  DONE = "done",
}

class TaskService {
  static async createTask(
    userId: string,
    title: string,
    description: string,
    attachments: any,
    due_date: Date,
    comments: string,
    KenbanId: string
  ): Promise<Tasks | ErrorResponse> {
    if (!title) {
      throw new Error("You need to provide a title for your task");
    }

    const kenbanTask = await prisma.tasks.create({
      data: {
        title,
        description,
        due_date,
        userId,
        attachments,
        comments,
        KenbanId,
      },
      include: {
        Assignees: true,
        createdByUser: true,
        KenbanBoard: true,
      },
    });

    return kenbanTask;
  }

  static async getAllTasks(): Promise<(Tasks | ErrorResponse)[]> {
    try {
      const tasks = await prisma.tasks.findMany();

      return tasks;
    } catch (error) {
      console.error(error);
      return [{ error: "An error occurred while retrieving all tasks." }];
    }
  }

  static async getTodoTasks(): Promise<(Tasks | ErrorResponse)[]> {
    try {
      const todos = await prisma.tasks.findMany({
        where: {
          status: "todo",
        },
        include: {
          KenbanBoard: true,
          Assignees: true,
          createdByUser: true,
        },
      });

      return todos;
    } catch (error) {
      console.error(error);

      return [{ error: "An error occurred while retrieving all todos." }];
    }
  }

  static async getTaskInProgress(): Promise<(Tasks | ErrorResponse)[]> {
    try {
      const inProgress = await prisma.tasks.findMany({
        where: {
          status: "inProgress",
        },
        include: {
          KenbanBoard: true,
          Assignees: true,
          createdByUser: true,
        },
      });

      return inProgress;
    } catch (error) {
      console.error(error);

      return [
        { error: "An error occurred while retrieving all tasks in progress." },
      ];
    }
  }

  static async getDoneTasks(): Promise<(Tasks | ErrorResponse)[]> {
    try {
      const doneTasks = await prisma.tasks.findMany({
        where: {
          status: "Done",
        },
        include: {
          KenbanBoard: true,
          Assignees: true,
          createdByUser: true,
        },
      });

      return doneTasks;
    } catch (error) {
      console.error(error);

      return [{ error: "An error occurred while retrieving all done tasks." }];
    }
  }

  static async getTaskById(
    taskId: string
  ): Promise<Tasks | ErrorResponse | null> {
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          id: taskId,
        },
        include: {
          KenbanBoard: true,
          Assignees: true,
          createdByUser: true,
        },
      });

      return task;
    } catch (error) {
      console.error(error);

      return { error: "An error occurred while retrieving the bounty." };
    }
  }

  static async updateTask(
    userId: string,
    taskId: string,
    updateObject: Partial<Tasks>
  ): Promise<Tasks | null | ErrorResponse> {
    try {
      const task = await prisma.tasks.findFirst({
        where: {
          id: taskId,
          createdByUser: {
            id: userId,
          },
        },
      });

      if (!task) {
        return null;
      }

      const updatedTask = await prisma.tasks.update({
        where: {
          id: taskId,
        },
        data: updateObject,
        include: {
          createdByUser: true,
          Assignees: true,
        },
      });

      return updatedTask;
    } catch (error) {
      console.error(error);

      return { error: "An error occurred while updating the bounty." };
    }
  }

  static async addAssignees(
    taskId: string,
    userId: string
  ): Promise<Tasks | ErrorResponse> {
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          id: taskId,
        },
        include: {
          createdByUser: true,
          Assignees: true,
        },
      });

      if (!task) {
        return { error: "Bounty not found.", statusCode: 404 };
      }

      const assignee = await prisma.tasks.findUnique({
        where: {
          id: userId,
        },
      });

      if (!assignee) {
        return { error: "User not found.", statusCode: 404 };
      }

      const updatedTask = await prisma.tasks.update({
        where: {
          id: taskId,
        },
        data: {
          Assignees: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          createdByUser: true,
          Assignees: true,
        },
      });

      return updatedTask;
    } catch (error) {
      console.error(error);

      return {
        error: "An error occurred while adding the participant to the bounty.",
        statusCode: 500,
      };
    }
  }

  static async deleteTask(
    userId: string,
    bountyId: string
  ): Promise<Tasks | null | ErrorResponse> {
    try {
      const task = await prisma.tasks.findFirst({
        where: {
          id: bountyId,
          userId,
        },
        include: {
          createdByUser: true,
          Assignees: true,
        },
      });

      if (!task) {
        return null;
      }

      if (task.status !== TaskStatus.Done) {
        return null;
      }

      await prisma.bounty.delete({
        where: {
          id: bountyId,
        },
      });

      return task;
    } catch (error) {
      console.error(error);

      return { error: "An error occurred while deleting this task." };
    }
  }
}

export default TaskService;
