## Definition
Angular Signals are `eager push` / `lazy pull` based reactive primitive for Angular!


## Mental Models
- REACTIVE CONTEXT AND REACTIVE GRAPH
- PRODUCER vs CONSUMER (NON LIVE / LIVE / TRANSITIVE LIVE)
- PUSH vs POLL PULL? (algorithm and phrase)
- EAGER vs LAZY
- EQUALITY & VALUE VERSION (POLL)


## Signals reactivity
```javascript
const count = signal(0);

console.log(count());

count.set(1);
count.set(2);
count.update(current => current + 1);

// What will be the log output?
// 0, only once, but why?!

```
- Reading signal pulls the current value
- Updating signal sends eager push notification that its value might have changed (dirtiness)
- Only reactive live consumers get notified
- The console.log() is not a live reactive consumer!

## Angular Signals reactive graph
### Reactive context
```javascript
computed(() => {
  // reading signals here !
  return this.counter() % 2 === 0;
});

effect(() => {
  // reading signals here !
  console.log(this.counter());
});

@Component({
  template: `{{ counter() }}` // also here !
})
```

- Whenever we are reading a signal value or a pulling value out of signal inside of the computed implementation function called computation function or in the effect implemenation function or even in Angular template, we are inside of a reactive context.
- Somewhere behind the scenes, Angular needs to know or especially Angular reactive graph needs to know that we are currently running the callback inside of the computed or inside of the effect or in the template and that way it can create that connection inside of the reactive graph

```javascript
/**
 * The currently active consumer `ReactiveNode`, if running code in a reactive context.
 *
 * Change this via `setActiveConsumer`.
 */
let activeConsumer: ReactiveNode|null = null;
```
- Global variable which stores the active consumer, so that means whenever we start executing this function then this computed will be set as an active consumer and then whenever we are accessing that value of the signal, it will create an edge inside of that react graph connecting two of them together.

- **Accessing Signal value (pull) in reactive context (eg effect) creates new edge in reactive graph**
- **Angular reactive graph consists of producers who push dirtiness and consumers who `pull*` current value**

### Reactive graph for computed (non live consumer)
```javascript
@Component()
export class CounterComponent {
  counter = signal(0);

  isEven = computed(() => this.counter() % 2 === 0);

  ngOnInIt() { console.log(this.isEven()); }
}
```
- Pulling Singal value in a non-live consumer will create unidirectional reference from non-live consumer to the producer, no dirtiness will be pushed

### Reactive graph for effect (live consumer)
So the typical example is `effect` but also `Angular template`
```javascript
@Component()
export class CounterComponent {
  counter = signal(0);

  constructor() {
    effect(() => {
      console.log('counter value is', this.counter());
    });
  }
}
```
- Pulling Signal value in a `live consumer` will create bi-direction reference, eager push (producer) and `lazy pull*` (live consumer)


### Reactive graph for computed (transitive live consumer)
A computed which became live because it was used in another live consumer like effect or a template which makes it transitive live consumer.

```javascript
@Component()
export class CounterComponent {
  counter = signal(0);
  isEven = computed(() => this.counter() % 2 === 0);

  constructor() {
    effect(() => {
      console.log('effect is even', this.isEven());
    })
  }
}
```

- The computed will become live consumer with bi-direction reference if it's consumed by other live consumer (effect or template)

### Sum up
- Not everything about Angular Signals is reactve in BOTH directions! (push vs pull)
- Only LIVE (and TRANSITIVE LIVE) CONSUMERS are bi-drectional
  - effect
  - template
  - computed as long as is used in transitively in
    - effect
    - template

## Seperation of PUSH vs PULL phases
```javascript
@Component()
export class CounterComponent {
  counter = signal(0);
  
  constructor() {
    effect(() => {
      console.log('effect', this.counter()) // ??
    });

    this.counter.set(1);
    this.counter.update(current => current + 1);
  }
}
```

- Effect schedules itself on the microtask queue and this code runs synchronously at like constructor time.
So what does that mean? 
We define a signal and a effect. The signal starts as dirty and it schedules its own run in the microtask queue.
Then still synchronously we set the value to one and then update the value by plus 1.
So those singals definitely push the dirtiness through the reactive graph but the thing is because this effect didn't run yet, this signal was not yet added as a dependency inside of that reactive graph. So those are basically ignored and even the dirtiness was not really pushed because there was no edge in the graph yet. So only after this effect actually runs it will access the value of the counter for the first time and only then the edge in that reactive graph between the counter signal as a producer and effect as a consumer will be created. This also means we are going to get the latest value of that counter signal when the effect ran for the first time.


## Laziness, polling, value versions...
```javascript
export class App {
  counter = signal(0);

  isEven = computed(() => {
    console.log('[computed] isEven');
    return this.counter() % 2 === 0;
  });

  constructor() {
    effect(() => {
      console.log('[effect] isEven', this.isEven());
    })
  }

  increment(amount = 1) {
    this.counter.update((current) => current + amount);
  }

  reset() {
    this.counter.set(0);
  }
}
```

### PUSH / POLL PULL? ALGORITHM

### Laziness summary
- Laziness applies to the POLL PULL? phase of the reactive algorithm
- Consumers POLL the produers to see if their value (version) has changed
- The computed can be both producer and consumer as we move through the graph
- Polling will re-run some producers (eg computed)
- Consumers don't 'run' if the value version of producer stays the same (after poll)

"Always be mindful of the fact that computed and effects are lazy"



## What is the current role of Zone.js?
### Signals in Angular (today)
```javascript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ counter() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  counter = signal(0);

  increment(): void {
    this.counter.update(count => count + 1);
  }
}
```

- What happens when user clicks on the button?
- The components template is live consumers
- Clicking on button updates the signal value, sends eager push notification that its value might have changed
- The template is notified and marks itself as dirty and all its ancestor for traversal (NEW)
- But none of the above matters in this case today!
- Click marks component (and all its ancestors) as dirty and then Zone.js takes over

```javascript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ counter() }}</p>
  `
})
export class CounterComponent {
  counter = signal(0);

  constructor(): void {
    setTimeout(() => {
      this.counter.update(count => count + 1);
    }, 5000)
  }
}
```

- What happens when user clicks on the button?
- The components template is live consumers
- Clicking on button updates the signal value, sends eager push notification that its value might have changed
- The template is notified and marks itself as dirty and all its ancestor for traversal (NEW)
- Zone.js & change detection (will skipp components marked for traversal only)


