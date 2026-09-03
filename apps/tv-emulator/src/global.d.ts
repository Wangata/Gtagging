// Declares the window globals the GrabTV client SDK (packages/client-sdk)
// reads/writes, so this app's own tsc pass (a separate TS project) type-checks
// against them without importing the SDK package's ambient declarations.
export {}

declare global {
  interface Window {
    programId?: string
    measurementId?: string
    sessionToken?: string
    generateProgramIdHash?: (programId: string) => string | null
    generateSessionToken?: (apiKey: string, apiSecret: string) => Promise<string>
  }
}
