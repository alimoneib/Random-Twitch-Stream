import dotenv from 'dotenv'
dotenv.config()
import axios from "axios";
import puppeteer from "puppeteer";

let accessToken = "";
async function getToken() {

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
}


async function getTags(accessToken) {
    let tags = [];
    let cursor = "";

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
        }).catch((err) => { console.log(err) })

    } while (cursor != "null");


    const reducedTags = await tags.map((tag) => {
        let newTag = {
            tag_id: tag.tag_id,
            name: tag.localization_names[`en-us`],
            description: tag.localization_descriptions[`en-us`]
        }
        return newTag;
    })

    console.log(reducedTags)
}

async function getGames(accessToken) {
    let games = [];
    let cursor = "";

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
        }).catch((err) => { console.log(err) })

    } while (cursor != "null");


    const reducedGames = await games.map((game) => {
        let reducedGame = {
            id: game.id,
            name: game.name,
            description: game.box_art_url
        }
        return reducedGame;
    })

    console.log(reducedGames)
}

async function getStream(accessToken, gameID, isMature, tagIDs) {
    let streams = [];
    let cursor = "";

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
        }).catch((err) => { console.log(err) })

    } while (cursor != "null");


    const reducedStreams = await streams.map((stream) => {
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
        const matureStreams = await reducedStreams.filter(stream => stream.isMature === true);
        console.log(matureStreams)
    }
    
    if (tagIDs) {
        let filteredStreams = [];
        await reducedStreams.map((stream) => {
            if (stream.tags) {
                const tagsIncluded = tagIDs.every(tag => {
                    console.log(tag);
                    stream.tags.includes(tag)})
                if (tagsIncluded) {
                    filteredStreams.push(stream);
                }
            }
        })
        console.log(filteredStreams)
    }
    
    console.log(reducedStreams);

}

async function getStreamsByTags(tagIDs) {
    let query = ``;
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

    console.log(filteredStreams);
}


await getToken();
// getTags(accessToken)
// getGames(accessToken)
// getStream(accessToken, '509672', true)
getStreamsByTags(['eaba0ad7-c4e1-4878-b37f-01308dbb65c8', 'e027fb8b-219e-4959-8240-a4a082be0316'])