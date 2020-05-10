import hyperswarm from "hyperswarm";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
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

    if (PeersEndpoint.isPeersName(name)) {
      return PeersEndpoint;
    }

    return super.endpointFactoryFromConfig(name, definition, ic);
  }

  async _start() {
    const swarm = hyperswarm({ bootstrap: this.bootstrap });

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
      if (details.peer) {
        const topic = this.topics.get(details.peer.topic);

        this.trace(`connection for topic ${topic.name}`);
        //this.trace(`connection details ${JSON.stringify(details)}`);
        this.trace(
          `socket: ${socket.pending} ${socket.connecting} ${JSON.stringify(
            socket.address()
          )} ${socket.remoteAddress}`
        );

        topic.socket = socket;

        //this.trace(`socket readableFlowing: ${socket.readableFlowing}`);
        //socket.resume();

        //this.trace(`start reading socket`);

        socket.on("drain", () => this.info("socket drain"));
        socket.on("end", () => this.info("socket end"));
        socket.on("timeout", () => this.info("socket timeout"));

        setInterval(() => {
          socket.write(`hello from ${socket.localAddress}`, () => {
            this.info(`socket written`);
          });
        }, 10000);

        socket.on("data", chunk => this.info(`got ${chunk}`));

        this.trace(`socket readableFlowing: ${socket.readableFlowing}`);

        /*
        try {
          for await (const chunk of socket) {
            this.info(`got ${chunk}`);
          }
        } catch (e) {
          console.log(e);
        }
        */
        //this.trace(`done reading socket`);
      }
      // process.stdin.pipe(socket).pipe(process.stdout)
    });

    swarm.on("disconnection", (socket, details) => {
      if (details.peer) {
        this.info(`disconnection: ${JSON.stringify(details.peer)}`);
        const topic = this.topics.get(details.peer.topic);
        if (topic) {
          topic.removePeer(details.peer);
        } else {
          this.info(`disconnection: unknown topic`);
        }
      }
    });

    /*for (const topic of this.topics.values()) {
      this.info(
        `status of topic ${topic}: ${JSON.stringify(swarm.status(topic.key))}`
      );
    }
    */
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
