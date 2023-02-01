import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import usersRouter from "./api/users/index.js";
import {
  badRequestErrorHandler,
  forbiddenErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js";

import { pgConnect, syncModels } from "./db.js";

const server = express();
const PORT = process.env.PORT || 3014;

// ********************************* MIDDLEWARES ***************************************
server.use(cors());
server.use(express.json());

// ********************************** ENDPOINTS ****************************************
server.use("/users", usersRouter);

// ******************************* ERROR HANDLERS **************************************
server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericErrorHandler);

await pgConnect();
await syncModels();

server.listen(PORT, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${PORT}`);
});
