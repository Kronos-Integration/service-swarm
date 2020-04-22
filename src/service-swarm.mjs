import hyperswarm from "hyperswarm";
import { createHash } from "crypto";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
import { Topic } from "./topic.mjs";
import { TopicEndpoint } from "./topic-endpoint.mjs";

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
          setter(value, attribute) {
            this.topic = createHash("sha256").update(value).digest();
          },
          type: "string"
        }
      })
    );
  }

  topics = new Map();

  createTopic(name)
  {
    let topic = this.topics(name);
    if(!topic) {
      topic = new Topic(this,name);
      this.topics.set(name,topic);
    }
 
    return topic;
  }
  
  /**
   * on demand create topic endpoints
   * @param {string} name
   * @param {Object|string} definition
   * @return {Class} RouteSendEndpoint if name starts with 'topic'
   */
  endpointFactoryFromConfig(name, definition, ic) {
    if (name.startsWith("topic") {
      return TopicEndpoint;
    }

    return super.endpointFactoryFromConfig(name, definition, ic);
  }
  
  async _start() {
    const swarm = hyperswarm({ bootstrap: this.bootstrap });

    this.swarm = swarm;

    swarm.join(this.topic, {
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
