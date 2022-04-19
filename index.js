const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const checkedFilter = {
  property: "Checked",
  checkbox: {
    equals: false,
  },
};

const dateSort = {
  property: "Date",
  direction: "descending",
};

export const getDatabase = async (databaseId) => {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: checkedFilter,
    sorts: [dateSort],
  });
  return results;
};

const tweetRegex = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/g;
const tweetId = /.*\/([^?]+)/;

const filterTweet = (message) => {
  message.match(tweetRegex);
};

const fetchTweet = (url) => {
  const id = tweetId.exec(url)[1];
};
