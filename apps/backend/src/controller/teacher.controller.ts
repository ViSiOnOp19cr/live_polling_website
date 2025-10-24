import type { Request, Response } from "express";
import prisma from "../db";
import type { extendedRequest } from "../types";

// POST /api/v1/teacher/rooms - Create a new room
export const createRoom = async (req: extendedRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        const teacherId = req.userId;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Room title is required'
            });
        }

        // Generate unique room code
        let roomCode: number;
        let isUnique = false;
        
        while (!isUnique) {
            roomCode = Math.floor(100000 + Math.random() * 900000); // 6-digit number
            const existingRoom = await prisma.room.findUnique({
                where: { roomCode }
            });
            if (!existingRoom) {
                isUnique = true;
            }
        }

        const room = await prisma.room.create({
            data: {
                roomCode: roomCode!,
                title,
                description: description || null,
                teacherId: teacherId!
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            room: {
                id: room.id,
                roomCode: room.roomCode,
                title: room.title,
                description: room.description,
                isActive: room.isActive,
                createdAt: room.createdAt,
                teacher: room.teacher
            }
        });

    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create room'
        });
    }
};

// GET /api/v1/teacher/rooms - Get all rooms created by the teacher
export const getTeacherRooms = async (req: extendedRequest, res: Response) => {
    try {
        const teacherId = req.userId;

        const rooms = await prisma.room.findMany({
            where: { teacherId: teacherId! },
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
                },
                _count: {
                    select: {
                        participants: true,
                        polls: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const roomsWithStats = rooms.map(room => ({
            id: room.id,
            roomCode: room.roomCode,
            title: room.title,
            description: room.description,
            isActive: room.isActive,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            teacher: room.teacher,
            totalParticipants: room._count.participants,
            totalPolls: room._count.polls,
            activePolls: room.polls.filter(poll => poll.isActive).length,
            polls: room.polls,
            participants: room.participants.map(p => ({
                id: p.id,
                user: p.user,
                joinedAt: p.joinedAt
            }))
        }));

        return res.status(200).json({
            success: true,
            rooms: roomsWithStats,
            totalRooms: rooms.length
        });

    } catch (error) {
        console.error('Error fetching teacher rooms:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch teacher rooms'
        });
    }
};

// PUT /api/v1/teacher/rooms/:roomId - Update room settings
export const updateRoom = async (req: extendedRequest, res: Response) => {
    try {
        const { roomId } = req.params;
        const { title, description, isActive } = req.body;
        const teacherId = req.userId;

        // Check if room exists and belongs to the teacher
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: roomId,
                teacherId: teacherId!
            }
        });

        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                error: 'Room not found or you do not have permission to update it'
            });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: updateData,
            include: {
                teacher: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            room: {
                id: updatedRoom.id,
                roomCode: updatedRoom.roomCode,
                title: updatedRoom.title,
                description: updatedRoom.description,
                isActive: updatedRoom.isActive,
                updatedAt: updatedRoom.updatedAt,
                teacher: updatedRoom.teacher
            }
        });

    } catch (error) {
        console.error('Error updating room:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update room'
        });
    }
};

// DELETE /api/v1/teacher/rooms/:roomId - Delete a room
export const deleteRoom = async (req: extendedRequest, res: Response) => {
    try {
        const { roomId } = req.params;
        const teacherId = req.userId;

        // Check if room exists and belongs to the teacher
        const existingRoom = await prisma.room.findFirst({
            where: {
                id: roomId,
                teacherId: teacherId!
            }
        });

        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                error: 'Room not found or you do not have permission to delete it'
            });
        }

        // Delete room (cascade will handle related data)
        await prisma.room.delete({
            where: { id: roomId }
        });

        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting room:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete room'
        });
    }
};

// POST /api/v1/teacher/polls - Create a new poll
export const createPoll = async (req: extendedRequest, res: Response) => {
    try {
        const { question, options, correctOption, roomId } = req.body;
        const teacherId = req.userId;

        if (!question || !options || !correctOption || !roomId) {
            return res.status(400).json({
                success: false,
                error: 'Question, options, correctOption, and roomId are required'
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Options must be an array with at least 2 items'
            });
        }

        if (!options.includes(correctOption)) {
            return res.status(400).json({
                success: false,
                error: 'Correct option must be one of the provided options'
            });
        }

        // Check if room exists and belongs to the teacher
        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
                teacherId: teacherId!
            }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found or you do not have permission to create polls in it'
            });
        }

        const poll = await prisma.poll.create({
            data: {
                question,
                options,
                correctOption,
                roomId
            },
            include: {
                room: {
                    select: {
                        id: true,
                        roomCode: true,
                        title: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            poll: {
                id: poll.id,
                question: poll.question,
                options: poll.options,
                correctOption: poll.correctOption,
                isActive: poll.isActive,
                createdAt: poll.createdAt,
                room: poll.room
            }
        });

    } catch (error) {
        console.error('Error creating poll:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create poll'
        });
    }
};

// PUT /api/v1/teacher/polls/:pollId - Update a poll
export const updatePoll = async (req: extendedRequest, res: Response) => {
    try {
        const { pollId } = req.params;
        const { question, options, correctOption, isActive } = req.body;
        const teacherId = req.userId;

        // Check if poll exists and belongs to teacher's room
        const existingPoll = await prisma.poll.findFirst({
            where: {
                id: pollId,
                room: {
                    teacherId: teacherId!
                }
            },
            include: {
                room: {
                    select: {
                        id: true,
                        teacherId: true
                    }
                }
            }
        });

        if (!existingPoll) {
            return res.status(404).json({
                success: false,
                error: 'Poll not found or you do not have permission to update it'
            });
        }

        const updateData: any = {};
        if (question !== undefined) updateData.question = question;
        if (options !== undefined) {
            if (!Array.isArray(options) || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Options must be an array with at least 2 items'
                });
            }
            updateData.options = options;
        }
        if (correctOption !== undefined) {
            const finalOptions = options || existingPoll.options;
            if (!finalOptions.includes(correctOption)) {
                return res.status(400).json({
                    success: false,
                    error: 'Correct option must be one of the provided options'
                });
            }
            updateData.correctOption = correctOption;
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedPoll = await prisma.poll.update({
            where: { id: pollId },
            data: updateData,
            include: {
                room: {
                    select: {
                        id: true,
                        roomCode: true,
                        title: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            poll: {
                id: updatedPoll.id,
                question: updatedPoll.question,
                options: updatedPoll.options,
                correctOption: updatedPoll.correctOption,
                isActive: updatedPoll.isActive,
                updatedAt: updatedPoll.updatedAt,
                room: updatedPoll.room
            }
        });

    } catch (error) {
        console.error('Error updating poll:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update poll'
        });
    }
};

// DELETE /api/v1/teacher/polls/:pollId - Delete a poll
export const deletePoll = async (req: extendedRequest, res: Response) => {
    try {
        const { pollId } = req.params;
        const teacherId = req.userId;

        // Check if poll exists and belongs to teacher's room
        const existingPoll = await prisma.poll.findFirst({
            where: {
                id: pollId,
                room: {
                    teacherId: teacherId!
                }
            }
        });

        if (!existingPoll) {
            return res.status(404).json({
                success: false,
                error: 'Poll not found or you do not have permission to delete it'
            });
        }

        // Delete poll (cascade will handle related responses)
        await prisma.poll.delete({
            where: { id: pollId }
        });

        return res.status(200).json({
            success: true,
            message: 'Poll deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting poll:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete poll'
        });
    }
};

// GET /api/v1/teacher/analytics - Get teacher analytics
export const getTeacherAnalytics = async (req: extendedRequest, res: Response) => {
    try {
        const teacherId = req.userId;

        // Get teacher's rooms with stats
        const rooms = await prisma.room.findMany({
            where: { teacherId: teacherId! },
            include: {
                polls: {
                    include: {
                        responses: true,
                        _count: {
                            select: {
                                responses: true
                            }
                        }
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        polls: true,
                        participants: true
                    }
                }
            }
        });

        // Calculate analytics
        const totalRooms = rooms.length;
        const totalPolls = rooms.reduce((sum, room) => sum + room._count.polls, 0);
        const totalParticipants = rooms.reduce((sum, room) => sum + room._count.participants, 0);
        const totalResponses = rooms.reduce((sum, room) => 
            sum + room.polls.reduce((pollSum, poll) => pollSum + poll._count.responses, 0), 0
        );

        // Get active rooms and polls
        const activeRooms = rooms.filter(room => room.isActive).length;
        const activePolls = rooms.reduce((sum, room) => 
            sum + room.polls.filter(poll => poll.isActive).length, 0
        );

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRooms = rooms.filter(room => room.createdAt >= sevenDaysAgo).length;
        const recentPolls = rooms.reduce((sum, room) => 
            sum + room.polls.filter(poll => poll.createdAt >= sevenDaysAgo).length, 0
        );

        // Get room-wise statistics
        const roomStats = rooms.map(room => ({
            roomId: room.id,
            roomCode: room.roomCode,
            title: room.title,
            isActive: room.isActive,
            totalPolls: room._count.polls,
            totalParticipants: room._count.participants,
            activePolls: room.polls.filter(poll => poll.isActive).length,
            totalResponses: room.polls.reduce((sum, poll) => sum + poll._count.responses, 0),
            createdAt: room.createdAt
        }));

        return res.status(200).json({
            success: true,
            analytics: {
                overview: {
                    totalRooms,
                    totalPolls,
                    totalParticipants,
                    totalResponses,
                    activeRooms,
                    activePolls
                },
                recentActivity: {
                    roomsCreatedLast7Days: recentRooms,
                    pollsCreatedLast7Days: recentPolls
                },
                roomStats
            }
        });

    } catch (error) {
        console.error('Error fetching teacher analytics:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch teacher analytics'
        });
    }
};
