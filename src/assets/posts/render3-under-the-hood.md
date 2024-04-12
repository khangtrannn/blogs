# View
```javascript

/** Flags associated with an LView (saved in LView[FLAGS]) */
export const enum LViewFlags {
  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  CreationMode = 1 << 2,

  /**
   * Whether or not this LView instance is on its first processing pass.
   *
   * An LView instance is considered to be on its "first pass" until it
   * has completed one creation mode run and one update mode run. At this
   * time, the flag is turned off.
   */
  FirstLViewPass = 1 << 3,

  /** Whether this view has default change detection strategy (checks always) or onPush */
  CheckAlways = 1 << 4,

  /** Whether or not this view is currently dirty (needing check) */
  Dirty = 1 << 6,

  /**
   * Whether this moved LView was needs to be refreshed. Similar to the Dirty flag, but used for
   * transplanted and signal views where the parent/ancestor views are not marked dirty as well.
   * i.e. "Refresh just this view". Used in conjunction with the HAS_CHILD_VIEWS_TO_REFRESH
   * flag.
   */
  RefreshView = 1 << 10,

  /** Indicates that the view was created with `signals: true`. */
  SignalView = 1 << 12,

  /**
   * Indicates that this LView has a view underneath it that needs to be refreshed during change
   * detection. This flag indicates that even if this view is not dirty itself, we still need to
   * traverse its children during change detection.
   */
  HasChildViewsToRefresh = 1 << 13,
}

```

# application_ref.ts
```javascript
export class ApplicationRef {
  _views: InternalViewRef<unknown>[] = [];

  /**
   * Invoke this method to explicitly process change detection and its side-effects.
   *
   * In development mode, `tick()` also performs a second change detection cycle to ensure that no
   * further changes are detected.
   */
  tick(): void {
     this.detectChangesInAttachedViews();

     if (ngDevMode) {
        for (let view of this._views) {
          view.checkNoChanges();
        }
      }
  }


  detectChangesInAttachedViews(): void {
    // Loop through _views until there isn't any view need to check
    if (showRecheckView()) {
      this.detectChangesInView();
    }
  }

  showRecheckView(): void {
    return requiresRefreshOrTraversal(view);
  } 

  detectChangesInView(): void {
    // Set appropreate ChangeDetectionMode. It can be either Global or Targeted

    detectChangesInternal();
  }

  detectChangesInternal(): void {
    detectChangesInViewWhileDirty();
  }

  detectChangesInViewWhileDirty(): void {
    detectChangesInView(lView, mode);

    // If after running change detection, this view still needs to be refreshed or there are
    // descendants views that need to be refreshed due to re-dirtying during the change detection
    // run, detect changes on the view again. We run change detection in `Targeted` mode to only
    // refresh views with the `RefreshView` flag.
    while (requiresRefreshOrTraversal(lView)) {
      // Even if this view is detached, we still detect changes in targeted mode because this was
      // the root of the change detection run.
      detectChangesInView(lView, ChangeDetectionMode.Targeted);
    }
  }

  export function requiresRefreshOrTraversal(lView: LView) {
    return !!(
        lView[FLAGS] & (LViewFlags.RefreshView | LViewFlags.HasChildViewsToRefresh) ||
        lView[REACTIVE_TEMPLATE_CONSUMER]?.dirty);
  }
}

```


```javascript

export const REACTIVE_TEMPLATE_CONSUMER = 23;

export abstract class ViewRef extends ChangeDetectorRef {
  _lView: LView;
}


export interface LView<T = unknown> extends Array<any> {
  /**
   * The `Consumer` for this `LView`'s template so that signal reads can be tracked.
   *
   * This is initially `null` and gets assigned a consumer after template execution
   * if any signals were read.
   */
  [REACTIVE_TEMPLATE_CONSUMER]: ReactiveLViewConsumer|null;
}
```

## Glo-cal change detection

- `RefreshView`
- HAS_CHILD_VIEWS_TO_REFRESH

```javascript
/**
 * Adds the `RefreshView` flag from the lView and updates HAS_CHILD_VIEWS_TO_REFRESH flag of
 * parents.
 */
export function markViewForRefresh(lView: LView) {
  if (lView[FLAGS] & LViewFlags.RefreshView) {
    return;
  }
  lView[FLAGS] |= LViewFlags.RefreshView;
  if (viewAttachedToChangeDetector(lView)) {
    markAncestorsForTraversal(lView);
  }
}
```
When the template effect runs, Angular will run a function called `markViewForRefresh` which sets the current component flag to `RefreshView` and then calls `markAncestorsForTraversal` which will mark all the ancestors with `HAS_CHILD_VIEWS_TO_REFRESH`.


### Targeted Mode Rules
NgZone triggers change detection in `GlobalMode` (it will go top-down checking & refreshing all components)

In `GlobalMode` we check `CheckAlways` (normal component without any change detection strategy set) and `Dirty OnPush` components

**What triggers TargetedMode?**
- When in `GlobalMode` we encounter a `Non-Dirty OnPush` component, we switch to `TargetedMode`!

In `TargetedMode`:
- Only refresh a view if it has the `RefreshView` flag set
- `DO NOT` Refresh `CheckAlways` or regular `Dirty`` flag views
If we reach a view with `RefreshView` flag, traverse children in `GlobalMode`




- Tìm hiểu cơ chế `ngDoCheck` được gọi như thế nào với development mode
