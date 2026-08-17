# Add Frontend Validation and Global Toast Notifications

## Goal
Implement robust frontend form validations using `react-hook-form` and `zod` for all forms. Display validation errors clearly underneath each field. Additionally, introduce global and custom toast notifications for API success, error, and warning responses to ensure the frontend properly informs the user of backend states.

## User Review Required
No breaking changes. This refactors form state management from `useState` to `react-hook-form`, standardizing the forms based on existing patterns found in `new-task-dialog.tsx`.

## Open Questions
- Is `react-hot-toast` acceptable for the toast notifications? It is lightweight and easy to integrate globally.

## Proposed Changes

### Forms Refactoring (Validation)

We will migrate the following forms to use `react-hook-form` and `zod`:
- `web-app/src/features/clients/components/new-client-dialog.tsx`
- `web-app/src/features/clients/components/edit-client-dialog.tsx`
- `web-app/src/features/contracts/components/new-contract-dialog.tsx`
- `web-app/src/features/contracts/components/edit-contract-dialog.tsx`
- `web-app/src/features/auth/components/login-form.tsx`
- `web-app/src/features/auth/components/forgot-password-form.tsx`
- `web-app/src/features/auth/components/reset-password-form.tsx`
- `web-app/src/app/dashboard/settings/change-password/page.tsx`
- `web-app/src/app/dashboard/settings/profile/page.tsx`

Each will define a `zod` schema, display errors below inputs in `#FF3E46` text, and use `Controller` for custom inputs (e.g., Select, Popover).

### Toast Notifications

1.  **Install `react-hot-toast`**.
2.  **Add `<Toaster />` to `layout.tsx`** so toasts can be rendered globally.
3.  **Update `axios.ts`**:
    - Modify the response interceptor to automatically trigger a `toast.error(message)` when an API request fails.
4.  **Update Mutations**:
    - Replace local state success modals/messages with `toast.success(message)` where appropriate across services and pages to provide unified feedback.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1.  Open the New Client dialog, submit without data, and verify validation errors appear under each required field.
2.  Trigger a 400 or 500 error from the backend and verify a red error toast appears.
3.  Complete a successful mutation (e.g., edit profile) and verify a green success toast appears.
