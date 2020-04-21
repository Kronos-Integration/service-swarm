import test from "ava";
import {
  StandaloneServiceProvider,
  InitializationContext
} from "@kronos-integration/service";
import { ServiceSwarm } from "../src/service-swarm.mjs";

test("start / stop", async t => {
  const sp = new StandaloneServiceProvider();
  const ic = new InitializationContext(sp);

  const topic = "11-3232-334545-fff-ggff6f-gr-dff5";

  const bootstrap = [`127.0.0.1:61418`];

  const ss1 = new ServiceSwarm({ topic }, ic);
  const ss2 = new ServiceSwarm({ topic, bootstrap }, ic);

  await Promise.all([ss1.start(), ss2.start()]);

  await new Promise(resolve => setTimeout(resolve, 1500));

  t.is(ss1.state, "running");
  t.is(ss2.state, "running");

  await Promise.all([ss1.stop(), ss2.stop()]);

  t.is(ss1.state, "stopped");
  t.is(ss2.state, "stopped");
});
