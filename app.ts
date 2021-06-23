import express from 'express'
import userRoutes from './routes/userRoutes'

const app = express()

app.use(express.json())




//ROUTES
app.use('/twitter-app/api/v1/users', userRoutes)

export default app