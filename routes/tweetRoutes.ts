import express from 'express'
import AuthController from '../controllers/authController';
import TweetController from '../controllers/tweetController'

const tweetController = new TweetController()
const authController = new AuthController()

const router = express.Router()

router
  .route("/")
  .get(tweetController.getTweets)
  .post(authController.protect, tweetController.createTweet)
  .delete(tweetController.deleteTweetById);

  router
  .route("/:id")
  .patch(authController.protect, tweetController.updateTweetById)
  .delete(authController.protect,tweetController.deleteTweetById);

export default router;