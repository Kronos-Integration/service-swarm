import dht from "@hyperswarm/dht";
import { once } from "nonsynchronous";

export async function initialize() {
  const node = dht({
    bootstrap: [],
    ephemeral: true
  });
  node.listen();
  await once(node, "listening");
  const { port } = node.address();
  return {
    port,
    bootstrap: [`127.0.0.1:${port}`],
    close(...others) {
      let missing = 1;

      for (const n of others) {
        missing++;
        n.destroy(done);
      }
      done();

      function done() {
        if (--missing) return;
        node.destroy();
      }
    }
  };
}
