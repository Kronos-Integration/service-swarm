import { createHash } from "node:crypto";

/**
 * @param {ServiceSwarm} service
 * @param {string} name
 * @param {Object} options
 *
 * @property {ServiceSwarm} service
 * @property {string} name
 * @property {Object} options
 * @property {Buffer} key
 * @property {Set<TopicEndppoint>} topicEndpoints
 * @property {Set<PeerEndpoint>} peerEndpoints
 */
export class Topic {
  peers = new Map();
  sockets = new Set();
  topicEndpoints = new Set();
  peersEndpoints = new Set();

  constructor(service, name, options) {
    this.service = service;
    this.name = name;
    this.options = { server: false, client: true, ...options };
    this.key = createHash("sha256")
      .update(service.key + name)
      .digest();
  }

  join() {
    return this.service.swarm.join(this.key, this.options);
  }

  addSocket(socket) {
    if (this.sockets.has(socket)) {
      this.service.error(`socket already present`);
      return;
    }

    this.sockets.add(socket);
    this.topicEndpoints.forEach(e => e.addSocket(socket));

    socket.once("error", error => {
      this.service.error(`socket error ${error}`);
      this.sockets.delete(socket);
    });

    socket.once("end", () => {
      this.sockets.delete(socket);
    });

    socket.once("close", () => {
      this.service.trace("socket close");
      this.sockets.delete(socket);
    });
  }

  addTopicEndpoint(endpoint) {
    this.topicEndpoints.add(endpoint);
  }

  addPeersEndpoint(endpoint) {
    this.peersEndpoints.add(endpoint);
    endpoint.send(this.peers);
  }

  notifyPeerEndpoints() {
    this.peersEndpoints.forEach(e => e.send([...this.peers.values()]));
  }

  addPeer(peer) {
    /*
port: 45505
host: '10.0.6.2'
local: true
topic: <Buffer 4f 3c be 3c 08 17 01 88 f3 ed 15 99 83 72 32 0d e9 63 7f cc 97 d4 56 ad 13 1a 2a 94 93 8c cb 25>
to: { host: '79.194.42.188', port: 52787 }
referrer: {
  id: <Buffer ae df b3 1b dd 40 55 81 75 09 31 92 6d b9 aa dd 22 eb 7e 97 58 f2 f2 62 e6 28 8d 8c 03 67 a0 a5>
  port: 49453,
  host: '49.177.250.174'
  }
*/

    const key = peer.host + ":" + peer.port;

    if (!this.peers.has(key)) {
      this.service.trace(`add peer ${key}`);
      this.peers.set(key, peer);
      this.notifyPeerEndpoints();
    }
  }

  removePeer(peer) {
    const key = peer.host + ":" + peer.port;

    if (this.peers.has(key)) {
      this.service.info(`delete peer ${key}`);
      this.peers.delete(key);
      this.notifyPeerEndpoints();
    }
  }

  toString() {
    return `${this.name}(${this.sockets.size ? "open" : "closed"})`;
  }

  toJSONWithOptions(options) {
    return {
      name: this.name,
      peers: [...this.peers.values()].map(p => {
        return { host: p.host, port: p.port, local: p.local };
      }),
      sockets: this.sockets.size,
      server: this.options.server,
      client: this.options.client
    };
  }
}
