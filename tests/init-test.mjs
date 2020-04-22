import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ReceiveEndpoint } from "@kronos-integration/endpoint";

import { ServiceSwarm } from "../src/service-swarm.mjs";

test("start / stop", async t => {
  const sp = new StandaloneServiceProvider();

  const key = "11-3232-334545-fff-ggff6f-gr-dff5";

  const bootstrap = [`127.0.0.1:61418`];

  const r1 = new ReceiveEndpoint("r1", sp);
  const r2 = new ReceiveEndpoint("r2", sp);

  const ss1 = await sp.declareService({
    type: ServiceSwarm,
    key,
    endpoints: {
      "topic.t1": { connected: r1 }
    }
  });

  t.is(ss1.endpoints["topic.t1"].name, "topic.t1");
  t.is(ss1.endpoints["topic.t1"].topic, ss1.topics.get("t1"));

  const ss2 = await sp.declareService({
    type: ServiceSwarm,
    key,
    bootstrap,
    endpoints: {
      "topic.t1": { connected: r2 }
    }
  });

  await Promise.all([ss1.start(), ss2.start()]);

  await new Promise(resolve => setTimeout(resolve, 1500));

  t.is(ss1.state, "running");
  t.is(ss2.state, "running");

  await Promise.all([ss1.stop(), ss2.stop()]);

  t.is(ss1.state, "stopped");
  t.is(ss2.state, "stopped");
});
