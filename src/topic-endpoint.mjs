import { SendEndpoint } from "@kronos-integration/endpoint";

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
export class TopicEndpoint extends SendEndpoint {
  static isTopicName(name) {
    return name.startsWith(TOPIC_NAME_PREFIX);
  }

  constructor(name, owner, options = {}) {
    super(name, owner, options);

    let socket;

    const topicName = options.topic
      ? options.topic
      : name.replace(TOPIC_NAME_PREFIX, "");

    Object.defineProperties(this, {
      topic: {
        value: owner.createTopic(topicName, options)
      },
      socket: {
        set: value => {
          socket = value;

          for (const other of this.connections()) {
            if (socket) {
              owner.trace(`${this} open ${other}`);
              this.openConnection(other);
            } else {
              owner.trace(`${this} close ${other}`);
              this.closeConnection(other);
            }
          }
        },
        get: () => socket
      }
    });

    this.topic.addTopicEndpoint(this);
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  get jsonAttributes() {
    return [...super.jsonAttributes, "topic"];
  }

  /* get isOut() {
    return true;
  }*/

  get isIn() {
    return true;
  }

  get isOpen() {
    return this.socket !== undefined;
  }

  async receive(arg) {
    let goOn = "closed";

    if (this.socket) {
      goOn = this.socket.write(arg, "utf8", cb => {
        this.owner.info("chunk flushed");
      });
    }

    this.owner.info(`${this}: send(${goOn}) ${arg}`);
  }
}
