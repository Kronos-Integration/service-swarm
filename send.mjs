import Hyperswarm from "hyperswarm";
import { createHash } from "crypto";


const swarm = new Hyperswarm();

const topic = createHash("sha256").update("sdlfjksdfjdflk56kj5jk5jk54lk6sdcfffmgdfklf" + "uptime").digest();

swarm.join(topic, {
  lookup: true, // find & connect to peers
  announce: true // optional- announce self as a connection target
},() => {
    console.log("joined");
});

swarm.on("connection", (socket, info) => {
  console.log("new connection!", info);

  // you can now use the socket as a stream, eg:
  process.stdin.pipe(socket).pipe(process.stdout);
});
