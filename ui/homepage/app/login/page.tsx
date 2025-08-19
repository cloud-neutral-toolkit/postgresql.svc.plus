'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin') {
      router.push('/panel/xray')
    } else {
      router.push('/panel/account')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 max-w-sm">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  )
}
