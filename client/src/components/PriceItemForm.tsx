import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface PriceItem {
  id?: string
  code?: string
  ref?: string
  description: string
  category?: string
  subcategory?: string
  unit?: string
  rate?: number
  keyword_0?: string
  keyword_1?: string
  keyword_2?: string
  keyword_3?: string
  keyword_4?: string
  keyword_5?: string
  keyword_6?: string
  keyword_7?: string
  keyword_8?: string
  keyword_9?: string
  keyword_10?: string
  keyword_11?: string
  keyword_12?: string
  keyword_13?: string
  keyword_14?: string
  keyword_15?: string
  keyword_16?: string
  keyword_17?: string
  keyword_18?: string
  keyword_19?: string
  keyword_20?: string
  keyword_21?: string
  keyword_22?: string
  phrase_0?: string
  phrase_1?: string
  phrase_2?: string
  phrase_3?: string
  phrase_4?: string
  phrase_5?: string
  phrase_6?: string
  phrase_7?: string
  phrase_8?: string
  phrase_9?: string
  phrase_10?: string
}

interface PriceItemFormProps {
  initialData?: PriceItem
  onSuccess: () => void
  onCancel: () => void
}

export function PriceItemForm({ initialData, onSuccess, onCancel }: PriceItemFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  // Debug log to see what we're getting from the database
  console.log('Initial data rate:', initialData?.rate, 'Type:', typeof initialData?.rate)
  
  const [formData, setFormData] = useState<PriceItem>({
    code: initialData?.code || '',
    ref: initialData?.ref || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    unit: initialData?.unit || '',
    rate: initialData?.rate || undefined,
    keyword_0: initialData?.keyword_0 || '',
    keyword_1: initialData?.keyword_1 || '',
    keyword_2: initialData?.keyword_2 || '',
    keyword_3: initialData?.keyword_3 || '',
    keyword_4: initialData?.keyword_4 || '',
    keyword_5: initialData?.keyword_5 || '',
    keyword_6: initialData?.keyword_6 || '',
    keyword_7: initialData?.keyword_7 || '',
    keyword_8: initialData?.keyword_8 || '',
    keyword_9: initialData?.keyword_9 || '',
    phrase_0: initialData?.phrase_0 || '',
    phrase_1: initialData?.phrase_1 || '',
    phrase_2: initialData?.phrase_2 || '',
    phrase_3: initialData?.phrase_3 || '',
    phrase_4: initialData?.phrase_4 || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    setLoading(true)
    try {
      const itemData = {
        ...formData,
        user_id: user.id,
        rate: formData.rate && formData.rate !== 0 ? Number(formData.rate) : null,
      }

      console.log('Submitting with user_id:', user.id)
      console.log('Auth user:', user)
      console.log('Submitting rate:', itemData.rate, 'Original formData rate:', formData.rate)

      let error
      if (initialData?.id) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('price_items')
          .update(itemData)
          .eq('id', initialData.id)
        error = updateError
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from('price_items')
          .insert(itemData)
        error = insertError
      }

      if (error) {
        console.error('Error saving price item:', error)
        toast.error('Failed to save price item')
        return
      }

      toast.success(initialData?.id ? 'Price item updated successfully' : 'Price item added successfully')
      onSuccess()
    } catch (error) {
      console.error('Error saving price item:', error)
      toast.error('Failed to save price item')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PriceItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRateChange = (value: string) => {
    console.log('Rate change input:', value)
    if (value === '' || value === null || value === undefined) {
      setFormData(prev => ({ ...prev, rate: undefined }))
    } else {
      const numValue = parseFloat(value)
      setFormData(prev => ({ ...prev, rate: isNaN(numValue) ? undefined : numValue }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="Enter item code"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ref">Reference</Label>
          <Input
            id="ref"
            value={formData.ref}
            onChange={(e) => handleInputChange('ref', e.target.value)}
            placeholder="Enter reference"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter item description"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="e.g., Materials, Labor, Equipment"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            value={formData.subcategory}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            placeholder="Enter subcategory"
          />
        </div>
      </div>

      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            placeholder="e.g., m³, kg, hour, nr"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rate">Rate</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={formData.rate !== undefined && formData.rate !== null ? formData.rate.toString() : ''}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Keywords (first 10)</Label>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <Input
              key={i}
              value={formData[`keyword_${i}` as keyof PriceItem] as string || ''}
              onChange={(e) => handleInputChange(`keyword_${i}` as keyof PriceItem, e.target.value)}
              placeholder={`Keyword ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Phrases (first 5)</Label>
        <div className="grid gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Input
              key={i}
              value={formData[`phrase_${i}` as keyof PriceItem] as string || ''}
              onChange={(e) => handleInputChange(`phrase_${i}` as keyof PriceItem, e.target.value)}
              placeholder={`Phrase ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData?.id ? 'Update Item' : 'Add Item')}
        </Button>
      </div>
    </form>
  )
}
