"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PedidoForm from "@/components/pedido-form"
import { Badge } from "@/components/ui/badge"
import type { Pedido } from "@/types/pedido"

interface PedidoDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  pedido: Pedido | null
  onSubmit: (pedido: Pedido) => void
}

export default function PedidoDialog({ isOpen, onOpenChange, pedido, onSubmit }: PedidoDialogProps) {
  useEffect(() => {
    if (isOpen && pedido) {
      console.log("PedidoDialog aberto com pedido:", pedido)
    }
  }, [isOpen, pedido])

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

  const handleSubmit = (pedidoAtualizado: Pedido) => {
    console.log("Pedido enviado do dialog:", pedidoAtualizado)
    onSubmit(pedidoAtualizado)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{pedido ? `Editar Pedido de ${pedido.nome}` : "Novo Pedido"}</DialogTitle>
            {pedido && getStatusBadge(pedido.status)}
          </div>
        </DialogHeader>
        <PedidoForm 
          pedidoInicial={pedido || undefined} 
          onSubmit={handleSubmit} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}

