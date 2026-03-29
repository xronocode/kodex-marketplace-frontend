/*
MODULE_CONTRACT: Expose the infinite-scroll feature surface for catalog consumers.
SCOPE: Re-export the composable and its local state/reset contracts only.
DEPENDS: ./useInfiniteScroll
LINKS: [InfiniteScroll][index][BLOCK_DEFINE_INDEX]

MODULE_MAP:
- useInfiniteScroll - Public export declared in this module.
- InfiniteScrollResetOptions - DEPENDS: ./useInfiniteScroll, re-exported type.
- InfiniteScrollState - DEPENDS: ./useInfiniteScroll, re-exported type.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public feature barrel for infinite-scroll state.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a narrow feature entrypoint for the catalog infinite-scroll composable.
*/
export { useInfiniteScroll } from './useInfiniteScroll';
export type {
  InfiniteScrollResetOptions,
  InfiniteScrollState,
} from './useInfiniteScroll';
