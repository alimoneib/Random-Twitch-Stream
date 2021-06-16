import express from "express";
import {
  getToken,
  getTags,
  getGames,
  getStream,
  getStreamsByTags,
} from "../controllers/twitch.js";

const router = express.Router();

router.get("/token", getToken);
router.get("/tags", getTags);
router.get("/games", getGames);
router.post("/streams", getStream);
router.post("/streams/tags", getStreamsByTags);

export default router;
