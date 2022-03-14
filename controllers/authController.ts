import { RequestHandler, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
const { promisify } = require('util')
import User, { UserModalDocumentType, UserType } from '../models/userModel'
import AppError from '../utils/AppError'
import catchAsync from '../utils/catchAsync'
import sendEmail from '../core/mailer'
import tokenService from '../service/tokenService'
import UserDto from '../dtos/userDto'
import userService from '../service/userService'

// const signToken = (userId: string) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
//     expiresIn: process.env.JWT_EXPIRES_IN ?? "90d",
//   })
// }

const createSendTokens = async (
  user: UserDto,
  statusCode: number,
  res: Response
) => {
  const { accessToken, refreshToken } = tokenService.generateTokens(user.id)

  await tokenService.saveToken(user.id, refreshToken)
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  })

  res.status(statusCode).json({
    status: 'success',
    data: {
      token: accessToken,
      user,
    },
  })
}

export type CustomRequestType = Request & { user?: UserType }

class AuthController {
  signup: RequestHandler = catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm, avatar }: UserType =
      req.body

    const user = await userService.registration({
      username,
      email,
      password,
      passwordConfirm,
      avatar,
    })
    const confirmToken = user.createConfirmToken()

    const confirmURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/verify/${confirmToken}`
    const message = `To confirm your Twitter account please follow ${confirmURL}.`
    try {
      // await sendEmail({
      //   email: user.email,
      //   subject: "Confirmation token",
      //   message,
      // })

      res.status(200).json({
        status: 'success',
        message: 'Confirmation letter was sent to email',
      })
    } catch (err) {
      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      )
    }
  })

  login: RequestHandler = catchAsync(async (req, res) => {
    const { email, password }: UserType = req.body
    const user = await userService.login(email, password)
    createSendTokens(new UserDto(user), 200, res)
  })

  logout: RequestHandler = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies
    const token = await userService.logout(refreshToken)
    res.clearCookie('refreshToken')
    res.status(204).json({
      status: 'success',
      data: null,
    })
  })

  refresh: RequestHandler = catchAsync(
    async (req: CustomRequestType, res, next) => {
      try {
        const { accessToken, refreshToken, user } = await userService.refresh(
          req.cookies.refreshToken
        )
        res.cookie('refreshToken', refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        })
        res.status(200).json({
          status: 'success',
          data: {
            token: accessToken,
            user,
          },
        })
      } catch (e) {
        next(e)
      }
    }
  )

  verify: RequestHandler = catchAsync(async (req, res, next) => {
    const confirmToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      confirmToken,
    })

    if (!user) {
      return next(new AppError('Token is invalid', 400))
    }
    // @ts-ignore
    user.confirmToken = undefined
    user.confirmed = true
    await user.save({ validateBeforeSave: false })
    res.status(200).json({
      status: 'success',
      message: 'Account was confirmed successfully!',
    })
  })

  protect = catchAsync(async (req: CustomRequestType, _, next) => {
    let token: string | undefined
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1]
    }
    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access', 401)
      )
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET!)

    const currentUser = await User.findById(decoded.id)

    if (!currentUser) {
      return next(
        new AppError(
          `The user belonging to this token doesn't longer exist`,
          401
        )
      )
    }

    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User has changed a password recently! Please log in again',
          401
        )
      )
    }

    req.user = currentUser
    next()
  })
}

export default AuthController
