import compression from 'compression'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import replicachePull from './controller/replicache-pull'
import replicachePush from './controller/replicache-push'
import { db } from './db'

const app = express()

app.disable('x-powered-by')

app.use(compression())

app.use(cors())

app.use(morgan('tiny'))

app.use(express.json({ limit: '64mb' }))

app.get('/', (_, res: express.Response) => {
  return res.status(200).send('Hello World!')
})

app.post('/init', async (_, res: express.Response) => {
  await db.task(async t => {
    await t.none('drop table if exists counts')
    await t.none('drop table if exists replicache_client')
    await t.none('drop sequence if exists version')
    await t.none(
      'create table counts (id text primary key not null, count int not null, ord bigint not null, version bigint not null)',
    )
    await t.none(
      'create table replicache_client (id text primary key not null, last_mutation_id bigint not null)',
    )
    await t.none('create sequence version')
  })

  return res.status(200).end()
})

app.post('/replicache-pull', replicachePull)

app.post('/replicache-push', replicachePush)

app.listen(process.env.PORT, () => {
  console.error(`🚀 Server listening on port ${process.env.PORT}`)
})
