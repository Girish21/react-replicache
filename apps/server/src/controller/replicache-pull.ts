import type express from 'express'
import { performance } from 'perf_hooks'
import { db } from '../db'

async function replicachePull(req: express.Request, res: express.Response) {
  const pull = req.body
  console.log(`processing pull: ${JSON.stringify(pull)}`)
  const t0 = performance.now()

  try {
    await db.tx(async t => {
      const lastMutationID = parseInt(
        (
          await t.oneOrNone(
            'select last_mutation_id from replicache_client where id = $1',
            pull.clientID,
          )
        )?.last_mutation_id ?? '0',
      )
      const changed = await t.manyOrNone(
        'select id, count, ord from counts where version >= $1',
        pull.cookie,
      )
      const cookie =
        (await t.one('select max(version) as version from counts'))?.version ??
        0

      console.log({ lastMutationID, changed, cookie })

      const patch = []
      if (pull.cookie === null) {
        patch.push({ op: 'clear' })
      }

      patch.push(
        ...changed.map(row => ({
          op: 'put',
          key: `count/${row.id}`,
          value: { count: row.count, order: parseInt(row.ord) },
        })),
      )

      return res.status(200).json({ lastMutationID, patch, cookie })
    })
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  } finally {
    console.log('Processed pull in', performance.now() - t0)
  }
}

export default replicachePull
