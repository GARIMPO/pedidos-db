export interface Pedido {
  id: string
  created_at: string
  nome: string
  email: string
  telefone: string
  status: 'producao' | 'pronto' | 'enviado'
  total: number
  observacao: string
  codigo_rastreamento: string
  endereco?: string
  descricoes?: string[]
}

