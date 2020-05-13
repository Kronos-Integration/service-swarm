[![npm](https://img.shields.io/npm/v/@kronos-integration/service-swarm.svg)](https://www.npmjs.com/package/@kronos-integration/service-swarm)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/@kronos-integration/service-swarm)](https://bundlephobia.com/result?p=@kronos-integration/service-swarm)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/service-swarm.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/service-swarm)
[![Build Action Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Fservice-swarm%2Fbadge&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/service-swarm/goto)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/service-swarm.git)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/service-swarm/badge.svg)](https://snyk.io/test/github/Kronos-Integration/service-swarm)
[![codecov.io](http://codecov.io/github/Kronos-Integration/service-swarm/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/service-swarm?branch=master)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/service-swarm/badge.svg)](https://coveralls.io/r/Kronos-Integration/service-swarm)

# @kronos-integration/service-swarm

Manage a set of remote services

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [ServiceSwarm](#serviceswarm)
    -   [endpointFactoryFromConfig](#endpointfactoryfromconfig)
        -   [Parameters](#parameters)
    -   [name](#name)
-   [Topic](#topic)
    -   [Parameters](#parameters-1)
    -   [Properties](#properties)
-   [TOPIC_NAME_PREFIX](#topic_name_prefix)
-   [TopicEndpoint](#topicendpoint)
    -   [Parameters](#parameters-2)
    -   [Properties](#properties-1)
-   [PEERS_NAME_PREFIX](#peers_name_prefix)
-   [PeersEndpoint](#peersendpoint)
    -   [Parameters](#parameters-3)
    -   [Properties](#properties-2)

## ServiceSwarm

**Extends Service**

swarm detecting sync service

### endpointFactoryFromConfig

on demand create topic endpoints

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `definition` **([Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** 
-   `ic`  

Returns **Class** TopicEndpoint if name starts with 'topic.'

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'swarm'

## Topic

### Parameters

-   `service` **[ServiceSwarm](#serviceswarm)** 
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)

### Properties

-   `service` **[ServiceSwarm](#serviceswarm)** 
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `key` **[Buffer](https://nodejs.org/api/buffer.html)** 

## TOPIC_NAME_PREFIX

Endpoint name prefix for topic endpoints

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## TopicEndpoint

**Extends SendEndpoint**

Endpoint to link against a swarm topic

### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** endpoint name
-   `owner` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** owner of the endpoint
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.topic` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** defaults to endpoint name (without @see TOPIC_NAME_PREFIX)

### Properties

-   `topic` **[Topic](#topic)** 

## PEERS_NAME_PREFIX

Endpoint name prefix for peers endpoints

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## PeersEndpoint

**Extends SendEndpoint**

Endpoint to link against a swarm topic

### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** endpoint name
-   `owner` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** owner of the endpoint
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.topic` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** defaults to endpoint name (without @see PEERS_NAME_PREFIX)

### Properties

-   `topic` **[Topic](#topic)** 

# install

With [npm](http://npmjs.org) do:

```shell
npm install @kronos-integration/service-swarm
```

# license

BSD-2-Clause
