import test from "ava";
import {
  StandaloneServiceProvider,
  InitializationContext
} from "@kronos-integration/service";
import { ServiceSwarm } from "../src/service-swarm.mjs";

test("start", async t => {
  const sp = new StandaloneServiceProvider();
  const ic = new InitializationContext(sp);

  const ss = new ServiceSwarm(
    {
    },
    ic
  );

  await ss.start();

  await new Promise((resolve) => setTimeout(resolve,1500));

  t.is(ss.state, 'running');
});

