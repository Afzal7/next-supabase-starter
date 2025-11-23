# DESIGN-SPEC-org-scenarios-v3.md

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
  User sees: Modal with title "Create Organization", name input labeled "Organization Name" with placeholder "My Organization", slug input labeled "Slug" with placeholder "my-organization" (auto-generated from name), description textarea labeled "Description (optional)" with placeholder "Brief description of your organization", type select labeled "Type" with options "Personal", "Team", "Enterprise" (default "Team"), primary blue "Create Organization" button, secondary gray "Cancel" button
  User does: Fills required fields (name, slug), submits
  System responds: Loading spinner on button, form fields disabled, success green toast "Organization created successfully", modal closes, dashboard refreshes with new org context

  States:
    Empty: Form ready with auto-generated slug, all fields enabled
    Loading: Button shows "Creating..." with spinner, all form fields disabled
    Error: Red text below name field "Organization name is required", below slug field "This slug is already taken. Please choose a different one.", below form "You've reached the maximum number of organizations (5). Leave an organization to create a new one."
    Success: Modal closes, org becomes active, dashboard shows org context

EXIT:
  User sees: Dashboard with active organization context, workspace sidebar appears, breadcrumb shows organization name
  User knows: Organization created and active, can now access org-dependent features

### Journey: Joining Organization via Invitation (No Existing Orgs)
Entry: User clicks invitation link from email, has no organization memberships
Context: Invited to join an organization as first membership

STEP 1: Invitation Landing Page
  User sees: Centered card with organization logo (default building icon if none), title "You've been invited to join [Org Name]", subtitle "Invited by [Inviter Name]", role badge "Role: [Role]", description paragraph "[Org Description]", green "Accept Invitation" button, red "Decline" button
  User does: Clicks "Accept Invitation"
  System responds: If not logged in, redirects to login with message "Please sign in to accept this invitation", return URL preserved; after login, shows invitation page again

  States:
    Empty: Invitation details displayed, buttons enabled
    Loading: Buttons show "Processing..." with spinners, disabled
    Error: Red banner at top "This invitation is invalid or has expired. Please request a new invitation from the organization admin." with "Request New Invitation" button
    Success: Green banner "Successfully joined [Org Name] as [Role]"

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
  User sees: Sidebar top section with current organization name in bold text, type in smaller gray text (e.g., "Acme Corp (Team)"), dropdown arrow icon, blue highlight border around the switcher area
  User does: Clicks the switcher area
  System responds: Dropdown expands showing list of all user's organizations, keyboard navigable (Tab/Arrow/Enter keys)

  States:
    Empty: Dropdown shows current org, list ready
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Select Organization
  User sees: Dropdown list with each organization showing name, type in parentheses, member count "X members", current org has green checkmark icon, bottom item "Create Organization" with plus icon
  User does: Clicks different organization
  System responds: Dropdown closes, active context switches, all org-dependent content refreshes, breadcrumb updates to "Home > [New Org Name]", workspace sidebar updates with new org's sections

  States:
    Empty: List populated with all orgs
    Loading: Brief loading overlay on dashboard during switch (<500ms)
    Error: If switch fails, red toast "Failed to switch organization. Please try again." with retry button
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
  User sees: Organization settings page with red "Leave Organization" button at bottom, above it warning text in red "This action cannot be undone. You'll lose access to all organization resources."
  User does: Clicks "Leave Organization"
  System responds: Opens confirmation modal

  States:
    Empty: Settings page displayed, button enabled
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Confirmation Modal
  User sees: Modal with title "Leave Organization", warning text "Are you sure you want to leave [Org Name]? You'll lose access to all its resources and data.", red "Leave Organization" button, gray "Cancel" button
  User does: Clicks "Leave Organization"
  System responds: Loading, success message, redirects to dashboard

  States:
    Empty: Modal displayed, buttons enabled
    Loading: Button shows "Leaving..." with spinner, buttons disabled
    Error: Red text in modal "Cannot leave organization: you are the only owner. Transfer ownership to another member first." with "Transfer Ownership" button
    Success: Modal closes, green toast "You have left [Org Name]", redirect to dashboard

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
  Given user switches org, When switch completes, Then sidebar workspace shows new org's sections (e.g., "Members", "Groups", "Settings")
  Given user switches org, When switch completes, Then breadcrumb shows "Home > [New Org Name]"
  Given user switches org, When switch completes, Then main content shows new org's data (e.g., overview card with org description and stats)
  Given user creates first org, When creation succeeds, Then org becomes active, workspace sidebar appears with sections "Members", "Groups", "Invitations", "Settings"

Test: Switch between orgs, verify all UI updates immediately

REQ-2: Feature Access Gating
When user: Views interface without active organization
System shall: Show specific prompts for org-dependent features, disable/hide org-required actions with clear messaging
Why: Guides users to create or join organizations before accessing dependent features

Acceptance Criteria:
  Given no active org, When user views dashboard, Then show card with building icon, title "Create your first organization", description "Start collaborating by creating an organization", primary blue "Create Organization" button, secondary "Join via Invitation" link
  Given no active org, When user tries org-dependent nav, Then show tooltip "Create an organization first" on hover, link disabled with gray color and no pointer cursor
  Given no active org, When user accesses org page URL, Then redirect to dashboard with red banner "Please create or join an organization first" and "Create Organization" button
  Given no active org, When user clicks disabled nav, Then show modal "Organization Required" with title "Organization Required", message "This feature requires an active organization. Create one to get started.", "Create Organization" button, "Join via Invitation" link
  Given org created, When user views dashboard, Then show org overview card with org name, description, member count "X members", instead of prompt

REQ-3: Organization Switching UI
When user: Has multiple organizations
System shall: Provide clear, accessible organization switcher with visual feedback and keyboard shortcuts
Why: Enables seamless context switching between organizations

Acceptance Criteria:
  Given multiple orgs, When user opens switcher, Then show dropdown list with each org name, type in parentheses, member count "X members", current org with green checkmark icon
  Given multiple orgs, When user selects org, Then show loading overlay on dashboard (<500ms), then update sidebar, breadcrumb to "Home > [New Org Name]", main content
  Given switch fails, When error occurs, Then show red toast "Failed to switch organization. Please try again." with "Retry" button, keep previous org active
  Given keyboard navigation, When using Tab/Arrow/Enter, Then switcher opens/closes, items selectable, focus moves logically with visible focus ring
  Given Cmd/Ctrl+K, When pressed, Then open org switcher dropdown (optional keyboard shortcut)

Test: Tab through switcher, select different org, verify all content updates

REQ-4: First-Time User Onboarding
When user: Logs in without organizations
System shall: Provide clear next steps with prominent CTAs and progressive guidance
Why: Reduces friction for new users getting started

Acceptance Criteria:
  Given first login no org, When dashboard loads, Then show hero section with large "Welcome to [App Name]!" title, subtitle "Get started by creating your first organization", primary blue "Create Organization" button, secondary gray "Join via Invitation" link
  Given first login no org, When sidebar loads, Then platform nav (Profile, Settings) available, workspace section hidden or shows grayed text "Get started by creating an organization"
  Given org created, When dashboard refreshes, Then onboarding content replaced with org overview card showing org name, type, member count

REQ-5: Invitation Handling
When user: Receives organization invitation
System shall: Handle invitations appropriately based on user's current org status
Why: Ensures smooth onboarding for invited users

Acceptance Criteria:
  Given invitation link, no orgs, When user accepts, Then org becomes active, dashboard shows org context with success banner "Welcome to [Org Name]!"
  Given invitation link, has orgs, When user accepts, Then org added to memberships, active remains unchanged, success banner "You can now switch to [Org Name] using the organization switcher"
  Given invitation expired, When user clicks, Then show red banner "This invitation has expired. Please request a new invitation from the organization admin." with "Request New Invitation" button
  Given invitation for existing member, When user clicks, Then show yellow banner "You're already a member of this organization."

REQ-6: Organization Membership Management
When user: Views or manages organization memberships
System shall: Show clear overview of all memberships with leave options
Why: Gives users control over their org participations

Acceptance Criteria:
  Given multiple orgs, When user views switcher, Then show all orgs, each with small red X button on hover for leaving
  Given user clicks leave, When confirms in modal, Then remove from membership, if leaving active, switch to next org automatically, show green toast "You have left [Org Name]"
  Given leaving last org, When confirms, Then return to onboarding state with "Create your first organization" card
  Given leaving active org, When confirms, Then switch to next available org, update sidebar, breadcrumb, main content

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