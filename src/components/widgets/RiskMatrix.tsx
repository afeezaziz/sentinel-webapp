interface RiskMatrixProps {
  pof: number // Probability of Failure (1-5)
  cof: number // Consequence of Failure (1-5)
}

export default function RiskMatrix({ pof, cof }: RiskMatrixProps) {
  // Define risk levels for each cell
  const getRiskLevel = (row: number, col: number): 'low' | 'medium' | 'high' | 'critical' => {
    const riskScore = row + col
    if (riskScore <= 4) return 'low'
    if (riskScore <= 6) return 'medium'
    if (riskScore <= 8) return 'high'
    return 'critical'
  }

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-slate-100 border-slate-300 text-slate-800'
    }
  }

  const getRiskColorHover = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low':
        return 'hover:bg-green-200'
      case 'medium':
        return 'hover:bg-yellow-200'
      case 'high':
        return 'hover:bg-orange-200'
      case 'critical':
        return 'hover:bg-red-200'
      default:
        return 'hover:bg-slate-200'
    }
  }

  const probabilityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  const consequenceLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="space-y-3">
        {/* Grid */}
        <div className="relative">
          {/* Y-axis labels (Probability) */}
          <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-slate-600 font-medium -mt-8">
            {probabilityLabels.map((label, index) => (
              <div key={label} className="h-full flex items-center justify-end pr-2">
                <span className="transform -rotate-90 text-xs w-16 text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix Grid */}
          <div className="ml-24 grid grid-cols-5 gap-1 border-2 border-slate-300 p-2 bg-slate-50">
            {Array.from({ length: 5 }, (_, row) => (
              Array.from({ length: 5 }, (_, col) => {
                const riskLevel = getRiskLevel(5 - row, col + 1) // Invert row for proper orientation
                const isHighlighted = (5 - row) === pof && (col + 1) === cof

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`
                      aspect-square flex items-center justify-center text-xs font-medium
                      border transition-all duration-200 relative
                      ${getRiskColor(riskLevel)}
                      ${getRiskColorHover(riskLevel)}
                      ${isHighlighted ? 'ring-2 ring-slate-900 ring-offset-1 z-10' : 'border-slate-300'}
                    `}
                  >
                    {isHighlighted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    {!isHighlighted && (
                      <span className="opacity-60">
                        {(5 - row) + (col + 1)}
                      </span>
                    )}
                  </div>
                )
              })
            )).flat()}
          </div>

          {/* X-axis labels (Consequence) */}
          <div className="ml-24 grid grid-cols-5 gap-1 mt-2 text-xs text-slate-600 font-medium">
            {consequenceLabels.map((label) => (
              <div key={label} className="text-center">
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-600">Legend:</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
              <span className="text-slate-600">Low</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
              <span className="text-slate-600">Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300"></div>
              <span className="text-slate-600">High</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-100 border border-red-300"></div>
              <span className="text-slate-600">Critical</span>
            </div>
          </div>

          {/* Current Position */}
          <div className="flex items-center space-x-2 text-slate-600">
            <span>Current:</span>
            <span className="font-medium">
              P{pof} × C{cof} = Risk {pof * cof}
            </span>
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Probability of Failure (P):</span>
              <span className="font-medium">{pof}/5 ({probabilityLabels[pof - 1]})</span>
            </div>
            <div className="flex justify-between">
              <span>Consequence of Failure (C):</span>
              <span className="font-medium">{cof}/5 ({consequenceLabels[cof - 1]})</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Overall Risk Score:</span>
              <span className={`
                ${pof * cof <= 4 ? 'text-green-600' :
                  pof * cof <= 6 ? 'text-yellow-600' :
                  pof * cof <= 8 ? 'text-orange-600' : 'text-red-600'}
              `}>
                {pof * cof}/25 - {
                  pof * cof <= 4 ? 'Low' :
                  pof * cof <= 6 ? 'Medium' :
                  pof * cof <= 8 ? 'High' : 'Critical'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}