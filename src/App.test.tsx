import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import timeline from '../public/data/timeline.json'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(timeline), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('<App />', () => {
  it('renders the whole tree with the profile name once data loads', async () => {
    render(<App />)
    // The name shows as the <h1> in the header (and again as the panel's <h2>).
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /Rodrigo Regad/ }),
      ).toBeInTheDocument(),
    )
  })

  it('shows the git-graph with its trunk label', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument())
    expect(screen.getAllByText('main').length).toBeGreaterThan(0)
  })

  it('expands a stat tile into the list of its items', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /Rodrigo Regad/ }),
      ).toBeInTheDocument(),
    )

    const techTile = screen.getByRole('button', { name: /technolog|tecnolog/i })
    expect(techTile).toHaveAttribute('aria-expanded', 'false')

    await user.click(techTile)
    expect(techTile).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Strapi')).toBeInTheDocument()

    await user.click(techTile)
    expect(techTile).toHaveAttribute('aria-expanded', 'false')
  })
})
