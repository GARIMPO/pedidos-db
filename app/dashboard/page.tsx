"use client"

import { useState, useEffect } from "react"
import { PlusCircle, DollarSign, LineChart, Mail, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent } from "@/components/ui/card"
import PedidoDialog from "@/components/pedido-dialog"
import ListaPedidos from "@/components/lista-pedidos"
import FinancasView from "@/components/financas-view"
import EmailsView from "@/components/emails-view"
import PedidoSearch from "@/components/pedido-search"
import EmailsSalvosView from "@/components/emails-salvos-view"
import type { Pedido } from "@/types/pedido"
import type { Transacao } from "@/types/financas"
import type { Contato } from "@/types/contato"
import { useRouter } from "next/navigation"
import { 
  getPedidos, createPedido, updatePedido, deletePedido,
  getFinanceiro, createFinanceiro, updateFinanceiro, deleteFinanceiro,
  getContatos, createContato, updateContato, deleteContato
} from "@/services/supabase"

export default function Dashboard() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [activeTab, setActiveTab] = useState("pedidos")
  const { toast } = useToast()

  const [searchStatus, setSearchStatus] = useState("todos")

  // Carrega dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [pedidosData, transacoesData, contatosData] = await Promise.all([
          getPedidos(),
          getFinanceiro(),
          getContatos()
        ])
        
        setPedidos(pedidosData)
        setTransacoes(transacoesData)
        setContatos(contatosData)
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do banco de dados.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  const adicionarPedido = async (novoPedido: Pedido) => {
    try {
      console.log("Tentando salvar pedido:", novoPedido)
      console.log("PedidoAtual:", pedidoAtual)
      
      if (pedidoAtual) {
        // Editando pedido existente
        console.log("Atualizando pedido existente com ID:", pedidoAtual.id)
        
        // Preparar dados para atualização
        const dadosAtualizacao = {
          nome: novoPedido.nome,
          email: novoPedido.email,
          telefone: novoPedido.telefone,
          status: novoPedido.status,
          total: novoPedido.total,
          observacao: novoPedido.observacao,
          codigo_rastreamento: novoPedido.codigo_rastreamento
        };
        
        console.log("Dados para atualização:", dadosAtualizacao);
        
        const pedidoAtualizado = await updatePedido(pedidoAtual.id, dadosAtualizacao);

        if (!pedidoAtualizado) {
          throw new Error('Pedido não foi atualizado')
        }

        console.log("Pedido atualizado com sucesso:", pedidoAtualizado)
        // Atualiza o pedido na lista
        setPedidos(pedidos.map((p) => (p.id === pedidoAtual.id ? pedidoAtualizado : p)))
      } else {
        // Criando novo pedido
        console.log("Criando novo pedido")
        const pedidoCriado = await createPedido(novoPedido)
        
        if (!pedidoCriado) {
          throw new Error('Pedido não foi criado')
        }

        console.log("Pedido criado com sucesso:", pedidoCriado)
        // Adiciona o novo pedido à lista
        setPedidos([pedidoCriado, ...pedidos])
      }

      // Se o e-mail foi adicionado ou alterado, atualiza ou adiciona o contato
      if (novoPedido.email) {
        const contatoExistente = contatos.find((c) => c.email === novoPedido.email)
        if (!contatoExistente) {
          const novoContato = await createContato({
            nome: novoPedido.nome,
            email: novoPedido.email,
            telefone: novoPedido.telefone,
            mensagem: "Contato criado a partir do pedido"
          })
          if (novoContato) {
            setContatos([...contatos, novoContato])
          }
        }
      }

      setIsDialogOpen(false)
      setPedidoAtual(null)
      toast({
        title: "Sucesso",
        description: pedidoAtual ? "Pedido atualizado com sucesso!" : "Pedido criado com sucesso!",
      })
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar pedido. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const editarPedido = (pedido: Pedido) => {
    console.log("Pedido selecionado para edição:", pedido)
    
    // Certifique-se de que todos os campos necessários estejam presentes
    const pedidoCompleto: Pedido = {
      id: pedido.id,
      created_at: pedido.created_at,
      nome: pedido.nome || '',
      email: pedido.email || '',
      telefone: pedido.telefone || '',
      status: pedido.status || 'producao',
      total: typeof pedido.total === 'number' ? pedido.total : 0,
      observacao: pedido.observacao || '',
      codigo_rastreamento: pedido.codigo_rastreamento || '',
      endereco: pedido.endereco || '',
      descricoes: pedido.descricoes || []
    }
    
    console.log("Pedido preparado para edição:", pedidoCompleto)
    setPedidoAtual(pedidoCompleto)
    setIsDialogOpen(true)
  }

  const excluirPedido = async (id: string) => {
    try {
      console.log("Iniciando exclusão do pedido:", id);
      
      // Exibir toast de carregamento
      toast({
        title: "Excluindo pedido",
        description: "Aguarde enquanto o pedido é excluído...",
      });
      
      // Chamar a API do Supabase para excluir o pedido
      const result = await deletePedido(id);
      console.log("Resultado da exclusão:", result);

      // Se chegou aqui é porque a exclusão foi bem-sucedida
      // Atualizar a lista de pedidos removendo o pedido excluído
      setPedidos(pedidos.filter((p) => p.id !== id));
      
      // Notificar o usuário sobre o sucesso
      toast({
        title: "Pedido excluído",
        description: "O pedido foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      
      // Notificar o usuário sobre o erro
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  const adicionarTransacao = async (novaTransacao: Transacao) => {
    try {
      const transacaoCriada = await createFinanceiro({
        tipo: novaTransacao.tipo,
        valor: novaTransacao.valor,
        data: novaTransacao.data,
        descricao: novaTransacao.descricao,
        categoria: "geral"
      })
      
      if (!transacaoCriada) {
        throw new Error('Transação não foi criada')
      }
      setTransacoes([...transacoes, transacaoCriada])
      toast({
        title: `${novaTransacao.tipo === "receita" ? "Receita" : "Despesa"} adicionada`,
        description: `${novaTransacao.descricao} foi registrada com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação.",
        variant: "destructive",
      })
    }
  }

  const excluirTransacao = async (id: string) => {
    try {
      await deleteFinanceiro(id)
      setTransacoes(transacoes.filter((t) => t.id !== id))
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      })
    }
  }

  const editarTransacao = async (id: string, transacaoAtualizada: Transacao) => {
    try {
      const transacaoEditada = await updateFinanceiro(id, {
        tipo: transacaoAtualizada.tipo,
        valor: transacaoAtualizada.valor,
        data: transacaoAtualizada.data,
        descricao: transacaoAtualizada.descricao
      })
      
      if (!transacaoEditada) {
        throw new Error('Transação não foi atualizada')
      }
      
      setTransacoes(transacoes.map((t) => (t.id === id ? transacaoEditada : t)))
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao editar transação:', error)
      toast({
        title: "Erro",
        description: "Não foi possível editar a transação.",
        variant: "destructive",
      })
    }
  }

  const adicionarContato = async (novoContato: Contato) => {
    try {
      const contatoCriado = await createContato(novoContato)
      
      if (!contatoCriado) {
        throw new Error('Contato não foi criado')
      }
      
      setContatos([...contatos, contatoCriado])
      toast({
        title: "Contato adicionado",
        description: `${novoContato.nome} foi adicionado com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao adicionar contato:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive",
      })
    }
  }

  const atualizarContato = async (id: string, contatoAtualizado: Contato) => {
    try {
      const contatoEditado = await updateContato(id, contatoAtualizado)
      
      if (!contatoEditado) {
        throw new Error('Contato não foi atualizado')
      }
      
      setContatos(contatos.map((c) => (c.id === id ? contatoEditado : c)))
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao atualizar contato:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato.",
        variant: "destructive",
      })
    }
  }

  const excluirContato = async (id: string) => {
    try {
      await deleteContato(id)
      setContatos(contatos.filter((c) => c.id !== id))
      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato.",
        variant: "destructive",
      })
    }
  }

  // Divide pedidos em grupos com base no status
  const pedidosEmAndamento = pedidos.filter((p) => p.status !== 'enviado')
  const pedidosConcluidos = pedidos.filter((p) => p.status === 'enviado')

  // Filtrar pedidos baseado no status
  const pedidosEmAndamentoFiltrados = filtrarPedidos(pedidosEmAndamento, searchStatus)
  const pedidosConcluidosFiltrados = filtrarPedidos(pedidosConcluidos, searchStatus)

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { 
      style: "currency", 
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(valor)
  }

  const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)
  const totalDespesas = transacoes.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)
  const lucro = totalReceitas - totalDespesas

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sistema de Gerenciamento de Pedidos</h1>
                <p className="text-muted-foreground mt-1">Acompanhe o status e detalhes de todos os seus pedidos</p>
              </div>
            </div>
            <div className="mt-4 max-w-md">
              <PedidoSearch onSearch={setSearchStatus} />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[450px]">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPedidoAtual(null)
                  setIsDialogOpen(true)
                }}
                className="flex items-center gap-2 flex-1"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Pedido
              </Button>
              <Button onClick={() => setActiveTab("financas")} className="flex items-center gap-2 flex-1">
                <DollarSign className="h-4 w-4" />
                Finanças
              </Button>
            </div>
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="px-1">
                    <p className="text-xs text-muted-foreground">Receitas</p>
                    <p className="text-xs font-medium text-green-600 whitespace-nowrap overflow-hidden" title={formatarValor(totalReceitas)}>
                      {formatarValor(totalReceitas)}
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-xs text-muted-foreground">Despesas</p>
                    <p className="text-xs font-medium text-red-600 whitespace-nowrap overflow-hidden" title={formatarValor(totalDespesas)}>
                      {formatarValor(totalDespesas)}
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className="text-xs font-medium text-blue-600 whitespace-nowrap overflow-hidden" title={formatarValor(lucro)}>
                      {formatarValor(lucro)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => setActiveTab("emails")} className="w-full flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              E-mails Salvos ({contatos.length})
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="financas">Finanças</TabsTrigger>
            <TabsTrigger value="emails">E-mails</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Pedidos Em Andamento</h2>
              <ListaPedidos
                pedidos={pedidosEmAndamentoFiltrados}
                onEdit={editarPedido}
                onDelete={excluirPedido}
              />
            </div>

            {pedidosConcluidos.length > 0 && (
              <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold tracking-tight">Pedidos Concluídos</h2>
                <ListaPedidos
                  pedidos={pedidosConcluidosFiltrados}
                  onEdit={editarPedido}
                  onDelete={excluirPedido}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="financas">
            <FinancasView
              transacoes={transacoes}
              onAdd={adicionarTransacao}
              onDelete={excluirTransacao}
              onEdit={editarTransacao}
            />
          </TabsContent>

          <TabsContent value="emails">
            <EmailsSalvosView 
              contatos={contatos}
              onAdd={adicionarContato} 
              onEdit={atualizarContato}
              onDelete={excluirContato}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PedidoDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pedido={pedidoAtual}
        onSubmit={adicionarPedido}
      />

      <Toaster />
    </main>
  )
}

// Função de filtro para os pedidos
function filtrarPedidos(pedidos: Pedido[], status: string) {
  if (status === "todos") {
    return pedidos
  }
  
  return pedidos.filter((pedido) => pedido.status === status)
} 