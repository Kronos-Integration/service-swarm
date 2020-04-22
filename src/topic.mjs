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
 */
export class Topic {
  constructor(service, name, options = {}) {
    let socket;

    Object.defineProperties(this, {
      service: { value: service },
      peers: { value: new Set() },
      name: { value: name },
      options: { value: { lookup: true, announce: true, ...options } },
      key: {
        value: createHash("sha256")
          .update(service.key + name)
          .digest()
      },
      socket: {
        set: value => {
          socket = value;
          if (socket) {
            socket.pipe(process.stdout);
          }
        },
        get: () => socket
      }
    });
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
    }
  }

  removePeer(peer) {
    const p = JSON.stringify(peer.to);
    if (this.peers.has(p)) {
      this.service.info(`delete peer ${p}`);
      this.peers.delete(p);
    }
  }

  toString() {
    return `${this.name}(${this.socket ? "open" : "closed"})`;
  }
}
