import mongoose, { Schema, Document } from 'mongoose'

export type TweetType = {
  text: string
  user: string
}

export type TweetModelDocumentType = TweetType & Document

const tweetSchema = new mongoose.Schema<TweetType>(
  {
    text: {
      type: String,
      required: [true, 'Enter tweet text please!'],
      maxLength: [280, 'Tweet must contain less than 280 characters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: true,
  }
)

const tweetModal = mongoose.model<TweetModelDocumentType>('Tweet', tweetSchema)

export default tweetModal
