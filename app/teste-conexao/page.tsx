'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TesteConexao() {
  const [status, setStatus] = useState('Testando conexão...')

  useEffect(() => {
    async function testarConexao() {
      try {
        const { data, error } = await supabase
          .from('teste')
          .select('*')
        
        if (error) {
          setStatus(`Erro na conexão: ${error.message}`)
        } else {
          setStatus('Conexão com Supabase estabelecida com sucesso!')
        }
      } catch (error) {
        setStatus(`Erro: ${error}`)
      }
    }

    testarConexao()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
      <p>{status}</p>
    </div>
  )
} 