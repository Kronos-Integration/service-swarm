import { hostname } from "os";
import hyperswarm from "hyperswarm";
import { Decode, Encode } from "length-prefix-framed-stream";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
import { pipeline  } from "./util.mjs";
import { Topic } from "./topic.mjs";
import { TopicEndpoint } from "./topic-endpoint.mjs";
import { PeersEndpoint } from "./peers-endpoint.mjs";

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
      super.configurationAttributes,
      createAttributes({
        bootstrap: {
          description: "well known peer addresses",
          needsRestart: true,
          type: "string"
        },
        /*
        "node-id": {
          description: "id of our node",
          needsRestart: true,
          type: "string"
        },
        */
        ephemeral: {
          description: `Set to false if this is a long running instance on a server
When running in ephemeral mode you don't join the DHT but just 
query it instead. If unset, or set to a non-boolean (default undefined)
then the node will start in short-lived (ephemeral) mode and switch 
to long-lived (non-ephemeral) mode after a certain period of uptime`,
          needsRestart: true,
          type: "boolean"
        },
        key: {
          description: "topic initial key",
          needsRestart: true,
          private: true,
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
   * On demand create topic endpoints
   * @param {string} name
   * @param {Object|string} definition
   * @return {Class} TopicEndpoint if name starts with 'topic.'
   */
  endpointFactoryFromConfig(name, definition, ic) {
    if (TopicEndpoint.isTopicName(name)) {
      return TopicEndpoint;
    }

    if (PeersEndpoint.isPeersName(name)) {
      return PeersEndpoint;
    }

    return super.endpointFactoryFromConfig(name, definition, ic);
  }

  async _start() {
    const swarm = hyperswarm({
      bootstrap: this.bootstrap,
      ephemeral: this.ephemeral,
      multiplex: true
    });

    this.swarm = swarm;

    await Promise.all(
      [...this.topics.values()].map(topic => {
        this.info(`join topic ${topic.name} ${JSON.stringify(topic.options)}`);
        return new Promise(resolve => {
          this.swarm.join(topic.key, topic.options, () => {
            this.info(`joined topic ${topic.name}`);
            resolve();
          });
        });
      })
    );

    swarm.on("peer", peer => {
      const topic = this.topics.get(peer.topic);
      topic.addPeer(peer);
    });

    swarm.on("peer-rejected", peer => {
      this.info(`peer-rejected: ${JSON.stringify(peer)}`);
    });

    /*swarm.on("updated", key => {
      this.info(`updated: ${JSON.stringify(key)}`);
    });*/

    swarm.on("connection", async (socket, details) => {
      this.info(
        `connection: peer=${details.peer ? "true" : "false"} client=${
          details.client ? "true" : "false"
        } ${JSON.stringify(socket.address())} ${socket.remoteAddress}`
      );

      if (details.peer) {
        const topic = this.topics.get(details.peer.topic);

        this.info(`connection for topic ${topic.name}`);

        topic.addSocket(socket);

        socket.on("drain", () => this.info("socket drain"));
        socket.on("timeout", () => this.info("socket timeout"));

        const encode = new Encode();

        setInterval(() => {
          encode.write(`hello from ${hostname()}`);
        }, 5 * 60 * 1000);

        await pipeline(encode, socket);

        this.info(`Encoding pipeline established ${topic.name}`);
      }

      const decode = new Decode({ objectMode: true, encoding: "utf8" });

      await pipeline(socket, decode);

      this.info(`Decoding pipeline established`);

      decode.on("data", data => {
        this.info(`got ${data}`);
      });

      /*try {
        for await (const chunk of socket) {
          this.info(`B got ${chunk}`);
        }
      } catch (e) {
        console.log(e);
      }*/
    });

    swarm.on("disconnection", (socket, details) => {
      if (details.peer) {
        this.trace(`disconnection: ${JSON.stringify(details.peer)}`);
        const topic = this.topics.get(details.peer.topic);
        if (topic) {
          topic.removePeer(details.peer);
        } else {
          this.info(`disconnection: unknown topic`);
        }
      }
    });
  }

  async _stop() {
    return Promise.all(
      [...this.topics.values()].map(topic => {
        this.info(`leave topic ${topic.name}`);
        return new Promise(resolve => {
          this.swarm.join(topic.key, () => {
            this.info(`leaved topic ${topic.name}`);
            resolve();
          });
        });
      })
    );
  }
}

export default ServiceSwarm;
