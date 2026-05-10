// Re-export all room types from the @buildwithdarsh/sdk package
// Frontend code can import from either location
export type {
  PlayFlixRoomStatus as RoomStatus,
  PlayFlixRoomPrivacy as RoomPrivacy,
  PlayFlixRoomVibe as RoomVibe,
  PlayFlixRoomViewerMode as RoomMode,
  PlayFlixRoom as Room,
  PlayFlixRoomViewer as RoomViewer,
  PlayFlixRoomMessage as ChatMessage,
  PlayFlixRoomPlaybackState as HostPlaybackState,
  PlayFlixRoomJoinResponse as JoinRoomResponse,
  HostEarning as RoomEarning,
  EarningsSummary,
} from '@buildwithdarsh/sdk';

export type { CreatePlayFlixRoomDto as CreateRoomParams } from '@buildwithdarsh/sdk';

// Emoji reaction is client-only (not persisted), keep it local
export interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: number;
}
