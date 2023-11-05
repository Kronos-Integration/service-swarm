import { get } from "node:http";
import { setTimeout } from "node:timers/promises";
import DHT from "@hyperswarm/dht";

export async function initialize() {
/*
  const node = new DHT({
    ephemeral: true
  });

  const server = node.createServer();

  server.on('connection', noiseSocket => { 
    // noiseSocket is E2E between you and the other peer
    // pipe it somewhere like any duplex stream
    console.log('Remote public key', noiseSocket.remotePublicKey);
    console.log('Local public key', noiseSocket.publicKey);
    // same as keyPair.publicKey
    process.stdin.pipe(noiseSocket).pipe(process.stdout);
  });


  const keyPair = DHT.keyPair()
  // this makes the server accept connections on this keypairawait server.listen(keyPair)

  await server.listen(keyPair);
*/

  const dht = new DHT(); // DHT.bootstrapper(49736);
  await dht.ready();
  
  console.log("DHT", dht.address());

  return {
    dht,
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
