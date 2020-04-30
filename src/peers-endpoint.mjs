import { SendEndpoint } from "@kronos-integration/endpoint";

const PEERS_NAME_PREFIX = "peers.";

/**
 * Endpoint to link against a swarm topic
 *
 * @property {Topic} topic
 */
export class PeersEndpoint extends SendEndpoint {
  static isPeersName(name) {
    return name.startsWith(PEERS_NAME_PREFIX);
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
      : name.replace(PEERS_NAME_PREFIX, "");

    Object.defineProperties(this, {
      topic: {
        value: owner.createTopic(topicName, options)
      }
    });

    //this.topic.addEndpoint(this);
  }

  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  get jsonAttributes() {
    return [...super.jsonAttributes, "topic"];
  }

  get isOpen() {
    return this.socket !== undefined;
  }
}
