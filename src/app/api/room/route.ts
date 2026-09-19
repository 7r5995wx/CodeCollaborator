import { NextRequest, NextResponse } from 'next/server';

interface RoomState {
  code: string;
  title: string;
  hostUserId: string;
  hostName: string;
  approvalRequired: boolean;
  passcode?: string;
  language: string;
  files: any[];
  activeFileId: string;
  participants: any[];
  pendingQueue: any[];
  approvedUserIds: string[];
  rejectedUserIds: string[];
  lastExecution?: any;
  updatedAt: number;
}

// Global serverless memory cache for active rooms across invocations
const globalRef = globalThis as unknown as { __ROOM_STORE__?: Map<string, RoomState> };
if (!globalRef.__ROOM_STORE__) {
  globalRef.__ROOM_STORE__ = new Map<string, RoomState>();
}
const roomStore = globalRef.__ROOM_STORE__;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.toUpperCase();
  const userId = searchParams.get('userId');

  if (!code) {
    return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
  }

  const room = roomStore.get(code);
  if (!room) {
    return NextResponse.json({ exists: false }, { status: 200 });
  }

  // Determine status for requesting user
  let userStatus: 'host' | 'approved' | 'waiting' | 'rejected' = 'waiting';

  if (userId && userId === room.hostUserId) {
    userStatus = 'host';
  } else if (userId && room.approvedUserIds.includes(userId)) {
    userStatus = 'approved';
  } else if (userId && room.rejectedUserIds.includes(userId)) {
    userStatus = 'rejected';
  } else if (!room.approvalRequired) {
    userStatus = 'approved';
    if (userId && !room.approvedUserIds.includes(userId)) {
      room.approvedUserIds.push(userId);
    }
  }

  return NextResponse.json({
    exists: true,
    code: room.code,
    title: room.title,
    approvalRequired: room.approvalRequired,
    language: room.language,
    files: room.files,
    activeFileId: room.activeFileId,
    pendingQueue: room.pendingQueue,
    participants: room.participants,
    userStatus,
    lastExecution: room.lastExecution,
    updatedAt: room.updatedAt,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, userId, userName, userColor, payload } = body;

    const roomCode = code?.toUpperCase();
    if (!roomCode) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    // 1. CREATE ROOM (Host)
    if (action === 'CREATE_ROOM') {
      const existingRoom = roomStore.get(roomCode);
      const newRoom: RoomState = {
        code: roomCode,
        title: payload?.title || existingRoom?.title || 'CodeCollaborator Session',
        hostUserId: userId,
        hostName: userName,
        approvalRequired: payload?.approvalRequired ?? existingRoom?.approvalRequired ?? true,
        passcode: payload?.passcode || existingRoom?.passcode || '',
        language: payload?.language || existingRoom?.language || 'javascript',
        files: payload?.files || existingRoom?.files || [],
        activeFileId: payload?.activeFileId || existingRoom?.activeFileId || 'main_file',
        participants: [
          { id: userId, name: userName, isHost: true, color: userColor || '#3b82f6' }
        ],
        pendingQueue: existingRoom?.pendingQueue || [],
        approvedUserIds: [userId, ...(existingRoom?.approvedUserIds || [])],
        rejectedUserIds: existingRoom?.rejectedUserIds || [],
        updatedAt: Date.now(),
      };

      roomStore.set(roomCode, newRoom);
      return NextResponse.json({ success: true, room: newRoom });
    }

    let room = roomStore.get(roomCode);

    // 2. REQUEST JOIN (Guest)
    if (action === 'REQUEST_JOIN') {
      if (!room) {
        // Room shell without host assignment
        room = {
          code: roomCode,
          title: 'Collaborative Session',
          hostUserId: '', // Empty until host connects
          hostName: 'Host',
          approvalRequired: true,
          language: 'cpp',
          files: [],
          activeFileId: 'main_file',
          participants: [],
          pendingQueue: [],
          approvedUserIds: [],
          rejectedUserIds: [],
          updatedAt: Date.now(),
        };
        roomStore.set(roomCode, room);
      }

      const isAlreadyApproved = room.approvedUserIds.includes(userId);
      if (isAlreadyApproved || !room.approvalRequired) {
        if (!room.approvedUserIds.includes(userId)) room.approvedUserIds.push(userId);
        if (!room.participants.some(p => p.id === userId)) {
          room.participants.push({ id: userId, name: userName, isHost: false, color: userColor });
        }
        return NextResponse.json({ status: 'approved', room });
      }

      const existingInQueue = room.pendingQueue.some(u => u.id === userId);
      if (!existingInQueue) {
        room.pendingQueue.push({ id: userId, name: userName, color: userColor, requestedAt: Date.now() });
        room.updatedAt = Date.now();
      }

      return NextResponse.json({ status: 'waiting', pendingQueue: room.pendingQueue });
    }

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 3. APPROVE GUEST (Host)
    if (action === 'APPROVE_GUEST') {
      const targetId = payload?.targetUserId;
      room.pendingQueue = room.pendingQueue.filter(u => u.id !== targetId);
      if (targetId && !room.approvedUserIds.includes(targetId)) {
        room.approvedUserIds.push(targetId);
      }
      const guestInfo = payload?.guestInfo || { id: targetId, name: 'Guest', color: '#10b981' };
      if (targetId && !room.participants.some(p => p.id === targetId)) {
        room.participants.push({ id: targetId, name: guestInfo.name, isHost: false, color: guestInfo.color });
      }
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room });
    }

    // 4. REJECT GUEST (Host)
    if (action === 'REJECT_GUEST') {
      const targetId = payload?.targetUserId;
      room.pendingQueue = room.pendingQueue.filter(u => u.id !== targetId);
      if (targetId && !room.rejectedUserIds.includes(targetId)) {
        room.rejectedUserIds.push(targetId);
      }
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room });
    }

    // 5. UPDATE CODE / FILES
    if (action === 'UPDATE_FILES') {
      if (payload?.files) room.files = payload.files;
      if (payload?.activeFileId) room.activeFileId = payload.activeFileId;
      if (payload?.language) room.language = payload.language;
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true });
    }

    // 6. RECORD EXECUTION
    if (action === 'RECORD_EXECUTION') {
      room.lastExecution = payload?.execution;
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

