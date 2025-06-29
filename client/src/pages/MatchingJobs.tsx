import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { PriceMatching } from "@/components/PriceMatching"

export default function MatchingJobs() {
  return (
    <div className="pt-[10px] px-3 sm:px-4 md:px-6 pb-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0">Price Matcher</h1>
          <p className="text-sm sm:text-base text-muted-foreground">AI-powered BOQ price matching and analysis using Cohere embeddings</p>
        </div>
      </div>

      <PriceMatching />
    </div>
  )
}
