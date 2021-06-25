import  { RequestHandler } from 'express'
import User from '../models/userModel'
import { UserModalDocumentType } from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import { CustomRequestType } from './authController'

class UserController {
    getUsers:RequestHandler = catchAsync(async (_, res) => {
        const users:UserModalDocumentType[] = await User.find()

        res.status(200).json({
            status: 'success',
            results:users.length,
            data: {
                users
            }
        })
    })
    me:RequestHandler = catchAsync(async (req: CustomRequestType, res) => {
        const user = await User.findById(req.user?.id)
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })
    })
}

export default UserController