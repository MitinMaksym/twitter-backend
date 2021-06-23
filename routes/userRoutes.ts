import express from 'express'
import AuthController from '../controllers/authController'

const authController = new AuthController()

 const router = express.Router()

router.post('/signup', authController.signup)

export default router