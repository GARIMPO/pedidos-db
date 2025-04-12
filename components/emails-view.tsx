"use client"

import { useState } from "react"
import { Mail, Trash2, Send, Search, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Contato } from "@/types/contato"

interface EmailsViewProps {
  contatos: Contato[]
  onDelete: (id: string) => void
}

export default function EmailsView({ contatos, onDelete }: EmailsViewProps) {
  const [contatoParaExcluir, setContatoParaExcluir] = useState<string | null>(null)
  const [contatoParaEmail, setContatoParaEmail] = useState<Contato | null>(null)
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [filtro, setFiltro] = useState("")

  const confirmarExclusao = (id: string) => {
    setContatoParaExcluir(id)
  }

  const cancelarExclusao = () => {
    setContatoParaExcluir(null)
  }

  const executarExclusao = () => {
    if (contatoParaExcluir) {
      onDelete(contatoParaExcluir)
      setContatoParaExcluir(null)
    }
  }

  const abrirDialogEmail = (contato: Contato) => {
    setContatoParaEmail(contato)
    setAssunto("")
    setMensagem("")
  }

  const fecharDialogEmail = () => {
    setContatoParaEmail(null)
  }

  const enviarEmail = () => {
    if (!contatoParaEmail || !assunto || !mensagem) return

    // Aqui você pode integrar com um serviço de e-mail real
    // Por enquanto, vamos apenas simular o envio abrindo o cliente de e-mail padrão
    const mailtoLink = `mailto:${contatoParaEmail.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`
    window.open(mailtoLink, "_blank")

    fecharDialogEmail()
  }

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numeroLimpo = telefone.replace(/\D/g, "")
    const mensagem = encodeURIComponent(`Olá ${nome}! Aqui é do sistema de pedidos.`)
    window.open(`https://wa.me/${numeroLimpo}?text=${mensagem}`, "_blank")
  }

  const abrirEmail = (email: string, nome: string) => {
    const assunto = encodeURIComponent(`Atualização do seu pedido - ${nome}`)
    const mensagem = encodeURIComponent(`Olá ${nome},\n\nAqui é do sistema de pedidos.`)
    window.open(`mailto:${email}?subject=${assunto}&body=${mensagem}`, "_blank")
  }

  const contatosFiltrados = contatos.filter(
    (contato) =>
      contato.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      contato.email.toLowerCase().includes(filtro.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-mails Salvos
            </span>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos..."
                className="pl-8"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </CardTitle>
          <CardDescription>Lista de todos os e-mails de clientes salvos no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {contatosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filtro ? "Nenhum contato encontrado para esta busca." : "Nenhum contato salvo ainda."}
            </div>
          ) : (
            <div className="space-y-4">
              {contatosFiltrados.map((contato) => (
                <Card key={contato.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{contato.nome}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${contato.email}?subject=${encodeURIComponent(`Atualização do seu pedido - ${contato.nome}`)}&body=${encodeURIComponent(`Olá ${contato.nome},\n\nAqui é do sistema de pedidos.`)}`}
                              className="hover:text-primary cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                abrirEmail(contato.email, contato.nome)
                              }}
                            >
                              {contato.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`https://wa.me/${contato.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${contato.nome}! Aqui é do sistema de pedidos.`)}`}
                              className="hover:text-primary cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                abrirWhatsApp(contato.telefone, contato.nome)
                              }}
                            >
                              {contato.telefone}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmarExclusao(contato.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!contatoParaExcluir} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
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

      <Dialog open={!!contatoParaEmail} onOpenChange={(open) => !open && fecharDialogEmail()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar E-mail</DialogTitle>
            <DialogDescription>
              Envie um e-mail para {contatoParaEmail?.nome} ({contatoParaEmail?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Assunto do e-mail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={enviarEmail} disabled={!assunto || !mensagem}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

