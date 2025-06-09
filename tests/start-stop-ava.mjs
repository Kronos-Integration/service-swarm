import test from "ava";
import { initialize, wait, publicAddress } from "./helpers/util.mjs";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ReceiveEndpoint } from "@kronos-integration/endpoint";
import { ServiceSwarm } from "@kronos-integration/service-swarm";

test.skip("start / stop", async t => {
  const sp = new StandaloneServiceProvider();
  const key = "11-3232-334545-fff-ggff6f-gr-df58";
  const { dht, close } = await initialize();

  let peers1;

  const options = {
    receive: r => {
      console.log("receive", this, r);
      return "xxx";
    }
  };

  const s1 = new ReceiveEndpoint("s1", sp, {
    receive: r => {
      receive1 = r;
      return "xxx";
    }
  });

  const serviceSwarm1 = await sp.declareService({
    type: ServiceSwarm,
    name: "serviceSwarm1",
    server: true,
    logLevel: "trace",
    key,
    endpoints: {
      "topic.t1": {
        connected: s1
      },
      "peers.t1": {
        connected: new ReceiveEndpoint("peers@1", sp, {
          receive: peers => (peers1 = peers)
        })
      }
    }
  });

        /*
    */

  t.is(serviceSwarm1.endpoints["topic.t1"].name, "topic.t1");
  t.is(
    serviceSwarm1.endpoints["topic.t1"].topic,
    serviceSwarm1.topicsByName.get("t1")
  );
  t.true(
    serviceSwarm1.topicsByName
      .get("t1")
      .topicEndpoints.has(serviceSwarm1.endpoints["topic.t1"])
  );
  t.true(
    serviceSwarm1.topicsByName
      .get("t1")
      .peersEndpoints.has(serviceSwarm1.endpoints["peers.t1"])
  );

  const s2 = new ReceiveEndpoint("s2", sp, options);

  const serviceSwarm2 = await sp.declareService({
    type: ServiceSwarm,
    name: "serviceSwarm2",
    client: true,
    logLevel: "trace",
    key,
    dht,
    endpoints: {
      "topic.t1": { connected: s2, announce: false }
    }
  });

  await Promise.all([serviceSwarm1.start(), serviceSwarm2.start()]);

  t.is(serviceSwarm1.state, "running");
  t.is(serviceSwarm2.state, "running");

  t.true(serviceSwarm1.endpoints["topic.t1"].isConnected(s1));
  t.true(serviceSwarm2.endpoints["topic.t1"].isConnected(s2));

  console.log(await publicAddress());

  await wait(5000);

  t.truthy(peers1);
  //t.truthy(peers1.length > 1);

  console.log(peers1);

  //t.truthy(serviceSwarm1.endpoints["topic.t1"].sockets.length > 0);

  const response = await serviceSwarm1.endpoints["topic.t1"].send(
    "hello from serviceSwarm1.topic.t1"
  );

  await Promise.all([serviceSwarm1.stop(), serviceSwarm2.stop()]);

  t.is(serviceSwarm1.state, "stopped");
  t.is(serviceSwarm2.state, "stopped");

  await close();
});
