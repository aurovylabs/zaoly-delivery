// @vitest-environment jsdom
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingPage } from '../components/landing-page'
import { UserPrefsProvider } from '../lib/user-prefs'
import { paths } from '../lib/paths'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

describe('Zaoly landing page', () => {
  const renderLanding = (locale: 'de' | 'en' = 'de') => render(<UserPrefsProvider initialLocale={locale}><LandingPage /></UserPrefsProvider>)

  it('shows the design-to-component story and working entry points', () => {
    renderLanding()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Vom Design zur echten Komponente.',
    )
    expect(screen.getByRole('heading', { name: /Ein Editor.*Der ganze Prozess/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ein Kit/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ein Master.*Mehr Ausdruck/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ein Wert.*Überall spürbar/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Werte formen.*Wirkung sehen/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Schrift ändern.*System bewegen/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ein Inhalt.*Zwei Kompositionen/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Eine Seite.*Jeder Bildschirm/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Eine Komponente.*Ein durchgehender Weg/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Übergabe ohne Ratespiel/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /So viele Projekte, wie du brauchst/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Loslegen/i })[0]).toHaveAttribute(
      'href',
      paths.routes.register,
    )
    expect(screen.getByRole('link', { name: /Zaoly Kit ansehen/i })).toHaveAttribute(
      'href',
      paths.routes.kit,
    )
    expect(screen.getAllByRole('link', { name: /Token Studio öffnen/i })).toHaveLength(2)
    for (const link of screen.getAllByRole('link', { name: /Token Studio öffnen/i })) {
      expect(link).toHaveAttribute('href', paths.routes.tokens)
    }
    expect(screen.getAllByRole('link', { name: 'Token Studio' })[0]).toHaveAttribute(
      'href',
      `${paths.routes.home}#${paths.landing.sections.tokens}`,
    )
    expect(screen.getByRole('navigation', { name: /Landingpage/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'FAQ' })[0]).toHaveAttribute('href', paths.routes.faq)
    expect(screen.getByText(/Team-Präsenz, Kommentare und benannte Versionsstände/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Canvas wird eine Komponente ausgewählt/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Eine Komponente in drei verschiedenen Projekten/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Beispiel eines exportierten React-Moduls/i)).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/Plexon Collection/i)
  })

  it('renders the full public landing entry in English', () => {
    renderLanding('en')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('From design to real components.')
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByRole('link', { name: /Get started/i })[0]).toHaveAttribute(
      'href',
      paths.routes.register,
    )
    expect(screen.getByText('Color, down to the detail.')).toBeInTheDocument()
    expect(screen.getByText('One pack. Multiple views.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Token Studio illustration: a color token changes/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Let’s talk about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Talk to our team/i })).toHaveAttribute('href', `mailto:${paths.publicSiteContactEmailDefault}?subject=Zaoly%20enquiry`)
  })

  it('uses the configured contact inbox and never invents one', () => {
    render(<UserPrefsProvider initialLocale="de"><LandingPage contactEmail="team@example.org" /></UserPrefsProvider>)
    expect(screen.getByRole('link', { name: /Gespräch anfragen/i })).toHaveAttribute('href', 'mailto:team@example.org?subject=Anfrage%20zu%20Zaoly')
  })

  it('uses the first-party illustration and genuine app screenshot assets listed in paths', () => {
    renderLanding()
    const hero = document.querySelector(`img[src="${paths.landing.assets.heroArtboard}"]`)
    const kit = screen.getByRole('img', { name: /Zaoly Kit: Text, Button/i })
    const tokenScreenshot = screen.getByRole('img', { name: /Echte Zaoly Token-Studio-Ansicht/i })
    const kitScreenshot = screen.getByRole('img', { name: /Echtes Zaoly Kit Playground/i })
    expect(hero).toBeInTheDocument()
    expect(kit).toHaveAttribute('src', paths.landing.assets.kitAssembly)
    expect(tokenScreenshot).toHaveAttribute('src', paths.landing.assets.tokenStudioApp)
    expect(kitScreenshot).toHaveAttribute('src', paths.landing.assets.kitPlaygroundApp)
    expect(screen.getAllByText('Echte App-Ansicht · Demodaten')).toHaveLength(2)
    expect(screen.getByText(/Pfade verbinden Werte und Komponenten im Editor/i)).toBeInTheDocument()
    expect(screen.getByText(/Kit-Atome, TSX und Live Preview stehen nebeneinander/i)).toBeInTheDocument()
    for (const asset of Object.values(paths.landing.assets)) {
      expect(existsSync(path.join(__dirname, '../public', asset.replace(/^\//, '')))).toBe(true)
    }
  })

  it('shows eighteen explanatory loops with a complete reduced-motion fallback', () => {
    renderLanding()

    expect(
      [...document.querySelectorAll('[data-loop]')].map((element) => element.getAttribute('data-loop')),
    ).toEqual(['canvas', 'editor', 'capability-design', 'capability-system', 'capability-team', 'capability-handoff', 'kit', 'variants', 'tokens', 'token-color-edit', 'token-spacing-wheel', 'token-compose', 'typography', 'composition', 'breakpoints', 'workflow', 'projects', 'handoff'])
    expect(screen.getByRole('img', { name: /Canvas wird eine Komponente ausgewählt/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Illustration des Zaoly Editors mit Canvas, Seiten und Ebenen/i })).toBeInTheDocument()
    expect(document.querySelectorAll('.zl-editor-tour__pane--check')).toHaveLength(2)
    expect(document.querySelector('.zl-editor-tour__token')).toHaveTextContent('typography.heading.h1')
    expect(document.querySelectorAll('.zl-editor-overview__capabilities article')).toHaveLength(4)
    expect(screen.getByRole('img', { name: /Ebenen einer Seite ausgewählt/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /FeatureCard-Master mit benannter Variante/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Team-Präsenz, ein Kommentar/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Entwurf im Preflight/i })).toBeInTheDocument()
    expect(document.querySelectorAll('.zl-kit__atom-focus[aria-hidden="true"]')).toHaveLength(4)
    expect(document.querySelector('.zl-stage__variant-value')).toHaveTextContent('DefaultPrimary')
    expect(document.querySelectorAll('.zl-kit__result-mask')).toHaveLength(3)
    expect(screen.getByRole('img', { name: /Master-Varianten Default und Editorial/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-variant-stage__default')).toHaveTextContent('Default')
    expect(document.querySelector('.zl-variant-stage__editorial')).toHaveTextContent('Editorial')
    expect(document.querySelectorAll('.zl-variant-stage__card')).toHaveLength(2)
    expect(screen.getByRole('img', { name: /Farbtoken wird geändert und zwei daran gebundene Komponenten/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-token-stage')).toHaveTextContent('color.action.primary')
    expect(document.querySelector('.zl-token-stage')).toHaveTextContent('typography.heading.h1')
    expect(document.querySelector('.zl-token-stage')).toHaveTextContent('spacing.static.medium')
    expect(document.querySelector('.zl-token-stage__value-code')).toHaveTextContent('#1F44FF#7457D8')
    expect(document.querySelectorAll('.zl-token-stage__component')).toHaveLength(2)
    expect(document.querySelector('.zl-token-stage__complete')).toHaveTextContent('Beide Komponenten aktualisiert')
    expect(screen.getByRole('img', { name: /color.action.primary wird im Edit-Dock/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-token-craft__formats')).toHaveTextContent('HEXRGBHSLOKLCH')
    expect(document.querySelector('.zl-token-craft__selected-foot')).toHaveTextContent('Override')
    expect(screen.getByRole('img', { name: /Endlos-Rad ändert spacing.static.medium/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-token-craft__wheel-scale')).toHaveTextContent('.5.7511.251.51.7522.25')
    expect(screen.getByRole('img', { name: /spacing.gap.modules verwendet im Digitalwert-Feld/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-token-craft__expression')).toHaveTextContent('calc({spacing.static.medium} * 2)')
    expect(screen.getByRole('img', { name: /Typografie-Token typography.heading.h1/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-type-stage')).toHaveTextContent('Noto Sans JP')
    expect(document.querySelector('.zl-type-stage')).toHaveTextContent('Serif')
    expect(document.querySelectorAll('.zl-type-stage__sample')).toHaveLength(2)
    expect(screen.getByRole('img', { name: /Kit-Atome Text, Button und Bild/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-compose-stage__layout')).toHaveTextContent('GridStack')
    expect(screen.getByRole('img', { name: /Breakpoints Desktop mit 1440 Pixeln und Mobile mit 390 Pixeln/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-break-stage__desktop-tab')).toHaveTextContent('Desktop 1440')
    expect(document.querySelector('.zl-break-stage__mobile-tab')).toHaveTextContent('Mobile 390')
    expect(document.querySelectorAll('.zl-workflow__chapter')).toHaveLength(3)
    expect(screen.getByRole('img', { name: /FeatureCard ist auf einem Artboard ausgewählt/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /FeatureCard-Master mit Variante Primary und gebundenem Farbtoken/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /React-Modul FeatureCard.tsx mit Import/i })).toBeInTheDocument()
    expect(document.querySelector('.zl-workflow__journey')).toHaveTextContent('color.action.primary')
    expect(document.querySelector('.zl-workflow__journey')).toHaveTextContent('@zaoly/site-kit')
    expect(document.querySelector('.zl-handoff__ready')).toHaveTextContent('Bereit für React')

    const css = readFileSync(path.join(__dirname, '../app/landing.css'), 'utf8')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('.zl-kit__result-mask, .zl-project__sample::after')
    expect(css).toContain('.zl-token-stage__value-after, .zl-token-stage__complete { opacity: 1; }')
    expect(css).toContain('.zl-token-craft__changed, .zl-token-craft__saved, .zl-token-craft__resolve strong { opacity: 1; }')
    expect(css).toContain('.zl-type-stage__after, .zl-type-stage__text-after { opacity: 1; }')
    expect(css).toContain('.zl-compose-stage__headline { top: 17%; left: 12%; width: 76%; text-align: center; }')
    expect(css).toContain('.zl-variant-stage__card--editorial, .zl-variant-stage__foot-editorial { opacity: 1; transform: none; }')
    expect(css).toContain('.zl-break-stage__mobile { opacity: 1; }')
    expect(css).toContain('.zl-editor-tour__pane--check, .zl-editor-tour__issue { opacity: 1; }')
    expect(css).toContain('.zl-editor-overview__capabilities { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));')
    expect(css).toContain('.zl-editor-overview__capabilities { grid-template-columns: 1fr; }')
    expect(css).toContain('.zl-cap-design__page em, .zl-cap-team__comment, .zl-cap-team__version, .zl-cap-handoff__checks i, .zl-cap-handoff__code strong { opacity: 1; }')
    expect(css).toContain('.zl-workflow__journey { grid-template-columns: 1fr;')
    expect(css).toContain('.zl-workflow__chapter::before { background: var(--zl-acid); }')
  })
})
