import axios from "axios";
import puppeteer from "puppeteer";
import redis from "redis";

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

export const cacheTags = (req, res, next) => {
  console.log("Fetching Tags from Redis Server")
    client.get("tags", (err, data) => {
        if (err) throw err;

        if (data !== null){
            res.status(200).json(JSON.parse(data));
        } else {
            next();
        }
    })
}

export const cacheGames = (req, res, next) => {
  console.log("Fetching Games from Redis Server")
  client.get("games", (err, data) => {
    if (err) throw err;

    if(data !== null){
      res.status(200).json(JSON.parse(data));
    } else {
      next();
    }
  })
}
export const getToken = async (req, res, next) => {
  let accessToken = "";

  try {
    await axios({
      method: "POST",
      url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
    })
      .then((response) => {
        accessToken = response.data.access_token;
      })
      .catch((error) => {
        console.log(error);
      });
    res.status(200).json(accessToken);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

export const getTags = async (req, res, next) => {
  const { accessToken } = req.query;
  let tags = [];
  let cursor = "";
  console.log("Fetching Tags from Twitch API")
  try {
    do {
      await axios({
        method: "GET",
        url: `https://api.twitch.tv/helix/tags/streams?first=100&after=${cursor}`,
        headers: {
          "Client-ID": process.env.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          for (let i = 0; i < res.data.data.length; i++) {
            tags.push(res.data.data[i]);
          }

          if (res.data.pagination.cursor) {
            cursor = res.data.pagination.cursor;
          } else {
            cursor = "null";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } while (cursor != "null");

    const reducedTags = await tags.map((tag) => {
      let newTag = {
        tag_id: tag.tag_id,
        name: tag.localization_names[`en-us`],
        description: tag.localization_descriptions[`en-us`],
        isDisabled: false,
      };
      return newTag;
    });

    reducedTags.sort((a, b) => a.name.localeCompare(b.name));

    //set to redis
    client.setex("tags", 604800000, JSON.stringify(reducedTags)); 

    res.status(200).json(reducedTags);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

export const getGames = async (req, res, next) => {
  const { accessToken } = req.query;
  let games = [];
  let cursor = "";
  console.log("Fetching Games from Twitch API")

  try {
    do {
      await axios({
        method: "GET",
        url: `https://api.twitch.tv/helix/games/top?first=100&after=${cursor}`,
        headers: {
          "Client-ID": process.env.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          for (let i = 0; i < res.data.data.length; i++) {
            games.push(res.data.data[i]);
          }

          if (res.data.pagination.cursor) {
            cursor = res.data.pagination.cursor;
          } else {
            cursor = "null";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } while (cursor != "null");

    const reducedGames = await games.map((game) => {
      let reducedGame = {
        id: game.id,
        name: game.name,
        description: game.box_art_url,
      };
      return reducedGame;
    });

    reducedGames.sort((a, b) => a.name.localeCompare(b.name));

    client.setex("games", 604800000, JSON.stringify(reducedGames)); 

    res.status(200).json(reducedGames);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

export const getStream = async (req, res, next) => {
  const { accessToken, gameID, isMature, tagIDs, viewersRange } = req.body;

  let streams = [];
  let cursor = "";
  let randomStream = {};

  try {
    do {
      await axios({
        method: "GET",
        url: ` https://api.twitch.tv/helix/streams?first=100&after=${cursor}&game_id=${gameID}`,
        headers: {
          "Client-ID": process.env.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          for (let i = 0; i < res.data.data.length; i++) {
            streams.push(res.data.data[i]);
          }

          if (res.data.pagination.cursor) {
            cursor = res.data.pagination.cursor;
          } else {
            cursor = "null";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } while (cursor != "null");

    let reducedStreams = streams.map((stream) => {
      let reducedStream = {
        username: stream.user_name,
        userID: stream.user_id,
        viewerCount: stream.viewer_count,
        tags: stream.tag_ids,
        isMature: stream.is_mature,
        type: stream.type,
      };
      return reducedStream;
    });

    if (isMature !== "either") {
      reducedStreams = await checkMature(reducedStreams, isMature);
    }
    if (tagIDs !== []) {
      let filteredStreams = [];
      reducedStreams.map((stream) => {
        if (stream.tags) {
          const isIncluded = tagIDs.every(
            (tag) => stream.tags.indexOf(tag) !== -1
          );
          if (isIncluded) {
            filteredStreams.push(stream);
          }
        }
      });

      filteredStreams = await checkRanges(filteredStreams, viewersRange);
      randomStream =
        filteredStreams[Math.floor(Math.random() * filteredStreams.length)];

      res.status(200).json(randomStream);
    } else {
      console.log("reducedStreams 2", reducedStreams.length);
      reducedStreams = await checkRanges(reducedStreams, viewersRange);
      randomStream =
        reducedStreams[Math.floor(Math.random() * reducedStreams.length)];

      res.status(200).json(randomStream);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

export const getStreamsByTags = async (req, res, next) => {
  const { tagIDs, accessToken, isMature, viewersRange } = req.body;

  let query = ``;
  let randomStream = {};
  let channels = [];

  try {
    if (tagIDs.length > 1) {
      query = `${tagIDs[0]}?tl=`;
      for (let i = 1; i < tagIDs.length; i++) {
        query = query.concat(`${tagIDs[i]},`);
      }
    } else {
      query = `${tagIDs[0]}`;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.twitch.tv/directory/all/tags/${query}`);
    await page.waitForSelector('a[data-test-selector="ChannelLink"]');

    const filteredStreams = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('a[data-test-selector="ChannelLink"]'),
        (element) => element.textContent
      )
    );

    await browser.close();

    for (let i = 0; i < filteredStreams.length; i++) {
      let channel = {};
      await axios({
        method: "GET",
        url: `https://api.twitch.tv/helix/streams?user_login=${filteredStreams[i]}`,
        headers: {
          "Client-ID": process.env.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
            (channel.username = res.data.data[0].user_name),
            (channel.userID = res.data.data[0].user_id),
            (channel.viewerCount = res.data.data[0].viewer_count),
            (channel.isMature = res.data.data[0].is_mature);
        })
        .catch((err) => {
          console.log(err);
        });
      channels.push(channel);
    }

    if (isMature !== "either") {
      channels = await checkMature(channels, isMature);
    }

    channels = await checkRanges(channels, viewersRange);

    randomStream = channels[Math.floor(Math.random() * channels.length)];

    res.status(200).json(randomStream);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

const checkMature = async (streams, matureVal) => {
  let reducedStreams = [];
  if (matureVal == true) {
    reducedStreams = streams.filter((stream) => stream.isMature == true);
  } else {
    reducedStreams = streams.filter((stream) => stream.isMature == false);
  }
  return reducedStreams;
};

const checkRanges = async (streams, viewersRange) => {
  let reducedStreams = await streams.filter(
    (stream) =>
      stream.viewerCount >= viewersRange.min &&
      stream.viewerCount <= viewersRange.max
  );

  return reducedStreams;
};
