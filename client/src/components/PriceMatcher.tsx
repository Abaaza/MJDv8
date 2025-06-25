                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select matching method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Matching Methods</SelectLabel>
                    <SelectItem value="cohere">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span>AI Matching (Cohere)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hybrid">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-500" />
                        <span>Hybrid AI (Cohere + OpenAI)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="local">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Local Matching (Faster)</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent> 