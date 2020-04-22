import hyperswarm from "hyperswarm";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
import { Topic } from "./topic.mjs";
import { TopicEndpoint } from "./topic-endpoint.mjs";

/**
 * swarm detecting sync service
 */
export class ServiceSwarm extends Service {
  //topics = new Map();

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
        key: {
          description: "topic initial key",
          needsRestart: true,
          type: "string"
        }
      })
    );
  }

  createTopic(name, options) {
    if (!this.topics) {
      this.topics = new Map(); // TODO why ?
    }

    let topic = this.topics.get(name);
    if (!topic) {
      topic = new Topic(this, name);
      this.topics.set(name, topic, options);
    }

    return topic;
  }

  /**
   * on demand create topic endpoints
   * @param {string} name
   * @param {Object|string} definition
   * @return {Class} TopicEndpoint if name starts with 'topic.'
   */
  endpointFactoryFromConfig(name, definition, ic) {
    if (TopicEndpoint.isTopicName(name)) {
      return TopicEndpoint;
    }

    return super.endpointFactoryFromConfig(name, definition, ic);
  }

  async _start() {
    const swarm = hyperswarm({ bootstrap: this.bootstrap });

    this.swarm = swarm;

    for (const topic of this.topics.values()) {
      this.info(`join ${topic.name} ${JSON.stringify(topic.options)}`);
      this.swarm.join(topic.key, topic.options);
    }

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
    for (const topic of this.topics.values()) {
      this.info(`leave ${topic.name}`);
      this.swarm.leave(topic.key);
    }
  }
}

export default ServiceSwarm;
