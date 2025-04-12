"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        Feito por{" "}
        <Link 
          href="https://www.instagram.com/garimpodeofertas_top/" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Garimpo de Ofertas
        </Link>
      </div>
    </footer>
  )
} 