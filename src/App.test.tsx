import { render, screen, waitFor } from '@testing-library/react'
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
    // The trunk (main) branch label appears in the right gutter.
    expect(screen.getAllByText('main').length).toBeGreaterThan(0)
  })
})
