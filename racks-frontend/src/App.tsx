import { useState } from 'react'
import { MeltStrip } from './components/MeltStrip'
import { Home } from './screens/Home'
import { Trade } from './screens/Trade'
import { Cayman } from './screens/Cayman'
import { Agents } from './screens/Agents'
import { Dashboard } from './screens/Dashboard'
import { HowItWorks } from './screens/HowItWorks'
import { activeChain, isTestnet } from './config/chains'
import { missing } from './config/addresses'
import { Notice } from './components/ui'

const SCREENS = [
  { id: 'home', label: 'Wallet' },
  { id: 'trade', label: 'Trade' },
  { id: 'cayman', label: 'Cayman Islands' },
  { id: 'agents', label: 'IRS Agents' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'how', label: 'How this works' },
] as const

export default function App() {
  const [screen, setScreen] = useState<string>('home')
  const unset = missing('racks', 'cayman', 'irsAgent', 'twapOracle')

  return (
    <div className="shell">
      <header className="masthead">
        <span className="wordmark">RACKS</span>
        <span className="tagline">
          Your money melts. The Caymans are open. The agents are hiring.
        </span>
      </header>

      {unset.length > 0 ? (
        <Notice kind="setup">
          <p>
            Pre-deployment build. {unset.length} contract
            {unset.length === 1 ? '' : 's'} have no address yet, so the figures
            below are blank rather than zero. Fill in <span className="figure-sm">.env</span>{' '}
            after the {isTestnet ? 'testnet' : 'mainnet'} deploy.
          </p>
        </Notice>
      ) : null}

      {/* Never conditional. §7. */}
      <MeltStrip />

      <nav className="nav">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            aria-current={screen === s.id ? 'page' : undefined}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main>
        {screen === 'home' && <Home go={setScreen} />}
        {screen === 'trade' && <Trade />}
        {screen === 'cayman' && <Cayman />}
        {screen === 'agents' && <Agents />}
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'how' && <HowItWorks />}
      </main>

      <footer className="footer">
        <p>
          {activeChain.name} · chain {activeChain.id}
          {isTestnet ? ' · testnet, tokens are worthless' : ''}
        </p>
        <p>
          RACKS loses 4.2–6.9% of its value per day by design. The agent game is
          gambling and most players lose.{' '}
          <button
            className="btn secondary"
            style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}
            onClick={() => setScreen('how')}
          >
            Read the risks
          </button>
        </p>
      </footer>
    </div>
  )
}
