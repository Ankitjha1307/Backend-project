import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller";

const router = Router()
router.use(verifyJWT); //uses VerifyJWT in all routes

router.route("/tweet").post(createTweet)
router.route("/user/:userId").post(getUserTweets)
router.route("/updateTweet").post(updateTweet)
router.route("/deleteTweet").post(deleteTweet)