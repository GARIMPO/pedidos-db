"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Pedido } from "@/types/pedido"

interface PedidoFormProps {
  pedidoInicial?: Pedido
  onSubmit: (pedido: Pedido) => void
  onCancel?: () => void
}

export default function PedidoForm({ pedidoInicial, onSubmit, onCancel }: PedidoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Estado inicial vazio
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [status, setStatus] = useState<'producao' | 'pronto' | 'enviado'>('producao')
  const [total, setTotal] = useState<number>(0)
  const [observacao, setObservacao] = useState('')
  const [codigoRastreamento, setCodigoRastreamento] = useState('')
  const [id, setId] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  // Inicializa o formulário com os dados do pedido existente quando pedidoInicial mudar
  useEffect(() => {
    if (pedidoInicial) {
      console.log("Preenchendo formulário com pedido:", pedidoInicial)
      
      // Preencher todos os campos do formulário
      setNome(pedidoInicial.nome || '')
      setEmail(pedidoInicial.email || '')
      setTelefone(pedidoInicial.telefone || '')
      setStatus(pedidoInicial.status || 'producao')
      setTotal(pedidoInicial.total || 0)
      setObservacao(pedidoInicial.observacao || '')
      setCodigoRastreamento(pedidoInicial.codigo_rastreamento || '')
      setId(pedidoInicial.id || '')
      setCreatedAt(pedidoInicial.created_at || '')
    } else {
      // Reset do formulário quando não há pedido inicial
      setNome('')
      setEmail('')
      setTelefone('')
      setStatus('producao')
      setTotal(0)
      setObservacao('')
      setCodigoRastreamento('')
      setId('')
      setCreatedAt('')
    }
  }, [pedidoInicial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validação dos campos obrigatórios
      if (!nome || !email || !telefone) {
        throw new Error('Por favor, preencha todos os campos obrigatórios')
      }

      // Montar o objeto de pedido
      const pedido: Pedido = {
        id: id || '',
        created_at: createdAt || '',
        nome: nome,
        email: email,
        telefone: telefone,
        status: status,
        total: Number(total) || 0,
        observacao: observacao || '',
        codigo_rastreamento: codigoRastreamento || ''
      }

      console.log("Enviando pedido:", pedido)

      // Chama a função onSubmit do pai para salvar o pedido
      onSubmit(pedido)
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar pedido. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as 'producao' | 'pronto' | 'enviado')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="producao">Em Produção</SelectItem>
                <SelectItem value="pronto">Pronto</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total">Total</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            value={total}
            onChange={(e) => setTotal(parseFloat(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo_rastreamento">Código de Rastreio</Label>
          <Input
            id="codigo_rastreamento"
            value={codigoRastreamento}
            onChange={(e) => setCodigoRastreamento(e.target.value)}
            placeholder="Digite o código de rastreio"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacao">Observações</Label>
          <Textarea
            id="observacao"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : id ? "Atualizar Pedido" : "Salvar Pedido"}
        </Button>
      </div>
    </form>
  )
}

