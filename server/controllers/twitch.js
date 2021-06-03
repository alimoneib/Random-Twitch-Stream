import axios from "axios";
import puppeteer from "puppeteer";

export const getToken = async (req, res, next) => {
    let accessToken = "";

    try {
        await axios({
                method: 'POST',
                url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`
            })
            .then(response => {
                accessToken = response.data.access_token;
            })
            .catch(error => {
                console.log(error);
            });
        res.status(200).json(accessToken);
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
}

export const getTags = async (req, res, next) => {
    const {
        accessToken
    } = req.query;
    let tags = [];
    let cursor = "";

    try {
        do {
            await axios({
                method: 'GET',
                url: `https://api.twitch.tv/helix/tags/streams?first=100&after=${cursor}`,
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }).then((res) => {
                for (let i = 0; i < res.data.data.length; i++) {
                    tags.push(res.data.data[i]);
                }

                if (res.data.pagination.cursor) {
                    cursor = res.data.pagination.cursor;
                } else {
                    cursor = 'null'
                }
            }).catch((err) => {
                console.log(err)
            })
        } while (cursor != "null");

        const reducedTags = await tags.map((tag) => {
            let newTag = {
                tag_id: tag.tag_id,
                name: tag.localization_names[`en-us`],
                description: tag.localization_descriptions[`en-us`]
            }
            return newTag;
        })

        res.status(200).json(reducedTags);
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
}

export const getGames = async (req, res, next) => {
    const {
        accessToken
    } = req.query;
    let games = [];
    let cursor = "";

    try {
        do {
            await axios({
                method: 'GET',
                url: `https://api.twitch.tv/helix/games/top?first=100&after=${cursor}`,
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }).then((res) => {
                for (let i = 0; i < res.data.data.length; i++) {
                    games.push(res.data.data[i]);
                }

                if (res.data.pagination.cursor) {
                    cursor = res.data.pagination.cursor;
                } else {
                    cursor = 'null'
                }
            }).catch((err) => {
                console.log(err)
            })
        } while (cursor != "null");

        const reducedGames = await games.map((game) => {
            let reducedGame = {
                id: game.id,
                name: game.name,
                description: game.box_art_url
            }
            return reducedGame;
        })
        res.status(200).json(reducedGames);

    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
}

export const getStream = async (req, res, next) => {
    const {
        accessToken,
        gameID,
        isMature,
        tagIDs
    } = req.body
    let streams = [];
    let cursor = "";

    try {
        do {
            await axios({
                method: 'GET',
                url: ` https://api.twitch.tv/helix/streams?first=100&after=${cursor}&game_id=${gameID}`,
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }).then((res) => {
                for (let i = 0; i < res.data.data.length; i++) {
                    streams.push(res.data.data[i]);
                }

                if (res.data.pagination.cursor) {
                    cursor = res.data.pagination.cursor;
                } else {
                    cursor = 'null'
                }
            }).catch((err) => {
                console.log(err)
            })
        } while (cursor != "null");

        let reducedStreams = streams.map((stream) => {
            let reducedStream = {
                username: stream.user_name,
                viewerCount: stream.viewer_count,
                tags: stream.tag_ids,
                isMature: stream.is_mature,
                type: stream.type
            }
            return reducedStream;
        })

        if (isMature) {
            reducedStreams = reducedStreams.filter(stream => stream.isMature === true);
        }

        if (tagIDs) {
            let filteredStreams = [];
            reducedStreams.map((stream) => {
                if (stream.tags) {
                    const isIncluded = tagIDs.every(tag => stream.tags.indexOf(tag) !== -1);
                    if (isIncluded) {
                        filteredStreams.push(stream);
                    }
                }
            })
            return res.status(200).json(filteredStreams);
        }

        res.status(200).json(reducedStreams);

    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }

}

export const getStreamsByTags = async (req, res, next) => {
    const {
        tagIDs
    } = req.body
    let query = ``;

    try {
        if (tagIDs.length > 1) {
            query = `${tagIDs[0]}?tl=`;
            for (let i = 1; i < tagIDs.length; i++) {
                query = query.concat(`${tagIDs[i]},`)
            }
        } else {
            query = `${tagIDs[0]}`
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://www.twitch.tv/directory/all/tags/${query}`);
        await page.waitForSelector('a[data-test-selector="ChannelLink"]');
      
        const filteredStreams = await page.evaluate(() => Array.from(document.querySelectorAll('a[data-test-selector="ChannelLink"]'), element => element.textContent));

        await browser.close();

        res.status(200).json(filteredStreams);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}