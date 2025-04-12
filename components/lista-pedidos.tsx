"use client"

import { useState } from "react"
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
import PedidoCard from "./pedido-card"
import type { Pedido } from "@/types/pedido"

interface ListaPedidosProps {
  pedidos: Pedido[]
  onEdit: (pedido: Pedido) => void
  onDelete: (id: string) => void
}

export default function ListaPedidos({ pedidos, onEdit, onDelete }: ListaPedidosProps) {
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<string | null>(null)

  const confirmarExclusao = (id: string) => {
    setPedidoParaExcluir(id)
  }

  const cancelarExclusao = () => {
    setPedidoParaExcluir(null)
  }

  const executarExclusao = () => {
    if (pedidoParaExcluir) {
      const pedidoAExcluir = pedidos.find(p => p.id === pedidoParaExcluir);
      console.log(`Confirmando exclusão do pedido ID: ${pedidoParaExcluir}`, 
                   pedidoAExcluir ? `Nome: ${pedidoAExcluir.nome}` : 'Pedido não encontrado');
      
      try {
        onDelete(pedidoParaExcluir);
      } catch (error) {
        console.error('Erro ao excluir pedido:', error);
      }
      
      setPedidoParaExcluir(null);
    }
  }

  return (
    <div className="space-y-4">
      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} onEdit={onEdit} onDelete={confirmarExclusao} />
        ))
      )}

      <AlertDialog open={!!pedidoParaExcluir} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const pedidoAExcluir = pedidos.find(p => p.id === pedidoParaExcluir);
                if (pedidoAExcluir) {
                  return (
                    <>
                      Tem certeza que deseja excluir o pedido de <strong>{pedidoAExcluir.nome}</strong>?
                    </>
                  )
                }
                return "Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.";
              })()}
            </AlertDialogDescription>
            
            {pedidoParaExcluir && (() => {
              const pedidoAExcluir = pedidos.find(p => p.id === pedidoParaExcluir);
              if (pedidoAExcluir) {
                return (
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-col gap-2 bg-muted p-3 rounded">
                      <div><strong>Cliente:</strong> {pedidoAExcluir.nome}</div>
                      <div><strong>Email:</strong> {pedidoAExcluir.email}</div>
                      <div><strong>Telefone:</strong> {pedidoAExcluir.telefone}</div>
                      <div><strong>Valor:</strong> R$ {pedidoAExcluir.total.toFixed(2)}</div>
                    </div>
                    <p className="text-destructive font-semibold">
                      Esta ação não pode ser desfeita e todos os dados do pedido serão permanentemente removidos.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executarExclusao} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

