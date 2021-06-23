import {RequestHandler} from 'express'
import jwt from 'jsonwebtoken'

import User, { UserType } from '../models/userModel'

const signToken = (userId:string) => {
    console.log(process.env.JWT_EXPIRES_IN)
    return jwt.sign(userId, process.env.JWT_SECRET!)
}

class AuthController {
    signup:RequestHandler = async (req, res, next) => {
      const body: UserType = req.body;

      const user = await User.create({
        username: body.username,
        email: body.email,
        password: body.password,
        passwordConfirm: body.passwordConfirm,
      });

      const token = signToken(user.id);
      // @ts-ignore
      user.password = undefined;

      res.status(201).json({
        status: "success",
        data: {
          user,
        },
      });
    }

    
}

export default AuthController