"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Trash2, TrendingUp, TrendingDown, DollarSign, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Transacao } from "@/types/financas"

interface FinancasViewProps {
  transacoes: Transacao[]
  onAdd: (transacao: Transacao) => void
  onDelete: (id: string) => void
  onEdit: (id: string, transacao: Transacao) => void
}

export default function FinancasView({
  transacoes,
  onAdd,
  onDelete,
  onEdit,
}: FinancasViewProps) {
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita")
  const [data, setData] = useState<Date>(new Date())
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null)
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null)

  // Calculamos os valores totais dentro do componente
  const totalReceitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((sum, t) => sum + (t.valor || 0), 0)
  
  const totalDespesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + (t.valor || 0), 0)
  
  const lucro = totalReceitas - totalDespesas

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao || !valor) return

    if (transacaoParaEditar) {
      // Editando transação existente
      onEdit(transacaoParaEditar.id, {
        ...transacaoParaEditar,
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data: data.toISOString(),
      })
    } else {
      // Adicionando nova transação
      const novaTransacao: Transacao = {
        id: uuidv4(),
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data: data.toISOString(),
      }
      onAdd(novaTransacao)
    }

    // Limpar formulário
    setDescricao("")
    setValor("")
    setTipo("receita")
    setData(new Date())
    setTransacaoParaEditar(null)
  }

  const editarTransacao = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao)
    setDescricao(transacao.descricao || '')
    setValor(transacao.valor ? transacao.valor.toString() : '')
    setTipo(transacao.tipo)
    try {
      // Garantir que a data seja um objeto Date válido
      const dataTransacao = transacao.data ? new Date(transacao.data) : new Date()
      // Verificar se a data é válida antes de atribuir
      if (isNaN(dataTransacao.getTime())) {
        console.error("Data inválida:", transacao.data)
        setData(new Date()) // Usar data atual como fallback
      } else {
        setData(dataTransacao)
      }
    } catch (error) {
      console.error("Erro ao converter data:", error)
      setData(new Date()) // Usar data atual como fallback
    }
  }

  // Função adaptadora para corrigir o tipo
  const handleEditTransacao = (id: string, transacao: Transacao) => {
    editarTransacao(transacao)
  }

  const cancelarEdicao = () => {
    setTransacaoParaEditar(null)
    setDescricao("")
    setValor("")
    setTipo("receita")
    setData(new Date())
  }

  const confirmarExclusao = (id: string) => {
    setTransacaoParaExcluir(id)
  }

  const cancelarExclusao = () => {
    setTransacaoParaExcluir(null)
  }

  const executarExclusao = () => {
    if (transacaoParaExcluir) {
      onDelete(transacaoParaExcluir)
      setTransacaoParaExcluir(null)
    }
  }

  const formatarValor = (valor: number) => {
    // Adicionamos verificação para o caso de valor ser undefined ou NaN
    if (valor === undefined || isNaN(valor)) {
      return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const receitas = transacoes.filter((t) => t.tipo === "receita")
  const despesas = transacoes.filter((t) => t.tipo === "despesa")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatarValor(totalReceitas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatarValor(totalDespesas)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatarValor(lucro)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{transacaoParaEditar ? "Editar Transação" : "Nova Transação"}</CardTitle>
            <CardDescription>Registre receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transação</Label>
                <Select value={tipo} onValueChange={(value: "receita" | "despesa") => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  placeholder="Ex: Venda de produtos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data && !isNaN(data.getTime()) 
                        ? format(data, "PPP", { locale: ptBR }) 
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data}
                      onSelect={(date) => date && setData(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                {transacaoParaEditar && (
                  <Button type="button" variant="outline" className="flex-1" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  {transacaoParaEditar ? "Salvar Alterações" : "Adicionar Transação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="mt-4 space-y-4">
              {transacoes.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma transação registrada.</p>
              ) : (
                transacoes.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao} 
                    onEdit={handleEditTransacao} 
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="receitas" className="mt-4 space-y-4">
              {receitas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma receita registrada.</p>
              ) : (
                receitas.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao} 
                    onEdit={handleEditTransacao} 
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="despesas" className="mt-4 space-y-4">
              {despesas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma despesa registrada.</p>
              ) : (
                despesas.map((transacao) => (
                  <TransacaoItem 
                    key={transacao.id} 
                    transacao={transacao} 
                    onDelete={confirmarExclusao} 
                    onEdit={handleEditTransacao} 
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={!!transacaoParaExcluir} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executarExclusao} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface TransacaoItemProps {
  transacao: Transacao
  onDelete: (id: string) => void
  onEdit: (id: string, transacao: Transacao) => void
}

function TransacaoItem({ transacao, onDelete, onEdit }: TransacaoItemProps) {
  const formatarValor = (valor: number) => {
    // Adicionamos verificação para o caso de valor ser undefined ou NaN
    if (valor === undefined || isNaN(valor)) {
      return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const handleEdit = () => {
    onEdit(transacao.id, transacao)
  }

  const formatarData = (dataStr: string) => {
    try {
      const data = new Date(dataStr)
      if (isNaN(data.getTime())) {
        return "Data inválida"
      }
      return format(data, "PPP", { locale: ptBR })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-2 rounded-full ${transacao.tipo === "receita" ? "bg-green-100" : "bg-red-100"}`}>
              {transacao.tipo === "receita" ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
            </div>
            <div>
              <p className="font-medium">{transacao.descricao}</p>
              <p className="text-sm text-muted-foreground">
                {formatarData(transacao.data)}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {transacao.tipo}
                {transacao.categoria && ` • ${transacao.categoria}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className={`font-medium ${transacao.tipo === "receita" ? "text-green-600" : "text-red-600"}`}>
              {transacao.tipo === "receita" ? "+" : "-"}
              {formatarValor(transacao.valor)}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(transacao.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

