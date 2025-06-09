#!/usr/bin/env node

import Hyperswarm from "hyperswarm";
import { createHash } from "node:crypto";

const isServer = process.argv.at(-1) === "server";

const swarm = new Hyperswarm();

const topic = createHash("sha256")
  .update("sdlfjksdfjdflk56kj5jk5jk54lk6sdcfffmgdfklf")
  .digest();

const discovery = swarm.join(
  topic,
  isServer
    ? {
        server: true,
        client: false
      }
    : { server: false, client: true }
);

swarm.on("connection", (socket, info) => {
  console.log("new connection!", info);

  // you can now use the socket as a stream, eg:
  process.stdin.pipe(socket).pipe(process.stdout);
});

await discovery.flushed();


console.log("flushed",isServer);