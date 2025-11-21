# DESIGN-SPEC-final.md

## SECTION 1: DESIGN TOKENS

### Subsection 1.1: Color Palette

#### Semantic Colors
- **Primary**: oklch(0.55 0.20 250) — Brand accent for CTAs and active states
- **Secondary**: oklch(0.50 0.15 20) — Secondary actions and accents
- **Success**: oklch(0.65 0.20 140) — Positive confirmations and success states
- **Warning**: oklch(0.75 0.18 70) — Cautions and warnings
- **Error**: oklch(0.60 0.22 25) — Errors and destructive actions
- **Info**: oklch(0.60 0.18 230) — Informational content

#### Neutral Palette (Light Mode)
- **bg-primary**: oklch(0.98 0 0) — Primary backgrounds
- **bg-secondary**: oklch(0.95 0 0) — Secondary backgrounds for cards and sections
- **bg-tertiary**: oklch(0.90 0 0) — Tertiary backgrounds for inputs and hovers
- **text-primary**: oklch(0.13 0 0) — Primary text for headings and strong content
- **text-secondary**: oklch(0.45 0 0) — Secondary text for descriptions
- **text-tertiary**: oklch(0.65 0 0) — Tertiary text for labels and captions
- **border**: oklch(0.87 0 0) — Borders for components
- **divider**: oklch(0.92 0 0) — Dividers between sections

#### Dark Mode Overrides
- **bg-primary**: oklch(0.13 0 0)
- **bg-secondary**: oklch(0.18 0 0)
- **bg-tertiary**: oklch(0.22 0 0)
- **text-primary**: oklch(0.95 0 0)
- **text-secondary**: oklch(0.75 0 0)
- **text-tertiary**: oklch(0.55 0 0)
- **border**: oklch(0.28 0 0)
- **divider**: oklch(0.22 0 0)

#### CSS @theme Implementation
@theme {
  --color-primary: oklch(0.55 0.20 250);
  --color-secondary: oklch(0.50 0.15 20);
  --color-success: oklch(0.65 0.20 140);
  --color-warning: oklch(0.75 0.18 70);
  --color-error: oklch(0.60 0.22 25);
  --color-info: oklch(0.60 0.18 230);
  --color-bg-primary: oklch(0.98 0 0);
  --color-bg-secondary: oklch(0.95 0 0);
  --color-bg-tertiary: oklch(0.90 0 0);
  --color-text-primary: oklch(0.13 0 0);
  --color-text-secondary: oklch(0.45 0 0);
  --color-text-tertiary: oklch(0.65 0 0);
  --color-border: oklch(0.87 0 0);
  --color-divider: oklch(0.92 0 0);
  @variant dark {
    --color-bg-primary: oklch(0.13 0 0);
    --color-bg-secondary: oklch(0.18 0 0);
    --color-bg-tertiary: oklch(0.22 0 0);
    --color-text-primary: oklch(0.95 0 0);
    --color-text-secondary: oklch(0.75 0 0);
    --color-text-tertiary: oklch(0.55 0 0);
    --color-border: oklch(0.28 0 0);
    --color-divider: oklch(0.22 0 0);
  }
}

### Subsection 1.2: Typography

#### Font Family
- **Sans**: system-ui, -apple-system, sans-serif

#### Scale (Base Unit: 1rem = 16px)
- **xs**: 0.75rem (12px) | line-height: 1.33 | letter-spacing: 0.5px
- **sm**: 0.875rem (14px) | line-height: 1.43 | letter-spacing: 0.3px
- **base**: 1rem (16px) | line-height: 1.5 | letter-spacing: 0px
- **lg**: 1.125rem (18px) | line-height: 1.56 | letter-spacing: -0.2px
- **xl**: 1.25rem (20px) | line-height: 1.4 | letter-spacing: -0.3px
- **2xl**: 1.5rem (24px) | line-height: 1.33 | letter-spacing: -0.5px

#### Semantic Usage
- **Page Title (h1)**: 2xl, text-primary, font-semibold
- **Section Title (h2)**: xl, text-primary, font-semibold
- **Subsection (h3)**: lg, text-primary, font-medium
- **Body Text**: base, text-secondary, font-normal, line-height 1.6
- **Label**: sm, text-tertiary, font-medium, uppercase
- **Caption**: xs, text-tertiary, font-normal

### Subsection 1.3: Spacing

#### Spacing System (Tailwind Base Unit)

Base: 0.25rem = 4px

- **p-1**: 0.25rem (4px) — Tight spacing for badges
- **p-2**: 0.5rem (8px) — Small gaps and button padding
- **p-3**: 0.75rem (12px) — Input padding and label margins
- **p-4**: 1rem (16px) — Standard padding and content gaps
- **p-6**: 1.5rem (24px) — Card padding and section gaps
- **p-8**: 2rem (32px) — Hero sections and major spacing
- **p-12**: 3rem (48px) — Generous spacing and whitespace
- **p-16**: 4rem (64px) — Extra large spacing

### Subsection 1.4: Border Radius

#### Border Radius Scales

- **radius-sm**: 0.375rem (6px) — Small buttons and inputs
- **radius-md**: 0.5rem (8px) — Cards and standard components
- **radius-lg**: 0.75rem (12px) — Large components and dialogs
- **radius-xl**: 1rem (16px) — Hero sections and modals
- **radius-2xl**: 1.5rem (24px) — Extra large sections
- **radius-full**: 9999px — Fully rounded for circles and pills

### Subsection 1.5: Shadows

#### Shadow Scales (Apple-style: Subtle)

- **shadow-xs**: 0 1px 2px 0 rgba(0, 0, 0, 0.05) — Minimal lift
- **shadow-sm**: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1) — Subtle depth
- **shadow-md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) — Standard depth
- **shadow-lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) — Elevated
- **shadow-xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) — Maximum elevation

#### Usage Guidelines
- Elements on bg-primary: shadow-sm
- Elevated cards/modals: shadow-md to shadow-lg
- Floating elements: shadow-lg to shadow-xl

### Subsection 1.6: Animation Tokens

#### Animation Durations

- **duration-fast**: 150ms — Micro-interactions and immediate feedback
- **duration-normal**: 300ms — Standard transitions and state changes
- **duration-slow**: 500ms — Entrance animations and significant transitions
- **duration-leisurely**: 700ms — Slow, deliberate animations

#### Animation Easing Functions

- **ease-linear**: linear — Constant speed
- **ease-smooth**: cubic-bezier(0.4, 0, 0.2, 1) — Natural feel
- **ease-entrance**: cubic-bezier(0.16, 1, 0.3, 1) — Bouncy entrance
- **ease-exit**: cubic-bezier(0.7, 0, 0.84, 0) — Settling exit
- **ease-spring**: cubic-bezier(0.34, 1.56, 0.64, 1) — Playful spring

## SECTION 2: COMPONENT INVENTORY

### Primary Button

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/components-buttons-button |
| **Usage Context** | Primary CTAs: submit, confirm, create, save actions |
| **Component Variants** | primary, secondary, outline, ghost, destructive |
| **Mobile (320-480px)** | Full-width, p-3 padding, 48px height minimum, 48px touch target |
| **Tablet (md: 768px)** | Auto-width if not full-width container, p-4 padding, 48px height |
| **Desktop (lg: 1024px)** | Fixed width or auto, p-4 padding, 48px height, hover states active |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Default** | Page load | bg-primary, text-white, shadow-sm | None | Base state |
| **Hover** | Mouse hover (desktop only) | opacity 0.9, shadow-md, cursor pointer | 150ms ease-smooth | Not on mobile |
| **Active/Pressed** | Click/tap | bg-primary-dark, scale 0.98, shadow-sm | 100ms ease-smooth | Immediate feedback |
| **Disabled** | isDisabled prop | opacity 0.5, cursor-not-allowed, bg-gray | None | Not interactive |
| **Error** | Validation fails | [red border, error text] | 300ms ease-entrance | From error animation |
| **Loading** | Async action | Shows spinner icon, disabled state, text "Loading..." | Continuous spinner | Prevents interaction |
| **Focus** | Keyboard tab | outline 2px solid color-primary, offset 2px | 200ms ease-smooth | WCAG focus indicator |

#### Colors & Typography
- **Text**: text-white, font-semibold, base size
- **Background**: color-primary (oklch(0.55 0.20 250))
- **Border**: None
- **Typography**: base, text-white, font-semibold

#### Spacing
- **Padding**: px-6 py-3 mobile, px-8 py-4 desktop
- **Margin**: m-0
- **Gap**: gap-2 if icon + text

#### Animations Applied
- **Button Hover**: opacity fade to 0.9, shadow increase (150ms, ease-smooth)
- **Button Press**: scale 0.98, slight shadow reduction (100ms, ease-smooth)
- **Loading Spinner**: rotate 360deg infinite (1s, linear)

#### Dark Mode Behavior
- Text color: text-white (unchanged)
- Background: color-primary (unchanged)
- Hover: opacity behavior same
- Focus: outline color-primary

#### Conditional Rendering
- Rendered when action available
- Hidden if user lacks permission

### Text Input

| Property | Value |
|---|---|
| **Registry Source** | @shadcn/input |
| **Usage Context** | Email, password, name inputs in forms |
| **Component Variants** | text, password |
| **Mobile (320-480px)** | Full-width, p-3 padding, 44px height minimum, 44px touch target |
| **Tablet (md: 768px)** | Full-width, p-4 padding, 48px height |
| **Desktop (lg: 1024px)** | Fixed width or full, p-4 padding, 48px height, hover focus ring |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Default** | Page load | bg-secondary, border, placeholder text-tertiary | None | Ready for input |
| **Focus** | Click or tab | border-primary, shadow-sm, ring 2px color-primary offset 2px | 200ms ease-smooth | Clear focus indication |
| **Filled** | User types | bg-primary, text-primary, border-secondary | None | Content present |
| **Error** | Validation fails | border-error, bg-error-light, error text below | 300ms ease-entrance | Error slide-down |
| **Disabled** | isDisabled=true | opacity 0.5, cursor-not-allowed, bg-gray | None | Not editable |
| **Hover** | Mouse over (desktop) | border-primary-light | 150ms ease-smooth | Subtle interaction cue |

#### Colors & Typography
- **Text**: text-primary, base size
- **Background**: bg-secondary
- **Border**: border
- **Placeholder**: text-tertiary, opacity 0.6

#### Spacing
- **Padding**: p-3 mobile, p-4 desktop
- **Margin**: mb-2 for label above, mb-1 for error below
- **Height**: 44px mobile, 48px desktop

#### Animations Applied
- **Focus Ring**: border color and shadow fade-in (200ms, ease-smooth)
- **Error Appearance**: translateY -10px to 0, opacity 0 to 1 (300ms, ease-entrance)

#### Dark Mode Behavior
- Background: bg-tertiary
- Text: text-primary
- Border: border
- Placeholder: text-tertiary
- Focus ring: color-primary

#### Conditional Rendering
- Rendered in forms
- Password variant shows eye icon for toggle

### Dialog

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/components-radix-dialog |
| **Usage Context** | Modals for create group, invite member |
| **Component Variants** | default |
| **Mobile (320-480px)** | Full-screen overlay, centered content, p-4 padding |
| **Tablet (md: 768px)** | Centered modal, max-width 500px, p-6 padding |
| **Desktop (lg: 1024px)** | Centered modal, max-width 600px, p-8 padding |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Closed** | Default | Hidden, overlay opacity 0 | None | Not visible |
| **Open** | Button click | Overlay fade-in, modal scale-in | 300ms ease-entrance | Smooth entrance |
| **Closing** | Close button or outside click | Overlay fade-out, modal scale-out | 200ms ease-exit | Reverse animation |
| **Focus Trap** | Open | Focus moves to first input | None | Accessibility |

#### Colors & Typography
- **Background**: bg-primary
- **Overlay**: black opacity 0.5 light, 0.7 dark
- **Text**: text-primary
- **Title**: lg, font-semibold

#### Spacing
- **Padding**: p-6 mobile, p-8 desktop
- **Margin**: centered via flex
- **Gap**: gap-4 between elements

#### Animations Applied
- **Entrance**: overlay opacity 0→0.5, modal opacity 0→1 scale 0.95→1 (300ms, ease-entrance)
- **Exit**: overlay opacity 0.5→0, modal opacity 1→0 scale 1→0.95 (200ms, ease-exit)

#### Dark Mode Behavior
- Overlay: black opacity 0.7
- Background: bg-primary
- Text: text-primary

#### Conditional Rendering
- Opens on trigger
- Closes on action or escape
- Backdrop click closes

### Sidebar

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/components-radix-sidebar |
| **Usage Context** | Dashboard navigation |
| **Component Variants** | collapsible |
| **Mobile (320-480px)** | Hidden by default, overlay on open, full height |
| **Tablet (md: 768px)** | Collapsed to icons, expandable, 64px width collapsed |
| **Desktop (lg: 1024px)** | Expanded, 280px width, persistent |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Collapsed** | Mobile default, tablet collapsed | Icons only, width 64px | None | Space efficient |
| **Expanded** | Click hamburger or expand button | Full sidebar, width 280px | 300ms ease-smooth | Slide in from left |
| **Hover** | Mouse over collapsed (desktop) | Tooltip on icons | None | Accessibility |
| **Resizing** | Drag edge (future) | Width changes | Smooth | If implemented |

#### Colors & Typography
- **Background**: bg-secondary
- **Text**: text-primary
- **Active item**: bg-primary, text-white

#### Spacing
- **Width**: 280px expanded, 64px collapsed
- **Padding**: p-4
- **Item height**: 48px

#### Animations Applied
- **Expand/Collapse**: translateX -280px to 0 (300ms, ease-smooth)
- **Overlay**: opacity 0 to 0.5 parallel (mobile)

#### Dark Mode Behavior
- Background: bg-tertiary
- Text: text-primary
- Active: color-primary

#### Conditional Rendering
- Always present in dashboard
- Collapsed state based on screen size

### Tabs

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/components-headless-tabs |
| **Usage Context** | Group detail sections |
| **Component Variants** | default |
| **Mobile (320-480px)** | Horizontal scroll if needed, p-2 padding |
| **Tablet (md: 768px)** | Full width, p-4 padding |
| **Desktop (lg: 1024px)** | Full width, p-4 padding, hover states |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Inactive** | Default | text-secondary, no underline | None | Not selected |
| **Active** | Click | text-primary, underline color-primary | 200ms ease-smooth | Selected tab |
| **Hover** | Mouse over (desktop) | opacity 0.8, underline preview | 150ms ease-smooth | Subtle cue |
| **Focus** | Tab | outline ring | 200ms ease-smooth | Keyboard nav |

#### Colors & Typography
- **Text**: text-secondary inactive, text-primary active
- **Underline**: color-primary, 2px height

#### Spacing
- **Padding**: p-4 per tab
- **Underline offset**: 2px from bottom

#### Animations Applied
- **Tab Switch**: underline width 0 to 100% (200ms, ease-smooth)

#### Dark Mode Behavior
- Colors adjust via tokens
- Underline: color-primary

#### Conditional Rendering
- In group detail
- Tabs for Overview, Members, Invitations

### Card

| Property | Value |
|---|---|
| **Registry Source** | @shadcn/card |
| **Usage Context** | Invitation page, member list items |
| **Component Variants** | default |
| **Mobile (320-480px)** | Full-width, p-4 padding, shadow-sm |
| **Tablet (md: 768px)** | Full-width, p-6 padding, shadow-sm |
| **Desktop (lg: 1024px)** | Max-width 600px, p-6 padding, shadow-md, hover shadow-lg |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Default** | Page load | shadow-sm | None | Base |
| **Hover** | Mouse over (desktop) | shadow-md, slight lift | 200ms ease-smooth | Interactive feel |

#### Colors & Typography
- **Background**: bg-primary
- **Text**: text-primary
- **Border**: border subtle

#### Spacing
- **Padding**: p-4 mobile, p-6 desktop
- **Margin**: m-4 between cards

#### Animations Applied
- **Hover Lift**: translateY 0 to -2px, shadow increase (200ms, ease-smooth)

#### Dark Mode Behavior
- Background: bg-secondary
- Shadow: darker shadows

#### Conditional Rendering
- For content display
- Empty state if no content

### Select

| Property | Value |
|---|---|
| **Registry Source** | @shadcn/select |
| **Usage Context** | Role selection, group type |
| **Component Variants** | default |
| **Mobile (320-480px)** | Full-width, touch-friendly |
| **Tablet (md: 768px)** | Auto-width |
| **Desktop (lg: 1024px)** | Auto-width, hover open |

#### Component States

| State | Trigger | Visual Changes | Animation | Notes |
|---|---|---|---|---|
| **Closed** | Default | border, chevron down | None | Ready |
| **Open** | Click | Dropdown visible, chevron up | 200ms ease-entrance | Slide down |
| **Selected** | Choose option | Text updates, close dropdown | None | Value set |
| **Focus** | Tab | outline ring | 200ms ease-smooth | Keyboard |

#### Colors & Typography
- **Text**: text-primary
- **Background**: bg-secondary
- **Dropdown**: bg-primary, shadow-lg

#### Spacing
- **Padding**: p-3 trigger, p-2 options
- **Height**: 44px mobile, 48px desktop

#### Animations Applied
- **Dropdown**: translateY 0 to full height (200ms, ease-entrance)

#### Dark Mode Behavior
- Background: bg-tertiary
- Dropdown: bg-secondary

#### Conditional Rendering
- In forms
- Options based on context

## SECTION 3: ICON LIBRARY

### Check Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-check |
| **Sizes Available** | 16px, 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | color-success |
| **Color (Dark Mode)** | color-success |
| **Animation** | None |
| **Usage Contexts** | Success states, confirmations |
| **Accessibility** | aria-hidden="true" |

### Menu Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-menu |
| **Sizes Available** | 24px, 32px |
| **Default Size** | 32px |
| **Color (Light Mode)** | text-primary |
| **Color (Dark Mode)** | text-primary |
| **Animation** | Rotate 90° on open (300ms, ease-smooth) |
| **Usage Contexts** | Mobile hamburger menu |
| **Accessibility** | aria-label="Toggle menu", aria-expanded |

### User Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-user |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | text-secondary |
| **Color (Dark Mode)** | text-secondary |
| **Animation** | None |
| **Usage Contexts** | Avatar placeholders, user references |
| **Accessibility** | aria-hidden="true" |

### Plus Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-plus |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | text-primary |
| **Color (Dark Mode)** | text-primary |
| **Animation** | None |
| **Usage Contexts** | Add buttons, create actions |
| **Accessibility** | aria-label="Add" |

### X Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-x |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | text-primary |
| **Color (Dark Mode)** | text-primary |
| **Animation** | None |
| **Usage Contexts** | Close buttons, remove actions |
| **Accessibility** | aria-label="Close" |

### Eye Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-eye |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 20px |
| **Color (Light Mode)** | text-tertiary |
| **Color (Dark Mode)** | text-tertiary |
| **Animation** | None |
| **Usage Contexts** | Password show/hide toggle |
| **Accessibility** | aria-label="Show password" |

### Chevron Down Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-chevron-down |
| **Sizes Available** | 16px, 20px, 24px |
| **Default Size** | 20px |
| **Color (Light Mode)** | text-primary |
| **Color (Dark Mode)** | text-primary |
| **Animation** | Rotate 180° on open (200ms, ease-smooth) |
| **Usage Contexts** | Select dropdown trigger |
| **Accessibility** | aria-hidden="true" |

### Mail Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-mail |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | text-secondary |
| **Color (Dark Mode)** | text-secondary |
| **Animation** | None |
| **Usage Contexts** | Email references |
| **Accessibility** | aria-hidden="true" |

### Lock Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-lock |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 20px |
| **Color (Light Mode)** | text-tertiary |
| **Color (Dark Mode)** | text-tertiary |
| **Animation** | None |
| **Usage Contexts** | Password fields |
| **Accessibility** | aria-hidden="true" |

### Settings Icon

| Property | Value |
|---|---|
| **Registry Source** | @animate-ui/icons-settings |
| **Sizes Available** | 20px, 24px |
| **Default Size** | 24px |
| **Color (Light Mode)** | text-secondary |
| **Color (Dark Mode)** | text-secondary |
| **Animation** | Rotate on hover (desktop) |
| **Usage Contexts** | Settings buttons |
| **Accessibility** | aria-label="Settings" |

## SECTION 4: USER JOURNEYS

### Journey: New User Onboarding

**Entry Point**: User arrives at app home page

**Journey Completion**: Account created, email confirmed, user logged in

#### Step 1: Home Page

**Screen Purpose**: Welcome new users, prompt to sign up

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Centered vertical stack, full height, flex column
- Header: None
- Content: Hero title, subtitle, CTA button, login link
- Footer: None
- Scrollable: No, fits in viewport

**Tablet (md: 768px)**:
- Layout: Centered, larger padding, max-width 600px, bg-secondary card
- Spacing: p-12

**Desktop (lg: 1024px)**:
- Layout: Centered, max-width 800px, generous whitespace, shadow-sm
- Spacing: p-16
- Hover: Button hover state, link underline

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Primary Button | @animate-ui/components-buttons-button | Get Started CTA | default, hover | Opacity fade |
| Link | N/A | Login link | default | None |

##### Colors & Typography

- **Hero Title (h1)**: 2xl, text-primary, font-semibold, center, line-height 1.2
- **Subtitle**: base, text-secondary, center, max-width 400px
- **Button**: color-primary bg, text-white
- **Link**: color-primary, underline on hover

##### Spacing Specifications

- **Top padding**: p-8 mobile, p-12 tablet, p-16 desktop
- **Section gaps**: gap-6
- **Button margin**: mt-8
- **Link margin**: mt-4

##### Interactive Elements & Animations

1. **Get Started Button**:
   - Trigger: Click
   - Animation: Navigate to signup, page transition fade
   - Next screen: Sign Up Form

2. **Login Link**:
   - Trigger: Click
   - Animation: Navigate to login

##### Conditional Rendering & Edge Cases

- Always shown
- If user already logged in: Redirect to dashboard immediately

##### Data Presentation

- None

##### Dark Mode Behavior

- Text colors invert via tokens
- Button: color-primary unchanged
- Card: bg-secondary in tablet+

#### Step 2: Sign Up Form

**Screen Purpose**: Collect user email and password

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Single column form, centered, full-width
- Header: Title
- Content: Email input, password input, confirm password input, button
- Footer: Login link
- Scrollable: If keyboard open, auto-scroll to focused input

**Tablet (md: 768px)**:
- Layout: Centered form, max-width 400px, bg-secondary card, shadow-sm

**Desktop (lg: 1024px)**:
- Layout: Centered, max-width 400px, card with shadow

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Text Input | @shadcn/input | Email input | default, focus, error | Focus ring |
| Text Input | @shadcn/input | Password input | default, focus, error | Focus ring |
| Text Input | @shadcn/input | Confirm password | default, focus, error | Focus ring |
| Primary Button | @animate-ui/components-buttons-button | Submit | default, loading | None |

##### Colors & Typography

- **Title**: xl, text-primary, font-semibold, center
- **Labels**: sm, text-tertiary, font-medium, uppercase, left-aligned
- **Inputs**: bg-secondary
- **Button**: color-primary

##### Spacing Specifications

- **Form padding**: p-6
- **Input gap**: gap-4
- **Label margin**: mb-2
- **Button top**: mt-6

##### Interactive Elements & Animations

1. **Email Input**:
   - Trigger: Focus
   - Animation: Border color change (200ms)

2. **Password Input**:
   - Trigger: Focus
   - Animation: Same
   - Additional: Eye icon toggle, no animation

3. **Submit Button**:
   - Trigger: Click
   - Animation: Loading state, spinner, then navigate

##### Conditional Rendering & Edge Cases

- Error: Show specific error messages below fields
- Success: Redirect to confirmation
- If email exists: Error "Account already exists"
- If weak password: Error "Must be 8+ chars"
- If passwords don't match: Error "Passwords don't match"

##### Data Presentation

- Validation errors: Red text below inputs, slide-down animation

##### Dark Mode Behavior

- Inputs: bg-tertiary
- Card: bg-secondary

#### Step 3: Email Confirmation

**Screen Purpose**: Confirm email sent, wait for user action

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Centered card, full-width, p-6
- Content: Icon, title, message, button

**Tablet (md: 768px)**:
- Larger card, centered, max-width 500px

**Desktop (lg: 1024px)**:
- Max-width 500px, shadow-md

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Card | @shadcn/card | Container | default | None |
| Check Icon | @animate-ui/icons-check | Success indicator | default | None |
| Primary Button | @animate-ui/components-buttons-button | Resend | default | None |

##### Colors & Typography

- **Title**: xl, text-primary, font-semibold, center
- **Text**: base, text-secondary, center
- **Icon**: color-success, 64px

##### Spacing Specifications

- **Card padding**: p-6
- **Icon margin**: mb-4
- **Button top**: mt-6

##### Interactive Elements & Animations

1. **Resend Button**:
   - Trigger: Click
   - Animation: Toast notification "Email sent"

##### Conditional Rendering & Edge Cases

- Expired link: Show error card "Link expired", resend button
- If confirmed: Redirect to login with success banner

##### Data Presentation

- None

##### Dark Mode Behavior

- Card: bg-secondary
- Icon: color-success

#### Step 4: Login Form

**Screen Purpose**: Authenticate returning users

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Single column, centered, full-width

**Tablet (md: 768px)**:
- Centered, card

**Desktop (lg: 1024px)**:
- Centered, max-width 400px

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Text Input | @shadcn/input | Email | default, focus, error | Focus ring |
| Text Input | @shadcn/input | Password | default, focus, error | Focus ring |
| Primary Button | @animate-ui/components-buttons-button | Sign In | default, loading | None |
| Link | N/A | Forgot password | default | None |

##### Colors & Typography

- **Title**: xl, text-primary, center

##### Spacing Specifications

- **Form padding**: p-6
- **Gap**: gap-4

##### Interactive Elements & Animations

1. **Sign In Button**:
   - Trigger: Click
   - Animation: Loading, navigate

##### Conditional Rendering & Edge Cases

- Error: "Invalid credentials"
- Locked: "Account locked for 15 min"
- Success: Redirect to dashboard

##### Data Presentation

- Error messages

##### Dark Mode Behavior

- Inputs: bg-tertiary

### Journey: Existing User Login

**Entry Point**: User navigates to login

**Journey Completion**: User authenticated, dashboard loaded

#### Step 1: Login Form

Similar to above, but entry from link.

### Journey: Group Management

**Entry Point**: Dashboard

**Journey Completion**: Group created or managed

#### Step 1: Dashboard

**Screen Purpose**: Overview of user's groups

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Sidebar hidden, main content full-width, p-4
- Navigation: Hamburger menu top-left, fixed position

**Tablet (md: 768px)**:
- Sidebar collapsed to icons, main content with margin-left 64px

**Desktop (lg: 1024px)**:
- Sidebar expanded, main content margin-left 280px

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Sidebar | @animate-ui/components-radix-sidebar | Navigation | collapsed, expanded | Slide |
| Primary Button | @animate-ui/components-buttons-button | Add Group | default | None |
| List | N/A | Groups list | default | None |

##### Colors & Typography

- **Title**: xl, text-primary

##### Spacing Specifications

- **Sidebar width**: 280px
- **Main padding**: p-4 mobile, p-6 desktop

##### Interactive Elements & Animations

1. **Hamburger**:
   - Trigger: Click
   - Animation: Sidebar slide (300ms), overlay fade

2. **Add Group**:
   - Trigger: Click
   - Animation: Open modal

3. **Group Item**:
   - Trigger: Click
   - Animation: Navigate to group detail

##### Conditional Rendering & Edge Cases

- Empty: Show "No groups" message, prominent add button
- Loading: Skeleton list
- Error: Error banner "Failed to load groups", retry button

##### Data Presentation

- Groups list: Vertical stack, each item name, type, member count

##### Dark Mode Behavior

- Sidebar: bg-tertiary

#### Step 2: Create Group Form

**Screen Purpose**: Create new group

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Full-screen modal

**Tablet (md: 768px)**:
- Centered modal, 500px width

**Desktop (lg: 1024px)**:
- Centered, 600px

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Dialog | @animate-ui/components-radix-dialog | Modal | open | Fade scale |
| Text Input | @shadcn/input | Name | default | None |
| Text Input | @shadcn/input | Slug | default | Auto-generated |
| Textarea | @shadcn/textarea | Description | default | None |
| Select | @shadcn/select | Type | default | Dropdown |
| Primary Button | @animate-ui/components-buttons-button | Create | default, loading | None |

##### Colors & Typography

- **Title**: lg, text-primary, font-semibold

##### Spacing Specifications

- **Modal padding**: p-6
- **Gap**: gap-4
- **Button top**: mt-6

##### Interactive Elements & Animations

1. **Name Input**:
   - Trigger: Type
   - Animation: Slug auto-updates

2. **Create Button**:
   - Trigger: Click
   - Animation: Loading, close modal, toast

##### Conditional Rendering & Edge Cases

- Error: Name required, slug taken
- Limit: If at max groups, disable button, show message

##### Data Presentation

- Form errors

##### Dark Mode Behavior

- Modal: bg-primary

#### Step 3: Group Detail

**Screen Purpose**: View and manage group

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Header, tabs below, content scrollable

**Tablet (md: 768px)**:
- Tabs horizontal

**Desktop (lg: 1024px)**:
- Tabs horizontal, wider content

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Tabs | @animate-ui/components-headless-tabs | Sections | active | Underline slide |
| Primary Button | @animate-ui/components-buttons-button | Invite | default | None |
| List | N/A | Members | default | None |

##### Colors & Typography

- **Title**: xl, text-primary

##### Spacing Specifications

- **Content padding**: p-6

##### Interactive Elements & Animations

1. **Tabs**:
   - Trigger: Click
   - Animation: Underline slide (200ms)

2. **Invite Button**:
   - Trigger: Click
   - Animation: Open modal

##### Conditional Rendering & Edge Cases

- Empty members: "No members yet"
- Permission: Hide actions if not admin

##### Data Presentation

- Members: List with name, role, actions

##### Dark Mode Behavior

- Tabs: adjust colors

#### Step 4: Invite Member

Modal with email input, role select.

#### Step 5: Manage Members

List with change role, remove actions.

### Journey: Handle Invitation

**Entry Point**: Click invitation link

**Journey Completion**: Join group or decline

#### Step 1: Invitation Page

**Screen Purpose**: Accept or reject invitation

##### Layout & Responsive Behavior

**Mobile (320-480px)**:
- Layout: Centered card, full-width

**Tablet (md: 768px)**:
- Larger card

**Desktop (lg: 1024px)**:
- Max-width 500px

##### Components Used

| Component | Registry | Purpose | States | Animation |
|---|---|---|---|---|
| Card | @shadcn/card | Invitation | default | None |
| Primary Button | @animate-ui/components-buttons-button | Accept | default | None |
| Button | @shadcn/button | Reject | outline | None |

##### Colors & Typography

- **Title**: xl, text-primary

##### Spacing Specifications

- **Card padding**: p-6

##### Interactive Elements & Animations

1. **Accept/Reject**:
   - Trigger: Click
   - Animation: Navigate, success message

##### Conditional Rendering & Edge Cases

- Expired: Error "Invitation expired"
- Already member: "Already joined"
- Not logged in: Prompt login

##### Data Presentation

- Group name, inviter, role

##### Dark Mode Behavior

- Card: bg-secondary

### Journey: Password Reset

**Entry Point**: Forgot password link

**Journey Completion**: Password updated

#### Step 1: Reset Request

Form with email.

#### Step 2: Reset Form

New password inputs.

## SECTION 5: ANIMATION LIBRARY REFERENCE

### Micro-Interactions (150-200ms, Immediate Feedback)

#### Button Hover State

| Property | Value |
|---|---|
| **Trigger** | Mouse hover (desktop only) |
| **Element(s)** | Button background + shadow |
| **Animation Library** | Tailwind Animate |
| **Duration** | 150ms |
| **Easing** | ease-smooth |
| **Transform Properties** | opacity: 1 → 0.9; box-shadow: shadow-sm → shadow-md |
| **Keyframe Breakdown** | 0%: opacity 1, shadow-sm; 100%: opacity 0.9, shadow-md |
| **GPU Acceleration** | opacity, box-shadow |
| **Performance** | 60fps, no layout thrashing |
| **Reduced-Motion Fallback** | Instant change |
| **Browser Support** | All modern browsers |

### Entrance Animations (300-500ms, Page Load / Screen Enter)

#### Modal Fade-In Scale

| Property | Value |
|---|---|
| **Trigger** | Modal open |
| **Element(s)** | Modal container + overlay |
| **Animation Library** | Framer Motion |
| **Duration** | 300ms |
| **Easing** | ease-entrance |
| **Transform Properties** | overlay opacity: 0 → 0.5; modal opacity: 0 → 1; modal scale: 0.95 → 1 |
| **Keyframe Breakdown** | 0%: overlay 0, modal 0 scale 0.95; 100%: overlay 0.5, modal 1 scale 1 |
| **GPU Acceleration** | transform (scale), opacity |
| **Performance** | 60fps, monitor on low-end devices |
| **Reduced-Motion Fallback** | Instant appearance |
| **Stagger** | None |

### State Change Animations (300ms, User Interaction Result)

#### Form Error Slide-Down

| Property | Value |
|---|---|
| **Trigger** | Validation error |
| **Element(s)** | Error message container |
| **Animation Library** | Framer Motion |
| **Duration** | 300ms |
| **Easing** | ease-entrance |
| **Transform Properties** | opacity: 0 → 1; translateY: -10px → 0 |
| **Keyframe Breakdown** | 0%: opacity 0, translateY -10px; 100%: opacity 1, translateY 0 |
| **GPU Acceleration** | transform (translateY), opacity |
| **Performance** | 60fps |
| **Reduced-Motion Fallback** | Instant show |
| **Z-index** | Above form, no overlap |

### Navigation Animations (200-300ms, User Navigation)

#### Sidebar Slide-In

| Property | Value |
|---|---|
| **Trigger** | Hamburger click |
| **Element(s)** | Sidebar + overlay (mobile) |
| **Animation Library** | Framer Motion |
| **Duration** | 300ms |
| **Easing** | ease-smooth |
| **Transform Properties** | sidebar translateX: -280px → 0; overlay opacity: 0 → 0.5 |
| **Keyframe Breakdown** | 0%: translateX -280px, overlay 0; 100%: translateX 0, overlay 0.5 |
| **GPU Acceleration** | transform (translateX), opacity |
| **Performance** | 60fps mobile, test on iPhone |
| **Reduced-Motion Fallback** | Instant slide |
| **Overlay** | Black backdrop, z-index above content |

### Loading & Feedback Animations (Continuous, System State)

#### Spinner Rotation

| Property | Value |
|---|---|
| **Trigger** | Async action start |
| **Element(s)** | Spinner icon in button |
| **Animation Library** | Tailwind Animate |
| **Duration** | 1000ms (full rotation) |
| **Easing** | linear |
| **Transform Properties** | rotate: 0deg → 360deg → infinite |
| **Keyframe Breakdown** | 0%: rotate 0; 100%: rotate 360 |
| **GPU Acceleration** | transform (rotate) |
| **Performance** | 60fps, lightweight |
| **Stops when** | Action completes + 200ms delay |
| **Reduced-Motion Fallback** | Static spinner icon |
| **Color** | Inherits button color |

## SECTION 6: RESPONSIVE BREAKPOINT MATRIX

| Breakpoint | Device | Width | Layout Type | Typography | Navigation | Spacing | Key Characteristics |
|---|---|---|---|---|---|---|---|
| **Mobile** | Phone | 320-480px | Single column, vertical stack | base: 16px, h1: 24px, label: 12px | Hamburger menu, overlay sidebar | p-4, gap-4, px-4 | Full-width, 44-48px touch targets, thumb navigation |
| **Tablet (md)** | Tablet | 481-768px | 2-column possible, centered forms | base: 17px, h1: 28px, label: 14px | Collapsed sidebar, horizontal tabs | p-6, gap-6, px-6 | Improved readability, touch still primary |
| **Desktop (lg)** | Desktop | 769-1024px | Multi-column, persistent sidebar | base: 18px, h1: 32px, label: 14px | Expanded sidebar, hover states | p-8, gap-8, px-8 | Mouse interactions, efficient space use |
| **Large (xl)** | Desktop XL | 1025-1440px | Full grid, generous whitespace | base: 18px, h1: 36px, label: 14px | Full nav options | p-12, gap-12, px-12 | Abundant space, max-width containers |
| **Ultra (2xl)** | Desktop XXL | 1441px+ | Ultra-wide with gutters | base: 20px, h1: 40px, label: 15px | Multi-nav possible | p-16, gap-16, px-16 | Centered content, extreme whitespace |

## SECTION 7: COMPONENT VARIANTS DOCUMENTATION

### Button Variants

#### Variant: Primary

**When to use**: Main CTAs, form submissions

| Property | Value |
|---|---|
| **Background** | color-primary |
| **Text** | text-white |
| **Border** | None |
| **Hover State** | opacity 0.9, shadow-md |
| **Disabled State** | opacity 0.5, cursor-not-allowed |
| **Loading State** | spinner, text "Loading..." |

#### Variant: Secondary

**When to use**: Secondary actions, cancel

| Property | Value |
|---|---|
| **Background** | bg-secondary |
| **Text** | text-primary |
| **Border** | 1px solid color-primary |
| **Hover State** | bg-tertiary, shadow-sm |
| **Disabled State** | opacity 0.5 |

#### Variant: Outline

**When to use**: Tertiary actions, less prominent

| Property | Value |
|---|---|
| **Background** | transparent |
| **Text** | color-primary |
| **Border** | 2px solid color-primary |
| **Hover State** | bg-primary opacity 0.1 |
| **Disabled State** | opacity 0.5 |

#### Variant: Ghost

**When to use**: Minimal presence, toolbars

| Property | Value |
|---|---|
| **Background** | transparent |
| **Text** | text-primary |
| **Border** | None |
| **Hover State** | bg-tertiary opacity 0.5 |
| **Disabled State** | opacity 0.5 |

#### Variant: Destructive

**When to use**: Delete, remove actions

| Property | Value |
|---|---|
| **Background** | color-error |
| **Text** | text-white |
| **Border** | None |
| **Hover State** | opacity 0.9 |
| **Disabled State** | opacity 0.5 |

## SECTION 8: DARK MODE COVERAGE MAP

## Dark Mode Support

### Screens Supporting Dark Mode

| Screen | Light Mode | Dark Mode | Notes |
|---|---|---|---|
| **Home** | ✅ | ✅ | Token system handles inversion |
| **Sign Up** | ✅ | ✅ | Forms, buttons themed |
| **Login** | ✅ | ✅ | Forms, buttons themed |
| **Dashboard** | ✅ | ✅ | Sidebar, lists themed |
| **Group Detail** | ✅ | ✅ | Tabs, cards themed |
| **Invitation** | ✅ | ✅ | Cards, buttons themed |

### Screens Forced to Light Mode

| Screen | Reason | Override |
|---|---|---|
| None | All support dark | N/A |

### Token Inversion Strategy

All color tokens automatically invert when dark mode is active via CSS @theme @variant dark directive.

**Manual testing checklist**:
- ✅ Text contrast meets WCAG AA (4.5:1 minimum)
- ✅ All interactive elements visible and usable
- ✅ Icons inherit color tokens correctly
- ✅ Shadows adapt (darker in dark mode)
- ✅ Form inputs remain accessible
- ✅ Animations work in both modes

## SECTION 9: DATA PRESENTATION PATTERNS

## Lists & Collections

### List Item Structure

**Mobile (320-480px)**:
- One item per row
- Item height: 64px minimum
- Padding: p-4
- Touch target: Full row, 44px minimum
- Visible items: 3-6 per screen

**Tablet (md: 768px)**:
- Item height: 72px
- Padding: p-6
- Visible items: 4-8

**Desktop (lg: 1024px)**:
- Item height: 64px
- Padding: p-4
- Hover: bg-tertiary on row
- Visible items: 10+

### Pagination Strategy

- **Mobile**: "Load More" button at bottom, full-width
- **Tablet**: "Load More" or numbered 1 2 3
- **Desktop**: Numbered pagination

### Empty State

- **Icon**: 64px, text-tertiary, centered
- **Title**: "No items yet", lg, text-primary
- **Description**: base, text-secondary
- **CTA**: Primary button centered below
- **Animation**: Fade-in on load (300ms)

## Forms

### Input Field Structure

**Mobile**:
- Label: sm, text-tertiary, mb-2, above input
- Input: Full-width, p-3, 44px height minimum
- Error: Below input, xs, color-error, mt-1
- Helper: Below error, xs, text-tertiary

**Desktop**:
- Input: p-4, 48px height
- Hover: Subtle border change
- Focus: Ring 2px, offset 2px

### Validation Display

- **On blur**: Validate field, show error immediately
- **On submit**: Validate all, show all errors
- **Error animation**: Slide-down from above (300ms, ease-entrance)
- **Error clear**: On focus, hide error instantly

## Tables

None in this app, but if added:

### Mobile

- Horizontal scroll
- Sticky first column
- Compact padding p-2

### Desktop

- Full width
- Hover row highlight
- Sortable headers with icons

## Images & Media

None.


<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design,this creates what users call the "AI slop" aesthetic. Avoid this: make creative,distinctive frontends that surprise and delight. 

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>