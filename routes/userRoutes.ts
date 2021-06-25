import express from 'express'
import AuthController from '../controllers/authController'
import UserController from '../controllers/userController'

const authController = new AuthController()
const userController = new UserController()

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/verify/:token', authController.verify)

router.get('/', authController.protect, userController.getUsers)

export default router