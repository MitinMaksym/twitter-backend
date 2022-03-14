import UserDto from '../dtos/userDto'
import User from '../models/userModel'
import AppError from '../utils/AppError'
import tokenService from './tokenService'
type UserSignUp = {
  username: string
  email: string
  password: string
  passwordConfirm: string
  avatar: string
}
class UserService {
  async registration(userData: UserSignUp) {
    const { username, email, password, passwordConfirm, avatar } = userData
    const user = await User.create({
      username,
      email,
      password,
      passwordConfirm,
      avatar,
    })

    await user.save({ validateBeforeSave: false })

    return user
  }

  async login(email: string, password: string) {
    if (!password || !email) {
      throw new AppError('Please provide email and password', 400)
    }

    const user = await User.findOne({
      email: email,
    })
      .select('+password')
      .select('+confirmed')
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Login or password is incorrect', 401)
    }
    if (!user.confirmed) {
      throw new AppError('You account in not confirmed', 401)
    }
    return user
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError(
        'You are not logged in. Please log in to get access',
        401
      )
    }
    const userData = await tokenService.validateToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh'
    )
    const userDto = new UserDto(userData)
    const tokens = tokenService.generateTokens(userDto.id)

    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }
}

export default new UserService()
