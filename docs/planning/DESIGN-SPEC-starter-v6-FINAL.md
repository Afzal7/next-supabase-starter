# DESIGN-SPEC-starter-v2.md

## SECTION 1: USER JOURNEYS

### Journey: New User Onboarding
Entry: User arrives at app home page, sees welcome message
Context: New user, wants to create account and start using the app

STEP 1: Home Page
  User sees: Large hero title "Welcome to [App Name]", subtitle "Manage your [entityNamePlural] efficiently", prominent "Get Started" button, login link for existing users
  User does: Clicks "Get Started"
  System responds: Navigates to signup page

  States:
    Empty: Standard welcome content
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Sign Up Form
  User sees: Email input, password input, confirm password input, "Create Account" button, "Already have an account? Sign in" link
  User does: Fills form, submits
  System responds: Shows loading spinner, then redirects to email confirmation page

  States:
    Empty: Form with placeholders ("Enter your email", "Create a password")
    Loading: Submit button shows "Creating account..." with spinner, all fields disabled
    Error: Red text below fields ("This email is already registered", "Password must be at least 8 characters", "Passwords don't match")
    Success: Redirects to confirmation page

STEP 3: Email Confirmation
  User sees: Checkmark icon, "Check your email" heading, "We've sent a confirmation link to [email]", "Didn't receive it?" button
  User does: Clicks confirmation link in email
  System responds: Redirects to login with green success banner

  States:
    Empty: Confirmation message
    Loading: N/A
    Error: If link expired, red error "This confirmation link has expired. Request a new one." with resend button
    Success: Redirect to login

DECISION POINT:
  If user clicks resend → Send new email, show green "Confirmation email sent" message
  If confirmation expired → Show expiry message, allow resend

EXIT:
  User sees: Login page with green "Account confirmed successfully! Please sign in." banner
  User knows: Can now log in

### Journey: Existing User Login
Entry: User arrives at login page
Context: Returning user with account

STEP 1: Login Form
  User sees: Email input, password input, "Sign In" button, "Forgot your password?" link, "Don't have an account? Sign up" link
  User does: Enters credentials, submits
  System responds: Loading, then redirects to dashboard

  States:
    Empty: Form ready with placeholders
    Loading: Button shows "Signing in..." with spinner, fields disabled
    Error: Red text "Invalid email or password" or "Account locked for 15 minutes due to too many failed attempts"
    Success: Redirect to dashboard

DECISION POINT:
  If forgot password → Navigate to reset request form
  If account locked → Show lock message with countdown timer

EXIT:
  User sees: Dashboard with sidebar showing user's groups, main content with "Welcome back!" overview
  User knows: Logged in successfully

### Journey: Group Management
Entry: User in dashboard, wants to create or manage groups
Context: User needs to organize teams/organizations

STEP 1: Dashboard
  User sees: Collapsible sidebar with team switcher (active group selector), navigation sections, projects list (user's groups), user dropdown; main content area with breadcrumb header and group overview
  User does: Uses sidebar team switcher to select group or clicks "Add team" to create new group
  System responds: Switches active group context or opens create modal

  States:
    Empty: Sidebar projects section shows "No [entityNamePlural] yet", main content shows welcome message with create prompt
    Loading: Sidebar shows skeleton loading for groups list
    Error: Sidebar shows red "Failed to load groups" with retry option
    Success: Sidebar populated with user's groups, main content shows active group overview (members count, recent activity)

STEP 2: Create Group Form
  User sees: Modal with name input, slug input (auto-generated), description textarea, type select, create/cancel buttons
  User does: Fills required fields, submits
  System responds: Loading, success toast, redirects to group detail

  States:
    Empty: Form with auto-generated slug from name
    Loading: Button shows "Creating..." with spinner, form disabled
    Error: Red text below fields ("Name is required", "Slug already taken", "Limit exceeded")
    Success: Modal closes, redirect to new group

STEP 3: Group Detail
  User sees: Main content with breadcrumb (Home > Dashboard > [Group Name]), group header with name/type, tabs (Overview, Members, Invitations), member list with roles, invite button
  User does: Clicks invite or member actions
  System responds: Opens invite modal or member menu

  States:
    Empty: Group header, empty member list with "No members yet"
    Loading: Skeleton loading for members
    Error: Error banner "Failed to load group details"
    Success: Full group info displayed in main content

STEP 4: Invite Member
  User sees: Modal with email input, role select (member/admin), send/cancel buttons
  User does: Enters email, selects role, submits
  System responds: Success toast "Invitation sent", modal closes

  States:
    Empty: Form ready
    Loading: Button shows "Sending..." with spinner
    Error: Red text "Invalid email format" or "User already a member" or "Group is at member limit"
    Success: Toast notification, invitation appears in pending list

STEP 5: Manage Members
  User sees: Member list with name, role, joined date, action menu (change role, remove)
  User does: Clicks action menu, selects change role or remove
  System responds: Opens confirmation modal or role change form

  States:
    Empty: Member list displayed
    Loading: Action processing
    Error: "Cannot remove last owner" or "Insufficient permissions"
    Success: Member updated, toast confirmation

EXIT:
  User sees: Group detail with updated member list
  User knows: Member management completed

### Journey: Handle Invitation
Entry: User clicks invitation link from email
Context: Invited to join a group

STEP 1: Invitation Page
  User sees: Card with group name/logo, "You've been invited by [inviter name]", role offered, group description, accept/reject buttons
  User does: Clicks accept or reject
  System responds: Loading, then success message and redirect

  States:
    Empty: Invitation details displayed
    Loading: Buttons show "Processing..." with spinners
    Error: Red error "This invitation is invalid or has expired" with "Request new invitation" button
    Success: Green success "Successfully joined [group name]" or "Invitation declined"

DECISION POINT:
  If not logged in → Show login prompt, after login redirect back to process invitation
  If already member → Show "You're already a member of this group" message

EXIT:
  User sees: Dashboard or group page with success message
  User knows: Joined the group or declined invitation

### Journey: Password Reset
Entry: User on login page, clicks "Forgot password"
Context: Can't access account

STEP 1: Reset Request
  User sees: Email input, "Send Reset Link" button, back to login link
  User does: Enters email, submits
  System responds: Success message "Check your email for reset instructions"

  States:
    Empty: Form ready
    Loading: Button shows "Sending..." with spinner
    Error: Red text "No account found with this email"
    Success: Green message "Reset link sent to [email]"

STEP 2: Reset Form
  User sees: New password input, confirm password input, "Update Password" button
  User does: Enters matching passwords, submits
  System responds: Success, redirect to login

  States:
    Empty: Form ready
    Loading: Button shows "Updating..." with spinner
    Error: Red text "Passwords don't match" or "Password too weak"
    Success: Redirect to login with success banner

EXIT:
  User sees: Login page with green "Password updated successfully! Please sign in." banner
  User knows: Password changed, can log in

## SECTION 2: BEHAVIORS & REQUIREMENTS

REQ-1: Form Validation
When user: Submits form with invalid data
System shall: Show specific error messages below fields in red text
Why: Guides user to correct input without confusion

Acceptance Criteria:
  Given empty required field, When submit, Then red "This field is required" appears below field
  Given invalid email format, When submit, Then red "Please enter a valid email address" appears
  Given password <8 characters, When submit, Then red "Password must be at least 8 characters" appears
  Given password mismatch, When submit, Then red "Passwords don't match" appears
  Given duplicate email on signup, When submit, Then red "An account with this email already exists" appears

Test: Submit each form with invalid data, verify exact error messages appear

REQ-2: Loading States
When user: Submits any async action
System shall: Show loading indicator, disable form interactions
Why: Prevents duplicate submissions, shows system is working

Acceptance Criteria:
  Given form submission, When processing, Then submit button shows spinner icon and "Loading..." text, all form fields disabled
  Given API call >200ms, When initiated, Then show skeleton loaders or progress indicators
  Given error during loading, When occurs, Then loading stops, error shown, form re-enabled

REQ-3: Auto-generated Slugs
When user: Types group name
System shall: Auto-generate URL-safe slug, allow manual override
Why: Helps create valid, readable URLs

Acceptance Criteria:
  Given name "My Team", When typed, Then slug auto-fills as "my-team"
  Given manual slug edit to "custom-slug", When name changes, Then slug remains "custom-slug"
  Given invalid characters in name, When typed, Then slug sanitizes to valid format

REQ-4: Invitation Email
When user: Sends member invitation
System shall: Show sending confirmation and handle delivery status
Why: Enables seamless async collaboration

Acceptance Criteria:
  Given valid email, When invite sent, Then show green "Invitation sent to [email]" toast with envelope icon
  Given email provider error, When sending fails, Then show red "Failed to send invitation. Please try again." error
  Given invitation sent, When viewed in UI, Then show pending status with "Email sent" indicator

Test: Submit invite form, verify toast appears immediately

REQ-5: Role-based Access
When user: Views group interface
System shall: Show/hide actions based on user role permissions
Why: Enforces security and prevents unauthorized actions

Acceptance Criteria:
  Given member role, When views group, Then hide "Invite Members", "Remove Members", "Change Roles" buttons
  Given admin role, When views group, Then show member management actions
  Given owner role, When views group, Then show all actions including delete group

REQ-6: Search Functionality
When user: Types in search field
System shall: Filter results in real-time with debouncing
Why: Helps users find groups quickly

Acceptance Criteria:
  Given search term "team", When typed, Then show only groups containing "team" in name/description
  Given empty search, When cleared, Then show all groups
  Given no matches, When searched, Then show "No groups found" message

REQ-7: Error Recovery
When user: Encounters network/server error
System shall: Show retry options and clear error messages on success
Why: Allows users to recover from temporary issues

Acceptance Criteria:
  Given network error, When action fails, Then show "Connection failed. Try again." with retry button
  Given server error, When occurs, Then show "Something went wrong. Please try again." with retry
  Given retry clicked, When succeeds, Then error disappears, action completes

REQ-8: Global Error States
When user: Experiences system-wide errors
System shall: Show appropriate error UI with recovery options
Why: Handles edge cases gracefully

Acceptance Criteria:
  Given session expired, When page loads, Then redirect to login with red "Your session has expired. Please sign in again." banner
  Given rate limited, When action attempted, Then show red "Too many attempts. Please wait 60 seconds before trying again." with countdown
  Given server maintenance, When page loads, Then show full-page "Service temporarily unavailable" with retry button
  Given network offline, When action attempted, Then show red "No internet connection. Please check your connection and try again."

## SECTION 3: BUSINESS RULES

Rule: Group Creation Limits
If user attempts to create group when count >= maxGroupsPerUser → Show red error "You've reached the maximum number of [entityNamePlural] ([maxGroupsPerUser]). Upgrade to create more."
Why: Prevents abuse and encourages plan upgrades

Rule: Member Limits
If group member count >= maxMembersPerGroup → Disable invite button, show gray "Group is at maximum capacity ([maxMembersPerGroup] members)" message
Why: Controls group size and performance

Rule: Invitation Expiry
If invitation created > invitationExpiryDays ago → Show red "This invitation has expired" with "Request new invitation" button
Why: Security measure to prevent stale access

Rule: Unique Slugs
If slug already exists in database → Show red "This slug is already taken. Please choose a different one."
Why: Ensures unique, predictable URLs

Rule: Role Permissions
If user role lacks required permission → Hide/disable action, show tooltip "You don't have permission to perform this action"
Why: Access control and clear user expectations

Rule: Soft Deletes
If group marked as deleted → Hide from user's group list, show "This [entityName] has been deleted" in audit log
Why: Allows recovery and maintains data integrity

Rule: Audit Logging
If auditLog enabled → Log all member changes, invitations, role updates with timestamps
Why: Compliance and troubleshooting

## SECTION 4: DESIGN CONSTRAINTS

**Accessibility (WCAG 2.1 AA - mandatory):**
- All interactive elements keyboard navigable (Tab, Arrow, Enter keys)
- Screen reader compatible (semantic HTML, ARIA labels like aria-label, aria-describedby)
- Color contrast: Text 4.5:1 minimum, UI components 3:1 minimum
- Focus indicators: 2px solid visible outline on focus
- Touch targets: Minimum 44px height/width for buttons, 48px recommended
- Error messages: Associated with inputs using aria-describedby

**Device Support:**
- iOS 15+, Android 11+, Chrome/Firefox/Safari 100+
- Responsive breakpoints: Mobile (375px), Tablet (768px), Desktop (1440px)
- Touch interactions: Swipe gestures for navigation, tap for actions

**Performance:**
- Page load: Initial content visible <3s
- Button response: Visual feedback within 100ms
- Loading states: Show for operations >200ms
- Error display: Message appears within 100ms
- Search: Debounced to 300ms to prevent excessive API calls

**Psychology Principles Applied:**
- Cognitive Load: Sidebar navigation limited to 5-7 main sections (Miller's Law)
- Familiarity: Standard sidebar layout with collapsible sections, common in SaaS apps (Jakob's Law)
- Feedback: Immediate visual confirmation for all actions (Doherty Threshold <400ms)
- Progressive Disclosure: Sidebar collapses to icons, advanced options in dropdowns

**Configurable UI:**
- Entity names: Use config.entityName ("Organization") and entityNamePlural ("Organizations")
- Limits: Display current/max counts (e.g., "3/10 groups used")
- Roles: Use config.defaultRoles for dropdowns and displays
- Features: Conditionally show/hide based on config.features

## SECTION 5: ACCEPTANCE CRITERIA

Design passes when:

For each user journey:
  [ ] User can complete from entry to exit without asking questions
  [ ] Each decision point has obvious visual cues (buttons, links clearly labeled)
  [ ] All error states show specific, actionable error messages with recovery steps
  [ ] Next action is always clear (no dead ends, obvious CTAs)

For each requirement:
  [ ] Observable UI behavior exactly matches specification (text, colors, layout)
  [ ] Error recovery path is one-click (retry buttons, clear instructions)
  [ ] Feedback is immediate (<100ms visual, <400ms functional)

Accessibility:
  [ ] All interactive elements reachable via Tab key in logical order
  [ ] Focus visible on every interactive element (2px outline)
  [ ] Screen reader can describe all content (test with NVDA/JAWS/VoiceOver)
  [ ] Color contrast passes WAVE or Axe DevTools checker
  [ ] Touch targets meet 44px minimum on mobile

Performance:
  [ ] No operation completes without loading state if >200ms
  [ ] Buttons respond visually within perceived instant time
  [ ] Page loads show content within 3 seconds

Configurability:
  [ ] All text uses config values (entity names, limits, roles)
  [ ] UI adapts when config changes (test with different entityName values)

Testing:
  - Designer walkthrough: Complete each journey without hesitation, noting any unclear steps
  - Accessibility check: Tab through all interactive elements, verify focus indicators, test with screen reader
  - Performance check: Simulate slow connections, verify loading states appear appropriately
  - Config check: Mock different config values, verify UI text and features update
  - Error check: Trigger error states, verify messages and recovery options