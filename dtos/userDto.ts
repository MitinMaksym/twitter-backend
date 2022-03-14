import { UserModalDocumentType } from '../models/userModel'

class UserDto {
  public username: string
  public id: string
  public email: string
  public avatar: string
  constructor(user: UserModalDocumentType) {
    this.id = user._id
    this.username = user.username
    this.email = user.email
    this.avatar = user.avatar
  }
}

export default UserDto
