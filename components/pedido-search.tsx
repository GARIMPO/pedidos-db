"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PedidoSearchProps {
  onSearch: (status: string) => void
}

export default function PedidoSearch({ onSearch }: PedidoSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onSearch}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="producao">Em Produção</SelectItem>
          <SelectItem value="pronto">Pronto</SelectItem>
          <SelectItem value="enviado">Enviado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 