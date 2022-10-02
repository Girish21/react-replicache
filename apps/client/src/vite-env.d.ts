/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPLICACHE_LICENSE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
