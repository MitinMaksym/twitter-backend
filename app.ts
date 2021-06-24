import express from 'express'
import ErrorController from './controllers/ErrorController'
import userRoutes from './routes/userRoutes'

const app = express()

app.use(express.json())




//ROUTES
app.use('/api/v1/users', userRoutes)

app.use(ErrorController)

export default app