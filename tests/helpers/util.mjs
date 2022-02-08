import { get } from "http";
import { setTimeout } from "timers/promises";
import DHT from "@hyperswarm/dht";

export async function initialize() {
  const node = new DHT({
    bootstrap: [],
    ephemeral: true
  });

  const server = node.createServer();

  await server.listen();
  const { port } = server.address();

  return {
    port,
    bootstrap: [`127.0.0.1:${port}`],
    close(...others) {
      let missing = 1;

      for (const n of others) {
        missing++;
        n.destroy(done);
      }
      done();

      function done() {
        if (--missing) return;
        node.destroy();
      }
    }
  };
}

export async function wait(msecs = 1000) {
  return setTimeout(msecs);
}

export async function publicAddress() {
  return new Promise((resolve, reject) => {
    const req = get("http://ifconfig.me/ip", response => {
      let data = "";
      response.on("data", chunk => (data += chunk));

      response.on("end", () => {
        try {
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}
