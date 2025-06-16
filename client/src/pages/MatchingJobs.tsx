
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { PriceMatching } from "@/components/PriceMatching"

export default function MatchingJobs() {
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Price Matcher</h1>
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
