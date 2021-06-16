import express from "express";
import {
  getToken,
  getTags,
  cacheTags,
  getGames,
  cacheGames,
  getStream,
  getStreamsByTags,
} from "../controllers/twitch.js";

const router = express.Router();

router.get("/token", getToken);
router.get("/tags", cacheTags, getTags);
router.get("/games", cacheGames, getGames);
router.post("/streams", getStream);
router.post("/streams/tags", getStreamsByTags);

export default router;
