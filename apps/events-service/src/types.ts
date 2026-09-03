export type RemoteInput =
  | { kind: 'dpad'; direction: 'up' | 'down' | 'left' | 'right' | 'ok' }
  | { kind: 'button'; name: 'back' | 'play' }
  | { kind: 'trackpad'; dx: number; dy: number }
  | { kind: 'mic'; active: boolean };

// Remote -> server
export interface InputMessage {
  type: 'input';
  input: RemoteInput;
}

// Server -> TV
export interface RegisteredMessage {
  type: 'registered';
  code: string;
}
export interface RemoteConnectedMessage {
  type: 'remote_connected';
  remoteCount: number;
}
export interface RemoteDisconnectedMessage {
  type: 'remote_disconnected';
  remoteCount: number;
}
export interface RelayedInputMessage {
  type: 'input';
  input: RemoteInput;
}

// Server -> remote
export interface PairedMessage {
  type: 'paired';
  code: string;
}
export interface PendingMessage {
  type: 'pending';
  code: string;
}
export interface TvDisconnectedMessage {
  type: 'tv_disconnected';
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}
