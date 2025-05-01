// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string
    // Contoh tambahan variabel lain:
    NEXT_PUBLIC_APP_VERSION: string
    API_SECRET_KEY: string // Hanya untuk server-side
  }
}