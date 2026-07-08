/**
 * Shared TypeScript content model for clone-vite.
 *
 * These types mirror contracts/run.schema.json and
 * contracts/component-spec.schema.json exactly so both app
 * code and Node scripts share one source of truth.
 *
 * Rules:
 * - No `any`. No optional fields unless the schema marks them optional.
 * - Export every type; import from here in scripts and components.
 * - Update this file and both schemas together — they must stay in sync.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type InteractionModel =
  | 'static'
  | 'click-driven'
  | 'scroll-driven'
  | 'time-driven'
  | 'mixed';

export type StateCapture = 'pending' | 'complete' | 'not-applicable';

export type ViewportName = 'desktop' | 'tablet' | 'mobile';

export type AssetKind = 'image' | 'video' | 'font' | 'svg' | 'favicon';

export type RunStatus =
  | 'recon-complete'
  | 'ready-to-build'
  | 'built'
  | 'qa-complete';

// ---------------------------------------------------------------------------
// run.json — mirrors contracts/run.schema.json
// ---------------------------------------------------------------------------

export interface Viewport {
  name: ViewportName;
  width: number;
  height: number;
}

export interface ScreenshotEntry {
  viewport: ViewportName;
  /** Must match: docs/research/<hostname>/screenshots/<name>.(png|webp|jpg|jpeg) */
  path: string;
  fullPage: boolean;
}

export interface TopologyItem {
  /** Lowercase kebab-case section identifier. */
  id: string;
  order: number;
  selector: string;
  interactionModel: InteractionModel;
  /** Whether the dedicated state sweep has been completed for this section. */
  stateCapture?: StateCapture;
  /** Free-text notes from the interaction sweep (scroll thresholds, triggers, transitions). */
  interactionNotes?: string;
}

export interface AssetEntry {
  sourceUrl: string;
  kind: AssetKind;
  /** Must match: public/<path> */
  localPath: string;
}

export interface RunJson {
  schemaVersion: '1.0';
  target: {
    url: string;
    /** Lowercase hostname slug, e.g. "example.com" */
    hostname: string;
    authorized: true;
  };
  capturedAt: string;
  status: RunStatus;
  viewports: [Viewport, Viewport, Viewport, ...Viewport[]];
  screenshots: [ScreenshotEntry, ScreenshotEntry, ...ScreenshotEntry[]];
  topology: [TopologyItem, ...TopologyItem[]];
  assets: AssetEntry[];
  /** Relative paths: "components/<slug>.json" */
  componentSpecs: string[];
}

// ---------------------------------------------------------------------------
// component spec JSON — mirrors contracts/component-spec.schema.json
// ---------------------------------------------------------------------------

export interface StateTransition {
  name: string;
  trigger: string;
  before: Record<string, string>;
  after: Record<string, string>;
  transition: string;
  implementation: string;
}

export interface ComponentAsset {
  /** Must match: public/<path> */
  localPath: string;
  purpose: string;
}

export interface ComponentSpecJson {
  schemaVersion: '1.0';
  /** Lowercase kebab-case component identifier. */
  id: string;
  /** Must match a TopologyItem.id in the parent run.json. */
  sourceSectionId: string;
  /** Must match: src/components/<path>.tsx */
  targetFile: string;
  /** Each entry must match: docs/research/<hostname>/screenshots/<name>.(png|webp|jpg|jpeg) */
  screenshotPaths: [string, ...string[]];
  interactionModel: InteractionModel;
  /** Whether all non-default states have been captured for this component. */
  stateCapture?: StateCapture;
  /** Pixel widths at which the component layout changes, from responsive sweep. */
  responsiveBreakpoints?: number[];
  dom: {
    summary: string;
    selector?: string;
  };
  /** Keyed by CSS selector; value is a map of property → computed value. */
  computedStyles: Record<string, Record<string, string>>;
  states: StateTransition[];
  assets: ComponentAsset[];
  textContent: string[];
  responsive: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
}
