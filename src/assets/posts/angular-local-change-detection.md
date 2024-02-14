## Distilled
- Reactive nodes
- Reactive graph
- PUSH - POLL - PULL algorithm
- Local change detection

### How do we sychronize state between view and model?
- Change detection in Angular is the process of automatically monitoring and updating the user interface to reflect changes in the application's model

### Zone.JS
#zone-js
- Monkey patches Javascript events

- Downsides
  - Doesn't deliver detailed information about where the change happened. Zone.js can only notify us when something might have happened in the app. The problem is in the ‘might’. Zone.js is not capable of giving us more information about what happened, where, and what has changed.
  - Doesn't work with all native APIs
  - Potential for many change detections run
  - Intial load cost

-> Some techniques exist already to improve this issue with `pure pipes` and components with `onPush strategy` but this is not sufficient.

### Angular component tree

- Default change dectection strategy
```plaintext
App ✓
  Products ✓
    ProductList ✓
      ProductDetails ✓  (Change happens 🖱️)
  
  Customer ✓
    CustomerSearch ✓
      CustomerSearchFilter ✓
    CustomerList ✓
      CustomerItem ✓
```

Let's say we have change that happens in the product details. Now what is going to happen is a click happens and ZoneJS patches that click event, so ZoneJS kicks in and tells Angular, hey Angular something changed, please go figure out what changed. But he doesn't deliver information where the change happend, so he just said go figure out Angular.
He does it by doing `appRef.tick()` which is basically the function that invokes change detection. So what Angular then does it reverses the component tree, so it goes through the tree and dirty check each component with previous state against the current state.

- OnPush change dectection strategy
```plaintext
App 🔴
  Products (OnPush) 🔴
    ProductList (OnPush) 🔴
      ProductDetails (OnPush) 🔴  (Change happens 🖱️)
  
  Customer (OnPush)
    CustomerSearch (OnPush)
      CustomerSearchFilter (OnPush)
    CustomerList (OnPush)
      CustomerItem (onpush)
```
Let's see how the application is impacted by having OnPush component.
Let's say we still have a click on the product details component, if click happens and now what is going to happen is mark those components as dirty, so that they are checked during the next change detection. ZoneJs then kicks in, but here comes to difference tot the default change detection strategy, we only check the one with the red dots.


BUT if we think about this is still not fully optimal because actually what we have is wouldn't it be cool if we would directly check for the product details so if the change happens in the product details we could go to product details and only check there.


### Change detection approaches
- Classic change detection
Top -> bottom approach
We start from the root component and traverse the tree to figure out what changed. And we do that in a default change detection and in OnPush

- Local change detection

### New reactive primitive - SINGALS
- Fine grained information about model changes
- Synchrounous data access
- Glitch-free execution
- Automatic dependency tracking

Angular signals are eager push and lazy pull based reactive primitive for Angular

#### Reactive nodes
- Consumer: represents a reactive context that depends on producers
- Producer: deliver change notification to consumers
Producers produce reactivity, consumers consume reactivity
Consumers and producers form a graph
This graph is the base for the PUSH -> POLL -> PULL algorithm [[Demystifying the Push - Pull nature of Angular Signals]]

  - Writable signal: producer
  - Computed signal: consumer / producer & consumer
    A computed signal on the other hand is a consumer because it consumes some values that are produced by producers by a writable signal.
    But at the same time, it's also producing new value. So a computed is basically used to calculate derived values. So therefore, a computed signal is
    a producer and consumer depends on if that value is again used.
  - Effect: consumer

#### Signal behind the scenes
```javascript
const counter = signal(0);
const isEven = computed(() => couter() % 2 === 0);
effect(() => console.log('Is even: ', isEven()));
couter.update((c) => c + 1);
```
**Graph update**
- Each producer has a version and the value, so internally each producer stores a version and a value. So a version is just a counter that is incremented, the value is the actual value you start with. So we start with a writable signal of 0. Then the other interesting thing is each producer also has a list of consumers so it stores a reference to its consumers. The consumers on the other hand, they store a reference to the producer. So we have this two-way dependecy graph. And the reference to the producer in addition to that reference they also store the version and the value.

- Basically, `isEven`, we can see that the producer has a reference to the count signal but it also stores the version and the value. And same for the effect. And we will see later why this is important. Because now we have basically an algorithm in two phrases.

**Fist phrase / push**
So the first thing is we do `counter.update` and we update by basically using the callback where we increment the counter value on our writable signal.
So now what is going to happen is the `version` gets set to `2` and the `value` is updated to `1`. And then basically we have the graph and we push dirtiness across that graph. And that's everything that is happening when we do the `update`, so that's the eager update. But nothing else is happening, so nobody is notified nothing.

**Second phrase / poll - pull**
- At some point, you either read your signal or Angular basically calls the effects. So the effects are always called by Angular, they are scheduled behind the scene, and you are guaranteed that an effect runs at least once.
- This is the Poll - Pull phrase. So the effect starts and pulls the consumer, then that consumer pull the writable signal (the counter signal in this case). And during that polling they compare is the version that signal has the same that I stored for that signal. So we can see that basically the `isEven` has stored `version = 1` and `value = 0`. But on the `counter`, it's actually `version = 2` and `value = 1`. So it actually just compares the `version`. So he knows that I have stored `1` but he is on `version = 2`, so probably something has changed. And if he knows something has changed, he **pull** the new value. So he pulls one, he recomputes his value, he updates his version. And the same happen for the `effect`.


**Simplified mental model**
So you have an `effect` that poll `isEven` and then recursion. Basically you have a recursion here where `isEven` poll the `counter` and if necessary, so if the version changed, you pull the value, recompute yourself, you update the value and version.


The PUSH -> POLL -> PULL algorithm guarantees lazy and glitch-free execution.

### Local change detection

