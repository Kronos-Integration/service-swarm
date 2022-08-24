[![npm](https://img.shields.io/npm/v/@kronos-integration/service-swarm.svg)](https://www.npmjs.com/package/@kronos-integration/service-swarm)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=@kronos-integration/service-swarm)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/service-swarm.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/service-swarm)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/service-swarm.svg?style=flat-square)](https://github.com/Kronos-Integration/service-swarm/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Fservice-swarm%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/service-swarm/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/service-swarm/badge.svg)](https://snyk.io/test/github/Kronos-Integration/service-swarm)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/service-swarm/badge.svg)](https://coveralls.io/github/Kronos-Integration/service-swarm)

# @kronos-integration/service-swarm

Manage a set of remote services

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [PEERS\_NAME\_PREFIX](#peers_name_prefix)
*   [PeersEndpoint](#peersendpoint)
    *   [Parameters](#parameters)
    *   [Properties](#properties)
*   [ServiceSwarm](#serviceswarm)
    *   [endpointFactoryFromConfig](#endpointfactoryfromconfig)
        *   [Parameters](#parameters-1)
    *   [name](#name)
*   [TOPIC\_NAME\_PREFIX](#topic_name_prefix)
*   [TopicEndpoint](#topicendpoint)
    *   [Parameters](#parameters-2)
    *   [Properties](#properties-1)
*   [Topic](#topic)
    *   [Parameters](#parameters-3)
    *   [Properties](#properties-2)

## PEERS\_NAME\_PREFIX

Endpoint name prefix for peers endpoints.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## PeersEndpoint

**Extends MultiSendEndpoint**

Endpoint to link against a swarm topic.

### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** endpoint name
*   `owner` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** owner of the endpoint
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)

    *   `options.topic` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** defaults to endpoint name (without @see PEERS\_NAME\_PREFIX)

### Properties

*   `topic` **[Topic](#topic)**&#x20;

## ServiceSwarm

**Extends Service**

Swarm detecting sync service.

### endpointFactoryFromConfig

On demand create topic endpoints.

#### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `definition` **([Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**&#x20;
*   `ic` &#x20;

Returns **Class** TopicEndpoint if name starts with 'topic.'

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'swarm'

## TOPIC\_NAME\_PREFIX

Endpoint name prefix for topic endpoints.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## TopicEndpoint

**Extends MultiSendEndpoint**

Endpoint to link against a swarm topic.

### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** endpoint name
*   `owner` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** owner of the endpoint
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)

    *   `options.topic` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** defaults to endpoint name (without @see TOPIC\_NAME\_PREFIX)

### Properties

*   `topic` **[Topic](#topic)**&#x20;

## Topic

### Parameters

*   `service` **[ServiceSwarm](#serviceswarm)**&#x20;
*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)

### Properties

*   `service` **[ServiceSwarm](#serviceswarm)**&#x20;
*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `key` **[Buffer](https://nodejs.org/api/buffer.html)**&#x20;
*   `topicEndpoints` **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)\<TopicEndppoint>**&#x20;
*   `peerEndpoints` **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)\<PeerEndpoint>**&#x20;

# install

With [npm](http://npmjs.org) do:

```shell
npm install @kronos-integration/service-swarm
```

# license

BSD-2-Clause
