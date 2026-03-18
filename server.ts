import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./src/server/socketHandlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "*" : (process.env.NEXT_PUBLIC_APP_URL ?? "*"),
      methods: ["GET", "POST"],
    },
  });

  await setupSocketHandlers(io);

  httpServer.listen(port, hostname, () => {
    console.log(`> BugRacer ready on http://${hostname}:${port}`);
  });
});
