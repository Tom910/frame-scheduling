# Frame Scheduling

[![Build Status](https://travis-ci.org/Tom910/frame-scheduling.svg?branch=master)](https://travis-ci.org/Tom910/frame-scheduling)
[![Coverage Status](https://coveralls.io/repos/github/Tom910/frame-scheduling/badge.svg?branch=master)](https://coveralls.io/github/Tom910/frame-scheduling?branch=master)

```js
import frameScheduling, { P_IMPORTANT } from 'frame-scheduling';

frameScheduling(() => { Action() }, { priority: P_IMPORTANT });
```

Asynchronous running tasks in JavaScript based on requestAnimationFrame. Supports priority and interrupt execution every 16 milliseconds, to achieve 60fps.

## Installation

```bash
# yarn
yarn add frame-scheduling

# npm
npm install --save frame-scheduling
```

## Example
### Priority
```js
import frameScheduling, { P_IMPORTANT, P_LOW } from 'frame-scheduling';
const result = [];

frameScheduling(() => { result.push('Ember') }, { priority: P_LOW })
frameScheduling(() => { result.push('Angular') })
frameScheduling(() => { result.push('React') }, { priority: P_IMPORTANT })

console.log(result) // > ['React', 'Angular', 'Ember']
```

### framing
```js
import frameScheduling from 'frame-scheduling';

frameScheduling(() => 'function 1') // light < 1ms exec
frameScheduling(() => 'function 2') // heavy > 17ms exec
frameScheduling(() => 'function 3') // heavy > 17ms exec
frameScheduling(() => 'function 4') // light < 1ms exec
frameScheduling(() => 'function 5') // light < 1ms exec

/*
Runs in frame
| function 1
| function 2
    | function 3
        | function 4
        | function 5
*/
```

## Options
#### priority: number = 5
It is possible to set the priority of the function. If the function has a low priority, then each execution skip adds +1 to the priority. Thus, low-priority tasks, when something is done.