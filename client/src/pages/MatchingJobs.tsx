import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { PriceMatching } from "@/components/PriceMatching"

export default function MatchingJobs() {
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="pt-[10px] px-6 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 text-left">
            <h1 className="text-3xl font-bold page-title">Price Matcher</h1>
            <p className="text-muted-foreground">AI-powered BOQ price matching and analysis using Cohere embeddings</p>
          </div>
        </div>
      </div>

      {/* Price Matching Component */}
      <div className="px-6 pb-6">
        <PriceMatching />
      </div>
    </div>
  )
}
