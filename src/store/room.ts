import { create } from 'zustand';
import { TZ } from '@/lib/tz';
import { wsClient, WS_EVENTS } from '@/lib/ws-client';
import type {
  Room,
  RoomMode,
  RoomViewer,
  ChatMessage,
  EmojiReaction,
  HostPlaybackState,
  CreateRoomParams,
  JoinRoomResponse,
} from '@/lib/types/room';
import type { WsConnectionState } from '@/lib/ws';

interface RoomState {
  // Room metadata
  room: Room | null;
  mode: RoomMode;
  isHost: boolean;

  // Viewers
  viewers: RoomViewer[];

  // Chat
  messages: ChatMessage[];

  // Reactions (last N for float animation)
  reactions: EmojiReaction[];

  // Playback sync
  hostPlaybackState: HostPlaybackState | null;

  // Connection
  wsStatus: WsConnectionState;

  // Actions
  createRoom: (params: CreateRoomParams) => Promise<Room | null>;
  joinRoom: (roomId: string, mode: RoomMode) => Promise<JoinRoomResponse | null>;
  leaveRoom: () => Promise<void>;
  switchMode: (newMode: RoomMode) => void;

  // Host actions
  hostPlay: (currentTime: number) => void;
  hostPause: (currentTime: number) => void;
  hostSeek: (currentTime: number) => void;

  // Social
  sendMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;

  // Internal
  setRoom: (room: Room) => void;
  removeReaction: (id: string) => void;
  reset: () => void;
}

const initialState = {
  room: null,
  mode: 'sync' as RoomMode,
  isHost: false,
  viewers: [],
  messages: [],
  reactions: [],
  hostPlaybackState: null,
  wsStatus: 'disconnected' as WsConnectionState,
};

export const useRoomStore = create<RoomState>((set, get) => ({
  ...initialState,

  createRoom: async (params) => {
    try {
      const res = await TZ.storefront.rooms.create({
        tmdbId: params.tmdbId,
        movieTitle: params.movieTitle,
        posterUrl: params.posterUrl ?? null,
        gdriveFileId: params.gdriveFileId,
        name: params.name,
        privacy: params.privacy ?? 'public',
        vibe: params.vibe ?? 'chill',
        ratePerMinPaise: params.ratePerMinPaise,
        ...(params.maxViewers !== undefined ? { maxViewers: params.maxViewers } : {}),
      });

      // API returns { room: {...} } or flat room object
      const raw = res as unknown as Record<string, unknown>;
      const room = (raw['room'] || raw) as Room;

      set({ room, isHost: true });
      return room;
    } catch (err) {
      // Re-throw so UI can handle specific errors (e.g. 409 duplicate)
      throw err;
    }
  },

  joinRoom: async (roomId, mode) => {
    try {
      const joinResponse = await TZ.storefront.rooms.join(roomId, { mode }) as JoinRoomResponse;

      set({
        room: joinResponse.room,
        mode,
        isHost: false,
        viewers: joinResponse.viewers,
        messages: joinResponse.recentMessages,
        hostPlaybackState: joinResponse.playbackState,
      });

      const ablyToken = joinResponse.ablyToken;

      // Connect to real-time channel
      wsClient.connect(ablyToken, roomId);

      const unsubState = wsClient.onStateChange((state) => {
        set({ wsStatus: state });
      });

      // Set up event listeners
      wsClient.on(WS_EVENTS.ROOM_STATE, (data) => {
        const state = data as { viewers: RoomViewer[]; playbackState: HostPlaybackState | null; recentMessages: ChatMessage[] };
        set({
          viewers: state.viewers,
          hostPlaybackState: state.playbackState,
          messages: state.recentMessages,
        });
      });

      wsClient.on(WS_EVENTS.VIEWER_JOINED, (data) => {
        const viewer = data as RoomViewer;
        set((s) => ({
          viewers: [...s.viewers, viewer],
          room: s.room ? { ...s.room, viewerCount: s.room.viewerCount + 1 } : null,
        }));
      });

      wsClient.on(WS_EVENTS.VIEWER_LEFT, (data) => {
        const { endUserId } = data as { endUserId: string };
        set((s) => ({
          viewers: s.viewers.filter((v) => v.endUserId !== endUserId),
          room: s.room ? { ...s.room, viewerCount: Math.max(0, s.room.viewerCount - 1) } : null,
        }));
      });

      wsClient.on(WS_EVENTS.CHAT_MESSAGE, (data) => {
        const msg = data as ChatMessage;
        set((s) => ({ messages: [...s.messages.slice(-99), msg] }));
      });

      wsClient.on(WS_EVENTS.EMOJI_REACTION, (data) => {
        const reaction = data as EmojiReaction;
        set((s) => ({ reactions: [...s.reactions.slice(-19), reaction] }));
      });

      wsClient.on(WS_EVENTS.HOST_PLAY, (data) => {
        set({ hostPlaybackState: data as HostPlaybackState });
      });

      wsClient.on(WS_EVENTS.HOST_PAUSE, (data) => {
        set({ hostPlaybackState: data as HostPlaybackState });
      });

      wsClient.on(WS_EVENTS.HOST_SEEK, (data) => {
        set({ hostPlaybackState: data as HostPlaybackState });
      });

      wsClient.on(WS_EVENTS.HOST_END, () => {
        set((s) => ({
          room: s.room ? { ...s.room, status: 'ended' } : null,
        }));
      });

      wsClient.on(WS_EVENTS.MODE_SWITCH, (data) => {
        const { endUserId, mode: newMode } = data as { endUserId: string; mode: RoomMode };
        set((s) => ({
          viewers: s.viewers.map((v) =>
            v.endUserId === endUserId ? { ...v, mode: newMode } : v
          ),
        }));
      });

      // Store cleanup ref
      void unsubState;

      return joinResponse;
    } catch {
      return null;
    }
  },

  leaveRoom: async () => {
    const { room } = get();
    if (!room) return;

    try {
      await TZ.storefront.rooms.leave(room.id);
    } catch {
      // Best-effort — still disconnect locally
    }
    wsClient.send(WS_EVENTS.VIEWER_LEFT, { roomId: room.id });
    wsClient.disconnect();
    set(initialState);
  },

  switchMode: (newMode) => {
    const { room } = get();
    set({ mode: newMode });
    if (room) {
      wsClient.send(WS_EVENTS.MODE_SWITCH, { roomId: room.id, mode: newMode });
    }
  },

  // Host actions
  hostPlay: (currentTime) => {
    const state: HostPlaybackState = { playing: true, currentTime, playbackRate: 1, updatedAt: Date.now() };
    set({ hostPlaybackState: state });
    wsClient.send(WS_EVENTS.HOST_PLAY, state);
  },

  hostPause: (currentTime) => {
    const state: HostPlaybackState = { playing: false, currentTime, playbackRate: 1, updatedAt: Date.now() };
    set({ hostPlaybackState: state });
    wsClient.send(WS_EVENTS.HOST_PAUSE, state);
  },

  hostSeek: (currentTime) => {
    const prev = get().hostPlaybackState;
    const state: HostPlaybackState = { playing: prev?.playing ?? false, currentTime, playbackRate: prev?.playbackRate ?? 1, updatedAt: Date.now() };
    set({ hostPlaybackState: state });
    wsClient.send(WS_EVENTS.HOST_SEEK, state);
  },

  // Social
  sendMessage: (text) => {
    wsClient.send(WS_EVENTS.CHAT_MESSAGE, {
      text,
      userId: 'current-user', // will be set from auth store at call site
      userName: 'You',
      mode: get().mode,
    });
  },

  sendReaction: (emoji) => {
    // Optimistic: show locally immediately
    const reaction = {
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      userId: 'current-user',
      timestamp: Date.now(),
    };
    set((s) => ({ reactions: [...s.reactions.slice(-19), reaction] }));

    // Also broadcast via WS
    wsClient.send(WS_EVENTS.EMOJI_REACTION, {
      emoji,
      userId: 'current-user',
    });
  },

  setRoom: (room) => set({ room }),

  removeReaction: (id) => {
    set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) }));
  },

  reset: () => {
    wsClient.disconnect();
    set(initialState);
  },
}));
