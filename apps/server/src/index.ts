import compression from 'compression'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

dotenv.config()

const app = express()

app.disable('x-powered-by')

app.use(compression())

app.use(cors())

app.use(morgan('tiny'))

app.get('/', (_, res: express.Response) => {
  return res.status(200).send('Hello World!')
})

app.listen(process.env.PORT, () => {
  console.error(`🚀 Server listening on port ${process.env.PORT}`)
})
