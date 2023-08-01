import { Router } from "express";
import { authRouter } from "./auth/auth.router";
import { userRouter } from "./user/user.router";
import workspaceRouter from "./workspace/workspace.router";
import bountyRouter from "./bounty/bounty.router";
import kenbanBoardRouter from "./KenbanBoard/kenbanboard.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/workspaces", workspaceRouter);
router.use("/bounties", bountyRouter);
router.use("/kenbanboard", kenbanBoardRouter);

export default router;
