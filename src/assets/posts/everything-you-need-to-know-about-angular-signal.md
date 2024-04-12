## Signal in a nutshell
```javascript
let x = 5;
let y = 3;
let z = x + y;
console.log(z); // 8
x = 10;
console.log(z); // 8
```
- Value is assigned when the expression is first evalueated
- Z does not react to changes in x or y

How do we react to changes? One option is use getter
```javascript
let x = 5;
let y = 3;
console.log(z); // 8
x = 10;
console.log(z); // 13

get z() {
  return x + y;
}
```

**Signals**
```javascript
const x = signal(5);
const y = signal(3);
const z = computed(() => x() + y());
console.log(z()); // 8

x.set(10);
console.log(z()); // 13
```

## Why
- Signals provide a new way for our code to tell our templates (and other code) that our data has changed
- Provide more reactivity
- Finer control over change detection


## What
`Signal = value + change notification`

With signals, when we declare a signal that signal value is encapsulated. It's like putting the value in a box. When the signal changes, the box glows providing notification of the change. Any code that references the signal is notified of the change and can react appropriatey. If a template reads the signal that template is scheduled for re-rendering and the current value of signal is displayed

- Signals are reactive
- A signal always has a value
- A signal is side effect free
  - Reading a signal can cause no other changes nor execute any other code

- A signal created with the `signal()` constructor function is writable
- The signal value can be:
  - Set to new value
  - Updated based on its current value

- Reading a signal "opens the box" to get the current value `hero()`. Technically speaking, it's calling the signal's `getter` function



- Signals are integrated into the existing change detection model
  - Signals will mark OnPush components for check (similar to the async pipe)


`set` & `update`
- Setting a signal replaces the value in the box with a new value
- Notifies any consumer* that the signal changed
  - *Consumer -> Any code that's interested in notifications when the signal changes
- Those consumers update when it's their turn to execute

How does our code show it's interested and receiving notifications?

- React to changes
```javascript
onSomeEvent(qty: number) {
  this.quantity.set(qty);
  this.quantity.set(9);
  this.quantity.set(99);
}
```
It's important to note that a signal does nto emit values, so it isn't like an observable.
If a signal changes multiple times before the value is read, the consumers will only see the current or most recent value. When it's time to re-render the template `{{quantity()}}`, only displays the current value when change detection is run `42`. It knows nothing about prior signal values

This also applied to `effect`


### Computed signal
- Creates a new singal that depends on other signals
- A computed signal is read only
- It cannot be modified with set(), update()
- Value is re-computed when:
  - One (or more) of its dependent signals is changed
  - AND the value is read
- The computed value is memoized, meaning it sotres the computed result
- That computed value is reused next time the computed value is read


### effect
- Think of it like Observable tap operator
- That automatically "subscribes" to the signal
- Does not change the value in the box
- The effect function is run when:
 - One (or more) of its dependent signals is changed
 - AND it's tthis code's turn to execute

- When to use Effect?
  - Logging
  - External APIs (not RxJS)


- The way `effect` is trigger
```javascript
const source = signal(1)
effect(() => console.log('Signal'));
setTimeout(() => source.set(2), 1);
```

The `effect` will be triggered on start and when its dependencies change


### signals and templates
```html
<div>Total: {{ exPrice() }}</div>
```
- During template rendering:
  - Reading a signal returns the signal value
  - Also registers the singal as a dependency of the view
  - If the signal changes, the view is re-rendered
    

### Signals vs. Observables
- Observables emit data
- Signals hold the data value


### Computed Signals + Effect Signals -> Tracking dependencies -> Dependency graph
