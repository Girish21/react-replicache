/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPLICACHE_LICENSE: string
  readonly VITE_REPLICHAT_PUSHER_KEY: string
  readonly VITE_REPLICHAT_PUSHER_CLUSTER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
