import Pusher from 'pusher-js'
import * as React from 'react'
import { Replicache } from 'replicache'

const replicache = new Replicache({
  licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE,
  name: 'todo',
  pullURL: 'http://localhost:3001/replicache-pull',
  pushURL: 'http://localhost:3001/replicache-push',
  mutators: {
    async addCount(
      tx,
      { id, count, order }: { id: string; count: number; order: number },
    ) {
      console.log(order)
      await tx.put(`count/${id}`, { count, order })
    },
  },
})

const ReplicacheContext = React.createContext(replicache)

export const ReplicacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  React.useEffect(() => {
    Pusher.logToConsole = true

    const pusher = new Pusher(import.meta.env.VITE_REPLICHAT_PUSHER_KEY, {
      cluster: import.meta.env.VITE_REPLICHAT_PUSHER_CLUSTER,
    })

    const channel = pusher.subscribe('default')

    channel.bind('poke', () => {
      console.log('got poked')
      replicache.pull()
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [])

  return (
    <ReplicacheContext.Provider value={replicache}>
      {children}
    </ReplicacheContext.Provider>
  )
}

export const useReplicache = () => {
  const replicache = React.useContext(ReplicacheContext)

  if (!replicache) {
    throw new Error('useReplicache must be used within a ReplicacheProvider')
  }

  return replicache
}
