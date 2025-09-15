import { pipeline } from "node:stream";
import Hyperswarm from "hyperswarm";
import { Decode, Encode } from "length-prefix-framed-stream";
import {
  prepareAttributesDefinitions,
  private_key_attribute,
  boolean_attribute_false,
  integer_attribute,
  object_attribute
} from "pacc";
import { Service } from "@kronos-integration/service";
import { Topic } from "./topic.mjs";
import { TopicEndpoint } from "./topic-endpoint.mjs";
import { PeersEndpoint } from "./peers-endpoint.mjs";

/**
 * Swarm detecting sync service.
 */
export class ServiceSwarm extends Service {
  _topics; // = new Map();
  _topicsByName; // = new Map();

  /**
   * @return {string} 'swarm'
   */
  static get name() {
    return "swarm";
  }

  static attributes = prepareAttributesDefinitions(
    {
      server: {
        ...boolean_attribute_false,
        needsRestart: true,
      },
      client: {
        ...boolean_attribute_false,
        needsRestart: true
      },
      dht: {
        ...object_attribute,
        description: "well known dht addresses",
        needsRestart: true,
      },
      maxPeers: {
        ...integer_attribute,
        description: "total amount of peers that this peer will connect to",
        default: 10,
        needsRestart: true
      },
      key: {
        ...private_key_attribute,
        description: "topic initial key",
        needsRestart: true
      }
    },
    Service.attributes
  );

  get topics() {
    if (!this._topics) {
      this._topics = new Map();
    }
    return this._topics;
  }

  get topicsByName() {
    if (!this._topicsByName) {
      this._topicsByName = new Map();
    }
    return this._topicsByName;
  }

  createTopic(name, options) {
    let topic = this.topicsByName.get(name);
    if (!topic) {
      topic = new Topic(this, name, options);
      this.topicsByName.set(name, topic);
      this.topics.set(topic.key, topic);
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
    const swarm = (this.swarm = new Hyperswarm({
      dht: this.dht,
      maxPeers: this.maxPeers
    }));

    /*
    this.discovery = swarm.join(
      topic,
        ? {
            server: this.server,
            client: this.client
          }
    );
    */

    swarm.on("update", () => {
      console.log("Hyperswarm update", swarm);
    });

    swarm.on("peer", peer => {
      const topic = this.topics.get(peer.topic);
      topic.addPeer(peer);
    });

    swarm.on("connection", async (socket, peerInfo) => {
      console.log(socket, peerInfo);
      /*
      this.trace(
        `connection: peer=${info.peer ? "true" : "false"} client=${
          info.client ? "true" : "false"
        } ${JSON.stringify(socket.address())} ${socket.remoteAddress}`
      );*/

      if (peerInfo) {
        const topic = this.topics.get(peerInfo.peer.topic);

        this.trace(`Connection for topic ${topic.name}`);

        topic.addSocket(socket);

        socket.on("drain", () => this.trace("socket drain"));
        socket.on("timeout", () => this.trace("socket timeout"));

        const encode = new Encode();

        pipeline(encode, socket, e => this.trace(`Encoding pipeline end ${e}`));

        this.trace(`Encoding pipeline established ${topic.name}`);
      }

      const decode = new Decode({ objectMode: true, encoding: "utf8" });

      pipeline(socket, decode, e => this.trace(`Decoding pipeline end ${e}`));

      this.trace(`Decoding pipeline established`);

      decode.on("data", data => this.trace(`got ${data}`));
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
