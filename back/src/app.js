import cors from "cors";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined"));

app.use("/api", routes);
app.use(errorHandler);

export default app;
