import { RequestHandler } from 'express'
import catchAsync from '../utils/catchAsync'
import Tweet, { TweetModalDocumentType } from '../models/tweetModel'
import AppError from '../utils/AppError'
import {CustomRequestType} from '../controllers/authController'


class TweetController {
    getTweets:RequestHandler = catchAsync(async (_, res) => {
        const tweets:TweetModalDocumentType[] = await Tweet.find()
        res.status(200).json({
            status: 'success',
            results: tweets.length,
            data: {
                tweets
            }
        })
    })
    createTweet:RequestHandler = catchAsync(async (req:CustomRequestType, res) => {
        const user = req.user
        const tweet = await Tweet.create({text: req.body.text,user:user?.id})

        res.status(201).json({
            status: 'success',
            data:{tweet}
        })

    })
    updateTweetById: RequestHandler = catchAsync(async (req:CustomRequestType, res, next) => {
        const tweet = await Tweet.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        })

        if (!tweet) {
            return next(new AppError('Tweet with such an id is not found', 404))
        }

        if (String(tweet?.user) !== req.user?.id){
            return next(new AppError('User is allowed to update only own tweets', 403))
        }

        res.status(200).json({
            status: 'success',
            data: {
                tweet
            }
        })
    })
    deleteTweetById:RequestHandler = catchAsync(async (req:CustomRequestType, res, next) => {
        
        const tweet = await Tweet.findById(req.params.id)
        if (!tweet) {
            return next(new AppError('Tour with such an id is not found', 404))
        }
        if (String(tweet?.user) !== req.user?.id){
            return next(new AppError('User is allowed to delete only own tweets', 403))
        }
      
        tweet.remove()

        res.status(204).json({
            status: 'success',
            data: null
        })

    })
}

export default TweetController