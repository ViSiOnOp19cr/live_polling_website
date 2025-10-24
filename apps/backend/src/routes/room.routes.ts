import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { getRoom, getRoomPolls } from "../controller/room.controller.ts";

export const roomRouter = express.Router();

//Get room details with polls and participants
roomRouter.get("/:roomId", authMiddleware, getRoom);

//Get all polls in a room
roomRouter.get("/:roomId/polls", authMiddleware, getRoomPolls);