# Feature Context Log

## 2026-09-28: Login Screen UI and Mock Interaction

**Feature:** Implement the Acme task and project management SaaS login screen at `/login`.

**Scope:** Frontend UI only. Authentication API integration, session creation, and real credential validation are not implemented.

**Implemented behavior:**
- Dark, responsive login card consistent with the existing Acme dashboard visual language.
- Email and password inputs with accessible labels, dashboard-aligned focus and hover states, an email icon, and a show/hide password control.
- Remember me checkbox and Forgot password link, plus an OR divider without non-functional social login buttons.
- Client-side required/email validation feedback, disabled mock loading state, and explicit preview feedback after submission; no API request is sent.
- Navigation to registration and password recovery routes.

**Verification:** Browser-tested blank form validation, password visibility toggle, mock loading/disabled state, preview notice, and navigation links. Auth component editor diagnostics reported no errors.

## 2026-09-28: Registration Screen UI and Mock Interaction

**Feature:** Implement the Acme task and project management SaaS registration screen at `/register`, using the same shared authentication design system as `/login`.

**Scope:** Frontend UI only. The registration API is not called, and no account or session is created.

**Implemented behavior:**
- Registration heading and supporting text: “Create your account” and “Get started with your workspace.”
- Responsive full-name, email, password, and confirm-password fields with accessible labels and dashboard-aligned focus states.
- Independent show/hide controls for both password fields.
- Compact password-strength feedback for the 8-character minimum, uppercase, lowercase, and number requirements.
- Required-field and email-format validation, password requirement and confirmation checks, plus required Terms of Service and Privacy Policy consent.
- Full-width violet create-account action with disabled mock-loading state, and navigation back to sign-in.
- Form errors are announced accessibly and focus the invalid or mismatched field. Successful preview submission states that no authentication request was sent.

**Verification:** Browser-tested required-field focus, all password requirements, password visibility, confirmation mismatch/focus, terms consent, loading/disabled state, and preview notice. At 390px viewport width, the 343px card had no horizontal overflow. Auth component editor diagnostics reported no errors.

## 2026-09-28: Forgot Password UI and Mock Interaction

**Feature:** Implement the Acme task and project management SaaS forgot-password screen at `/forgot-password`, consistent with the shared login and registration design system.

**Scope:** Frontend UI only. No reset email is sent, no account lookup occurs, and no password-reset backend is connected.

**Implemented behavior:**
- Matching dark auth card, Acme branding, shared typography and field/action styles, with the heading “Forgot your password?” and requested supporting copy.
- Accessible email field with email icon, `you@example.com` placeholder, and client-side required/email validation.
- Full-width violet “Send reset link” action with disabled mock-loading state.
- Generic success state: “Check your email” and “If an account exists for this email, we've sent instructions to reset your password.” The submitted email is not displayed and account existence is never confirmed.
- “Back to sign in” action and “Remember your password? Sign in” navigation to `/login`.

**Verification:** Browser-tested invalid email feedback, sending/loading disabled state, generic success copy, absence of the submitted address in success UI, sign-in links, and mobile layout at 390px with no horizontal overflow. Auth component and route editor diagnostics reported no errors.

## 2026-09-28: Reset Password UI and Mock States

**Feature:** Implement the Acme task and project management SaaS reset-password screen at `/reset-password`, consistent with the shared login, registration, and forgot-password design system.

**Scope:** Frontend UI only. Reset tokens are not validated, passwords are not persisted, and no backend request is sent. The expired-link mock state is available at `/reset-password?state=expired`.

**Implemented behavior:**
- Accessible new-password and confirm-password fields with independent show/hide controls and shared compact password requirement indicators.
- Client-side required-field, eight-character minimum, uppercase/lowercase/number complexity, and confirmation-match validation with inline messages and focus on the field to correct.
- Full-width violet reset action with disabled mock-loading state.
- Mock success state with “Password updated,” confirmation copy, and a prominent Sign in link to `/login`.
- Invalid/expired-link state with “Reset link expired,” requested explanatory copy, and a Request a new reset link action to `/forgot-password`.

**Verification:** Browser-tested required-field focus, distinct minimum-length and complexity feedback, mismatch feedback/focus, password strength indicator, mock loading and success, expired-link copy/action, and mobile layout at 390px with no horizontal overflow. Auth component and route editor diagnostics reported no errors.

## 2026-09-28: Authentication Design-System Cohesion Review

**Feature:** Review and unify Login, Register, Forgot Password, and Reset Password as one cohesive authentication experience without changing the dashboard.

**Consistency updates:**
- Centralized email field styling and icon treatment across Login, Register, and Forgot Password.
- Centralized password-requirement presentation across Register and Reset Password.
- Shared primary action styling between form buttons and completion-state links, including height, radius, focus, hover, active, and disabled states.
- Shared status-icon sizing and success/warning surface treatment across Forgot Password and Reset Password states.
- Matched reset-form footer navigation to the other recovery flow and removed duplicate navigation beneath completed states.

**Verification:** Compared all form and expired-link routes at desktop and mobile sizes. Desktop cards measured 440px, headings 20px, form fields/actions 40px, and action corners 4.8px. At 375px viewport width, every route used a 343px card with no horizontal overflow. Forgot and Reset success actions both measured 40px high with matching 4.8px radius; status icons both measured 44px. Editor diagnostics reported no errors for auth components or routes. No dashboard files were changed.

## 2026-09-28: Centralized Authentication Text and Constants

**Feature:** Move authentication UI copy into `app/constants/AppTexts.ts` and authentication identifiers into `app/constants/AppConstants.ts`.

**Implemented behavior:**
- Centralized auth headings, descriptions, labels, placeholders, button/loading text, validation messages, password requirements, navigation copy, accessibility labels, brand/footer text, and auth page metadata in `AppTexts`.
- Centralized screen type identifiers, routes, form field names, query parameter/state values, and state/message variants in `AppConstants`.
- Updated all four auth page entries and shared auth components to reference the central definitions instead of inline copy or raw auth-type comparisons.

**Verification:** Auth route smoke-tested on mobile for headings, metadata, branding, login validation, registration labels, forgot-password copy, expired-link presentation, and overflow. Editor diagnostics reported no errors for constants, auth components, or routes. Targeted search found no raw auth state comparisons or inline user-facing copy in the auth components.

## 2026-09-28: Centralized Application Routes

**Feature:** Use `app/helpers/AppRoutes.ts` as the canonical route registry and remove duplicate auth page paths from `AppConstants`.

**Route inventory:**
- Page files: `/`, `/board`, `/login`, `/register`, `/forgot-password`, and `/reset-password`.
- Auth API route files: `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, and `/api/auth/change-password`.
- Existing auth UI legal-link destinations: `/terms` and `/privacy`; no corresponding page files currently exist.
- Legacy workspace paths are retained under `legacyWorkspace` for compatibility; matching page files are not currently present.

**Implemented behavior:** Auth logo/footer links, auth navigation links, and registration legal links now consume `AppRoutes`; page route references and API endpoints are grouped separately. The separate top-level `api/` directory is empty.

**Verification:** Searched app/components for remaining hardcoded `href`, fetch, and auth route constants; none remain. Browser-checked rendered auth navigation destinations, and editor diagnostics reported no errors in route constants or updated auth components/pages.

## 2026-09-28: Global Reusable Form Input

**Feature:** Provide an application-wide `FormInput` component in `components/ui/form-input.tsx`, usable outside authentication screens.

**Implemented behavior:**
- Supports labels, common native input types and attributes, required/disabled states, validation styling, controlled values and change handlers, and left/right adornment slots.
- Includes an accessible checkbox rendering mode.
- Login, registration, forgot-password, and reset-password controls now consume this shared UI component through small auth-specific compositions such as the email-field wrapper.
- Auth screens no longer define their own native input elements. The existing lower-level `components/ui/input.tsx` primitive and dashboard input remain unchanged.

**Verification:** Browser-checked all auth form routes and expired-link state, email icon/type, input required state, password visibility, checkbox interaction, strength feedback, and mobile overflow. Native auth input markup is absent from `components/auth`; editor diagnostics reported no errors.

## 2026-09-28: Global Reusable Password Field

**Feature:** Extract password input and visibility behavior into `components/ui/password-field.tsx` for reuse across the application.

**Implemented behavior:** The shared `PasswordField` composes the global `FormInput`, controls show/hide state, exposes configurable labels, autocomplete, controlled value/change behavior, required state, and wrapper styling. Login, Register, and Reset Password now import and use it; the auth screen no longer defines the password field component.

**Verification:** Browser-tested show-password toggles on Login, Register, and Reset Password, plus the Register confirmation field. All tested screens fit at 390px without horizontal overflow; editor diagnostics reported no errors in the shared component or auth screen.

**Follow-up:** The global `PasswordField` visibility toggle now uses the shared `components/ui/button.tsx` component with ghost/icon styling. Verified it remains a 32px non-submit button and toggles password visibility and its accessible label.

## 2026-09-28: Route-Owned Authentication Flows

**Feature:** Move Login, Register, Forgot Password, and Reset Password behavior from a single `AuthScreen` component into each route's own `app/<route>/page.tsx`.

**Implemented behavior:** Each page now owns its own fields, local state, validation, mock loading, result state, and navigation. Shared presentation remains in reusable auth components; password requirements are shared separately. Reset Password handles the expired-link query state within its page. Removed the obsolete `components/auth/auth-screen.tsx` and unused auth screen type constants.

**Verification:** Browser-rendered all four route pages plus the expired Reset Password state at desktop and mobile sizes; titles and headings are correct, cards remain consistent, and there is no horizontal overflow. Editor diagnostics report no errors across route pages and shared auth components.

## 2026-09-28: Shared Authentication Route Group

**Feature:** Consolidate Login, Register, Forgot Password, and Reset Password beneath `app/(auth)` with one shared `layout.tsx`.

**Implemented behavior:** Moved all four route folders intact under the `(auth)` route group, which Next.js omits from the public URL. Removed duplicate route-level layouts and added one shared group layout. The shared auth metadata title is “Account | Acme Inc”; individual auth flows remain in their own `page.tsx` files.

**Verification:** Confirmed there is one auth-group layout and no duplicate auth layouts. Browser-checked `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/reset-password?state=expired`; public URLs and headings are unchanged, cards remain 358px at 390px viewport width, and none overflow horizontally. Editor diagnostics reported no errors.

## 2026-09-28: Move Shared Helpers and Constants to Root

**Feature:** Relocate `app/helpers` and `app/constants` to project-root `helpers` and `constants` folders.

**Implemented behavior:** Moved all helper and constants files intact and updated auth pages/components plus auth API handlers to import from `@/helpers/...` and `@/constants/...`. The app route tree no longer contains these shared utility folders.

**Verification:** A workspace search found no remaining `@/app/helpers/` or `@/app/constants/` imports. Targeted diagnostics are clean for moved modules and their consumers; browser smoke test confirmed `/login` still renders with working recovery navigation.