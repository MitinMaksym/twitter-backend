import  { RequestHandler } from 'express'
import User from '../models/userModel'
import { UserModalDocumentType } from '../models/userModel'
import catchAsync from '../utils/catchAsync'

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
}

export default UserController