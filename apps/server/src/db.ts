import pgInit from 'pg-promise'

const pgp = pgInit()
const db = pgp(process.env.DATABASE_URL!)

export { db }
