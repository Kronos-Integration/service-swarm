import { pipeline } from "stream";
import { MultiSendEndpoint } from "@kronos-integration/endpoint";
import { Encode } from "length-prefix-framed-stream";

/**
 * Endpoint name prefix for topic endpoints.
 */
const TOPIC_NAME_PREFIX = "topic.";

/**
 * Endpoint to link against a swarm topic.
 * @param {string} name endpoint name
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

    //console.log("RECEIVE",interceptors,arg);

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
