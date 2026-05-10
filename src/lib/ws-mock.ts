import { WS_EVENTS, type WsConnectionState } from './ws';
import type { ChatMessage, RoomViewer, HostPlaybackState } from './types/room';

type EventHandler = (data: unknown) => void;

const MOCK_VIEWERS: RoomViewer[] = [
  { id: 'v1', endUserId: 'u1', name: 'Rahul', avatarUrl: null, mode: 'sync', joinedAt: new Date().toISOString() },
  { id: 'v2', endUserId: 'u2', name: 'Priya', avatarUrl: null, mode: 'sync', joinedAt: new Date().toISOString() },
  { id: 'v3', endUserId: 'u3', name: 'Arjun', avatarUrl: null, mode: 'solo', joinedAt: new Date().toISOString() },
];

class MockPlayFlixWs {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private _state: WsConnectionState = 'disconnected';
  private stateListeners: Set<(state: WsConnectionState) => void> = new Set();
  private playbackState: HostPlaybackState = {
    playing: false,
    currentTime: 0,
    playbackRate: 1,
    updatedAt: Date.now(),
  };
  private msgCounter = 0;

  get state(): WsConnectionState {
    return this._state;
  }

  private setState(state: WsConnectionState) {
    this._state = state;
    this.stateListeners.forEach((fn) => fn(state));
  }

  onStateChange(fn: (state: WsConnectionState) => void) {
    this.stateListeners.add(fn);
    return () => { this.stateListeners.delete(fn); };
  }

  connect(_token: string, _roomId: string) {
    this.setState('connecting');

    setTimeout(() => {
      this.setState('connected');
      this.emit(WS_EVENTS.ROOM_STATE, {
        viewers: MOCK_VIEWERS,
        playbackState: this.playbackState,
        recentMessages: [],
      });
    }, 300);
  }

  disconnect() {
    this.handlers.clear();
    this.setState('disconnected');
  }

  send(event: string, data?: unknown) {
    switch (event) {
      case WS_EVENTS.CHAT_MESSAGE: {
        const msg = data as { text: string; userId: string; userName: string; mode: string };
        const chatMsg: ChatMessage = {
          id: `msg-${++this.msgCounter}`,
          userId: msg.userId,
          userName: msg.userName,
          text: msg.text,
          mode: msg.mode as 'sync' | 'solo',
          isHost: false,
          timestamp: Date.now(),
        };
        setTimeout(() => this.emit(WS_EVENTS.CHAT_MESSAGE, chatMsg), 50);
        break;
      }
      case WS_EVENTS.EMOJI_REACTION: {
        const reaction = data as { emoji: string; userId: string };
        setTimeout(() => this.emit(WS_EVENTS.EMOJI_REACTION, {
          id: `r-${Date.now()}`,
          emoji: reaction.emoji,
          userId: reaction.userId,
          timestamp: Date.now(),
        }), 50);
        break;
      }
      case WS_EVENTS.HOST_PLAY:
        this.playbackState = { ...this.playbackState, playing: true, updatedAt: Date.now() };
        setTimeout(() => this.emit(WS_EVENTS.HOST_PLAY, this.playbackState), 50);
        break;
      case WS_EVENTS.HOST_PAUSE:
        this.playbackState = { ...this.playbackState, playing: false, updatedAt: Date.now() };
        setTimeout(() => this.emit(WS_EVENTS.HOST_PAUSE, this.playbackState), 50);
        break;
      case WS_EVENTS.HOST_SEEK: {
        const seekData = data as { currentTime: number };
        this.playbackState = { ...this.playbackState, currentTime: seekData.currentTime, updatedAt: Date.now() };
        setTimeout(() => this.emit(WS_EVENTS.HOST_SEEK, this.playbackState), 50);
        break;
      }
      case WS_EVENTS.MODE_SWITCH: {
        setTimeout(() => this.emit(WS_EVENTS.MODE_SWITCH, data), 50);
        break;
      }
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((fn) => fn(data));
  }
}

export const wsMock = new MockPlayFlixWs();
