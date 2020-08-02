import { pipeline as rawPipeline } from "stream";
import { promisify  } from "util";

export const pipeline = promisify(rawPipeline);
