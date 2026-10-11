'use client'

import { Button } from '@zaoly/ui'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { paths } from '../lib/paths'
import { siteText } from '../lib/public-site-locale'
import { useUserPrefs } from '../lib/user-prefs'
import { CollaborationCapabilityVisual, DesignCapabilityVisual, HandoffCapabilityVisual, SystemCapabilityVisual } from './landing-capability-visuals'
import { BreakpointLoop, CompositionLoop, EditorOverviewLoop, TypographyLoop, VariantLoop } from './landing-product-loops'
import { TokenColorEditVisual, TokenComposeVisual, TokenSpacingWheelVisual } from './landing-token-craft'
import { WorkflowVisual } from './landing-workflow-visual'
import { ZaolySealMark } from './zaoly-seal-mark'

const sectionHref = (id: string) => `${paths.routes.home}#${id}`

function Brand() {
  return <span className="zl-brand"><ZaolySealMark size={34} /><span>Zaoly</span></span>
}

function Index({ children }: { children: ReactNode }) {
  return <span className="zl-index">{children}</span>
}

function CodeLines({ locale }: { locale: 'de' | 'en' }) {
  const t = (de: string, en: string) => siteText(locale, de, en)
  return (
    <pre className="zl-code-lines" aria-label={t('Beispiel eines exportierten React-Moduls', 'Example of an exported React module')}><code>
      <span><i>01</i><b>import</b> {'{'} Stack, Text, Button {'}'}</span>
      <span><i>02</i><b>from</b> <em>&apos;@zaoly/site-kit&apos;</em></span>
      <span><i>03</i></span>
      <span><i>04</i><b>export function</b> FeatureCard() {'{'}</span>
      <span><i>05</i>  <b>return</b> (</span>
      <span><i>06</i>    &lt;Stack&gt;</span>
      <span><i>07</i>      &lt;Text&gt;{t('Eine Idee. Viele Orte.', 'One idea. Many places.')}&lt;/Text&gt;</span>
      <span><i>08</i>      &lt;Button&gt;{t('Entdecken', 'Explore')}&lt;/Button&gt;</span>
      <span><i>09</i>    &lt;/Stack&gt;</span>
      <span><i>10</i>  )</span>
      <span><i>11</i>{'}'}</span>
    </code></pre>
  )
}

function TokenStudioVisual({ locale }: { locale: 'de' | 'en' }) {
  const t = (de: string, en: string) => siteText(locale, de, en)
  return (
    <div
      className="zl-token-stage"
      data-loop="tokens"
      role="img"
      aria-label={t('Illustration des Token Studios: ein Farbtoken wird geändert und zwei daran gebundene Komponenten im Editor übernehmen den neuen Wert', 'Token Studio illustration: a color token changes and two bound components in the editor adopt the new value')}
    >
      <div className="zl-token-stage__window" aria-hidden="true">
        <span><b /> ZAOLY / TOKEN STUDIO</span>
        <span>{t('LOKALES PACK', 'LOCAL PACK')}</span>
      </div>
      <div className="zl-token-stage__body" aria-hidden="true">
        <div className="zl-token-stage__catalog">
          <div className="zl-token-stage__catalog-head">Tokens <span>{t('LOKALES PACK', 'LOCAL PACK')}</span></div>
          <div className="zl-token-stage__entry zl-token-stage__entry--color"><i className="zl-token-stage__swatch" /><span><strong>{t('Farbe', 'Color')}</strong><small>color.action.primary</small></span><b>↗</b></div>
          <div className="zl-token-stage__entry zl-token-stage__entry--type"><i className="zl-token-stage__glyph">Aa</i><span><strong>{t('Typografie', 'Typography')}</strong><small>typography.heading.h1</small></span><b>↗</b></div>
          <div className="zl-token-stage__entry zl-token-stage__entry--space"><i className="zl-token-stage__glyph">↔</i><span><strong>{t('Abstand', 'Spacing')}</strong><small>spacing.static.medium</small></span><b>↗</b></div>
        </div>
        <div className="zl-token-stage__preview">
          <div className="zl-token-stage__preview-head"><span>{t('GEBUNDENE KOMPONENTEN', 'BOUND COMPONENTS')}</span><span>{t('2 VERWENDUNGEN', '2 USES')}</span></div>
          <div className="zl-token-stage__value">
            <span className="zl-token-stage__value-swatch" />
            <span className="zl-token-stage__value-path">color.action.primary</span>
            <span className="zl-token-stage__value-code"><b className="zl-token-stage__value-before">#1F44FF</b><b className="zl-token-stage__value-after">#7457D8</b></span>
          </div>
          <div className="zl-token-stage__flow" aria-hidden="true"><span /><i /><span /></div>
          <div className="zl-token-stage__components">
            <div className="zl-token-stage__component zl-token-stage__component--one">
              <div className="zl-token-stage__component-head">FeatureCard <span>{t('GEBUNDEN', 'BOUND')}</span></div>
              <div className="zl-token-stage__component-body"><strong>{t('Eine Idee.', 'One idea.')}<br />{t('Viele Orte.', 'Many places.')}</strong><span className="zl-token-stage__component-action">{t('Entdecken', 'Explore')} ↗</span></div>
            </div>
            <div className="zl-token-stage__component zl-token-stage__component--two">
              <div className="zl-token-stage__component-head">ProductCard <span>{t('GEBUNDEN', 'BOUND')}</span></div>
              <div className="zl-token-stage__component-body"><strong>{t('Alles', 'Everything')}<br />{t('im Blick.', 'in view.')}</strong><span className="zl-token-stage__component-action">{t('Mehr ansehen', 'See more')} ↗</span></div>
            </div>
          </div>
          <div className="zl-token-stage__complete">{t('Ein Pfad. Beide Komponenten aktualisiert.', 'One path. Both components updated.')}</div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage({ contactEmail = paths.publicSiteContactEmailDefault }: { contactEmail?: string | null }) {
  const { product, kit, tokens, workflow, contact } = paths.landing.sections
  const { locale, setLocale } = useUserPrefs()
  const router = useRouter()
  const t = (de: string, en: string) => siteText(locale, de, en)

  return (
    <main className="zl">
      <a className="zl-skip" href={sectionHref(product)}>{t('Zum Inhalt springen', 'Skip to content')}</a>

      <header className="zl-header">
        <div className="zl-shell zl-header__inner">
          <a className="zl-header__brand" href={paths.routes.home} aria-label={t('Zaoly Startseite', 'Zaoly home')}><Brand /></a>
          <nav className="zl-nav" aria-label={t('Landingpage Navigation', 'Landing page navigation')}>
            <a href={sectionHref(product)}>{t('Produkt', 'Product')}</a>
            <a href={sectionHref(kit)}>Zaoly Kit</a>
            <a href={sectionHref(tokens)}>Token Studio</a>
            <a href={sectionHref(workflow)}>Workflow</a>
            <a href={paths.routes.faq}>FAQ</a>
            <a href={sectionHref(contact)}>{t('Kontakt', 'Contact')}</a>
          </nav>
          <div className="zl-header__actions">
            <div className="zl-language" role="group" aria-label={t('Sprache wählen', 'Choose language')}>
              {(['de', 'en'] as const).map((choice) => <button key={choice} type="button" lang={choice} aria-pressed={locale === choice} onClick={() => { setLocale(choice); router.refresh() }}>{choice.toUpperCase()}</button>)}
            </div>
            <a href={paths.routes.login}>{t('Anmelden', 'Sign in')}</a>
            <Button href={paths.routes.register} size="sm" className="zl-header__button">{t('Loslegen', 'Get started')} <span aria-hidden="true">↗</span></Button>
          </div>
        </div>
      </header>

      <section className="zl-hero" aria-labelledby="zl-hero-title">
        <div className="zl-shell zl-hero__intro">
          <div className="zl-hero__eyebrow">{t('VISUELLES DESIGN / ECHTER CODE', 'VISUAL DESIGN / REAL CODE')}</div>
          <h1 id="zl-hero-title">{locale === 'de' ? <><span>Vom Design </span><span>zur <em>echten</em> </span><span>Komponente.</span></> : <><span>From design </span><span>to <em>real</em> </span><span>components.</span></>}</h1>
          <div className="zl-hero__bottom">
            <p>{t('Gestalte auf dem Canvas. Baue mit dem Zaoly Kit. Übergib React-Komponenten, die dein Team in anderen Produkten einsetzen kann.', 'Design on the canvas. Build with Zaoly Kit. Hand off React components your team can use in other products.')}</p>
            <div className="zl-hero__actions">
              <Button href={paths.routes.register} size="lg" className="zl-hero__cta">{t('Loslegen', 'Get started')} <span aria-hidden="true">↗</span></Button>
              <a className="zl-arrow-link" href={paths.routes.login}>{t('Anmelden', 'Sign in')} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>

        <div className="zl-stage" data-loop="canvas" role="img" aria-label={t('Animation: auf dem Canvas wird eine Komponente ausgewählt und als React-Modul sichtbar', 'Animation: select a component on the canvas and see it appear as a React module')}>
          <div className="zl-stage__inner">
            <div className="zl-stage__canvas" aria-hidden="true">
              <div className="zl-stage__window"><span><b /> ZAOLY / EDITOR</span><span>STUDIO FORM / PAGE 01</span><span>◇</span></div>
              <div className="zl-stage__body">
                <div className="zl-stage__rail"><span>▦</span><span>◇</span><span>≡</span><span>◈</span></div>
                <div className="zl-stage__art"><div className="zl-stage__artboard"><img src={paths.landing.assets.heroArtboard} width="760" height="620" alt="" /><span className="zl-stage__focus" aria-hidden="true" /></div></div>
                <div className="zl-stage__inspect"><span>INSPECT</span><strong>FeatureCard</strong><small>VARIANT</small><b className="zl-stage__variant-value"><span>Default</span><span>Primary</span></b><small>TOKEN</small><b>Primary</b></div>
              </div>
            </div>
            <div className="zl-stage__code" aria-hidden="true">
              <div className="zl-stage__code-head"><span>FeatureCard.tsx</span><span className="zl-stage__code-variant">Primary</span></div>
              <code><span>import</span> {'{'} Stack, Text, Button {'}'}</code>
              <code><span>from</span> &apos;@zaoly/site-kit&apos;</code>
              <code className="zl-stage__code-gap">&nbsp;</code>
              <code><span>export function</span> FeatureCard() {'{'}</code>
              <code>&nbsp; return &lt;Stack&gt;...&lt;/Stack&gt;</code>
              <code>{'}'}</code>
            </div>
          </div>
        </div>
      </section>

      <section className="zl-manifesto" id={product} aria-labelledby="zl-manifesto-title">
        <div className="zl-shell">
          <Index>{t('WARUM ZAOLY', 'WHY ZAOLY')}</Index>
          <h2 id="zl-manifesto-title">{locale === 'de' ? <>Weniger <em>nachbauen.</em>{' '}<br />Mehr weiterverwenden.</> : <>Less <em>rebuilding.</em>{' '}<br />More reuse.</>}</h2>
          <div className="zl-manifesto__bottom"><p>{t('Zaoly macht aus visuellen Entscheidungen strukturierte Bausteine: mit Varianten, Markentokens und Code. Damit Design und Entwicklung am selben Ergebnis weiterarbeiten können.', 'Zaoly turns visual decisions into structured building blocks with variants, design tokens, and code, so design and development can keep working from the same source.')}</p></div>
          <div className="zl-manifesto__rail" aria-label={t('Design wird zur Komponente und zum Produkt', 'Design becomes a component and a product')}><span>DESIGN</span><b>→</b><span>{t('KOMPONENTE', 'COMPONENT')}</span><b>→</b><span>{t('PRODUKT', 'PRODUCT')}</span></div>
        </div>
      </section>

      <section className="zl-editor-overview" aria-labelledby="zl-editor-overview-title">
        <div className="zl-shell">
          <div className="zl-editor-overview__intro">
            <Index>{t('DER ZAOLY EDITOR', 'THE ZAOLY EDITOR')}</Index>
            <h2 id="zl-editor-overview-title">{locale === 'de' ? <>Ein Editor.<br /><em>Der ganze Prozess.</em></> : <>One editor.<br /><em>The whole process.</em></>}</h2>
            <div><p>{t('Von der ersten Seite bis zur geprüften Komponente: Zaoly gibt Designern Canvas, Systemwerkzeuge und Handoff in einem Arbeitsbereich.', 'From the first page to a reviewed component, Zaoly brings designers a canvas, system tools, and handoff in one workspace.')}</p><a className="zl-arrow-link" href={paths.routes.editor}>{t('Editor öffnen', 'Open editor')} <span aria-hidden="true">↗</span></a></div>
          </div>
          <EditorOverviewLoop locale={locale} />
          <p className="zl-sequence-note">{t('Illustration vorhandener Editor-Werkzeuge · keine App-Aufnahme', 'Illustration of editor capabilities · not an app screenshot')}</p>
          <div className="zl-editor-overview__capabilities">
            <article><div className="zl-editor-overview__cap-copy"><span>01</span><h3>{t('Gestalten', 'Design')}</h3><p>{t('Seiten, Ebenen und Artboards. Direktes Editieren auf dem Canvas, mit eigenen Ansichten für Desktop, Tablet und Mobile.', 'Pages, layers, and artboards. Edit directly on the canvas, with dedicated desktop, tablet, and mobile views.')}</p></div><DesignCapabilityVisual locale={locale} /></article>
            <article><div className="zl-editor-overview__cap-copy"><span>02</span><h3>{t('Systematisieren', 'Systemize')}</h3><p>{t('Kit-Atome, Masters, benannte Varianten und Markentokens geben Entwürfen eine wiederverwendbare Struktur.', 'Kit atoms, masters, named variants, and brand tokens give designs a reusable structure.')}</p></div><SystemCapabilityVisual locale={locale} /></article>
            <article><div className="zl-editor-overview__cap-copy"><span>03</span><h3>{t('Zusammenarbeiten', 'Collaborate')}</h3><p>{t('Assets, Team-Präsenz, Kommentare und benannte Versionsstände halten Entscheidungen und Änderungen nachvollziehbar.', 'Assets, team presence, comments, and named versions keep decisions and changes traceable.')}</p></div><CollaborationCapabilityVisual locale={locale} /></article>
            <article><div className="zl-editor-overview__cap-copy"><span>04</span><h3>{t('Weitergeben', 'Hand off')}</h3><p>{t('Preview, A11y-Preflight und React-Handoff verbinden den visuellen Entwurf mit der Umsetzung.', 'Preview, accessibility preflight, and React handoff connect visual design to implementation.')}</p></div><HandoffCapabilityVisual locale={locale} /></article>
          </div>
        </div>
      </section>

      <section className="zl-kit" id={kit} aria-labelledby="zl-kit-title">
        <div className="zl-shell zl-kit__layout">
          <div className="zl-kit__copy"><Index>ZAOLY KIT</Index><h2 id="zl-kit-title">{locale === 'de' ? <>Ein Kit.{' '}<br /><em>Alles in</em>{' '}<br />Bewegung.</> : <>One kit.{' '}<br /><em>Everything in</em>{' '}<br />motion.</>}</h2><p>{t('Text, Button, Input, Card und Layout sind der Anfang. Kombiniere die Atome zu eigenen Komponenten und entwickle ein System, das mit deinen Ideen wächst.', 'Text, Button, Input, Card, and Layout are the starting point. Combine these atoms into your own components and build a system that grows with your ideas.')}</p><a className="zl-arrow-link" href={paths.routes.kit}>{t('Zaoly Kit ansehen', 'Explore Zaoly Kit')} <span aria-hidden="true">↗</span></a></div>
          <div className="zl-kit__visual"><figure className="zl-kit__sheet"><div className="zl-kit__assembly" data-loop="kit"><img src={paths.landing.assets.kitAssembly} width="760" height="540" alt={t('Zaoly Kit: Text, Button, Input und Layout werden zu einer FeatureCard zusammengesetzt', 'Zaoly Kit: Text, Button, Input, and Layout combine to form a FeatureCard')} /><span className="zl-kit__atom-focus zl-kit__atom-focus--text" aria-hidden="true" /><span className="zl-kit__atom-focus zl-kit__atom-focus--button" aria-hidden="true" /><span className="zl-kit__atom-focus zl-kit__atom-focus--input" aria-hidden="true" /><span className="zl-kit__atom-focus zl-kit__atom-focus--layout" aria-hidden="true" /><span className="zl-kit__result-mask zl-kit__result-mask--image" aria-hidden="true" /><span className="zl-kit__result-mask zl-kit__result-mask--text" aria-hidden="true" /><span className="zl-kit__result-mask zl-kit__result-mask--action" aria-hidden="true" /></div></figure></div>
        </div>
      </section>

      <section className="zl-variants" aria-labelledby="zl-variants-title">
        <div className="zl-shell">
          <div className="zl-variants__intro">
            <Index>{t('VARIANTEN IM EDITOR', 'VARIANTS IN THE EDITOR')}</Index>
            <h2 id="zl-variants-title">{locale === 'de' ? <>Ein Master.<br /><em>Mehr Ausdruck.</em></> : <>One master.<br /><em>More expression.</em></>}</h2>
            <p>{t('Gestalte benannte Varianten einer Komponente und wähle den passenden Zustand für jede Instanz. Die Struktur bleibt dieselbe; der Auftritt wird gezielt verändert.', 'Create named component variants and choose the right state for each instance. Keep the same structure while changing its expression with intent.')}</p>
          </div>
          <VariantLoop locale={locale} />
          <p className="zl-sequence-note">{t('Illustration zweier benannter Master-Varianten', 'Illustration of two named master variants')}</p>
        </div>
      </section>

      <section className="zl-tokens" id={tokens} aria-labelledby="zl-tokens-title">
        <div className="zl-shell">
          <div className="zl-tokens__intro">
            <Index>TOKEN STUDIO</Index>
            <h2 id="zl-tokens-title">{locale === 'de' ? <>Ein Wert.<br /><em>Überall spürbar.</em></> : <>One value.<br /><em>Everywhere.</em></>}</h2>
            <div className="zl-tokens__bottom">
              <p>{t('Binde Komponenten im Editor an Token-Pfade statt an feste Werte. Änderst du einen Wert im lokalen Pack, übernehmen gebundene Komponenten beim Zurückkehren in den Editor den neuen Stil.', 'Bind editor components to token paths instead of fixed values. Change a value in the local pack, and bound components pick up the new style when you return to the editor.')}</p>
              <a className="zl-arrow-link" href={paths.routes.tokens}>{t('Token Studio öffnen', 'Open Token Studio')} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <TokenStudioVisual locale={locale} />
        </div>
      </section>

      <section className="zl-token-craft" aria-labelledby="zl-token-craft-title">
        <div className="zl-shell">
          <div className="zl-token-craft__intro"><Index>{t('TOKEN STUDIO / IM DETAIL', 'TOKEN STUDIO / IN DETAIL')}</Index><h2 id="zl-token-craft-title">{locale === 'de' ? <>Werte formen.<br /><em>Wirkung sehen.</em></> : <>Shape values.<br /><em>See the impact.</em></>}</h2><p>{t('Wähle eine Karte, ändere den Wert im seitlichen Dock und prüfe die Wirkung direkt am Token. Farbe, Maße und abgeleitete Werte haben jeweils ein passendes Werkzeug.', 'Select a card, edit its value in the side dock, and see the result on the token. Colors, dimensions, and derived values each have a dedicated tool.')}</p></div>
          <div className="zl-token-craft__grid">
            <article className="zl-token-craft__feature zl-token-craft__feature--color"><div className="zl-token-craft__feature-copy"><h3>{t('Farbe. Bis ins Detail.', 'Color, down to the detail.')}</h3><p>{t('HEX, RGB, HSL und OKLCH stehen im selben Bearbeitungsbereich bereit. Ein gespeicherter lokaler Wert wird als Override kenntlich.', 'Edit HEX, RGB, HSL, and OKLCH in one place. Saved local values are clearly marked as overrides.')}</p></div><TokenColorEditVisual locale={locale} /></article>
            <article className="zl-token-craft__feature zl-token-craft__feature--spacing"><div className="zl-token-craft__feature-copy"><h3>{t('Abstand mit Gefühl.', 'Tune spacing by feel.')}</h3><p>{t('Das Endlos-Rad bewegt die Skala unter einer festen Markierung. Die Vorschau folgt schon beim Einstellen.', 'Move the scale beneath a fixed marker with the infinite wheel. The preview responds as you adjust.')}</p></div><TokenSpacingWheelVisual locale={locale} /></article>
            <article className="zl-token-craft__feature zl-token-craft__feature--compose"><div className="zl-token-craft__feature-copy"><h3>{t('Werte verbinden.', 'Connect values.')}</h3><p>{t('Leite einen Wert aus einem anderen Token ab. Der aufgelöste Wert bleibt direkt im Feld sichtbar.', 'Derive a value from another token. Its resolved value stays visible right in the field.')}</p></div><TokenComposeVisual locale={locale} /></article>
          </div>
          <div className="zl-token-craft__pack"><strong>{t('Ein Pack. Mehrere Ansichten.', 'One pack. Multiple views.')}</strong><p>{t('Cards, JSON und CSS. Packwerte kopieren oder herunterladen. Admins prüfen einen JSON-Import vor dem Anwenden.', 'Cards, JSON, and CSS. Copy or download pack values. Admins can review a JSON import before applying it.')}</p><a className="zl-arrow-link" href={paths.routes.tokens}>{t('Token Studio öffnen', 'Open Token Studio')} <span aria-hidden="true">↗</span></a></div>
          <p className="zl-sequence-note">{t('Illustrationen des lokalen Token Studios · Beispielwerte und Entwürfe', 'Illustrations of the local Token Studio · sample values and drafts')}</p>
        </div>
      </section>

      <section className="zl-type" aria-labelledby="zl-type-title">
        <div className="zl-shell">
          <div className="zl-type__intro">
            <Index>{t('TYPOGRAFIE IM SYSTEM', 'TYPOGRAPHY IN THE SYSTEM')}</Index>
            <h2 id="zl-type-title">{locale === 'de' ? <>Schrift ändern.<br /><em>System bewegen.</em></> : <>Change type.<br /><em>Move the system.</em></>}</h2>
            <p>{t('Schriftfamilie, Gewicht und Größe sind Teil eines Tokens. Bindest du Texte im Editor an denselben Pfad, trägt eine Änderung am lokalen Pack den neuen Ausdruck in alle gebundenen Vorschauen.', 'Font family, weight, and size are token values. Bind editor text to the same path, and a local pack change carries the new expression to every connected preview.')}</p>
          </div>
          <TypographyLoop locale={locale} />
          <p className="zl-sequence-note">{t('Illustration des Produktprinzips · lokaler Beispiel-Override', 'Illustration of the product principle · local sample override')}</p>
        </div>
      </section>

      <section className="zl-product-view" aria-labelledby="zl-product-view-title">
        <div className="zl-shell">
          <div className="zl-product-view__intro">
            <Index>{t('EINBLICK IN ZAOLY', 'INSIDE ZAOLY')}</Index>
            <h2 id="zl-product-view-title">{locale === 'de' ? <>Das System.<br /><em>In der Anwendung.</em></> : <>The system.<br /><em>At work.</em></>}</h2>
            <p>{t('Die Ansichten zeigen Zaoly mit Demodaten: Token Studio, Kit Playground und den Editor mit Desktop-, Tablet- und Mobile-Artboards nebeneinander.', 'These views show Zaoly with sample data: Token Studio, Kit Playground, and the editor with desktop, tablet, and mobile artboards side by side.')}</p>
          </div>
          <figure className="zl-product-view__figure zl-product-view__figure--tokens">
            <div className="zl-product-view__image zl-product-view__image--tokens">
              <img src={paths.landing.assets.tokenStudioApp} width="1280" height="720" loading="lazy" alt={t('Echte Zaoly Token-Studio-Ansicht mit Farbtokens des lokalen Seed-Packs', 'Zaoly Token Studio app view showing color tokens from the local seed pack')} />
            </div>
            <figcaption><strong>Token Studio</strong><span>{t('Echte App-Ansicht · Demodaten', 'Actual app view · sample data')}</span></figcaption>
            <p className="zl-product-view__detail">{t('Ein lokales Token-Pack mit Farben, Typografie und Abständen. Die Pfade verbinden Werte und Komponenten im Editor.', 'A local token pack for colors, typography, and spacing. Token paths connect values to components in the editor.')}</p>
          </figure>
          <figure className="zl-product-view__figure zl-product-view__figure--kit">
            <div className="zl-product-view__image zl-product-view__image--kit">
              <img src={paths.landing.assets.kitPlaygroundApp} width="1320" height="420" loading="lazy" alt={t('Echtes Zaoly Kit Playground mit Komponentenliste, TSX-Code, Live Preview und Token-Panel', 'Zaoly Kit Playground showing a component list, TSX code, live preview, and token panel')} />
            </div>
            <figcaption><strong>Zaoly Kit Playground</strong><span>{t('Echte App-Ansicht · Demodaten', 'Actual app view · sample data')}</span></figcaption>
            <p className="zl-product-view__detail">{t('Kit-Atome, TSX und Live Preview stehen nebeneinander. Die technische Struktur bleibt schon beim Gestalten sichtbar.', 'Kit atoms, TSX, and live preview sit side by side, so the technical structure stays visible while you design.')}</p>
          </figure>
          <figure className="zl-product-view__figure zl-product-view__figure--breakpoints">
            <div className="zl-product-view__image zl-product-view__image--breakpoints">
              <img src={paths.landing.assets.editorBreakpointsApp} width="1024" height="651" loading="lazy" alt={t('Echter Zaoly Editor mit Desktop-, Tablet- und Mobile-Artboards derselben Seite nebeneinander', 'Zaoly editor showing the same page on desktop, tablet, and mobile artboards side by side')} />
            </div>
            <figcaption><strong>{t('Multi-Breakpoint', 'Multi-breakpoint')}</strong><span>{t('Echte App-Ansicht · Demodaten', 'Actual app view · sample data')}</span></figcaption>
            <p className="zl-product-view__detail">{t('Eine Composition, drei Breiten: Desktop, Tablet und Mobile gleichzeitig auf dem Canvas — für bewusstes Responsive-Design.', 'One composition, three widths: desktop, tablet, and mobile together on the canvas for intentional responsive design.')}</p>
          </figure>
        </div>
      </section>

      <section className="zl-composition" aria-labelledby="zl-composition-title">
        <div className="zl-shell">
          <div className="zl-composition__intro">
            <Index>{t('KOMPONIEREN MIT DEM ZAOLY KIT', 'COMPOSE WITH ZAOLY KIT')}</Index>
            <h2 id="zl-composition-title">{locale === 'de' ? <>Ein Inhalt.<br /><em>Zwei Kompositionen.</em></> : <>One set of content.<br /><em>Two compositions.</em></>}</h2>
            <p>{t('Text, Button, Bild und Layout sind Bausteine des Kits. Wähle eine andere Layoutstruktur und ordne dieselben Atome im Entwurf neu an — vom ruhigen Split-Hero zur gestapelten Landingpage.', 'Text, Button, Image, and Layout are Kit building blocks. Choose a different layout and rearrange the same atoms—from a calm split hero to a stacked landing page.')}</p>
          </div>
          <CompositionLoop locale={locale} />
          <p className="zl-sequence-note">{t('Illustration zweier bewusst gestalteter Layoutvarianten', 'Illustration of two intentionally designed layout variants')}</p>
        </div>
      </section>

      <section className="zl-breakpoints" aria-labelledby="zl-breakpoints-title">
        <div className="zl-shell">
          <div className="zl-breakpoints__intro">
            <Index>{t('BREAKPOINTS IM EDITOR', 'BREAKPOINTS IN THE EDITOR')}</Index>
            <h2 id="zl-breakpoints-title">{locale === 'de' ? <>Eine Seite.<br /><em>Jeder Bildschirm.</em></> : <>One page.<br /><em>Every screen.</em></>}</h2>
            <p>{t('Öffne Desktop, Tablet und Mobile nebeneinander auf dem Canvas. Gestalte jede Breite bewusst — ohne automatische Layout-Generierung, mit voller Kontrolle über Anordnung und Hierarchie.', 'Open desktop, tablet, and mobile side by side on the canvas. Shape each width with intent — no automatic layout generation, full control over arrangement and hierarchy.')}</p>
          </div>
          <figure className="zl-breakpoints__figure">
            <div className="zl-breakpoints__image">
              <img
                src={paths.landing.assets.editorBreakpointsApp}
                width="1024"
                height="651"
                loading="lazy"
                alt={t(
                  'Echter Zaoly Editor: dieselbe Landingpage als Desktop-, Tablet- und Mobile-Artboard nebeneinander',
                  'Zaoly editor: the same landing page as desktop, tablet, and mobile artboards side by side',
                )}
              />
            </div>
            <figcaption>
              <strong>{t('Multi-Breakpoint Compare', 'Multi-breakpoint compare')}</strong>
              <span>{t('Echte App-Ansicht · Demodaten', 'Actual app view · sample data')}</span>
            </figcaption>
          </figure>
          <BreakpointLoop locale={locale} />
          <p className="zl-sequence-note">{t('Darüber: echte Editor-Aufnahme · darunter Illustration einzelner Breakpoint-Zustände', 'Above: real editor capture · below: illustration of individual breakpoint states')}</p>
        </div>
      </section>

      <section className="zl-workflow" id={workflow} aria-labelledby="zl-workflow-title">
        <div className="zl-shell">
          <div className="zl-workflow__head"><Index>WORKFLOW</Index><h2 id="zl-workflow-title">{locale === 'de' ? <>Eine Komponente.<br /><em>Ein durchgehender Weg.</em></> : <>One component.<br /><em>One connected journey.</em></>}</h2><p>{t('Von der ersten Form bis zum Code: jeder Schritt baut auf demselben Baustein auf.', 'From the first shape to the code, every step builds on the same component.')}</p></div>
          <WorkflowVisual locale={locale} />
          <p className="zl-sequence-note">{t('Illustration des Workflows · Beispielkomponente und React-Ausschnitt', 'Workflow illustration · sample component and React snippet')}</p>
        </div>
      </section>

      <section className="zl-projects" aria-labelledby="zl-projects-title"><div className="zl-shell">
        <div className="zl-projects__intro"><Index>{t('PROJEKTE', 'PROJECTS')}</Index><h2 id="zl-projects-title">{locale === 'de' ? <>Ein Baustein.{' '}<br /><em>So viele Projekte,</em>{' '}<br />wie du brauchst.</> : <>One building block.{' '}<br /><em>As many projects</em>{' '}<br />as you need.</>}</h2><p>{t('Deine Projekte haben unterschiedliche Ziele. Gute Komponenten können trotzdem in mehr als einem Kontext weiterleben.', 'Your projects have different goals. Well-made components can still live on in more than one context.')}</p></div>
        <div className="zl-projects__mosaic" data-loop="projects" aria-label={t('Eine Komponente in drei verschiedenen Projekten', 'One component across three different projects')}>
          <article className="zl-project zl-project--studio"><div className="zl-project__sample"><span className="zl-project__glyph">◇</span><strong>{locale === 'de' ? <>Neue Räume<br />für Ideen.</> : <>New spaces<br />for ideas.</>}</strong><span>{t('Ein Modul für Geschichten.', 'A module for stories.')}</span><b>{t('Projekt entdecken', 'Explore project')} ↗</b></div><span className="zl-project__name">Studio Form</span></article>
          <article className="zl-project zl-project--product"><div className="zl-project__sample"><span className="zl-project__glyph">◇</span><strong>{locale === 'de' ? <>Alles im<br />Blick.</> : <>Everything<br />in view.</>}</strong><span>{t('Dieselbe Struktur. Neuer Kontext.', 'Same structure. New context.')}</span><b>{t('Mehr ansehen', 'See more')} ↗</b></div><span className="zl-project__name">Product</span></article>
          <article className="zl-project zl-project--platform"><div className="zl-project__sample"><span className="zl-project__glyph">◇</span><strong>{locale === 'de' ? <>Einfach<br />weiter.</> : <>Ready to<br />move on.</>}</strong><span>{t('Bereit für das nächste Produkt.', 'Ready for the next product.')}</span><b>{t('Jetzt starten', 'Get started')} ↗</b></div><span className="zl-project__name">Platform</span></article>
        </div>
      </div></section>

      <section className="zl-handoff" aria-labelledby="zl-handoff-title"><div className="zl-shell">
        <div className="zl-handoff__intro"><Index>DESIGN → DEV</Index><h2 id="zl-handoff-title">{locale === 'de' ? <>Übergabe{' '}<br /><em>ohne Ratespiel.</em></> : <>Handoff{' '}<br /><em>without guesswork.</em></>}</h2><p>{t('Aus dem visuellen Baustein wird ein React-Modul mit Import, Tokenkontext und Hinweisen für die Integration in andere React-Projekte.', 'Turn a visual building block into a React module with imports, token context, and guidance for integration into other React projects.')}</p></div>
        <div className="zl-handoff__proof" data-loop="handoff"><div className="zl-handoff__preview"><div className="zl-handoff__panel-head">{t('Visuelle Komponente', 'Visual component')}</div><div className="zl-handoff__visual-card"><strong>{locale === 'de' ? <>Eine Idee.<br /><em>Viele Orte.</em></> : <>One idea.<br /><em>Many places.</em></>}</strong><span className="zl-handoff__visual-button">{t('Entdecken', 'Explore')} ↗</span><i aria-hidden="true">◇</i></div></div><div className="zl-handoff__export"><div className="zl-handoff__panel-head">React module</div><CodeLines locale={locale} /><div className="zl-handoff__ready" aria-hidden="true"><span>✓</span> {t('Bereit für React', 'Ready for React')}</div></div></div>
      </div></section>

      <section className="zl-contact" id={contact} aria-labelledby="zl-contact-title">
        <div className="zl-shell zl-contact__layout">
          <div className="zl-contact__heading"><Index>{t('KONTAKT', 'CONTACT')}</Index><h2 id="zl-contact-title">{locale === 'de' ? <>Lass uns über<br /><em>Zaoly sprechen.</em></> : <>Let’s talk about<br /><em>Zaoly.</em></>}</h2></div>
          <div className="zl-contact__copy">
            <p>{t('Du planst den Einsatz im Team, möchtest mehr über Hosting und AI-Funktionen erfahren oder hast Fragen zum Entwickler-Handoff? Wir helfen dir, den passenden nächsten Schritt zu finden.', 'Planning a team rollout, want to learn about hosting and AI features, or have questions about developer handoff? We’ll help you find the right next step.')}</p>
            <div className="zl-contact__actions">
              {contactEmail ? <a className="zl-contact__primary" href={`mailto:${contactEmail}?subject=${encodeURIComponent(t('Anfrage zu Zaoly', 'Zaoly enquiry'))}`}>{t('Gespräch anfragen', 'Talk to our team')} <span aria-hidden="true">↗</span></a> : <a className="zl-contact__primary" href={paths.routes.faq}>{t('Produktfragen ansehen', 'Explore product FAQs')} <span aria-hidden="true">↗</span></a>}
              <a className="zl-contact__secondary" href={paths.routes.register}>{t('Loslegen', 'Get started')}</a>
            </div>
            {contactEmail ? <a className="zl-contact__email" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <p className="zl-contact__note">{t('Für direkte Anfragen ergänzen wir hier die offizielle Kontaktadresse.', 'The official contact address will appear here once configured.')}</p>}
          </div>
        </div>
      </section>

      <section className="zl-end" aria-labelledby="zl-end-title"><div className="zl-shell"><h2 id="zl-end-title">{locale === 'de' ? <>Mach aus deinem{' '}<br />nächsten Entwurf{' '}<br /><em>mehr.</em></> : <>Make more of{' '}<br />your next{' '}<br /><em>design.</em></>}</h2><div className="zl-end__bottom"><p>{t('Gestalte heute, was morgen als Komponente weiterarbeitet.', 'Design today what keeps working as a component tomorrow.')}</p><Button href={paths.routes.register} size="lg" className="zl-end__cta">{t('Loslegen', 'Get started')} <span aria-hidden="true">↗</span></Button></div></div></section>

      <footer className="zl-footer"><div className="zl-shell zl-footer__inner"><Brand /><nav aria-label={t('Footer Navigation', 'Footer navigation')}><a href={paths.routes.register}>{t('Loslegen', 'Get started')}</a><a href={paths.routes.kit}>Zaoly Kit</a><a href={paths.routes.tokens}>Token Studio</a><a href={paths.routes.faq}>FAQ</a><a href={sectionHref(contact)}>{t('Kontakt', 'Contact')}</a><a href={paths.routes.login}>{t('Anmelden', 'Sign in')}</a></nav></div></footer>
    </main>
  )
}
