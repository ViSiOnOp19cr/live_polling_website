import { Socket, Server } from 'socket.io';
import prisma from '../db.ts'

export class Poll {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    async createRoom(socket: Socket, data: { title: string; teacherId: string; roomCode: number }) {
        try {
            const { title, teacherId, roomCode } = data;
            if (!title || !teacherId || !roomCode) {
                console.error('Missing required fields:', { title, teacherId, roomCode });
                socket.emit('room-created', {
                    success: false,
                    error: 'Missing required fields: title, teacherId, or roomCode'
                });
                return;
            }
            const room = await prisma.room.create({
                data: {
                    roomCode,
                    title,
                    teacherId,
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

            socket.join(roomCode.toString());

            socket.emit('room-created', {
                success: true,
                room: {
                    id: room.id,
                    roomCode: room.roomCode,
                    title: room.title,
                    description: room.description,
                    teacher: room.teacher
                }
            });

            console.log(`Room created: ${roomCode} by teacher: ${teacherId}`);

        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('room-created', {
                success: false,
                error: 'Failed to create room'
            });
        }
    }

    async joinRoom(socket: Socket, data: { roomCode: number; userId: string }) {
        try {
            const { roomCode, userId } = data;

            const room = await prisma.room.findUnique({
                where: { roomCode },
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
                    }
                }
            });

            if (!room) {
                socket.emit('room-joined', {
                    success: false,
                    error: 'Room not found'
                });
                return;
            }

            if (!room.isActive) {
                socket.emit('room-joined', {
                    success: false,
                    error: 'Room is not active'
                });
                return;
            }

            // Check if user is already in the room
            const existingParticipant = await prisma.roomParticipant.findUnique({
                where: {
                    roomId_userId: {
                        roomId: room.id,
                        userId: userId
                    }
                }
            });

            if (!existingParticipant) {
                // Add user to room participants
                await prisma.roomParticipant.create({
                    data: {
                        roomId: room.id,
                        userId: userId
                    }
                });
            }

            // Join the socket room
            socket.join(roomCode.toString());

            // Get updated participant list
            const updatedRoom = await prisma.room.findUnique({
                where: { id: room.id },
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
                    }
                }
            });

            // Emit success response to the joining user
            socket.emit('room-joined', {
                success: true,
                room: {
                    id: room.id,
                    roomCode: room.roomCode,
                    title: room.title,
                    description: room.description,
                    teacher: room.teacher,
                    participants: updatedRoom?.participants || []
                }
            });

            // Notify all other users in the room about the new participant
            socket.to(roomCode.toString()).emit('participant-joined', {
                roomCode,
                participant: updatedRoom?.participants.find(p => p.userId === userId)?.user
            });

            console.log(`User ${userId} joined room: ${roomCode}`);

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('room-joined', {
                success: false,
                error: 'Failed to join room'
            });
        }
    }
    async postQuestion(socket: Socket, data: { question: string; options: string[]; correctOption: string; roomId: string; roomCode: number }) {
        try {
            const { question, options, correctOption, roomId, roomCode } = data;

            if (!question || !options || !correctOption || !roomId || !roomCode) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Missing required fields: question, options, correctOption, roomId, or roomCode'
                });
                return;
            }

            if (!Array.isArray(options) || options.length < 2) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Options must be an array with at least 2 items'
                });
                return;
            }

            if (!options.includes(correctOption)) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Correct option must be one of the provided options'
                });
                return;
            }

            const room = await prisma.room.findUnique({
                where: { id: roomId },
                select: { id: true, isActive: true, roomCode: true }
            });

            if (!room) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Room not found'
                });
                return;
            }

            if (!room.isActive) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Room is not active'
                });
                return;
            }

            if (room.roomCode !== roomCode) {
                socket.emit('question-posted', {
                    success: false,
                    error: 'Invalid room code'
                });
                return;
            }

            const questionData = await prisma.poll.create({
                data: {
                    question,
                    options: options,
                    correctOption,
                    roomId,
                }
            });

            socket.emit('question-posted', {
                success: true,
                question: {
                    id: questionData.id,
                    question: questionData.question,
                    options: questionData.options,
                    correctOption: questionData.correctOption
                }
            });

            socket.to(roomCode.toString()).emit('question-posted', {
                success: true,
                question: {
                    id: questionData.id,
                    question: questionData.question,
                    options: questionData.options,
                    correctOption: questionData.correctOption
                }
            });

            console.log(`Question posted in room ${roomCode}: ${question}`);

        } catch (error) {
            console.error('Error posting question:', error);
            socket.emit('question-posted', {
                success: false,
                error: 'Failed to post question'
            });
        }
    }

    async pollResponse(socket: Socket, data: { roomCode: number; pollid: string, userId: string; option: string }) {
        const { roomCode, pollid, userId, option } = data;
        try {
            const room = await prisma.room.findUnique({
                where: { roomCode },
                select: { id: true, isActive: true, roomCode: true }
            });
            if (!room) {
                socket.emit('poll-response', {
                    success: false,
                    error: 'Room not found'
                });
                return;
            }
            if (!room.isActive) {
                socket.emit('poll-response', {
                    success: false,
                    error: 'Room is not active'
                });
                return;
            }
            if (room.roomCode !== roomCode) {
                socket.emit('poll-response', {
                    success: false,
                    error: 'Invalid room code'
                });
                return;
            }
            const poll = await prisma.poll.findUnique({
                where: { id: pollid },
                select: { id: true, question: true, options: true, correctOption: true }
            });
            if (!poll) {
                socket.emit('poll-response', {
                    success: false,
                    error: 'Poll not found'
                });
                return;
            }
            const response = await prisma.pollResponse.create({
                data: {
                    pollId: pollid,
                    userId,
                    option
                }
            });
            socket.emit('poll-response', {
                success: true,
                response: {
                    id: response.id,
                    pollId: response.pollId,
                    userId: response.userId,
                    option: response.option
                }
            });
        } catch (error) {
            console.error('Error posting question:', error);
            socket.emit('poll-response', {
                success: false,
                error: 'Failed to post question'
            });
        }

    }
    async leaveRoom(socket: Socket, data: { roomCode: number; userId: string }) {
        try {
            const { roomCode, userId } = data;

            // Find the room
            const room = await prisma.room.findUnique({
                where: { roomCode: roomCode }
            });

            if (!room) {
                return;
            }

            // Remove user from room participants
            await prisma.roomParticipant.deleteMany({
                where: {
                    roomId: room.id,
                    userId: userId
                }
            });

            // Leave the socket room
            socket.leave(roomCode.toString());

            // Notify other users in the room
            socket.to(roomCode.toString()).emit('participant-left', {
                roomCode,
                userId
            });

            console.log(`User ${userId} left room: ${roomCode}`);

        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    private generateRoomCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
