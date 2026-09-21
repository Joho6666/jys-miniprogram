---
name: Campus Productivity WeChat Native
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#ebedf9'
  surface-container-high: '#e5e8f3'
  surface-container-highest: '#dfe2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2c3039'
  inverse-on-surface: '#eef0fc'
  outline: '#727786'
  outline-variant: '#c1c6d7'
  surface-tint: '#0059c7'
  primary: '#0057c2'
  on-primary: '#ffffff'
  primary-container: '#006ef2'
  on-primary-container: '#fefcff'
  inverse-primary: '#afc6ff'
  secondary: '#0053d0'
  on-secondary: '#ffffff'
  secondary-container: '#306ded'
  on-secondary-container: '#fefcff'
  tertiary: '#525d6d'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a7586'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#dae1ff'
  secondary-fixed-dim: '#b3c5ff'
  on-secondary-fixed: '#001849'
  on-secondary-fixed-variant: '#003fa3'
  tertiary-fixed: '#d8e3f7'
  tertiary-fixed-dim: '#bcc7da'
  on-tertiary-fixed: '#111c2a'
  on-tertiary-fixed-variant: '#3d4857'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#dfe2ed'
typography:
  headline-lg:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 24px
  title-md:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-xs:
    fontFamily: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", sans-serif
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
---

## Brand & Style

This design system is engineered specifically for university teaching, research groups, and faculty administration within the WeChat Mini Program ecosystem. The brand identity reflects structural rigor, institutional trust, and high operational clarity. It deliberately balances the lightweight, friction-free feel of native WeChat standards with the high-information-density workflows of enterprise tools like Lark and WeCom.

The aesthetic philosophy centers on **Corporate Restraint and Native Functionalism**:
- Zero decorative overhead: Decorative gradients, tinted surface washes, and heavy drop shadows are forbidden.
- High scan efficiency: Hierarchy is established strictly through structured margins, typography weight, micro-spacing, and hairline divider rules (`#E5E7EB`).
- Native Mini Program integration: Deep alignment with the WeChat OS environment, honoring standard top-nav metrics, the right-hand capsule reserve zone, and native list-cell paradigms.

## Colors

The palette is tuned for legibility in indoor, office, and academic laboratory lighting. It avoids decorative tonal pastel backgrounds entirely, grounding every surface in solid utility.

### Primary & Functional Colors
- **Primary (`#1677FF`)**: University Cobalt. Used for primary CTAs, active segmented tabs, focused state indicators, and key progress accents.
- **Primary Hover/Pressed (`#0958D9`)**: Deep Cobalt. Feedback state for primary button taps and selected row highlights.
- **Success (`#52C41A`)**: Institutional Green. Indicates completed tasks, approved submissions, and verified research credits.
- **Warning (`#FA8C16`)**: Urgency Amber. Signals approaching deadlines (e.g., within 24–48 hours) and pending document submissions.
- **Review / Pending (`#FAAD14`)**: Supervision Gold. Represents items queued for department head or academic advisor review.
- **Danger (`#FF4D4F`)**: Crimson. Flags overdue milestones, rejected proposals, or missing compliance data.

### Neutrals & Foundation
- **Canvas Background (`#F5F7FA`)**: A cool, clean neutral tone that prevents eye strain across long grading or administrative sessions. Never substitute with lavender or purplish tints.
- **Surface (`#FFFFFF`)**: Pure crisp white for content groups, tables, modal bodies, and standard WeChat group list items.
- **Text Primary (`#1D2129`)**: High-contrast, near-black for headers, critical metadata, task titles, and form inputs.
- **Text Secondary (`#4E5969`)**: Medium-dark neutral for field labels, table headers, descriptions, and user guidance.
- **Text Helper (`#86909C`)**: Subordinate neutral for timestamps, character counts, file formats, and secondary meta tags.
- **Borders & Dividers (`#E5E7EB`)**: Structural hairpins and container boundaries.

## Typography

The typography system relies exclusively on system font stacks for Chinese OS rendering (`-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`), guaranteeing instant loading and native performance within the WeChat WebView/Skyline engine.

### Typographic Hierarchy & Intent
- **Header Navigation Bar (`17px / 500`)**: Standard WeChat native navigation bar title, centered and balanced against the native capsule button on the right.
- **Metric Figures (`20px - 24px / 600`)**: Used for statistical summary dashboards (e.g., student paper completion rates, research fund balances, pending review tallies).
- **Module Section Titles (`15px / 600`)**: Section headers that partition groups of settings, approval workflows, or academic calendar blocks.
- **Row Titles & Important Items (`15px / 500`)**: High-priority list rows, student/faculty names in directory listings, and primary form field titles.
- **Standard Body & Descriptive Content (`14px / 400`)**: General descriptions, assignment rubrics, review annotations, and nested row items.
- **Auxiliary Labels, Tags & Footnotes (`12px / 400` & `11px / 500`)**: Status tags, submission timestamps, and system guidelines.

## Layout & Spacing

The layout is built for native mobile devices running WeChat, with an emphasis on compactness, scroll efficiency, and vertical rhythm.

### Layout Philosophy
1. **Vertical Group Stack**: Rather than nested multi-layer cards, views are organized using edge-to-edge or margin-inset group lists with white backgrounds (`#FFFFFF`) sitting on the canvas (`#F5F7FA`).
2. **Compact Vertical Budget**: To avoid endless scrolling during multi-task reviews, cards and rows are restricted to dense bounds. Single task items must target a height of `120px` to `140px`, including all metadata and action links.
3. **Margins & Gutters**:
   - Screen Margin: `16px` (`1rem`) on horizontal edges for card lists.
   - Group Row Padding: `12px` to `16px` vertical, `16px` horizontal.
   - Row Separator Indent: `16px` left indent to match text alignment, leaving the icon or left-edge uncluttered.
4. **WeChat Mini Program Capsule Avoidance**: The top custom navigation bar must pad right by `96px` to reserve clean clearance for the WeChat client capsule.

## Elevation & Depth

This design system avoids simulated elevation, drop shadows, and blur layers. Visual separation is accomplished solely through **flat tonal contrast and hairline borders**.

- **Canvas Level (Level 0)**: `#F5F7FA`. Forms the outer page scroll area and group gap zones.
- **Surface Level (Level 1)**: `#FFFFFF`. The primary operational plane for form cells, list rows, metric summaries, and action panels.
- **Borders & Dividers**: All surfaces and grouped blocks are bounded by `#E5E7EB` 0.5px (on Retina displays) or 1px hairline rules.
- **Active State / Pressed**: Cells use `#F2F3F5` overlay tinting on tap rather than scale down or shadow depression.
- **Overlays & Drawers**: Modals, action sheets, and picker menus use a solid white surface with a neutral `#000000` 45% alpha backdrop dimming mask.

## Shapes

The shape system is restrained and disciplined. Excessive rounding is avoided to prevent a consumer-entertainment feel and preserve an enterprise, institutional tone.

- **Group Cards & Blocks**: `8px` corner radius. When using full-bleed group lists, top and bottom corners are square (`0px`).
- **Standard Buttons**: `8px` corner radius to match input fields and dialog buttons.
- **Status Badges & Tags**: `4px` corner radius for sharp, crisp data labels.
- **Search Inputs**: `6px` or `8px` corner radius; avoid stadium/pill rounded search bars to maintain a serious workplace aesthetic.
- **Avatars**: Academic and student profile images use an `8px` rounded square for institutional accounts, or circular shapes only for standard personal user handles.

## Components

### 1. Navigation Bar (WeChat Custom Header)
- Height: 44px (excluding device status bar).
- Content: Centered title in `17px / 500` (`#1D2129`).
- Left Action: Native-style arrow back icon or home icon (20px). Never add decorative blue pills or colorful icons.
- Right Safe Zone: Padded right by 96px to accommodate WeChat's three-dot and close capsule.

### 2. Group List Rows (Standard WeChat Cell Pattern)
- Height: Minimum 48px, standard 54px.
- Background: `#FFFFFF`. Pressed state: `#F2F3F5`.
- Layout: Left title (`15px / 500`), optional icon, right aligned helper info or status tag (`14px / 400`, `#86909C`), followed by an 8px chevron arrow.
- Divider: `#E5E7EB` hairline rule indented 16px from the left edge; no divider after the final item in a group.

### 3. Task & Approval Cards
- Height: Compact constraint between `120px` and `140px`.
- Structure:
  - Header: Academic subject or module name (`13px / 500`, `#4E5969`) with right-aligned status Tag.
  - Body: Task / Thesis Title (`15px / 600`, `#1D2129`), single-line truncation.
  - Subtext: Assignee / Researcher and deadline (`12px / 400`, `#86909C`).
  - Footer: Bottom-aligned action links or hairline separator with single-tap review actions.

### 4. Status Badges & Tags
- Height: 22px to 24px, padding `2px 8px`, border radius `4px`.
- Typography: `11px` or `12px` medium weight.
- Color Variants:
  - **Completed**: `#F6FFED` background, `#52C41A` text, `#B7EB8F` hairline border.
  - **Urgent**: `#FFF7E6` background, `#FA8C16` text, `#FFD591` hairline border.
  - **Pending Review**: `#FFFBE6` background, `#FAAD14` text, `#FFE58F` hairline border.
  - **Rejected / Overdue**: `#FFF1F0` background, `#FF4D4F` text, `#FFA39E` hairline border.
  - **Neutral**: `#F2F3F5` background, `#4E5969` text, `#E5E7EB` hairline border.

### 5. Buttons
- **Primary**: Background `#1677FF`, text `#FFFFFF`, border-radius `8px`, height `44px` (full width) or `32px` (compact). Active: `#0958D9`.
- **Secondary / Ghost**: Background `#FFFFFF`, text `#1D2129`, border `1px solid #E5E7EB`, height `44px` or `32px`. Active: `#F5F7FA`.
- **Destructive**: Background `#FFF1F0`, text `#FF4D4F`, border `1px solid #FFA39E`.
- **Disabled**: Background `#F2F3F5`, text `#C9CDD4`, border none.

### 6. Input Fields & Form Controls
- Input container height: `44px`. Border: `1px solid #E5E7EB`, background `#FFFFFF`, radius `8px`.
- Focused state: Border transitions to `#1677FF` without glow or spread shadows.
- Checkboxes & Radios: 18px size. Checkbox uses `4px` radius; radio uses circular geometry. Selected state fills with `#1677FF`.

### 7. Segmented Tabs & Filters
- Underlined minimal tabs: Text `#4E5969`, active text `#1677FF` with a 2px high cobalt bar positioned underneath.
- Compact Pill Filters: Background `#F2F3F5`, text `#4E5969`, radius `4px`. Active state switches to `#E8F3FF` with `#1677FF` text.