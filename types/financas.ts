export interface Transacao {
  id: string
  tipo: "receita" | "despesa"
  descricao: string
  valor: number
  data: string // ISO string
  categoria?: string // Opcional
}

