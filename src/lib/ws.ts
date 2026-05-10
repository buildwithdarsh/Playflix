import * as Ably from 'ably';

export const WS_EVENTS = {
  // Room lifecycle
  ROOM_STATE: 'room:state',
  VIEWER_JOINED: 'room:viewer-joined',
  VIEWER_LEFT: 'room:viewer-left',

  // Playback sync (host → viewers)
  HOST_PLAY: 'room:host-play',
  HOST_PAUSE: 'room:host-pause',
  HOST_SEEK: 'room:host-seek',
  HOST_SPEED: 'room:host-speed',
  HOST_END: 'room:host-end',
  PLAYBACK_STATE: 'room:playback-state',

  // Social
  CHAT_MESSAGE: 'room:chat-message',
  EMOJI_REACTION: 'room:emoji-reaction',

  // Viewer actions
  MODE_SWITCH: 'room:mode-switch',
  METER_UPDATE: 'room:meter-update',
} as const;

export type WsConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

type EventHandler = (data: unknown) => void;

class PlayFlixWs {
  private client: Ably.Realtime | null = null;
  private channel: Ably.RealtimeChannel | null = null;
  private _state: WsConnectionState = 'disconnected';
  private stateListeners: Set<(state: WsConnectionState) => void> = new Set();
  private handlers: Map<string, Set<EventHandler>> = new Map();

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

  /**
   * Connect to an Ably channel for a room.
   * @param token - Ably token obtained from backend on room join
   * @param roomId - Used as channel name: `playflix:${roomId}`
   */
  connect(token: string, roomId: string) {
    this.disconnect();

    // Skip connection for mock tokens
    if (token.startsWith('mock-ably-token')) {
      this.setState('connected');
      return;
    }

    this.setState('connecting');

    // Token from backend is a JSON-stringified TokenRequest object.
    // Ably Realtime accepts a TokenRequest via authCallback.
    let ablyOptions: Ably.ClientOptions;
    try {
      const parsed = JSON.parse(token);
      // If it has 'keyName' it's a TokenRequest; if it has 'token' it's TokenDetails
      if (parsed.keyName) {
        ablyOptions = {
          authCallback: (_params, callback) => {
            callback(null, parsed as Ably.TokenRequest);
          },
          disconnectedRetryTimeout: 2000,
          suspendedRetryTimeout: 10000,
        };
      } else {
        ablyOptions = {
          tokenDetails: parsed as Ably.TokenDetails,
          disconnectedRetryTimeout: 2000,
          suspendedRetryTimeout: 10000,
        };
      }
    } catch {
      ablyOptions = {
        token,
        disconnectedRetryTimeout: 2000,
        suspendedRetryTimeout: 10000,
      };
    }

    this.client = new Ably.Realtime(ablyOptions);

    this.client.connection.on('connected', () => {
      this.setState('connected');
    });

    this.client.connection.on('disconnected', () => {
      this.setState('disconnected');
    });

    this.client.connection.on('failed', () => {
      this.setState('error');
    });

    const channelName = `playflix:${roomId}`;
    this.channel = this.client.channels.get(channelName);

    // Subscribe to all events on this channel
    this.channel.subscribe((message) => {
      if (!message.name) return;
      const handlers = this.handlers.get(message.name);
      if (handlers) {
        handlers.forEach((fn) => fn(message.data));
      }
    });
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.handlers.clear();
    this.setState('disconnected');
  }

  /**
   * Publish an event to the room channel.
   */
  send(event: string, data?: unknown) {
    if (this.channel) {
      this.channel.publish(event, data);
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
}

export const ws = new PlayFlixWs();
