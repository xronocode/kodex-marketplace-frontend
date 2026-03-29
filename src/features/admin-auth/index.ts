/*
MODULE_CONTRACT: Expose the admin auth feature public surface.
SCOPE: Re-export the admin auth composable and its credential contract.
DEPENDS: ./useAdminAuth
LINKS: [AdminAuthFeature][login][BLOCK_SUBMIT_LOGIN]

MODULE_MAP:
- useAdminAuth - Public export declared in this module.
- AdminLoginCredentials - DEPENDS: ./useAdminAuth, re-exported type.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public feature index for admin authentication helpers.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds the admin auth feature barrel export.
*/
export { useAdminAuth } from './useAdminAuth';
export type { AdminLoginCredentials } from './useAdminAuth';
