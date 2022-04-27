const fs = require('fs')
const readline = require('readline')
const { TwitterApi } = require('twitter-api-v2')
require('dotenv').config()

const twitterClient = new TwitterApi(process.env.TWITTER_TOKEN)

const path = process.argv[2]
const file = fs.createReadStream(path)

const tweetIdRegEx = /.*\/([^?]+)/
const ensRegEx = /([^ ]+\.(eth))/i

const isBot = ({ followers_count, friends_count, created_at }) => {
  return (
    +new Date(created_at) > process.env.TWITTER_USER_MINIMUM_DATE_CREATED ||
    followers_count < process.env.TWITTER_USER_MINIMUM_FOLLOWERS ||
    friends_count < process.env.TWITTER_USER_MINIMUM_FOLLOWING
  )
}

const isEligible = (tweet) => {
  const date = +new Date(tweet.created_at)
  if (date > process.env.DEADLINE) return false

  if (
    tweet.in_reply_to_screen_name === process.env.TWITTER_USERNAME ||
    tweet.quoted_status_id === process.env.TWEET_ID ||
    tweet.entities?.urls[0].display_url === process.env.TWEET_URL
  )
    return true
  return false
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const autoRetryOnRateLimitError = async (callback) => {
  while (true) {
    try {
      return await callback()
    } catch (error) {
      if (
        error instanceof ApiResponseError &&
        error.rateLimitError &&
        error.rateLimit
      ) {
        const resetTimeout = error.rateLimit.reset * 1000
        const timeToWait = resetTimeout - Date.now()

        await sleep(timeToWait)
        continue
      }

      throw error
    }
  }
}

const fetchTweet = (id) => {
  return autoRetryOnRateLimitError(() => twitterClient.v1.singleTweet(id))
}

const extractENS = async (tweetUrl) => {
  const match = tweetIdRegEx.exec(tweetUrl)
  if (!match) return ['invalid_tweet']

  const id = match[1]
  if (!id || id === 'undefined' || !Number.isInteger(Number(id))) {
    return ['invalid_tweet']
  }

  try {
    const tweet = await fetchTweet(id)
    if (isBot(tweet.user)) return ['bot']
    if (!isEligible(tweet)) return ['invalid_tweet']

    const match = ensRegEx.exec(tweet.full_text)
    if (!match) return ['invalid_ens']
    return ['valid', match[1], tweet.user.screen_name]
  } catch (err) {
    return ['error']
  }
}

let counts = { valid: 0, invalid_ens: 0, invalid_tweet: 0, bot: 0, error: 0 }

async function processLineByLine() {
  const rl = readline.createInterface({
    input: file,
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    const [result, ens, username] = await extractENS(line)
    if (result === 'valid') {
      console.log(ens, username)
    }
    counts[result]++
  }
  console.log(counts)
}

processLineByLine()
