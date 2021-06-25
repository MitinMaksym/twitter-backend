import {RequestHandler, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
const { promisify } = require('util');
import User, { UserModalDocumentType, UserType } from '../models/userModel'
import AppError from '../utils/AppError'
import catchAsync from '../utils/catchAsync'
import sendEmail from '../core/mailer'

const signToken = (userId:string) => {
    return jwt.sign({id:userId}, process.env.JWT_SECRET!,{expiresIn:process.env.JWT_EXPIRES_IN ?? '90d' })
}

const createSendToken = (user: UserModalDocumentType, statusCode:number, res:Response) => {
    const token = signToken(user._id)

    // @ts-ignore
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

export type CustomRequestType = Request & {user?:UserType}

class AuthController {
  signup: RequestHandler = catchAsync(async (req, res, next) => {
    const body: UserType = req.body;

    const user = await User.create({
      username: body.username,
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm
    });

    const confirmToken = user.createConfirmToken()
    await user.save({ validateBeforeSave: false });
    const confirmURL = `${req.protocol}://${req.get("host")}/api/v1/users/verify/${confirmToken}`;
    const message = `To confirm your Twitter account please follow ${confirmURL}.`;
    try {
        await sendEmail({
          email: user.email,
          subject: 'Confirmation token',
          message
        });
    
        res.status(200).json({
          status: 'success',
          message: 'Confirmation letter was sent to email'
        });
      } catch (err) {
        return next(
          new AppError('There was an error sending the email. Try again later!',500)
        );
      }
  });

  login: RequestHandler = catchAsync(async (req, res, next) => {
    const body: UserType = req.body;
    const login = body.username || body.email;
    if (!body.password || !login) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({
      $or: [{ username: body.username }, { email: body.email }],
    }).select("+password").select("+confirmed")
    if (!user || !(await user.correctPassword(body.password, user.password))) {
      return next(new AppError("Login or password is incorrect", 401));
    }
    if (!user.confirmed) {
        return next(new AppError("You account in not confirmed", 401))
    }
    createSendToken(user, 200, res);
  });

  verify: RequestHandler = catchAsync(async (req, res, next)=> { 
    const confirmToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        confirmToken
      });

    if (!user) {
        return next(new AppError('Token is invalid', 400))
    }
    // @ts-ignore
  user.confirmToken= undefined;
  user.confirmed=true
  await user.save({ validateBeforeSave: false });
     res.status(200).json({
         status:'success',
         message: "Account was confirmed successfully!"
     })
  })

  protect = catchAsync(
    async (req: CustomRequestType, _, next) => {
      let token: string | undefined;
      const { authorization } = req.headers;
      if (authorization && authorization.startsWith("Bearer")) {
        token = authorization.split(" ")[1];
      }
      if (!token) {
        return next(
          new AppError(
            "You are not logged in. Please log in to get access",
            401
          )
        );
      }

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next(
          new AppError(
            `The user belonging to this token doesn't longer exist`,
            401
          )
        );
      }

      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(
          new AppError(
            "User has changed a password recently! Please log in again",
            401
          )
        );
      }

      req.user = currentUser;
      next();
    }
  );
}

export default AuthController;