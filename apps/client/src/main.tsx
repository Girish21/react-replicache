import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { ReplicacheProvider } from './context/replicache'

async function init() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ReplicacheProvider>
        <App />
      </ReplicacheProvider>
    </React.StrictMode>,
  )
}

init()
