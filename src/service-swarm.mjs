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
        bootstrap: {
          description: "well known peer addresses",
          needsRestart: true,
          type: "string"
        },
        topic: {
          description: "peer lookup topic",
          needsRestart: true,
          type: "string"
        }
      })
    );
  }

  async _start() {
    const swarm = hyperswarm({ bootstrap: this.bootstrap });

    this.swarm = swarm;

    const topic = createHash("sha256").update(this.topic).digest();

    swarm.join(topic, {
      lookup: true, // find & connect to peers
      announce: true // optional- announce self as a connection target
    });

    swarm.on("disconnection", (socket, details) => {
      console.log("disconnection", details);
    });

    swarm.on("peer", peer => {
      console.log("peer", peer);
    });

    swarm.on("connection", (socket, details) => {
      console.log("connection", details);

      // you can now use the socket as a stream, eg:
      // process.stdin.pipe(socket).pipe(process.stdout)
    });
  }

  async _stop() {
    this.swarm.leave(this.topic);
  }
}

export default ServiceSwarm;
