# UI Component Registry

> Generated on 2026-07-13
> Project: rag-frontend (Next.js 16, React 19, Tailwind v4, TypeScript)

---

## shadcn/ui

**Package:** `shadcn@latest` (CLI) — initialized
**Site:** https://ui.shadcn.com
**Status:** ✅ Installed & configured

### Available Components (in `src/components/ui/`)

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `avatar.tsx` | User avatars with fallback | Chat messages, profile |
| `badge.tsx` | Status/label badges | Document status, tags |
| `button.tsx` | Action buttons | All interactive elements |
| `card.tsx` | Content containers | Panels, cards, sections |
| `command.tsx` | Command palette via cmdk | Search, quick actions |
| `dialog.tsx` | Modal dialogs | Confirmations, modals |
| `dropdown-menu.tsx` | Context menus | Actions, options |
| `input.tsx` | Text inputs | Forms, search |
| `input-group.tsx` | Grouped inputs | Search with icon, forms |
| `label.tsx` | Form labels | Forms |
| `scroll-area.tsx` | Custom scroll areas | Chat, long content |
| `select.tsx` | Dropdown selects | Options, filters |
| `separator.tsx` | Dividers | Layout separation |
| `skeleton.tsx` | Loading placeholders | Loading states |
| `switch.tsx` | Toggle switches | Settings, toggles |
| `tabs.tsx` | Tabbed navigation | Study tools, settings |
| `textarea.tsx` | Multi-line text input | Chat input, forms |
| `tooltip.tsx` | Hover tooltips | Icon explanations |

---

## Magic UI

**Package:** Registry-based (via shadcn CLI)
**Site:** https://magicui.design
**Status:** ✅ 6/7 components installed (1 timed out)

### Available Components (in `src/components/ui/`)

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `aurora-text.tsx` | Aurora gradient text heading | Hero section, page titles |
| `dock.tsx` | macOS-style dock navigation | Bottom navigation, app launcher |
| `particles.tsx` | Animated particle background | Hero backgrounds, loading screens |
| `animated-beam.tsx` | Connector beam between elements | Graph connections, flow lines |
| `marquee.tsx` | Infinite scroll marquee | Brand logos, testimonials |
| `shine-border.tsx` | Animated shining border | Premium cards, featured items |
| `animated-circular-progress-bar.tsx` | Circular progress indicator | Loading states, skill display |

---

## Aceternity UI

**Package:** `aceternity-ui` (npm)
**CLI binary:** `npx aceternity-ui`
**Site:** https://ui.aceternity.com
**Status:**
- ✅ npm package installed (v0.2.2)
- ⚠️ CLI init failed — requires legacy `tailwind.config.*` file (project uses Tailwind v4 CSS-only config)
- Components need manual copy-paste or legacy tailwind config setup

### Available Components (via CLI — once configured)

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `Spotlight` | Cursor-following spotlight glow | Hero sections, cards |
| `Card` | Animated hover card | Document cards, feature cards |
| `TracingBeam` | Scroll-tracking beam | Blog posts, long content |
| `BackgroundGradient` | Gradient backgrounds | Section backgrounds |
| `WobbleCard` | Wobble-interaction card | Interactive features |
| `Globe` | 3D interactive globe | Dashboard, location data |
| `HeroParallax` | Parallax hero section | Landing page hero |
| `StickyScrollReveal` | Sticky scroll content reveal | Feature sections |

---

## Origin UI

**Package:** None (copy-paste registry)
**Site:** https://originui.com
**Status:** ⚠️ No npm package — components copied manually from website

### Available Components (via originui.com)

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| Sidebar layouts | Professional sidebar | App layout |
| Tables | Data tables with sorting | Document list, data |
| Forms | Professional form layouts | Settings, upload |
| Cards | Premium card designs | Dashboard, features |
| Page sections | Complete page sections | Landing pages |
| Input groups | Search bars with filters | Search UI |
| Stats cards | Analytics stat displays | Dashboard |

---

## Animate UI

**Package:** `animate-ui` (npm)
**Site:** https://animate-ui.com
**Status:** ⚠️ Vue 2 library — NOT compatible with React
- Installed package is Vue-based (`vue.config.js`, `src/main.js` is Vue)
- Cannot be used in this React project

---

## Motion / Framer Motion

**Package:** `framer-motion` (npm)
**Site:** https://motion.dev
**Status:** ✅ Already installed (v12.42.2)

### Key Features

| Feature | Purpose |
|---------|---------|
| `motion.div` | Animated div with spring/tween |
| `AnimatePresence` | Enter/exit animations |
| `LayoutGroup` | Shared layout animations |
| `useScroll` | Scroll-driven animations |
| `useMotionValue` | Performant animated values |

---

## React Bits

**Package:** None (copy-paste registry)
**Site:** https://reactbits.dev
**GitHub:** https://github.com/DavidHDev/react-bits
**Status:** ⚠️ Registry CDN returned HTML (could be down or incorrect URL)

### Available Components (via reactbits.dev — manual copy)

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `BlurText` | Text with blur reveal | Headings, hero text |
| `FallingStars` | Animated falling stars | Hero backgrounds |
| `WarpBackground` | Warp speed starfield | Loading screens, backdrops |
| `SplashCursor` | Cursor splash effect | Interactive backgrounds |
| `TextPressure` | Text with pressure effect | Animated typography |
| `DecayRipple` | Ripple click effect | Button interactions |
| `MagnetLine` | Magnetic line connections | Decorative graphics |

---

## React Three Fiber + Drei

**Packages:**
- `@react-three/fiber` (v9.6.1) — ✅ Installed
- `@react-three/drei` (v10.7.7) — ✅ Installed
**Site:** https://github.com/pmndrs/react-three-fiber

### Available Components

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `<Canvas>` | R3F canvas wrapper | 3D backgrounds |
| `<OrbitControls>` | Camera controls | 3D scenes |
| `<Text>` | 3D text | 3D typography |
| `<Float>` | Floating animation | 3D elements |
| `<Environment>` | HDR environment lighting | 3D scenes |
| `<ContactShadows>` | Soft contact shadows | Ground shadows |
| `<Stars>` | Starfield background | Space backgrounds |

---

## React Flow (@xyflow/react)

**Package:** `@xyflow/react` (v12.11.2)
**Site:** https://reactflow.dev
**Status:** ✅ Installed

### Available Features

| Feature | Purpose | Where to Use |
|---------|---------|--------------|
| `<ReactFlow>` | Graph/flow canvas | Knowledge graph, agent workflows |
| `<Handle>` | Node connection handles | Graph nodes |
| `<Controls>` | Zoom controls | Graph interaction |
| `<MiniMap>` | Overview minimap | Large graphs |
| Custom nodes | Draggable custom nodes | Agent visualization |
| Edge types | Animated edges (bezier, step, straight) | Graph connections |

---

## cmdk

**Package:** `cmdk` (npm)
**Site:** https://cmdk.paco.me
**Status:** ✅ Installed (v1.1.1)
- Used via shadcn's `command.tsx` component wrapper

---

## Sonner

**Package:** `sonner` (npm)
**Site:** https://sonner.emilkowal.ski
**Status:** ✅ Installed (v2.0.7)

### Key APIs

| API | Purpose |
|-----|---------|
| `toast(message)` | Simple toast |
| `toast.success(message)` | Success toast |
| `toast.error(message)` | Error toast |
| `toast.promise(promise, opts)` | Promise-based toast |
| `<Toaster />` | Toast container component |

---

## Lucide React

**Package:** `lucide-react` (npm)
**Site:** https://lucide.dev
**Status:** ✅ Already installed (v1.24.0) — hundreds of icons available

---

## Iconoir React

**Package:** `iconoir-react` (npm)
**Site:** https://iconoir.com
**Status:** ✅ Installed (v7.11.1) — premium icon alternative to Lucide

### Key Features

- 1400+ premium SVG icons
- Alternative style to Lucide for premium sections
- Import: `import { IconName } from "iconoir-react"`

---

## Recharts

**Package:** `recharts` (npm)
**Site:** https://recharts.org
**Status:** ✅ Installed (v3.9.2)

### Available Chart Components

| Component | Purpose |
|-----------|---------|
| `<LineChart>` | Line charts |
| `<BarChart>` | Bar charts |
| `<PieChart>` | Pie/donut charts |
| `<AreaChart>` | Area charts |
| `<RadarChart>` | Radar charts |
| `<ResponsiveContainer>` | Responsive chart wrapper |

---

## Tremor

**Package:** `@tremor/react` (npm)
**Site:** https://www.tremor.so
**Status:** ✅ Installed (v3.18.7, with `--legacy-peer-deps`)

### Available Components

| Component | Purpose | Where to Use |
|-----------|---------|--------------|
| `<Card>` | Dashboard card | Analytics dashboard |
| `<AreaChart>` | Area chart | Time-series data |
| `<BarChart>` | Bar chart | Comparisons |
| `<LineChart>` | Line chart | Trends |
| `<DonutChart>` | Donut chart | Distributions |
| `<Table>` | Data table | Tabular data |
| `<Badge>` | Status badge | Status indicators |
| `<Metric>` | Metric display | KPIs |
| `<ProgressBar>` | Progress bar | Loading progress |
| `<TabGroup>` | Tab group | Dashboard tabs |

---

## Summary

### Total Components Available: ~70+

| Source | Count | Status |
|--------|-------|--------|
| shadcn/ui (installed) | 19 | ✅ |
| Magic UI (installed) | 6 | ✅ |
| Aceternity UI | ~15 (CLI) | ⚠️ Needs legacy tailwind config |
| Origin UI | ~20 (copy-paste) | ⚠️ Manual copy needed |
| React Bits | ~15 (copy-paste) | ⚠️ Registry unreachable |
| Sonner | 1 | ✅ |
| Tremor | 10+ | ✅ (legacy-peer-deps) |
| Recharts | 6+ | ✅ |
| R3F + Drei | 15+ | ✅ |
| React Flow | 1 + custom | ✅ |
| Iconoir | 1400+ icons | ✅ |
| Lucide | 1000+ icons | ✅ |
