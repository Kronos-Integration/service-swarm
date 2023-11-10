import test from "ava";

import { TopicEndpoint } from "../src/topic-endpoint.mjs";
import { PeersEndpoint } from "../src/peers-endpoint.mjs";
import { Topic } from "../src/topic.mjs";

test("topic endpoint", t => {
  let topic;
  const service = {
    createTopic() {
      return topic;
    }
  };

  topic = new Topic(service, "t1");

  const e = new TopicEndpoint("e1", service);
  t.deepEqual(e.sockets, new Set());

  t.deepEqual(e.toJSON(), {
    in: true,
    out: true,
    topic: {
      name: "t1",
      server: false,
      client: true,
      sockets: 0,
      peers: []
    },
    sockets: 0
  });
});

test("peers endpoint", t => {
  let topic;
  const service = {
    createTopic() {
      return topic;
    }
  };

  topic = new Topic(service, "t1");

  const e = new PeersEndpoint("e1", service);

  t.deepEqual(e.toJSON(), {
    out: true,
    topic: {
      name: "t1",
      server: false,
      client: true,
      sockets: 0,
      peers: []
    }
  });
});
