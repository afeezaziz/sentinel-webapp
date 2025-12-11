import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Camera,
  MapPin,
  Calendar,
  Clock,
  Download,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  List
} from 'lucide-react'

interface ImageItem {
  id: string
  url: string
  title: string
  description?: string
  timestamp: Date
  type: 'satellite' | 'aerial' | 'ground' | 'thermal' | 'street'
  location?: string
  coordinates?: { lat: number; lng: number }
  source?: string
  tags?: string[]
}

interface ImageGalleryProps {
  images: ImageItem[]
  title?: string
  className?: string
}

export default function ImageGallery({
  images,
  title = "Location Imagery",
  className = ""
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const openImageModal = (image: ImageItem, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'satellite':
        return 'bg-blue-100 text-blue-800'
      case 'aerial':
        return 'bg-green-100 text-green-800'
      case 'ground':
        return 'bg-amber-100 text-amber-800'
      case 'thermal':
        return 'bg-red-100 text-red-800'
      case 'street':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const sortedImages = [...images].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900 mb-1">No imagery available</h3>
            <p className="text-sm text-slate-500">No images have been captured for this location yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {title}
              <Badge variant="secondary" className="ml-2">
                {images.length} images
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-200"
                  onClick={() => openImageModal(image, index)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-white text-sm font-medium line-clamp-1">{image.title}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className={`text-xs ${getImageTypeColor(image.type)}`}>
                          {image.type}
                        </Badge>
                        <span className="text-white text-xs">
                          {image.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200"
                  onClick={() => openImageModal(image, index)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">{image.title}</h4>
                    {image.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{image.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getImageTypeColor(image.type)}`}>
                        {image.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {image.timestamp.toLocaleDateString()} {image.timestamp.toLocaleTimeString()}
                      </span>
                      {image.source && (
                        <span className="text-xs text-slate-500">• {image.source}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image Container */}
            <div className="flex flex-col items-center justify-center max-w-7xl mx-auto">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />

              {/* Image Information */}
              <Card className="mt-4 w-full max-w-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedImage.title}</h3>
                      {selectedImage.description && (
                        <p className="text-sm text-slate-600 mt-1">{selectedImage.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <Badge className={getImageTypeColor(selectedImage.type)}>
                      {selectedImage.type}
                    </Badge>
                    {selectedImage.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{selectedImage.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedImage.timestamp.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{selectedImage.timestamp.toLocaleTimeString()}</span>
                    </div>
                    {selectedImage.source && (
                      <span>Source: {selectedImage.source}</span>
                    )}
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-slate-500">Tags:</span>
                      {selectedImage.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="mt-2 text-center text-sm text-white/80">
                  {currentIndex + 1} of {images.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}