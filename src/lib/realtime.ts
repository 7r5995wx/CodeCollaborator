import { PeerSignalMessage, UserSession, ChatMessage, FileItem } from './types';

// Preset vibrant avatar cursor colors
export const AVATAR_COLORS = [
  '#3b82f6', // Bright Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#84cc16', // Lime
];

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export class RealtimeClient {
  private peer: any = null;
  private connections: Map<string, any> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatTimer: any = null;
  
  public roomId: string;
  public userId: string;
  public userName: string;
  public isHost: boolean;
  public userColor: string;
  public hostPeerId: string;

  private messageHandlers: Set<(msg: PeerSignalMessage) => void> = new Set();
  private connectionStateHandlers: Set<(status: string) => void> = new Set();

  constructor(roomId: string, userId: string, userName: string, isHost: boolean, color?: string) {
    this.roomId = (roomId || '').toUpperCase();
    this.userId = userId;
    this.userName = userName;
    this.isHost = isHost;
    this.userColor = color || getRandomColor();
    this.hostPeerId = `HOST_${this.roomId}`;

    if (typeof window !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(`codecollaborator_${this.roomId}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.senderId !== this.userId) {
          this.notifyHandlers(event.data);
        }
      };
    }
  }

  public async initPeerJS(): Promise<string> {
    if (typeof window === 'undefined') return this.userId;

    try {
      const PeerModule = (await import('peerjs')).default;
      const myPeerId = this.isHost ? this.hostPeerId : `GUEST_${this.roomId}_${this.userId}`;

      this.peer = new PeerModule(myPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }
      });

      return new Promise((resolve) => {
        this.peer.on('open', (id: string) => {
          this.notifyConnectionStatus('connected');

          if (this.isHost) {
            // Host starts broadcasting heartbeat every 2.5 seconds
            this.startHostHeartbeat();
          } else {
            // Guest starts continuous reconnection loop to Host until connected
            this.startGuestRetryLoop();
          }

          resolve(id);
        });

        this.peer.on('connection', (conn: any) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err: any) => {
          console.warn('PeerJS Connection Warning:', err.type);
          if (!this.isHost) this.startGuestRetryLoop();
          this.notifyConnectionStatus('mesh_active');
          resolve(this.userId);
        });
      });
    } catch (e) {
      console.warn('PeerJS Initialization Fallback:', e);
      if (!this.isHost) this.startGuestRetryLoop();
      this.notifyConnectionStatus('mesh_active');
      return this.userId;
    }
  }

  private startHostHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isHost) {
        this.sendMessage({
          type: 'HOST_ANNOUNCE' as any,
          senderId: this.userId,
          payload: {
            roomId: this.roomId,
            hostName: this.userName,
            hostPeerId: this.hostPeerId,
          }
        });
      }
    }, 2000);
  }

  private startGuestRetryLoop() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    const attemptConnect = () => {
      if (this.isHost) return;
      const conn = this.connections.get(this.hostPeerId);
      if (!conn || !conn.open) {
        this.connectToPeer(this.hostPeerId);
      } else {
        // Send join request signal over active connection
        try {
          conn.send({
            type: 'JOIN_REQUEST',
            senderId: this.userId,
            payload: {
              name: this.userName,
              color: this.userColor,
            },
          });
        } catch (e) {
          console.warn('Signal send error:', e);
        }
      }
    };

    attemptConnect();
    this.heartbeatTimer = setInterval(attemptConnect, 1500);
  }

  private setupConnection(conn: any) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // Send JOIN_REQUEST immediately over newly opened connection
      if (!this.isHost) {
        conn.send({
          type: 'JOIN_REQUEST',
          senderId: this.userId,
          payload: {
            name: this.userName,
            color: this.userColor,
          },
        });
      }
    });

    conn.on('data', (data: PeerSignalMessage) => {
      if (data && data.senderId !== this.userId) {
        this.notifyHandlers(data);

        // Host Star-Topology Relay: Forward guest messages to all other connected peers!
        if (this.isHost) {
          this.connections.forEach((peerConn, peerId) => {
            if (peerId !== conn.peer && peerConn && peerConn.open) {
              try {
                peerConn.send(data);
              } catch (e) {
                console.warn('Host message relay warning:', e);
              }
            }
          });
        }
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', (err: any) => {
      console.warn('Peer connection error:', err);
    });
  }

  public connectToPeer(targetPeerId: string) {
    if (!this.peer || this.connections.has(targetPeerId)) return;
    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnection(conn);
    } catch (e) {
      console.warn('Failed to connect peer:', targetPeerId, e);
    }
  }

  public sendMessage(msg: PeerSignalMessage) {
    // 1. Send over WebRTC Peer Connections
    this.connections.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(msg);
        } catch (e) {
          console.warn('Error sending over peer:', e);
        }
      }
    });

    // 2. Broadcast over BroadcastChannel for local/multi-tab sync
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  public onMessage(handler: (msg: PeerSignalMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onConnectionStateChange(handler: (status: string) => void) {
    this.connectionStateHandlers.add(handler);
    return () => this.connectionStateHandlers.delete(handler);
  }

  private notifyHandlers(msg: PeerSignalMessage) {
    this.messageHandlers.forEach((handler) => handler(msg));
  }

  private notifyConnectionStatus(status: string) {
    this.connectionStateHandlers.forEach((handler) => handler(status));
  }

  public disconnect() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}
