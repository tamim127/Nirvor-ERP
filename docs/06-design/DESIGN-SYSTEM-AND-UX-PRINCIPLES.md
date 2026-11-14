# Design System and UX Principles

## Product experience

Nirvor ERP must feel like one coherent product even when tenants activate different modules. The interface should reduce cognitive load for occasional and daily users.

## Visual direction

- Enterprise professional
- Clean information hierarchy
- Restrained color palette
- Strong typography and spacing
- Dense data views where needed, with readable defaults
- Consistent interaction patterns
- Light and dark themes only after contrast and component coverage are verified

## Mobile-first

Design responsive workflows from the beginning. Mobile should not be a compressed desktop screen.

- Touch-friendly targets
- Bottom navigation or compact navigation where appropriate
- Cards or focused views instead of forcing wide tables
- Quick actions for frequent tasks
- Responsive forms and approval flows
- Useful empty, loading, offline, and error states
- PWA capability can be evaluated; offline writes require explicit conflict and security design

## Information architecture

- Role-aware navigation
- Search and command access
- Consistent module shell
- Breadcrumbs and contextual actions
- Clear tenant/company/branch context
- Visible permission and plan limitations without exposing sensitive internals

## Accessibility

Target WCAG 2.2 AA as a design and testing goal. Use semantic controls, keyboard navigation, visible focus, contrast checks, labels, and screen-reader testing.

## Design tokens

Define color, typography, spacing, radius, elevation, motion, breakpoints, and component states centrally. Avoid one-off styling that fragments the product.
