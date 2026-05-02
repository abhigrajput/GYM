import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva("text-[#F1F5F9]", {
  variants: {
    variant: {
      default: "rounded-2xl border border-[#1A2332] bg-[#0F1520] p-6",
      accent: "rounded-2xl border border-[#0ECFB0] bg-[#0F1520] p-6",
      ghost: "rounded-2xl bg-transparent p-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  variant,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}
