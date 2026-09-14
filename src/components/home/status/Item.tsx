"use client"
import type { ReactNode } from "react"
import CountUp from "react-countup"

interface ItemProps {
  title: string
  value: number
  children: ReactNode
}

export function Item({ title, value, children }: ItemProps) {
  return (
    <div className="m-2 rounded-md bg-transparent">
      <div className="flex">
        <div className="m-4 max-w-[110px] cursor-pointer rounded-md bg-lucide-600 p-4 text-violet-300 transition-all duration-200 ease-in hover:scale-110">
          {children}
        </div>

        <div className="mx-3 my-8 flex w-full items-center justify-center rounded-2xl bg-lucide-600">
          <div className="flex flex-col items-center justify-center">
            <h3 className="mt-2 px-2 text-2xl">
              <CountUp end={value} delay={0.75} duration={3} separator="" />
            </h3>
            <h4 className="text-xl text-zinc-500">{title}</h4>
          </div>
        </div>
      </div>
    </div>
  )
}
