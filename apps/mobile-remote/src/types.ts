export type RemoteInput =
  | { kind: 'dpad'; direction: 'up' | 'down' | 'left' | 'right' | 'ok' }
  | { kind: 'button'; name: 'back' | 'play' }
  | { kind: 'trackpad'; dx: number; dy: number }
  | { kind: 'mic'; active: boolean };

export type PairingStatus = 'idle' | 'connecting' | 'pending' | 'paired' | 'disconnected' | 'error';
