import { SendEndpoint } from "@kronos-integration/endpoint";

/**
 * Endpoint to link against a swarm topic
 */
export class TopicEndpoint extends Endpoint {
  /**
   * @param {string} name endpoint name
   * @param {Object} owner owner of the endpoint
   * @param {Object} options
   * @param {string} options.topic defaults to endpoint name
   */
  constructor(name, owner, options = {}) {
    super(name, owner, options);

    const topicName = options.topic ? options.topic : name.replace(/^topic./);
 
    Object.defineProperty(this, "topic", {
        value: owner.createTopic(topicName);
    });
  }


  get toStringAttributes() {
    return { ...super.toStringAttributes, topic: "topic" };
  }

  get jsonAttributes() {
    return [...super.jsonAttributes, "topic"];
  }
}
