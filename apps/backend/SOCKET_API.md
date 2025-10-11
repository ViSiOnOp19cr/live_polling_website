# Socket API Documentation

## Overview
This document describes the socket endpoints for the live pooling application where teachers can create rooms and students can join to participate in polls.

## Socket Events

### 1. Create Room
**Event:** `create-room`
**Triggered by:** Teacher
**Data Required:**
```typescript
{
  title: string;        // Room title
  description?: string; // Optional room description
  teacherId: string;    // ID of the teacher creating the room
}
```

**Response:** `room-created`
```typescript
{
  success: boolean;
  room?: {
    id: string;
    roomCode: string;    // 6-character unique code
    title: string;
    description?: string;
    teacher: {
      id: string;
      username: string;
      role: string;
    }
  };
  error?: string;
}
```

### 2. Join Room
**Event:** `join-room`
**Triggered by:** Student
**Data Required:**
```typescript
{
  roomCode: string;  // 6-character room code
  userId: string;    // ID of the user joining
}
```

**Response:** `room-joined`
```typescript
{
  success: boolean;
  room?: {
    id: string;
    roomCode: string;
    title: string;
    description?: string;
    teacher: {
      id: string;
      username: string;
      role: string;
    };
    participants: Array<{
      id: string;
      user: {
        id: string;
        username: string;
        role: string;
      };
      joinedAt: string;
    }>;
  };
  error?: string;
}
```

**Broadcast to other participants:** `participant-joined`
```typescript
{
  roomCode: string;
  participant: {
    id: string;
    username: string;
    role: string;
  };
}
```

### 3. Leave Room
**Event:** `leave-room`
**Triggered by:** Any participant
**Data Required:**
```typescript
{
  roomCode: string;  // 6-character room code
  userId: string;    // ID of the user leaving
}
```

**Broadcast to other participants:** `participant-left`
```typescript
{
  roomCode: string;
  userId: string;
}
```

## Usage Examples

### Frontend Implementation (JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3005');

// Create a room (Teacher)
socket.emit('create-room', {
  title: 'Math Quiz Session',
  description: 'Weekly math quiz for grade 10',
  teacherId: 'teacher123'
});

socket.on('room-created', (response) => {
  if (response.success) {
    console.log('Room created:', response.room.roomCode);
    // Display room code to teacher
  } else {
    console.error('Failed to create room:', response.error);
  }
});

// Join a room (Student)
socket.emit('join-room', {
  roomCode: 'ABC123',
  userId: 'student456'
});

socket.on('room-joined', (response) => {
  if (response.success) {
    console.log('Joined room:', response.room.title);
    // Display room info and participants
  } else {
    console.error('Failed to join room:', response.error);
  }
});

// Listen for new participants
socket.on('participant-joined', (data) => {
  console.log('New participant:', data.participant.username);
  // Update participant list
});

// Listen for participants leaving
socket.on('participant-left', (data) => {
  console.log('Participant left:', data.userId);
  // Update participant list
});
```

## Database Schema

The implementation uses the following Prisma models:

- **User**: Stores user information (teachers and students)
- **Room**: Stores room information with unique room codes
- **Poll**: Stores poll questions and options (for future implementation)
- **PollResponse**: Stores user responses to polls (for future implementation)
- **RoomParticipant**: Tracks which users are in which rooms

## Error Handling

All socket events include proper error handling:
- Room not found
- Room inactive
- Database connection errors
- Invalid data format

## Room Code Generation

Room codes are automatically generated as 6-character alphanumeric strings (A-Z, 0-9) to ensure uniqueness and ease of sharing.
