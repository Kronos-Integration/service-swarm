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
    let socket;

    function setSocket(o, s) {
      socket = s;
      o.topicEndpoints.forEach(e => (e.socket = s));
    }

    Object.defineProperties(this, {
      service: { value: service },
      peers: { value: new Set() },
      topicEndpoints: { value: new Set() },
      peersEndpoints: { value: new Set() },
      name: { value: name },
      options: { value: { lookup: true, announce: true, ...options } },
      key: {
        value: createHash("sha256")
          .update(service.key + name)
          .digest()
      },
      socket: {
        set: value => {
          setSocket(this, value);

          if (socket) {
            socket.once("error", error => {
              this.service.error(`socket error ${error}`);
              setSocket(this, undefined);
            });
            socket.once("close", () => {
              this.service.info("socket close");
              setSocket(this, undefined);
            });
            socket.once("end", () => {
              this.service.info("socket end");
              setSocket(this, undefined);
            });
          }
        },
        get: () => socket
      }
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
    return `${this.name}(${this.socket ? "open" : "closed"})`;
  }
}
