import { pipeline } from "stream";
import hyperswarm from "hyperswarm";
import { Decode, Encode } from "length-prefix-framed-stream";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
import { Topic } from "./topic.mjs";
import { TopicEndpoint } from "./topic-endpoint.mjs";
import { PeersEndpoint } from "./peers-endpoint.mjs";

/**
 * Swarm detecting sync service.
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
      createAttributes({
        bootstrap: {
          description: "well known peer addresses",
          needsRestart: true,
          type: "string"
        },
        maxPeers: {
          description: "total amount of peers that this peer will connect to",
          default: 10,
          needsRestart: true,
          type: "integer"
        },
        maxServerSockets: {
          needsRestart: true,
          type: "integer"
        },
        maxClientSockets: {
          needsRestart: true,
          type: "integer"
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
      }),
      super.configurationAttributes
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
   * On demand create topic endpoints.
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
      maxPeers: this.maxPeers,
      maxServerSockets: this.maxServerSockets,
      maxClientSockets: this.maxClientSockets,
      multiplex: true,
      /*validatePeer: (peer) => {
        this.trace(`validatePeer ${JSON.stringify(peer)}`);
        return true;
      }*/
    });

    this.swarm = swarm;

    await Promise.all(
      [...this.topics.values()].map(topic => {
        this.trace(`join topic ${topic.name} ${JSON.stringify(topic.options)}`);
        return new Promise(resolve => {
          this.swarm.join(topic.key, topic.options, () => {
            this.trace(`joined topic ${topic.name}`);
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
      this.trace(`peer-rejected: ${JSON.stringify(peer)}`);
    });

    /*swarm.on("updated", key => {
      this.info(`updated: ${JSON.stringify(key)}`);
    });*/

    swarm.on("connection", async (socket, info) => {
      this.trace(
        `connection: peer=${info.peer ? "true" : "false"} client=${
          info.client ? "true" : "false"
        } ${JSON.stringify(socket.address())} ${socket.remoteAddress}`
      );

      if (info.peer) {
        const topic = this.topics.get(info.peer.topic);

        this.trace(`Connection for topic ${topic.name}`);

        topic.addSocket(socket);

        socket.on("drain", () => this.trace("socket drain"));
        socket.on("timeout", () => this.trace("socket timeout"));

        const encode = new Encode();

        /*
        setInterval(() => {
          encode.write(`hello from ${hostname()}`);
        }, 5 * 60 * 1000);*/

        pipeline(encode, socket, e => {
          this.trace(`Encoding pipeline end ${e}`);
        });

        this.trace(`Encoding pipeline established ${topic.name}`);
      }

      const decode = new Decode({ objectMode: true, encoding: "utf8" });

      pipeline(socket, decode, e => {
        this.trace(`Decoding pipeline end ${e}`);
      });

      this.trace(`Decoding pipeline established`);

      decode.on("data", data => {
        this.trace(`got ${data}`);
      });
    });

    swarm.on("disconnection", (socket, info) => {
      if (info.peer) {
        this.trace(`disconnection: ${JSON.stringify(info.peer)}`);
        const topic = this.topics.get(info.peer.topic);
        if (topic) {
          topic.removePeer(info.peer);
        } else {
          this.trace(`disconnection: unknown topic`);
        }
      }
    });
  }

  async _stop() {
    return Promise.all(
      [...this.topics.values()].map(topic => {
        this.trace(`leave topic ${topic.name}`);
        return new Promise(resolve => {
          this.swarm.join(topic.key, () => {
            this.trace(`leaved topic ${topic.name}`);
            resolve();
          });
        });
      })
    );
  }
}

export default ServiceSwarm;
