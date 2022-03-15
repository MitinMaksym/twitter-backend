import express from 'express'
import ErrorController from './controllers/errorController'
import userRoutes from './routes/userRoutes'
import tweetRoutes from './routes/tweetRoutes'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(cookieParser())

//ROUTES
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/tweets', tweetRoutes)

app.use(ErrorController)

export default app
