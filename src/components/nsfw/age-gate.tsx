"use client"

import { OctagonAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { Fragment, type ReactNode, useState } from "react"

interface AgeGateProps {
  children: ReactNode
}

// O aceite mora só no state do componente: sair da rota desmonta, voltar
// pergunta de novo. Nada de localStorage/cookie — não lembrar a escolha é o
// requisito, não um esquecimento.
//
// ponytail: gate de exibição, não de acesso — o payload RSC com as imagens já
// desceu quando o aviso aparece. Barrar de verdade exige mover o fetch para
// depois do aceite (cookie de sessão + branch no server component).
export const AgeGate = ({ children }: AgeGateProps) => {
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  if (accepted) {
    return <Fragment>{children}</Fragment>
  }

  return (
    <div className="flex grow items-center justify-center p-6">
      <div className="flex max-w-[420px] flex-col items-center gap-3.5 rounded-[10px] border border-warn/[0.22] bg-warn/[0.08] px-6 py-7 text-center">
        <OctagonAlert size={28} strokeWidth={1.75} className="text-warn" />
        <h2 className="text-[15px] font-semibold text-ink">Age-restricted section</h2>
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          This section contains content intended for adults. Confirm you are 18 or older to continue.
        </p>
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            className="flex h-10 items-center rounded-lg border border-line bg-raise px-[18px] text-sm text-ink-2"
          >
            Leave
          </button>
          <button
            type="button"
            onClick={() => setAccepted(true)}
            className="flex h-10 items-center rounded-lg bg-accent px-[18px] text-sm font-semibold text-rail"
          >
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  )
}
