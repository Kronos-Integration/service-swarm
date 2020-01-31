import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";


/**
 * HTTP server
 * @property {http.Server} server only present if state is running
 */
export class ServiceSwarm extends Service {
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
        peers: {
          description: "well known peer addressses",
          needsRestart: true,
          type: "string"
        },
      })
    );
  }
}

export default ServiceSwarm;
