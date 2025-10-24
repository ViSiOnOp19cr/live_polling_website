import type { Request, Response } from "express";
import prisma from "../db";

// GET /api/v1/rooms/:roomId - Get room details with polls and participants
export const getRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                role: true
                            }
                        }
                    }
                },
                polls: {
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        correctOption: true,
                        isActive: true,
                        createdAt: true,
                        _count: {
                            select: {
                                responses: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        return res.status(200).json({
            success: true,
            room: {
                id: room.id,
                roomCode: room.roomCode,
                title: room.title,
                description: room.description,
                isActive: room.isActive,
                createdAt: room.createdAt,
                teacher: room.teacher,
                participants: room.participants.map(p => ({
                    id: p.id,
                    user: p.user,
                    joinedAt: p.joinedAt
                })),
                polls: room.polls,
                totalPolls: room.polls.length,
                totalParticipants: room.participants.length
            }
        });

    } catch (error) {
        console.error('Error fetching room:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch room details'
        });
    }
};

// GET /api/v1/rooms/:roomId/polls - Get all polls in a room
export const getRoomPolls = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;

        // First check if room exists
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true, title: true, isActive: true }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const polls = await prisma.poll.findMany({
            where: { roomId: roomId },
            select: {
                id: true,
                question: true,
                options: true,
                correctOption: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        responses: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            room: {
                id: room.id,
                title: room.title,
                isActive: room.isActive
            },
            polls: polls,
            totalPolls: polls.length
        });

    } catch (error) {
        console.error('Error fetching room polls:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch room polls'
        });
    }
};