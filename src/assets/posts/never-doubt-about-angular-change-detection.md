- Angular component tree


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


#### OnPush
- `markForChecked`


#### Local Change Detection


#### Local Change Detection without ZoneJS
