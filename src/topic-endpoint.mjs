import { ReceiveEndpoint } from "@kronos-integration/endpoint";

const TOPIC_NAME_PREFIX = "topic.";

/**
 * Endpoint to link against a swarm topic
 *
 * @property {Topic} topic
 */
export class TopicEndpoint extends ReceiveEndpoint {
  static isTopicName(name) {
    return name.startsWith(TOPIC_NAME_PREFIX);
  }

  /**
   * @param {string} name endpoint name
   * @param {Object} owner owner of the endpoint
   * @param {Object} options
   * @param {string} options.topic defaults to endpoint name
   */
  constructor(name, owner, options = {}) {
    super(name, owner, options);

    const topicName = options.topic
      ? options.topic
      : name.replace(TOPIC_NAME_PREFIX, "");

    Object.defineProperty(this, "topic", {
      value: owner.createTopic(topicName, options)
    });
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  get jsonAttributes() {
    return [...super.jsonAttributes, "topic"];
  }

  get isOut() {
    return true;
  }
  
  get isIn() {
    return true;
  }

  get isOpen() {
    return this.topic && this.topic.socket !== undefined;
  }

  async receive(arg) {
    let goOn = 'closed';

    const socket = this.topic.socket;

    if (socket) {
      goOn = socket.write(arg,'utf8',cb => {
        this.owner.info('chunk flushed');
      });
    }

    this.owner.info(`${this}: send(${goOn}) ${arg}`);
  }
}
