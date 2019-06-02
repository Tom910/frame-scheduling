[![Build Status](https://travis-ci.org/Tom910/frame-scheduling.svg?branch=master)](https://travis-ci.org/Tom910/frame-scheduling)
[![Coverage Status](https://coveralls.io/repos/github/Tom910/frame-scheduling/badge.svg?branch=master)](https://coveralls.io/github/Tom910/frame-scheduling?branch=master)

# Frame Scheduling
A tiny module which allows run a non-blocking layout many tasks.

* **Fast.** Contains low overhead and optimized for running lots of tasks without drop fps
* **Small.** 930 B (minified and gzipped). No dependencies. It uses [Size Limit](https://github.com/ai/size-limit) to control size.
* **Priority** Separate tasks into different priorities. Try to complete priority tasks as quickly as possible.
* **Isomorphic.** work in browser and node js.


```js
import frameScheduling, { P_IMPORTANT } from 'frame-scheduling';

frameScheduling(() => { console.log('async task') });
```
[Demo](https://codesandbox.io/s/admiring-ride-jdoq0)

Asynchronous running tasks in JavaScript based on requestAnimationFrame. Supports priority and interrupt execution every 16 milliseconds, to achieve 60fps.

## Installation

```bash
# yarn
yarn add frame-scheduling

# npm
npm install --save frame-scheduling
```


## Priority
```js
import frameScheduling, { P_IMPORTANT, P_LOW } from 'frame-scheduling';
const result = [];

frameScheduling(() => { result.push('A') }, { priority: P_LOW })
frameScheduling(() => { result.push('B') })
frameScheduling(() => { result.push('C') }, { priority: P_IMPORTANT })
frameScheduling(() => { result.push('D') }, { priority: 1000 })

// after doing
console.log(result) // > ['D', 'C', 'B', 'A']
```
perform priority tasks first

### framing
```js
import frameScheduling from 'frame-scheduling';

frameScheduling(() => lightFunction()) // light < 1ms exec
frameScheduling(() => heavyFunction()) // heavy > 17ms exec
frameScheduling(() => heavyFunction2()) // heavy > 17ms exec
frameScheduling(() => lightFunction2()) // light < 1ms exec
frameScheduling(() => lightFunction3()) // light < 1ms exec

/*
Runs in frame
| lightFunction
| heavyFunction
    | heavyFunction2
        | lightFunction2
        | lightFunction3
*/
```
frame-scheduling aims to achieve 60 fps

## Options
#### priority: number = 5
It is possible to set the priority of the function. If the function has a low priority, then each execution skip adds +1 to the priority. Thus, low-priority tasks, when something is done.