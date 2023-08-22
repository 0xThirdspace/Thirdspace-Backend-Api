import { Router } from "express";
import { authRouter } from "./auth/auth.router";
import { userRouter } from "./user/user.router";
import workspaceRouter from "./workspace/workspace.router";
import bountyRouter from "./bounty/bounty.router";
import kenbanBoardRouter from "./KenbanBoard/kenbanboard.router";
import taskRouter from "./tasks/tasks.router";
import chatRouter from "./chat/chat.router";
import messageRouter from "./message/message.router";
const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/workspaces", workspaceRouter);
router.use("/bounties", bountyRouter);
router.use("/kenbanboard", kenbanBoardRouter);
router.use("/tasks", taskRouter);
router.use("/chats", chatRouter);
router.use("/messages", messageRouter);


export default router;
