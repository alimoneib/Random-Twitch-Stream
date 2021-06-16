import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import twitchRoutes from "./routes/twitch.js";

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/twitch", twitchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));