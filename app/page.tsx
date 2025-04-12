"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona diretamente para o dashboard sem verificar login
    router.push("/dashboard")
  }, [router])

  // Retorna um componente vazio pois será redirecionado
  return null
}

