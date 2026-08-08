import Link from "next/link";

const FAILURES = [
  {
    n: "01",
    problem: "A different building than the one modelled",
    fix: "Massing is stated as an explicit constraint, and your Revit screenshot is passed as image conditioning.",
  },
  {
    n: "02",
    problem: "Vertical fins render as glass curtain wall",
    fix: "Fins are described as solid and opaque, with glass named as an exclusion.",
  },
  {
    n: "03",
    problem: "Floor slab bands render too shallow",
    fix: "Slab depth goes in as a millimetre dimension, described as a band rather than a line.",
  },
  {
    n: "04",
    problem: "Floors, windows and balconies get added",
    fix: "A negative clause names the additions models tend to invent.",
  },
  {
    n: "05",
    problem: "Materials land on the wrong element",
    fix: "Materials are assigned per zone, each bound to the element it belongs to.",
  },
  {
    n: "06",
    problem: "Five views look like five buildings",
    fix: "Later renders in a project carry earlier images as style references — matched materials, independent cameras.",
  },
];

const STEPS = [
  {
    n: "STEP 01",
    t: "Pick a preset or fill ten rows",
    b: "Each row is one line of plain prose showing what it will say. Open only the ones you want to change.",
  },
  {
    n: "STEP 02",
    t: "Generate",
    b: "Text-to-image, or image-to-image if you attached a model screenshot — which is what holds your geometry.",
  },
  {
    n: "STEP 03",
    t: "Refine, do not redo",
    b: "Add light, people, a colour grade. Each pass saves a new version and remembers its parent.",
  },
];

export default function WelcomePage() {
  return (
    <div className="theme-paper">
      <div className="landing-page">
        <header className="landing-nav">
          <div className="landing-brand">
            <span>ArchiPrompts</span>
            <span className="landing-brand-dot" />
          </div>
          <div className="landing-nav-actions">
            <Link href="/pricing">Pricing</Link>
            <Link href="/builder" className="landing-nav-cta">
              Open the builder
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div>
            <div className="landing-eyebrow">CLOSED BETA · LAGOS</div>
            <h1>You already know what the building looks like.</h1>
            <p className="landing-hero-sub">
              The gap isn&apos;t judgment, it&apos;s phrasing. ArchiPrompts
              asks the questions an image model needs answered — fin
              material, slab depth in millimetres, lens — then writes the
              prompt in wording that has already been tested against the
              ways these models fail.
            </p>
            <div className="landing-hero-actions">
              <Link href="/builder" className="landing-btn">
                Start from a preset
              </Link>
              <Link href="/pricing" className="landing-btn secondary">
                See pricing
              </Link>
            </div>
            <div className="landing-hero-note">3 prompts free · no card</div>
          </div>
          <div>
            <div
              className="landing-hero-img"
              style={{ backgroundImage: "url(/mockups/villa-front.png)" }}
            >
              <span>hero render — 6-storey infill, late afternoon</span>
            </div>
            <div className="landing-hero-thumbs">
              <div style={{ backgroundImage: "url(/mockups/ext-angle.jpg)" }} />
              <div style={{ backgroundImage: "url(/mockups/ext-aerial.jpg)" }} />
              <div style={{ backgroundImage: "url(/mockups/office-facade.png)" }} />
            </div>
            <div className="landing-hero-caption">
              3 further views of the same building — style matched, cameras
              independent
            </div>
          </div>
        </section>

        <section className="landing-failures">
          <div className="landing-section-inner">
            <h2>Six ways image models get your building wrong</h2>
            <p>
              Every one of these was observed in testing, not hypothesised.
              Each has a specific fix built into the prompt.
            </p>
            <div className="landing-failures-grid">
              {FAILURES.map((f) => (
                <div key={f.n} className="landing-failure-cell">
                  <div className="landing-failure-n">{f.n}</div>
                  <div className="landing-failure-problem">{f.problem}</div>
                  <div className="landing-failure-fix">{f.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-steps">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="landing-step-n">{s.n}</div>
              <div className="landing-step-t">{s.t}</div>
              <div className="landing-step-b">{s.b}</div>
            </div>
          ))}
        </section>

        <footer className="landing-footer">
          <div>
            Built for architecture students, practices on 48-hour deadlines,
            and firms too small for a visualiser.
          </div>
          <Link href="/builder" className="landing-btn">
            Open the builder
          </Link>
        </footer>
      </div>
    </div>
  );
}
