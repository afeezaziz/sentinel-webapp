import ReactCompareImage from 'react-compare-image'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ImageSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export default function ImageSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspectRatio = 'video'
}: ImageSliderProps) {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'portrait':
        return 'aspect-[3/4]'
      case 'video':
      default:
        return 'aspect-video'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Verification Imagery</CardTitle>
        <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-slate-300 rounded"></div>
            <span>{beforeLabel}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>{afterLabel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`relative ${getAspectRatioClass()} bg-slate-100`}>
          <ReactCompareImage
            leftImage={beforeSrc}
            rightImage={afterSrc}
            leftImageLabel={beforeLabel}
            rightImageLabel={afterLabel}
            sliderLineColor="#1e293b"
            sliderLineWidth={2}
            handleSize={40}
            skeleton={null}
            sliderPositionPercentage={0.5}
          />
        </div>
        <div className="p-3 bg-slate-50 text-xs text-slate-600 border-t">
          <div className="flex items-center justify-between">
            <span>Drag slider to compare images</span>
            <span className="text-slate-500">High-resolution imagery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}