import mongoose, { Document, Schema } from 'mongoose'

export type TokenType = {
  user: string
  refreshToken: string
}

export type TokenModelDocumentType = TokenType & Document

const tokenSchema = new mongoose.Schema<TokenType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  refreshToken: { type: String, required: [true, 'Refresh token is required'] },
})

const tokenModel = mongoose.model<TokenType>('Token', tokenSchema)

export default tokenModel
