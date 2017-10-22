# Frame Scheduling

```js
import frameScheduling, { P_IMPORTANT } from 'frame-scheduling';
// And export module...
frameScheduling(() => { Action() }, { priority: P_IMPORTANT });
```

Asynchronous running tasks in JavaScript. Supports priority and interrupt execution every 16 milliseconds, to achieve 60fps.

## Usage

```js
frameScheduling(callback: Function)
frameScheduling(callback: Function, { priority: number }) // priority default = 5
```

#### Options
##### priority: number = 5
It is possible to set the priority of the function. If the function has a low priority, then each execution skip adds +1 to the priority. Thus, low-priority tasks, when something is done.