import jwt from 'jsonwebtoken'
const { promisify } = require('util')
import tokenModel from '../models/tokenModel'
import AppError from '../utils/AppError'
import User from '../models/userModel'

class TokenService {
  generateTokens(userId: string) {
    const payload = { id: userId }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'access', {
      expiresIn: '15s',
    })
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'refresh',
      {
        expiresIn: '300s',
      }
    )
    return {
      accessToken,
      refreshToken,
    }
  }

  async validateToken(token: string, secret: string) {
    const decoded = await promisify(jwt.verify)(token, secret)

    const currentUser = await User.findById(decoded.id)

    const tokenFromDb = await this.findToken(token)
    if (!currentUser || !tokenFromDb) {
      throw new AppError(
        `The user belonging to this token doesn't longer exist`,
        401
      )
    }

    return currentUser
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await tokenModel.findOne({ user: userId })
    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }
    const token = await tokenModel.create({ user: userId, refreshToken })
    return token
  }

  async removeToken(refreshToken: string) {
    const tokenData = await tokenModel.deleteOne({ refreshToken })
    return tokenData
  }

  async findToken(refreshToken: string) {
    const tokenData = await tokenModel.findOne({ refreshToken })
    return tokenData
  }
}

export default new TokenService()
