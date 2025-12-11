import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

// Zod schema for form validation
const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(100, 'Asset name must be less than 100 characters'),
  length: z.number().min(0.1, 'Length must be greater than 0').max(1000, 'Length must be less than 1000 km'),
  maop: z.number().min(100, 'MAOP must be at least 100 PSI').max(5000, 'MAOP must be less than 5000 PSI'),
  diameter: z.string().min(1, 'Diameter is required'),
  materialGrade: z.string().min(1, 'Material grade is required').max(20, 'Material grade must be less than 20 characters'),
  installYear: z.number().min(1950, 'Install year must be after 1950').max(new Date().getFullYear(), 'Install year cannot be in the future'),
  status: z.enum(['active', 'maintenance', 'inactive']),
})

type AssetFormData = z.infer<typeof assetSchema>

interface Asset {
  id: string
  name: string
  length: number
  maop: number
  diameter: string
  materialGrade: string
  installYear: number
  status: 'active' | 'maintenance' | 'inactive'
}

interface AssetFormDialogProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
  onSave: (assetData: Omit<Asset, 'id'>) => void
}

const diameterOptions = [
  { value: '16"', label: '16 inches' },
  { value: '20"', label: '20 inches' },
  { value: '24"', label: '24 inches' },
  { value: '30"', label: '30 inches' },
  { value: '36"', label: '36 inches' },
  { value: '42"', label: '42 inches' },
  { value: '48"', label: '48 inches' },
]

const materialGradeOptions = [
  { value: 'X42', label: 'X42' },
  { value: 'X46', label: 'X46' },
  { value: 'X52', label: 'X52' },
  { value: 'X56', label: 'X56' },
  { value: 'X60', label: 'X60' },
  { value: 'X65', label: 'X65' },
  { value: 'X70', label: 'X70' },
  { value: 'X80', label: 'X80' },
]

export default function AssetFormDialog({
  isOpen,
  onClose,
  asset,
  onSave
}: AssetFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    mode: 'onChange',
  })

  // Reset form when asset changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (asset) {
        reset({
          name: asset.name,
          length: asset.length,
          maop: asset.maop,
          diameter: asset.diameter,
          materialGrade: asset.materialGrade,
          installYear: asset.installYear,
          status: asset.status,
        })
      } else {
        reset({
          name: '',
          length: 0,
          maop: 0,
          diameter: '',
          materialGrade: '',
          installYear: new Date().getFullYear(),
          status: 'active',
        })
      }
    }
  }, [asset, isOpen, reset])

  const onSubmit = (data: AssetFormData) => {
    onSave(data)
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {asset ? 'Edit Asset' : 'Create New Asset'}
          </DialogTitle>
          <DialogDescription>
            {asset
              ? 'Update the pipeline asset information below.'
              : 'Enter the details for the new pipeline asset.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Pipeline Section A-1"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Length */}
            <div className="space-y-2">
              <Label htmlFor="length">Length (KM) *</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register('length', { valueAsNumber: true })}
                className={errors.length ? 'border-red-500' : ''}
              />
              {errors.length && (
                <p className="text-sm text-red-600">{errors.length.message}</p>
              )}
            </div>

            {/* MAOP */}
            <div className="space-y-2">
              <Label htmlFor="maop">MAOP (PSI) *</Label>
              <Input
                id="maop"
                type="number"
                placeholder="0"
                {...register('maop', { valueAsNumber: true })}
                className={errors.maop ? 'border-red-500' : ''}
              />
              {errors.maop && (
                <p className="text-sm text-red-600">{errors.maop.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Diameter */}
            <div className="space-y-2">
              <Label>Diameter *</Label>
              <Controller
                name="diameter"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={errors.diameter ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select diameter" />
                    </SelectTrigger>
                    <SelectContent>
                      {diameterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.diameter && (
                <p className="text-sm text-red-600">{errors.diameter.message}</p>
              )}
            </div>

            {/* Material Grade */}
            <div className="space-y-2">
              <Label>Material Grade *</Label>
              <Controller
                name="materialGrade"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={errors.materialGrade ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select material grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialGradeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.materialGrade && (
                <p className="text-sm text-red-600">{errors.materialGrade.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Install Year */}
            <div className="space-y-2">
              <Label htmlFor="installYear">Install Year *</Label>
              <Input
                id="installYear"
                type="number"
                placeholder="2023"
                {...register('installYear', { valueAsNumber: true })}
                className={errors.installYear ? 'border-red-500' : ''}
              />
              {errors.installYear && (
                <p className="text-sm text-red-600">{errors.installYear.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || !isValid}
            >
              {asset ? 'Update Asset' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}