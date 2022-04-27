# Email Tweetdrop

After the initial $NATION tweetdrop, many people complained that they were not included. This was due to issues with the Twitter API. We offered a way for them to send an email with a link to their tweet, in order to be included for a second batch of the tweetdrop. Email was completely flooded by thousands of requests, so we created these scripts to handle them.

## Usage

Copy all content of email messages to a file, then:

```
node import-email.js file.txt > tweets.txt
```

Now all tweets sent via email are on a file, which we can use to check their eligibility by executing:

```
node check-eligibility.js tweets.txt > ens-and-usernames.txt
```

This will output the addresses (now with the Twitter usernames too) to a file.
It will also output the amount of those tweets that were invalid, didn't contain ENS addresses, and were bots.

You can perform some manual checks by checking the usernames, and if satisfactory, just split the usernames and leave the ENS addresses by doing:

```
node split-ens.js ens-and-usernames.txt > ens.txt
```

Because of [a Sybil attack in the first round of the tweetdrop](https://forum.nation3.org/t/how-do-we-deal-with-this-sybil-attack/42), we needed to create some parameters that would filter bot accounts, such as account creation date and number of followers/following.
