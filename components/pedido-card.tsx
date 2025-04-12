"use client"

import { useState } from "react"
import { Edit, Trash2, ChevronDown, ChevronUp, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/types/pedido"

interface PedidoCardProps {
  pedido: Pedido
  onEdit: (pedido: Pedido) => void
  onDelete: (id: string) => void
}

export default function PedidoCard({ pedido, onEdit, onDelete }: PedidoCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "producao":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Em Produção
          </Badge>
        )
      case "pronto":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Pronto
          </Badge>
        )
      case "enviado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Enviado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const abrirWhatsApp = () => {
    if (pedido.telefone) {
      const numeroLimpo = pedido.telefone.replace(/\D/g, "")
      const mensagem = encodeURIComponent(`Olá ${pedido.nome}! Aqui é do sistema de pedidos.`)
      window.open(`https://wa.me/${numeroLimpo}?text=${mensagem}`, "_blank")
    }
  }

  const abrirEmail = () => {
    if (pedido.email) {
      const assunto = encodeURIComponent(`Atualização do seu pedido - ${pedido.nome}`)
      const mensagem = encodeURIComponent(`Olá ${pedido.nome},\n\nAqui é do sistema de pedidos.`)
      window.open(`mailto:${pedido.email}?subject=${assunto}&body=${mensagem}`, "_blank")
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{pedido.nome}</h3>
            <div className="flex items-center gap-2">
              {pedido.telefone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-primary"
                  onClick={abrirWhatsApp}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {pedido.telefone}
                </Button>
              )}
              {pedido.email && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${pedido.email}?subject=${encodeURIComponent(`Atualização do seu pedido - ${pedido.nome}`)}&body=${encodeURIComponent(`Olá ${pedido.nome},\n\nAqui é do sistema de pedidos.`)}`}
                    className="hover:text-primary cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      abrirEmail()
                    }}
                  >
                    {pedido.email}
                  </a>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Pedido de {format(new Date(pedido.created_at), "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(pedido.status)}
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log("Clicado para editar pedido:", pedido);
                  onEdit(pedido);
                }} 
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log(`Solicitando confirmação para excluir pedido: ${pedido.id} - ${pedido.nome}`);
                  onDelete(pedido.id);
                }}
                className="flex items-center gap-1 text-destructive hover:text-white hover:bg-destructive border-destructive/30"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-between py-2 px-0 hover:bg-transparent"
          onClick={toggleExpanded}
        >
          <span className="font-medium">Ver detalhes completos</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Data do Pedido</h4>
                <p className="text-sm">{format(new Date(pedido.created_at), "PPP", { locale: ptBR })}</p>
              </div>

              {pedido.codigo_rastreamento && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Código de Rastreamento</h4>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                    {pedido.codigo_rastreamento}
                  </p>
                </div>
              )}

              {pedido.endereco && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-1">Endereço</h4>
                  <p className="text-sm">{pedido.endereco}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium mb-1">Contato</h4>
                <div className="flex flex-wrap gap-2">
                  {pedido.telefone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={abrirWhatsApp}
                    >
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  {pedido.email && (
                    <a
                      href={`mailto:${pedido.email}?subject=${encodeURIComponent(`Atualização do seu pedido - ${pedido.nome}`)}&body=${encodeURIComponent(`Olá ${pedido.nome},\n\nAqui é do sistema de pedidos.`)}`}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault()
                        abrirEmail()
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      {pedido.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {pedido.observacao && (
              <div>
                <h4 className="text-sm font-medium mb-2">Observações</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{pedido.observacao}</p>
                </div>
              </div>
            )}

            {pedido.descricoes && pedido.descricoes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição do Pedido</h4>
                <div className="space-y-3">
                  {pedido.descricoes.map((descricao, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

