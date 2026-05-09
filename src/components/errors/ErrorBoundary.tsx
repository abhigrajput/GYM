"use client"

import React from "react"

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  errorText: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorText: "" }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error.message || "Unknown error" }
  }

  componentDidCatch(error: Error) {
    this.setState({ errorText: error.stack || error.message || "Unknown error" })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#07090F] p-4 text-[#F1F5F9]">
        <div className="w-full max-w-md rounded-2xl border border-[#1A2332] bg-[#0F1520] p-6 text-center">
          <p className="mb-1 text-xl font-bold text-[#0ECFB0]">IronIQ</p>
          <h2 className="text-lg font-semibold">Something went wrong. Reload and try again.</h2>
          <div className="mt-4 flex justify-center gap-2">
            <button
              className="rounded-xl bg-[#0ECFB0] px-4 py-2 text-black"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              className="rounded-xl border border-[#1A2332] px-4 py-2"
              onClick={async () => navigator.clipboard.writeText(this.state.errorText)}
            >
              Report error
            </button>
          </div>
        </div>
      </div>
    )
  }
}
