# Must READ
https://medium.com/angular-in-depth/angular-ivy-change-detection-execution-are-you-prepared-ab68d4231f2c
https://alexzuza.github.io/ivy-cd/

- Angular component tree

- But, how does Angular know when to refresh the view? How does it know when the data changes? How does it know when to run the change detection?


### ZoneJS
- Monkey patches Javascript events
- Process of detecting changes
  - `appRef.tick()`
  - ZoneJS doesn't deliver any information about where the change happens. It just tells Angular something changed, please go ahead and figure out what changed.
  - Then Angular goes ahead and traverses the component tree and dirty checking.
  - Dirty checking:
    - It dirty checks basically the previous value of the model against the current value
    - If something changed, Angular knows he has to update the view
    - Then Angular continues traversing the tree and goes futher down to the last child

- ZoneJS enables us to run our code before and after the brower events. Let hook into the `setTimeout` callback
```javascript
const zone = Zone.current.fork({
  onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
    console.log('Before setTimeout');
    delegate.invokeTask(target, task, applyThis, applyArgs);
    console.log('After setTimeout');
  }
})

zone.run(() => {
  setTimeout(() => {
    console.log('Hello world');
  }, 1000);
});
```


### When does ZoneJS kick in Angular change detection?
- When should change detection happen?
  - As soon as an application state chagnes
  - What can cause state change?
    - Event callback
    - Network (XHR) call
    - Timers (setTimeout, setInterval)

- NgZone includes an Observable called onMicrotaskEmpty. This observable emits a value when there are no more microtasks in the queue. And that’s what Angular uses to know when all the asynchronous code is finished running and it can safely run the change detection.

```javascript
// ng_zone_scheduling.ts NgZoneChangeDetectionScheduler
this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
    next: () => this.zone.run(() => this.applicationRef.tick())
});
```

- `applicationRef.tick()` runs the change detection for the whole component tree synchronously.
But now, Angular knows that all the asynchronous code has finished running and it can safely run the change detection.

```javascript
tick(): void {
    // code removed for brevity
    for (let view of this._views) {
        // runs the change detection for a single component
        view.detectChanges(); 
    }
}
```

### Component Dirty marking
One other thing Angular does is that it marks the component as dirty when it knows something inside the component changed.

These are the things that mark the component as dirty:

- Events (click, mouseover, etc.)

Every time we click a button with a listener in the template, Angular will wrap the callback function with a function called [wrapListenerIn_markDirtyAndPreventDefault](https://github.com/angular/angular/blob/c4de4e1f894001d8f80b70297c5e576f2d11ec6f/packages/core/src/render3/instructions/listener.ts#L260). And as we can see from the name of the function 😅, it will mark the component as dirty.


```javascript
function wrapListener(): EventListener {
  return function wrapListenerIn_markDirtyAndPreventDefault(e: any) {
    // ... code removed for brevity
    markViewDirty(startView); // mark the component as dirty
  };
}
```

- Change inputs

Also, while running the change detection, Angular will check if the input value of a component has changed (=== check). If it has changed, it will mark the component as dirty.
https://github.com/angular/angular/blob/c4de4e1f894001d8f80b70297c5e576f2d11ec6f/packages/core/src/render3/component_ref.ts#L348
```javascript
setInput(name: string, value: unknown): void {
    // Do not set the input if it is the same as the last value
    if (Object.is(this.previousInputValues.get(name), value)) {
        return;
    }

    // code removed for brevity
    setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
    markViewDirty(childComponentLView); // mark the component as dirty
}
```

- Output emissions

To listen to output emissions in Angular we register an event in the template. As we saw before, the callback fn will be wrapped and when the event is emitted, the component will be marked as dirty.



### markViewDirty
```javascript
/**
 * Marks current view and all ancestors dirty.
 */
export function markViewDirty(lView: LView): LView|null {
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty;
    const parent = getLViewParent(lView);
    // Stop traversing up as soon as you find a root view that wasn't attached to any container
    if (isRootView(lView) && !parent) {
      return lView;
    }
    // continue otherwise
    lView = parent!;
  }
  return null;
}

```

### Angular change detection
- The process of trigger change detection
  - So, when we click the button, Angular will call our callback fn (changeName) and because it’s wrapped with the wrapListenerIn_markDirtyAndPreventDefault function, it will mark the component as dirty.
  - After dirty marking to the top, wrapListenerIn_markDirtyAndPreventDefault fires and triggers zone.javascript  - Because Angular is listening to the onMicrotaskEmpty observable, and because the (click) registers an event listener, which zone has wrapped, zone will know that the event listener has finished running and it can emit a value to the onMicrotaskEmpty observable.
  - onMicrotaskEmpty tells Angular it’s time to run the change detection.


- Angular will only run the change detection for a component that is marked as dirty.

### OnPush + Observables + async pipe
When we work with Angular, observables have been our number one tool to manage data and state changes. To support observables, Angular provides the async pipe. The async pipe subscribes to an observable and returns the latest value. To let Angular know that the value has changed, it will call the markForCheck method that comes from the ChangeDetectorRef class (the component’s ChangeDetectorRef).
```javascript
@Pipe()
export class AsyncPipe implements OnDestroy, PipeTransform {
  constructor(ref: ChangeDetectorRef) {}

  transform<T>(obj: Observable<T>): T|null {
    // code removed for brevity
  }

  private _updateLatestValue(async: any, value: Object): void {
    // code removed for brevity
    this._ref!.markForCheck(); // <-- marks component for check
  }
}
```

And what the markForCheck method does is that it will just call the markViewDirty function that we saw before.

```javascript
// view_ref.ts
markForCheck(): void {
  markViewDirty(this._cdRefInjectingView || this._lView);
}
```


### OnPush + Observables + Who is triggering zone.js?
If our data changes without our interaction (click, mouseover etc.) probably there is a setTimeout or setInterval or an HTTP call being made somewhere under the hood that triggers zone.js.

Here’s how we can easily break it 🧨

```javascript
@Component({
  selector: 'todos',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `{{ todos$ | async | json }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);

  todos$ = of([] as any[]);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // this will be updated, but there's nothing triggering zonejs
        this.todos$ = this.getTodos();
      });
    });
  }

  getTodos() {
    return this.http
      .get<any>('https://jsonplaceholder.typicode.com/todos/1')
      .pipe(shareReplay(1));
  }
}
```
What we have done here is:

- In ngOnInit, we have used ngZone.runOutsideAngular() an API that allows us to run things outside the Angular zone.
- We use setTimeout (to skip the first task being run and also because Angular runs change detection at least once by default) and inside the setTimeout, we assign a value to the observable (yay we have a change).
- Because setTimeout won’t run inside the zone, also the API call will be made outside the zone because the code is run inside runOutsideAngular, there is nothing notifying zonejs that something changed.
- Run this code in your app and see that only “[]” will be shown in the browser.
- Broken State 🧨!

### Why do we need to mark all the ancestors dirty?
So, we mark only the component that had the click and its children to be marked for check. The moment the tick happens it will get to the parent component which is OnPush, check that it’s not dirty, and skip it.
Onpush + Non-Dirty -> Skip

### markForCheck vs detectChanges (coalesced run vs sync runs)
When we use markForCheck we just tell Angular that a component is dirty, and nothing else happens, so even if we call markForCheck 1000 times it’s not going to be an issue. But, when we use detectChanges, Angular will do actual work like checking bindings and updating the view if needed. And that’s why we should use markForCheck instead of detectChanges.


#### OnPush
- `markForChecked`

If the component is:
- OnPush + Non-Dirty -> Skip
- OnPush + Dirty -> Check bindings -> Refresh bindings -> Check children


#### Local Change Detection


#### Local Change Detection without ZoneJS



### Never doubt questions
1. Why do Angular need to change detection for the whole component tree?
- Because we may updated some data in a service that is used by other components

2. Why can’t we just run the change detection for the component that is marked as dirty?
- We can do that using the detectChanges method in the ChangeDetectorRef class. But it has its drawbacks. Because that method runs change detection synchronously, it can cause performance issues. Because everything will be done in the same browser task, it may block the main thread and cause jank. Imagine detecting changes for a list of 100 items every 1 or 2 seconds. That’s a lot of work for the browser.


### Reference
https://itnext.io/a-change-detection-zone-js-zoneless-local-change-detection-and-signals-story-9344079c3b9d
