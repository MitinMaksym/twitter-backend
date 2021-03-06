import express from 'express'
import AuthController from '../controllers/authController'
import UserController from '../controllers/userController'

const authController = new AuthController()
const userController = new UserController()

const router = express.Router()

router.get('/me', authController.protect, userController.me)
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/refreshToken', authController.refresh)
router.post('/verify/:token', authController.verify)

router.get('/', authController.protect, userController.getUsers)

export default router
