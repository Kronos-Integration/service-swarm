import { pipeline } from "node:stream";
import { MultiSendEndpoint } from "@kronos-integration/endpoint";
import { Encode } from "length-prefix-framed-stream";

/**
 * Endpoint name prefix for topic endpoints.
 */
const TOPIC_NAME_PREFIX = "topic.";

/**
 * Endpoint to link against a swarm topic.
 * @property {Topic} topic
 */
export class TopicEndpoint extends MultiSendEndpoint {
  static isTopicName(name) {
    return name.startsWith(TOPIC_NAME_PREFIX);
  }

  sockets = new Set();
  encode = new Encode();

  /**
   * @param {string} name endpoint name
   * @param {Object} owner owner of the endpoint
   * @param {Object} options
   * @param {string} options.topic defaults to endpoint name (without @see TOPIC_NAME_PREFIX)
   */
  constructor(name, owner, options) {
    super(name, owner, options);

    const topicName = options?.topic || name.replace(TOPIC_NAME_PREFIX, "");

    this.topic = owner.createTopic(topicName, options);

    this.topic.addTopicEndpoint(this);
  }

  async addSocket(socket) {
    if (this.sockets.has(socket)) {
      this.owner.error(`socket already present`);
      return;
    }

    this.sockets.add(socket);
    pipeline(this.encode, socket, e => {
      this.owner.trace(`${this} pipeline end ${e}`);
    });

    for (const other of this.connections()) {
      this.owner.trace(`${this} open ${other}`);
      this.openConnection(other);
    }
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  toJSONWithOptions(options) {
    const json = super.toJSONWithOptions(options);
    json.sockets = this.sockets.size;
    json.topic = this.topic.toJSONWithOptions(options);
    return json;
  }

  get isIn() {
    return true;
  }

  get isOpen() {
    return this.sockets.size > 0;
  }

  async receive(arg) {
    const interceptors = this.receivingInterceptors;
    let c = 0;

    const next = async arg => {
      if (c >= interceptors.length) {
        this.encode.write(arg);
      } else {
        return interceptors[c++].receive(this, next, arg);
      }
    };

    return next(arg);
  }
}
