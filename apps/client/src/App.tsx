import * as React from 'react'

function App() {
  const [count, setCount] = React.useState(0)

  return (
    <div className='grid h-screen place-content-center'>
      <h1 className='text-center text-2xl'>{count}</h1>
      <div className='flex justify-center gap-4'>
        <button onClick={() => setCount(count => count + 1)}>+</button>
        <button onClick={() => setCount(count => count - 1)}>-</button>
      </div>
    </div>
  )
}

export default App
