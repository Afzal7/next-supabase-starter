# DESIGN-SPEC-org-scenarios-v2.md

## SECTION 1: USER JOURNEYS

### Journey: First Login Without Organization
Entry: User completes login, redirected to dashboard
Context: New or returning user with no organization membership, wants to get started

STEP 1: Dashboard Landing
  User sees: Welcome header "Welcome to [App Name]", subtitle "Get started by creating your first organization or joining an existing one", prominent "Create Organization" button, secondary "Join via Invitation" link, sidebar with platform navigation (Profile, Settings available), workspace section hidden or shows "No organization selected"
  User does: Clicks "Create Organization"
  System responds: Opens create organization modal

  States:
    Empty: Clean dashboard with onboarding content
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Create Organization Modal
  User sees: Name input, slug input (auto-generated), description textarea, type select, create/cancel buttons
  User does: Fills form, submits
  System responds: Loading spinner, success toast "Organization created successfully", modal closes, dashboard refreshes with new org context

  States:
    Empty: Form ready with auto-generated slug
    Loading: Button shows "Creating..." with spinner, form disabled
    Error: Red text "Name is required", "Slug already taken", "Limit exceeded"
    Success: Modal closes, org becomes active

EXIT:
  User sees: Dashboard with active organization context, workspace sidebar appears, breadcrumb shows organization name
  User knows: Organization created and active, can now access org-dependent features

### Journey: Joining Organization via Invitation (No Existing Orgs)
Entry: User clicks invitation link from email, has no organization memberships
Context: Invited to join an organization as first membership

STEP 1: Invitation Landing Page
  User sees: Card with organization name/logo, "You've been invited by [inviter name]", role offered, organization description, accept/reject buttons
  User does: Clicks accept
  System responds: If not logged in, redirects to login with return URL; after login, shows invitation page again

  States:
    Empty: Invitation details displayed
    Loading: Buttons show "Processing..." with spinners
    Error: Red error "This invitation is invalid or has expired" with "Request new invitation" button
    Success: Green success "Successfully joined [org name]"

DECISION POINT:
  If user not logged in → Redirect to login page with "Please sign in to accept this invitation" message, return URL preserved
  If user already member → Show "You're already a member of this organization" message

STEP 2: Post-Accept Redirect
  User sees: Dashboard with new organization active, success banner "Welcome to [org name]!"
  User does: Can immediately access org features
  System responds: Org context activated, workspace sidebar appears

EXIT:
  User sees: Full dashboard with active organization
  User knows: Joined and can use all org features

### Journey: Joining Organization via Invitation (Has Existing Orgs)
Entry: User clicks invitation link from email, already has organization memberships
Context: Invited to join additional organization

STEP 1: Invitation Landing Page
  User sees: Card with organization name/logo, "You've been invited by [inviter name]", role offered, organization description, accept/reject buttons, note "You'll remain a member of your current organizations"
  User does: Clicks accept
  System responds: Processes acceptance, active org remains unchanged

  States:
    Empty: Invitation details displayed
    Loading: Buttons show "Processing..." with spinners
    Error: Red error "This invitation is invalid or has expired" or "You've reached the maximum number of organizations"
    Success: Green success "Successfully joined [org name]"

DECISION POINT:
  If user not logged in → Redirect to login, then back to invitation
  If user already member → Show "You're already a member of this organization" message

EXIT:
  User sees: Dashboard with current active org, success banner "You can now switch to [org name] using the organization switcher"
  User knows: Joined additional org, can switch context when needed

### Journey: Switching Between Multiple Organizations
Entry: User in dashboard with multiple organization memberships
Context: User needs to switch context between organizations

STEP 1: Organization Switcher
  User sees: Sidebar header with dropdown showing current active organization name/type, chevron indicator, visual highlight for active state
  User does: Clicks dropdown to open organization list
  System responds: Dropdown expands showing all user's organizations with icons, keyboard navigable (Tab/Arrow/Enter)

  States:
    Empty: Dropdown shows current org
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Select Organization
  User sees: List of organizations (name, type), "Create Organization" option at bottom, current org marked with checkmark
  User does: Clicks different organization
  System responds: Dropdown closes, active context switches, all org-dependent content refreshes, breadcrumb updates, workspace sidebar updates

  States:
    Empty: List populated
    Loading: Brief loading indicator during context switch (<500ms)
    Error: If switch fails, red error "Failed to switch organization" with retry button
    Success: All UI updates to new org context

DECISION POINT:
  If selecting "Create Organization" → Opens create modal, new org becomes active after creation

EXIT:
  User sees: Dashboard with new active organization, all features reflect new context
  User knows: Context switched successfully, working in different organization

### Journey: Accessing Organization-Independent Features
Entry: User in dashboard, any organization context
Context: User needs to access personal settings or app preferences

STEP 1: Platform Navigation
  User sees: Sidebar platform section with Profile, Settings links (always available), Invitations link (personal invitations)
  User does: Clicks Profile or Settings
  System responds: Navigates to page, content loads independently of org context

  States:
    Empty: Page content displayed
    Loading: Skeleton loading
    Error: Error banner with retry
    Success: Full page content

STEP 2: Profile/Settings Page
  User sees: Form fields for user preferences, account settings, app configuration (theme, notifications, etc.)
  User does: Makes changes, saves
  System responds: Loading, success toast, changes applied globally

  States:
    Empty: Current settings displayed
    Loading: Save button shows "Saving..." with spinner
    Error: Red text below fields for validation errors
    Success: Green toast "Settings saved"

EXIT:
  User sees: Updated settings applied, can continue using app
  User knows: Personal preferences updated, independent of organization context

### Journey: Leaving an Organization
Entry: User in organization settings, wants to leave membership
Context: User has multiple orgs or wants to remove membership

STEP 1: Organization Settings
  User sees: Settings page with "Leave Organization" button (red), warning text "This action cannot be undone"
  User does: Clicks "Leave Organization"
  System responds: Opens confirmation modal

  States:
    Empty: Settings page displayed
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Confirmation Modal
  User sees: Warning "Are you sure you want to leave [org name]? You'll lose access to all its resources.", confirm/cancel buttons
  User does: Clicks confirm
  System responds: Loading, success message, redirects to dashboard

  States:
    Empty: Modal displayed
    Loading: Button shows "Leaving..." with spinner
    Error: Red error "Cannot leave organization: you are the only owner" with "Transfer ownership first" button
    Success: Modal closes, redirect to dashboard

DECISION POINT:
  If leaving active org and has others → Switch to next available org
  If leaving last org → Return to no-org state with onboarding prompt

EXIT:
  User sees: Dashboard with updated org context or onboarding if no orgs remain
  User knows: Left organization, context adjusted appropriately

## SECTION 2: BEHAVIORS & REQUIREMENTS

REQ-1: Organization Context Management
When user: Switches organizations or creates first organization
System shall: Update all UI elements to reflect new active organization context
Why: Ensures consistent experience across all features

Acceptance Criteria:
  Given user switches org, When switch completes, Then sidebar workspace shows new org's sections
  Given user switches org, When switch completes, Then breadcrumb shows new org name
  Given user switches org, When switch completes, Then main content shows new org's data
  Given user creates first org, When creation succeeds, Then org becomes active, workspace appears

Test: Switch between orgs, verify all UI updates immediately

REQ-2: Feature Access Gating
When user: Views interface without active organization
System shall: Show specific prompts for org-dependent features, disable/hide org-required actions with clear messaging
Why: Guides users to create or join organizations before accessing dependent features

Acceptance Criteria:
  Given no active org, When user views dashboard, Then show "Create your first organization" card with icon and description
  Given no active org, When user tries org-dependent nav, Then show tooltip "Create an organization first" and disable link
  Given no active org, When user accesses org page URL, Then redirect to dashboard with red banner "Please create or join an organization first"
  Given no active org, When user clicks disabled nav, Then show modal "Organization Required" with create/join options
  Given org created, When user views dashboard, Then show org overview instead of prompt

REQ-3: Organization Switching UI
When user: Has multiple organizations
System shall: Provide clear, accessible organization switcher with visual feedback and keyboard shortcuts
Why: Enables seamless context switching between organizations

Acceptance Criteria:
  Given multiple orgs, When user opens switcher, Then show list with org names, types, and member counts
  Given multiple orgs, When user selects org, Then show loading during switch (<500ms), then update all context
  Given switch fails, When error occurs, Then show retry option, keep previous org active
  Given keyboard navigation, When using Tab/Arrow/Enter, Then switcher fully accessible with focus management
  Given Cmd/Ctrl+K, When pressed, Then open org switcher (optional shortcut)

Test: Tab through switcher, select different org, verify all content updates

REQ-4: First-Time User Onboarding
When user: Logs in without organizations
System shall: Provide clear next steps with prominent CTAs and progressive guidance
Why: Reduces friction for new users getting started

Acceptance Criteria:
  Given first login no org, When dashboard loads, Then show hero section with "Create Organization" primary button
  Given first login no org, When dashboard loads, Then show secondary "Join via Invitation" link
  Given first login no org, When sidebar loads, Then platform nav available, workspace section shows "Get started by creating an organization"
  Given org created, When dashboard refreshes, Then onboarding content replaced with org overview

REQ-5: Invitation Handling
When user: Receives organization invitation
System shall: Handle invitations appropriately based on user's current org status
Why: Ensures smooth onboarding for invited users

Acceptance Criteria:
  Given invitation link, no orgs, When user accepts, Then org becomes active after joining
  Given invitation link, has orgs, When user accepts, Then org added to memberships, active remains unchanged
  Given invitation expired, When user clicks, Then show "This invitation has expired" with resend option
  Given invitation for existing member, When user clicks, Then show "You're already a member" message

REQ-6: Organization Membership Management
When user: Views or manages organization memberships
System shall: Show clear overview of all memberships with leave options
Why: Gives users control over their org participations

Acceptance Criteria:
  Given multiple orgs, When user views switcher, Then show all orgs with leave option (X button)
  Given user clicks leave, When confirms, Then remove from membership, switch to next org or no-org state
  Given leaving last org, When confirms, Then return to onboarding state
  Given leaving active org, When confirms, Then switch to next available org automatically

## SECTION 3: BUSINESS RULES

Rule: Organization Membership Limits
If user attempts to join organization when membership count >= maxOrgsPerUser → Show red error "You've reached the maximum number of organizations ([maxOrgsPerUser]). Leave an organization to join this one."
Why: Controls user organization sprawl and performance

Rule: Active Organization Context
If user has multiple organizations → One organization marked as active, all org-dependent features use active org context
Why: Simplifies UI by having single active context

Rule: Permission Inheritance
If user switches active organization → Permissions update based on user's role in new active organization
Why: Ensures security and appropriate access controls

Rule: Organization Creation Validation
If user creates organization → Check against maxOrgsPerUser limit, auto-set as active if first org, validate unique slug
Why: Maintains data integrity and user experience

Rule: Context Persistence
If user switches organization → Persist active organization in localStorage, restore on next login
Why: Maintains user context across sessions

Rule: Feature Dependency Classification
If feature requires organization context → Classify as org-dependent (groups management, members, org-specific invitations, org settings) or org-independent (user profile, app settings, personal invitations)
Why: Clear separation of functionality and access requirements

Rule: Organization Leaving Logic
If user leaves organization → If leaving active org, switch to next available org; if leaving last org, enter no-org state; prevent leaving if user is only owner
Why: Maintains valid active context and prevents orphaned organizations

Rule: Invitation Types
If invitation sent → All invitations are organization-specific, requiring acceptance into particular org
Why: Maintains clear org boundaries and membership control

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
- Context switch: Complete within 500ms with loading indicator
- Invitation processing: Handle within 1s for immediate feedback

**Psychology Principles Applied:**
- Cognitive Load: Organization switcher limited to user's orgs (Miller's Law)
- Familiarity: Standard dropdown patterns, clear visual hierarchy (Jakob's Law)
- Feedback: Immediate visual confirmation for all actions (Doherty Threshold <400ms)
- Progressive Disclosure: Workspace sections appear only with active org

**Configurable UI:**
- Entity names: Use config.entityName ("Organization") and entityNamePlural ("Organizations")
- Limits: Display current/max counts (e.g., "2/5 organizations used")
- Roles: Use config.defaultRoles for dropdowns and displays
- Features: Conditionally show/hide based on config.features

## SECTION 5: ACCEPTANCE CRITERIA

Design passes when:

For each user journey:
  [ ] User can complete from entry to exit without confusion
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
  [ ] Organization switcher has aria-expanded, aria-selected for active org

Performance:
  [ ] No operation completes without loading state if >200ms
  [ ] Buttons respond visually within perceived instant time
  [ ] Page loads show content within 3 seconds
  [ ] Organization switch completes within 500ms
  [ ] Invitation acceptance processes within 1s

Organization Scenarios:
  [ ] First login without org shows onboarding prompt, no workspace sidebar
  [ ] Creating first org activates context, shows workspace sections
  [ ] Multi-org users see switcher with all orgs, switching updates all context
  [ ] Org-independent features (Profile, Settings) always accessible regardless of org context
  [ ] Org-dependent features show appropriate prompts when no active org
  [ ] Leaving org switches context appropriately (next org or no-org state)
  [ ] Invitations handle login redirects and different org states correctly
  [ ] Organization switcher persists active org across sessions

Testing:
  - Designer walkthrough: Complete each org scenario without hesitation, noting any unclear steps
  - Accessibility check: Tab through org switcher, verify focus indicators, test with screen reader, check aria attributes
  - Performance check: Time org switching and invitation processing, verify loading states appear appropriately
  - Config check: Mock different org limits, verify UI adapts
  - Error check: Trigger org creation/join/leave failures, verify messages and recovery
  - Persistence check: Switch org, refresh page, verify active org restored
  - Edge case check: Leave active org, verify automatic switching; accept invitation without login, verify redirect flow