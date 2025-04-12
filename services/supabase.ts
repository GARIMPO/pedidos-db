import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key são necessários')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Tipos baseados no schema do Supabase
export type Pedido = Database['public']['Tables']['pedidos']['Row']
export type Produto = Database['public']['Tables']['produtos']['Row']
export type ItemPedido = Database['public']['Tables']['itens_pedido']['Row']
export type Financeiro = Database['public']['Tables']['financeiro']['Row']
export type Contato = Database['public']['Tables']['contatos']['Row']

// Funções para Pedidos
export async function getPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar pedidos:', error)
    throw error
  }
  return data
}

export async function createPedido(pedido: Database['public']['Tables']['pedidos']['Insert']) {
  console.log('Criando pedido:', pedido)
  try {
    // Validação dos campos obrigatórios
    if (!pedido.nome || !pedido.email || !pedido.telefone) {
      throw new Error('Nome, email e telefone são campos obrigatórios')
    }

    // Remove o id e created_at do objeto pedido para evitar duplicação
    const { id, created_at, ...pedidoSemId } = pedido

    // Formata os dados antes de inserir
    const pedidoFormatado = {
      ...pedidoSemId,
      status: pedidoSemId.status || 'producao',
      total: Number(pedidoSemId.total) || 0,
      observacao: pedidoSemId.observacao || null,
      codigo_rastreamento: pedidoSemId.codigo_rastreamento || null
    }

    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedidoFormatado])
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar pedido:', error.message || error)
      throw new Error(error.message || 'Erro ao criar pedido')
    }

    if (!data) {
      console.error('Nenhum dado retornado ao criar pedido')
      throw new Error('Nenhum dado retornado ao criar pedido')
    }

    // Se o pedido foi criado com sucesso e tem um email, salve o email
    if (data && pedido.email) {
      try {
        await salvarEmail(pedido.email, pedido.nome, 'pedido', data.id)
      } catch (error) {
        console.error('Erro ao salvar email do pedido:', error)
        // Não lançamos o erro aqui para não interromper o fluxo do pedido
      }
    }

    return data
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    throw error
  }
}

export async function updatePedido(id: string, pedido: Database['public']['Tables']['pedidos']['Update']) {
  console.log('Atualizando pedido:', { id, pedido })
  const { data, error } = await supabase
    .from('pedidos')
    .update({
      nome: pedido.nome,
      email: pedido.email,
      telefone: pedido.telefone,
      status: pedido.status,
      total: pedido.total,
      observacao: pedido.observacao,
      codigo_rastreamento: pedido.codigo_rastreamento
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar pedido:', error)
    throw error
  }

  if (!data) {
    console.error('Nenhum dado retornado ao atualizar pedido')
    throw new Error('Nenhum dado retornado ao atualizar pedido')
  }

  return data
}

export async function deletePedido(id: string) {
  console.log('Iniciando processo de exclusão do pedido ID:', id)
  
  try {
    // Primeiro verificar se o pedido existe
    const { data: pedidoExistente, error: erroBusca } = await supabase
      .from('pedidos')
      .select('id, nome')
      .eq('id', id)
      .single()
    
    if (erroBusca) {
      console.error('Erro ao verificar se o pedido existe:', erroBusca)
      throw new Error(`Pedido com ID ${id} não encontrado.`)
    }
    
    if (!pedidoExistente) {
      console.error('Pedido não encontrado:', id)
      throw new Error(`Pedido com ID ${id} não existe no banco de dados.`)
    }
    
    console.log('Pedido encontrado, prosseguindo com exclusão:', pedidoExistente)
    
    // Verificar e excluir emails relacionados ao pedido primeiro
    try {
      const { error: erroExclusaoEmails } = await supabase
        .from('emails_salvos')
        .delete()
        .eq('pedido_id', id)
      
      if (erroExclusaoEmails) {
        console.warn('Aviso ao excluir emails relacionados ao pedido:', erroExclusaoEmails)
      }
    } catch (error) {
      console.warn('Erro ao tentar excluir emails relacionados ao pedido:', error)
      // Continuamos com a exclusão do pedido mesmo se falhar a exclusão dos emails
    }
    
    // Verificar e excluir itens do pedido
    try {
      const { error: erroExclusaoItens } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', id)
      
      if (erroExclusaoItens) {
        console.warn('Aviso ao excluir itens do pedido:', erroExclusaoItens)
      }
    } catch (error) {
      console.warn('Erro ao tentar excluir itens do pedido:', error)
      // Continuamos com a exclusão do pedido mesmo se falhar a exclusão dos itens
    }
    
    // Realizar a exclusão do pedido
    const { error: erroExclusao } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id)
    
    if (erroExclusao) {
      console.error('Erro ao deletar pedido:', erroExclusao)
      throw erroExclusao
    }
    
    console.log('Pedido excluído com sucesso:', id)
    return { success: true, message: `Pedido "${pedidoExistente.nome}" excluído com sucesso` }
  } catch (error) {
    console.error('Exceção ao tentar excluir pedido:', error)
    throw error
  }
}

// Funções para Produtos
export async function getProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProduto(produto: Omit<Produto, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([produto])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateProduto(id: string, produto: Partial<Produto>) {
  const { data, error } = await supabase
    .from('produtos')
    .update(produto)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteProduto(id: string) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Funções para Itens do Pedido
export async function getItensPedido(pedidoId: string) {
  const { data, error } = await supabase
    .from('itens_pedido')
    .select(`
      *,
      produto:produtos(*)
    `)
    .eq('pedido_id', pedidoId)
  
  if (error) throw error
  return data
}

export async function createItemPedido(item: Database['public']['Tables']['itens_pedido']['Insert']) {
  const { data, error } = await supabase
    .from('itens_pedido')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateItemPedido(id: string, item: Database['public']['Tables']['itens_pedido']['Update']) {
  const { data, error } = await supabase
    .from('itens_pedido')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteItemPedido(id: string) {
  const { error } = await supabase
    .from('itens_pedido')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Funções para Financeiro
export async function getFinanceiro() {
  const { data, error } = await supabase
    .from('financeiro')
    .select('*')
    .order('data', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar transações:', error)
    throw error
  }
  return data
}

export async function createFinanceiro(transacao: Database['public']['Tables']['financeiro']['Insert']) {
  console.log('Criando transação:', transacao)
  const { data, error } = await supabase
    .from('financeiro')
    .insert(transacao)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar transação:', error)
    throw error
  }
  return data
}

export async function updateFinanceiro(id: string, transacao: Database['public']['Tables']['financeiro']['Update']) {
  console.log('Atualizando transação:', { id, transacao })
  const { data, error } = await supabase
    .from('financeiro')
    .update(transacao)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar transação:', error)
    throw error
  }
  return data
}

export async function deleteFinanceiro(id: string) {
  console.log('Deletando transação:', id)
  const { error } = await supabase
    .from('financeiro')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar transação:', error)
    throw error
  }
}

// Funções para Contatos
export async function getContatos() {
  const { data, error } = await supabase
    .from('contatos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar contatos:', error)
    throw error
  }
  return data
}

export async function createContato(contato: Database['public']['Tables']['contatos']['Insert']) {
  console.log('Criando contato:', contato)
  const { data, error } = await supabase
    .from('contatos')
    .insert(contato)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar contato:', error)
    throw error
  }
  return data
}

export async function updateContato(id: string, contato: Database['public']['Tables']['contatos']['Update']) {
  console.log('Atualizando contato:', { id, contato })
  const { data, error } = await supabase
    .from('contatos')
    .update(contato)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar contato:', error)
    throw error
  }
  return data
}

export async function deleteContato(id: string) {
  console.log('Deletando contato:', id)
  const { error } = await supabase
    .from('contatos')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar contato:', error)
    throw error
  }
}

// Funções para E-mails Salvos
export async function salvarEmail(email: string, nome: string, origem: 'pedido' | 'contato', pedido_id?: string, contato_id?: string) {
  console.log('Salvando email:', { email, nome, origem, pedido_id, contato_id })
  const { data, error } = await supabase
    .from('emails_salvos')
    .insert({
      email,
      nome,
      origem,
      pedido_id,
      contato_id
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao salvar email:', error)
    throw error
  }
  return data
}

export async function getEmailsSalvos() {
  const { data, error } = await supabase
    .from('emails_salvos')
    .select(`
      *,
      pedido:pedidos(*),
      contato:contatos(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar emails salvos:', error)
    throw error
  }
  return data
}

export async function updateEmailSalvo(id: string, email: Partial<Database['public']['Tables']['emails_salvos']['Update']>) {
  const { data, error } = await supabase
    .from('emails_salvos')
    .update(email)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar email:', error)
    throw error
  }
  return data
}

export async function deleteEmailSalvo(id: string) {
  const { error } = await supabase
    .from('emails_salvos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir email:', error)
    throw error
  }
} 