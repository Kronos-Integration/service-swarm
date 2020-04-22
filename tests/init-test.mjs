import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { SendEndpoint } from "@kronos-integration/endpoint";

import { ServiceSwarm } from "../src/service-swarm.mjs";

test("start / stop", async t => {
  const sp = new StandaloneServiceProvider();

  const key = "11-3232-334545-fff-ggff6f-gr-df56";

  const bootstrap = [`127.0.0.1:61418`];

  const s1 = new SendEndpoint("s1", sp);
  const s2 = new SendEndpoint("s2", sp);

  const ss1 = await sp.declareService({
    type: ServiceSwarm,
    name: "ss1",
    key,
    endpoints: {
      "topic.t1": { connected: s1 }
    }
  });

  t.is(ss1.endpoints["topic.t1"].name, "topic.t1");
  t.is(ss1.endpoints["topic.t1"].topic, ss1.topicsByName.get("t1"));

  const ss2 = await sp.declareService({
    type: ServiceSwarm,
    name: "ss2",
    key,
    // bootstrap,
    endpoints: {
      "topic.t1": { connected: s2, announce: false }
    }
  });

  await Promise.all([ss1.start(), ss2.start()]);

  await new Promise(resolve => setTimeout(resolve, 10000));

  //t.is(ss1.endpoints["topic.t1"].isOpen, true, "ss1.topic.t1 isOpen");
  //t.is(ss2.endpoints["topic.t1"].isOpen, true, "ss2.topic.t1 isOpen");

  t.is(ss1.state, "running");
  t.is(ss2.state, "running");

  //s1.send("hello");
  await Promise.all([ss1.stop(), ss2.stop()]);

  t.is(ss1.state, "stopped");
  t.is(ss2.state, "stopped");
});
