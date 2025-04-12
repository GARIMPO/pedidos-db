export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pedidos: {
        Row: {
          id: string
          created_at: string
          nome: string
          email: string
          telefone: string
          status: 'producao' | 'pronto' | 'enviado'
          total: number
          observacao: string | null
          codigo_rastreamento: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          nome: string
          email: string
          telefone: string
          status?: 'producao' | 'pronto' | 'enviado'
          total: number
          observacao?: string | null
          codigo_rastreamento?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          nome?: string
          email?: string
          telefone?: string
          status?: 'producao' | 'pronto' | 'enviado'
          total?: number
          observacao?: string | null
          codigo_rastreamento?: string | null
        }
      }
      emails_salvos: {
        Row: {
          id: string
          created_at: string
          email: string
          nome: string
          origem: 'pedido' | 'contato'
          pedido_id: string | null
          contato_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          nome: string
          origem: 'pedido' | 'contato'
          pedido_id?: string | null
          contato_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          nome?: string
          origem?: 'pedido' | 'contato'
          pedido_id?: string | null
          contato_id?: string | null
        }
      }
      produtos: {
        Row: {
          id: string
          created_at: string
          nome: string
          descricao: string | null
          preco: number
          estoque: number
          categoria: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          nome: string
          descricao?: string | null
          preco: number
          estoque: number
          categoria?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          nome?: string
          descricao?: string | null
          preco?: number
          estoque?: number
          categoria?: string | null
        }
      }
      itens_pedido: {
        Row: {
          id: string
          created_at: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          total: number
        }
        Insert: {
          id?: string
          created_at?: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          total: number
        }
        Update: {
          id?: string
          created_at?: string
          pedido_id?: string
          produto_id?: string
          quantidade?: number
          preco_unitario?: number
          total?: number
        }
      }
      financeiro: {
        Row: {
          id: string
          created_at: string
          tipo: 'receita' | 'despesa'
          valor: number
          data: string
          descricao: string
          categoria: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          tipo: 'receita' | 'despesa'
          valor: number
          data: string
          descricao: string
          categoria?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          tipo?: 'receita' | 'despesa'
          valor?: number
          data?: string
          descricao?: string
          categoria?: string | null
        }
      }
      contatos: {
        Row: {
          id: string
          created_at: string
          nome: string
          email: string
          telefone: string
          mensagem: string
        }
        Insert: {
          id?: string
          created_at?: string
          nome: string
          email: string
          telefone: string
          mensagem: string
        }
        Update: {
          id?: string
          created_at?: string
          nome?: string
          email?: string
          telefone?: string
          mensagem?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 