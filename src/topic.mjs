import { createHash } from "crypto";

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
  constructor(service, name, options = {}) {
    Object.defineProperties(this, {
      service: { value: service },
      peers: { value: new Set() },
      sockets: { value: new Set() },
      topicEndpoints: { value: new Set() },
      peersEndpoints: { value: new Set() },
      name: { value: name },
      options: { value: { lookup: true, announce: true, ...options } },
      key: {
        value: createHash("sha256")
          .update(service.key + name)
          .digest()
      }
    });
  }

  addSocket(socket) {
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
      this.service.info("socket close");
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
    this.peersEndpoints.forEach(e => e.send(this.peers));
  }

  addPeer(peer) {
    const p = JSON.stringify(peer.to);

    if (!this.peers.has(p)) {
      if (!peer.to) {
        //console.log("missing to ?",peer);
        return;
      }

      this.service.info(`add peer ${p}`);
      this.peers.add(p);

      this.notifyPeerEndpoints();
    }
  }

  removePeer(peer) {
    const p = JSON.stringify(peer.to);
    if (this.peers.has(p)) {
      this.service.info(`delete peer ${p}`);
      this.peers.delete(p);
      this.notifyPeerEndpoints();
    }
  }

  toString() {
    return `${this.name}(${this.sockets.size ? "open" : "closed"})`;
  }

  toJSONWithOptions(options) {
    return {
      name: this.name,
      peers: [...this.peers],
      sockets: this.sockets.size,
      ...this.options
    };
  }
}
