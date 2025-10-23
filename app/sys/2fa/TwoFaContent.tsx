"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react'

export default function TwoFaPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/sys'
  const { update } = useSession()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Invalid token')

      // esto es nuevo - marcar que ya no requiere 2FA
      await update({ requires2FA: false })

      router.push(callbackUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Error')
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (!data?.user?.requires2FA) {
          router.push('/sys/login?callbackUrl=/sys/2fa')
        }
      } catch {
        router.push('/sys/login?callbackUrl=/sys/2fa')
      }
    })()
  }, [router])

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
      <VStack gap={6} w="full" maxW="400px" p={8}>
        <Text fontSize="lg" color="white">Confirmar autenticacion en dos pasos</Text>
        <Input placeholder="123456" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
        {error && <Text color="red.400">{error}</Text>}
  <Button colorScheme="blue" onClick={submit} loading={loading}>Confirmar</Button>
      </VStack>
    </Box>
  )
}
