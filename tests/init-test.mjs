import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { SendEndpoint, ReceiveEndpoint } from "@kronos-integration/endpoint";

import { ServiceSwarm } from "@kronos-integration/service-swarm";

test("start / stop", async t => {
  const sp = new StandaloneServiceProvider();

  const key = "11-3232-334545-fff-ggff6f-gr-df58";

  const bootstrap = [`127.0.0.1:61418`];

  const options = {
    didConnect: endpoint => {
      console.log("connected", endpoint);
      return async () => {
        console.log("disconnect", r);
      };
    },
    receive: r => {
      console.log("XXX received", r);
      return "xxx";
    }
  };

  const s1 = new ReceiveEndpoint("s1", sp, options);
  const ps1 = new ReceiveEndpoint("ps1", sp, {
    receive: peers => {
      console.log("peers received", peers);
    }
  });

  const ss1 = await sp.declareService({
    type: ServiceSwarm,
    name: "ss1",
    key,
    endpoints: {
      "topic.t1": {
        connected: s1
      },
      "peers.t1": {
        connected: ps1
      }
    }
  });

  t.is(ss1.endpoints["topic.t1"].name, "topic.t1");
  t.is(ss1.endpoints["topic.t1"].topic, ss1.topicsByName.get("t1"));
  t.true(
    ss1.topicsByName.get("t1").topicEndpoints.has(ss1.endpoints["topic.t1"])
  );
  t.true(
    ss1.topicsByName.get("t1").peersEndpoints.has(ss1.endpoints["peers.t1"])
  );

  const s2 = new ReceiveEndpoint("s2", sp, options);

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

  await new Promise(resolve => setTimeout(resolve, 50000));

  t.is(ss1.state, "running");
  t.is(ss2.state, "running");

  t.true(ss1.endpoints["topic.t1"].isConnected(s1));
  t.true(ss2.endpoints["topic.t1"].isConnected(s2));

  //t.truthy(ss1.endpoints["topic.t1"].sockets.length > 0);

  ss1.endpoints["topic.t1"].send("hello from ss1.topic.t1");

  /*
  t.is(ss1.endpoints["topic.t1"].isOpen, true, "ss1.topic.t1 isOpen");
  t.is(ss2.endpoints["topic.t1"].isOpen, true, "ss2.topic.t1 isOpen");
  */

  //s1.send("hello");
  await Promise.all([ss1.stop(), ss2.stop()]);

  t.is(ss1.state, "stopped");
  t.is(ss2.state, "stopped");
});
