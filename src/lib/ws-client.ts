import { ws } from './ws';
import { wsMock } from './ws-mock';

const useMock = process.env['NEXT_PUBLIC_WS_MOCK'] === 'true';

export const wsClient = useMock ? wsMock : ws;
export { WS_EVENTS } from './ws';
export type { WsConnectionState } from './ws';
