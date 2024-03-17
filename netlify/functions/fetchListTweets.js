import { Rettiwt } from 'rettiwt-api';

export default async (req, context) => {

  // Extract the twitter list id from the query string
  const url = new URL(req.url);
  const tweetListId = url.searchParams.get('tweetListId');
  const api_key = url.searchParams.get('apiKey');

  //Ensure to use environment variables in production
  const rettiwt = new Rettiwt({ apiKey: api_key });

  if (!tweetListId) {
    return new Response(JSON.stringify({ error: "Tweet list ID is required" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const res = await rettiwt.tweet.list(tweetListId);
    const enrichedTweets = await Promise.all(res.list.map(async (tweet) => {
      if (tweet.quoted !== undefined) {
        const quotedTweetDetails = await rettiwt.tweet.details(tweet.quoted);
        tweet.quoted = quotedTweetDetails;
      }
      return tweet;
    }));

    return new Response(JSON.stringify(enrichedTweets), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching tweet list:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch tweet list" }), {
      status: 500,
    });
  }
};
