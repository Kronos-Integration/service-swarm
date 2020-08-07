import { MultiSendEndpoint } from "@kronos-integration/endpoint";
import { Encode } from "length-prefix-framed-stream";
import { pipeline } from "./util.mjs";

/**
 * Endpoint name prefix for topic endpoints
 */
const TOPIC_NAME_PREFIX = "topic.";

/**
 * Endpoint to link against a swarm topic
 * @param {string} name endpoint name
 * @param {Object} owner owner of the endpoint
 * @param {Object} options
 * @param {string} options.topic defaults to endpoint name (without @see TOPIC_NAME_PREFIX)
 * @property {Topic} topic
 */
export class TopicEndpoint extends MultiSendEndpoint {
  static isTopicName(name) {
    return name.startsWith(TOPIC_NAME_PREFIX);
  }

  constructor(name, owner, options = {}) {
    super(name, owner, options);

    const topicName = options.topic
      ? options.topic
      : name.replace(TOPIC_NAME_PREFIX, "");

    Object.defineProperties(this, {
      topic: {
        value: owner.createTopic(topicName, options)
      },
      sockets: { value: new Set() },
      encode: { value: new Encode() }
    });

    this.topic.addTopicEndpoint(this);
  }

  async addSocket(socket) {
    await pipeline(this.encode, socket);

    for (const other of this.connections()) {
      owner.trace(`${this} open ${other}`);
      this.openConnection(other);
    }
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  get jsonAttributes() {
    return [...super.jsonAttributes, "topic"];
  }

  get isIn() {
    return true;
  }

  get isOpen() {
    return this.sockets.size > 0;
  }

  async receive(arg) {
    let goOn = "closed";

    if (this.sockets.size > 0) {
      goOn = this.encode.write(arg, "utf8");
    }

    this.owner.info(`${this}: send(${goOn}) ${arg}`);
  }
}
