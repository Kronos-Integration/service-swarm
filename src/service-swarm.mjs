import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
import hyperswarm from "hyperswarm";
import { createHash } from "crypto";

/**
 * swarm detecting sync service
 */
export class ServiceSwarm extends Service {
  /**
   * @return {string} 'swarm'
   */
  static get name() {
    return "swarm";
  }

  static get configurationAttributes() {
    return mergeAttributes(
      Service.configurationAttributes,
      createAttributes({
        peers: {
          description: "well known peer addresses",
          needsRestart: true,
          type: "string"
        }
      })
    );
  }

  constructor(...args) {
    super(...args);

    // look for peers listed under this topic
    const topic = createHash("sha256").update("xmy-hyperswarm-topic").digest();

    Object.defineProperties(this, {
      swarm: { value: hyperswarm() },
      topic: { value: topic }
    });
  }

  async _start() {
    this.swarm.join(this.topic, {
      lookup: true, // find & connect to peers
      announce: true // optional- announce self as a connection target
    });

    this.swarm.on("connection", (socket, details) => {
      console.log("connection", details);

      // you can now use the socket as a stream, eg:
      // process.stdin.pipe(socket).pipe(process.stdout)
    });

    this.swarm.on('disconnection', (socket, details) => {
      console.log("disconnection", details);
    });

    this.swarm.on('peer', (peer) => {
      console.log("peer", peer);
    });
  }

  async _stop() {
    this.swarm.leave(this.topic);
  }

}

export default ServiceSwarm;
