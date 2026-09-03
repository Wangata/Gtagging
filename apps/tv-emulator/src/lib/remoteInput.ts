export type RemoteInput =
  | { kind: 'dpad'; direction: 'up' | 'down' | 'left' | 'right' | 'ok' }
  | { kind: 'button'; name: 'back' | 'play' }
  | { kind: 'trackpad'; dx: number; dy: number }
  | { kind: 'mic'; active: boolean }

export function describeRemoteInput(input: RemoteInput): string {
  switch (input.kind) {
    case 'dpad':
      return `D-pad ${input.direction}`
    case 'button':
      return `${input.name} pressed`
    case 'trackpad':
      return `Trackpad move (${input.dx}, ${input.dy})`
    case 'mic':
      return `Mic ${input.active ? 'on' : 'off'}`
  }
}
