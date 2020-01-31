import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";


/**
 * swarm detecting sync service
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
