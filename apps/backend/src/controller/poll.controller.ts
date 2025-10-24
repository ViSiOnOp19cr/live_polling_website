import type { Request, Response } from "express";
import prisma from "../db";
import type { extendedRequest } from "../types.ts";

// GET /api/v1/polls/:pollId/results - Get poll results with analytics
export const getPollResults = async (req: Request, res: Response) => {
    try {
        const { pollId } = req.params;

        // Get poll with all responses
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                room: {
                    select: {
                        id: true,
                        title: true,
                        roomCode: true,
                        teacher: {
                            select: {
                                id: true,
                                username: true,
                                role: true
                            }
                        }
                    }
                },
                responses: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                role: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!poll) {
            return res.status(404).json({
                success: false,
                error: 'Poll not found'
            });
        }

        // Group responses by option for detailed view
        const responsesByOption: { [key: string]: any[] } = {};
        poll.options.forEach(option => {
            responsesByOption[option] = poll.responses
                .filter(response => response.option === option)
                .map(response => ({
                    id: response.id,
                    user: response.user,
                    createdAt: response.createdAt
                }));
        });

        return res.status(200).json({
            success: true,
            poll: {
                id: poll.id,
                question: poll.question,
                options: poll.options,
                correctOption: poll.correctOption,
                isActive: poll.isActive,
                createdAt: poll.createdAt,
                updatedAt: poll.updatedAt
            },
            room: poll.room,
            results: responsesByOption
        });

    } catch (error) {
        console.error('Error fetching poll results:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch poll results'
        });
    }
};

// GET /api/v1/polls/:pollId/responses - Get all individual responses (for detailed analysis)
export const getPollResponses = async (req: Request, res: Response) => {
    try {
        const { pollId } = req.params;

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            select: {
                id: true,
                question: true,
                options: true,
                correctOption: true,
                isActive: true,
                room: {
                    select: {
                        id: true,
                        title: true,
                        roomCode: true
                    }
                }
            }
        });

        if (!poll) {
            return res.status(404).json({
                success: false,
                error: 'Poll not found'
            });
        }

        const responses = await prisma.pollResponse.findMany({
            where: { pollId: pollId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return res.status(200).json({
            success: true,
            poll: {
                id: poll.id,
                question: poll.question,
                options: poll.options,
                correctOption: poll.correctOption,
                isActive: poll.isActive
            },
            room: poll.room,
            responses: responses.map(response => ({
                id: response.id,
                user: response.user,
                option: response.option,
                isCorrect: response.option === poll.correctOption,
                createdAt: response.createdAt
            })),
            totalResponses: responses.length
        });

    } catch (error) {
        console.error('Error fetching poll responses:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch poll responses'
        });
    }
};

// GET /api/v1/polls/user/attended - Get all polls user has attended/responded to
export const getUserAttendedPolls = async (req: extendedRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Get all polls the user has responded to
        const userResponses = await prisma.pollResponse.findMany({
            where: { userId: userId },
            include: {
                poll: {
                    include: {
                        room: {
                            select: {
                                id: true,
                                title: true,
                                roomCode: true,
                                teacher: {
                                    select: {
                                        id: true,
                                        username: true,
                                        role: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get all rooms the user has participated in (even if they didn't respond to polls)
        const userRooms = await prisma.roomParticipant.findMany({
            where: { userId: userId },
            include: {
                room: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                username: true,
                                role: true
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
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        // Process the data to show user's participation
        const attendedPolls = userResponses.map(response => ({
            pollId: response.poll.id,
            question: response.poll.question,
            options: response.poll.options,
            correctOption: response.poll.correctOption,
            isActive: response.poll.isActive,
            userResponse: response.option,
            isCorrect: response.option === response.poll.correctOption,
            respondedAt: response.createdAt,
            pollCreatedAt: response.poll.createdAt,
            room: {
                id: response.poll.room.id,
                title: response.poll.room.title,
                roomCode: response.poll.room.roomCode,
                teacher: response.poll.room.teacher
            }
        }));

        // Get room participation summary
        const roomParticipation = userRooms.map(participation => ({
            roomId: participation.room.id,
            roomTitle: participation.room.title,
            roomCode: participation.room.roomCode,
            teacher: participation.room.teacher,
            joinedAt: participation.joinedAt,
            totalPolls: participation.room.polls.length,
            pollsResponded: userResponses.filter(r => r.poll.roomId === participation.room.id).length,
            polls: participation.room.polls.map(poll => ({
                id: poll.id,
                question: poll.question,
                options: poll.options,
                correctOption: poll.correctOption,
                isActive: poll.isActive,
                createdAt: poll.createdAt,
                totalResponses: poll._count.responses,
                userResponded: userResponses.some(r => r.pollId === poll.id),
                userResponse: userResponses.find(r => r.pollId === poll.id)?.option || null
            }))
        }));

        return res.status(200).json({
            success: true,
            user: {
                id: req.user?.id,
                username: req.user?.username,
                role: req.user?.role
            },
            attendedPolls: {
                total: attendedPolls.length,
                polls: attendedPolls
            },
            roomParticipation: {
                totalRooms: roomParticipation.length,
                rooms: roomParticipation
            },
            statistics: {
                totalPollsResponded: attendedPolls.length,
                correctAnswers: attendedPolls.filter(p => p.isCorrect).length,
                accuracyRate: attendedPolls.length > 0 
                    ? Math.round((attendedPolls.filter(p => p.isCorrect).length / attendedPolls.length) * 100)
                    : 0,
                totalRoomsJoined: roomParticipation.length
            }
        });

    } catch (error) {
        console.error('Error fetching user attended polls:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user attended polls'
        });
    }
};
