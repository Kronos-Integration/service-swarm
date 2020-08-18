import { MultiSendEndpoint } from "@kronos-integration/endpoint";

/**
 * Endpoint name prefix for peers endpoints
 */
const PEERS_NAME_PREFIX = "peers.";

/**
 * Endpoint to link against a swarm topic
 * @param {string} name endpoint name
 * @param {Object} owner owner of the endpoint
 * @param {Object} options
 * @param {string} options.topic defaults to endpoint name (without @see PEERS_NAME_PREFIX)
 *
 * @property {Topic} topic
 */
export class PeersEndpoint extends MultiSendEndpoint {
  static isPeersName(name) {
    return name.startsWith(PEERS_NAME_PREFIX);
  }

  constructor(name, owner, options = {}) {
    super(name, owner, options);

    const topicName = options.topic
      ? options.topic
      : name.replace(PEERS_NAME_PREFIX, "");

    Object.defineProperties(this, {
      topic: {
        value: owner.createTopic(topicName, options)
      }
    });

    this.topic.addPeersEndpoint(this);
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  toJSONWithOptions(options) {
    const json = super.toJSONWithOptions(options);
    json.topic = this.topic.toJSONWithOptions(options);
    return json;
  }

  get isOpen() {
    return this.socket !== undefined;
  }
}
