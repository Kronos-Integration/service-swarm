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
      this.topicsByName = new Map(); // TODO why ?
    }

    let topic = this.topicsByName.get(name);
    if (!topic) {
      topic = new Topic(this, name, options);
      this.topicsByName.set(name, topic);
      this.topics.set(topic.key, topic, options);
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

      await new Promise(resolve => {
        this.swarm.join(topic.key, topic.options, () => {
          this.info(`joined ${topic.name}`);
          resolve();
        });
      });
    }

    swarm.on("peer", peer => {
      const topic = this.topics.get(peer.topic);
      topic.addPeer(peer);
    });

    swarm.on("peer-rejected", peer => {
      this.info(`peer-rejected: ${JSON.stringify(peer)}`);
    });

    swarm.on("updated", key => {
      this.info(`updated: ${JSON.stringify(key)}`);
    });

    swarm.on("connection", (socket, details) => {
      if (details.peer) {
        const topic = this.topics.get(details.peer.topic);

        console.log(`connection for topic ${topic.name}`);

        socket.write("hello world");
        topic.socket = socket;
      }
      // process.stdin.pipe(socket).pipe(process.stdout)
    });

    swarm.on("disconnection", (socket, details) => {
      if (details.peer) {
        this.info(`disconnection: ${JSON.stringify(details.peer)}`);
        const topic = this.topics.get(details.peer.topic);
        if(topic) {
          topic.removePeer(details.peer);
        }
        else {
          this.info(`disconnection: unknown topic`);
        }
      }
    });

    for (const topic of this.topics.values()) {
      this.info(
        `status of topic ${topic}: ${JSON.stringify(swarm.status(topic.key))}`
      );
    }
  }

  async _stop() {
    for (const topic of this.topics.values()) {
      this.info(`leave ${topic.name}`);
      this.swarm.leave(topic.key, () => {
        this.info(`leaved ${topic.name}`);
      });
    }
  }
}

export default ServiceSwarm;
