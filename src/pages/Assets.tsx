import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Activity, ArrowRight } from 'lucide-react'

interface Asset {
  id: string
  name: string
  length: number
  maop: number
  diameter: string
  materialGrade: string
  installYear: number
  riskScore: number
  lastInspection: Date
  status: 'active' | 'maintenance' | 'inactive'
}

// Dummy data for development
const dummyAssets: Asset[] = [
  {
    id: '1',
    name: 'Pipeline Section A-1',
    length: 45.8,
    maop: 1440,
    diameter: '24"',
    materialGrade: 'X70',
    installYear: 2015,
    riskScore: 3.2,
    lastInspection: new Date('2024-11-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Pipeline Section B-2',
    length: 67.3,
    maop: 1200,
    diameter: '36"',
    materialGrade: 'X65',
    installYear: 2012,
    riskScore: 6.8,
    lastInspection: new Date('2024-10-22'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Pipeline Section C-3',
    length: 23.4,
    maop: 1500,
    diameter: '30"',
    materialGrade: 'X80',
    installYear: 2018,
    riskScore: 2.1,
    lastInspection: new Date('2024-12-01'),
    status: 'active'
  },
  {
    id: '4',
    name: 'Pipeline Section D-4',
    length: 89.6,
    maop: 1000,
    diameter: '48"',
    materialGrade: 'X60',
    installYear: 2008,
    riskScore: 8.5,
    lastInspection: new Date('2024-09-10'),
    status: 'maintenance'
  },
  {
    id: '5',
    name: 'Pipeline Section E-5',
    length: 34.2,
    maop: 1380,
    diameter: '20"',
    materialGrade: 'X70',
    installYear: 2016,
    riskScore: 4.7,
    lastInspection: new Date('2024-11-28'),
    status: 'active'
  }
]

export default function Assets() {
  const navigate = useNavigate()
  const [assets] = useState<Asset[]>(dummyAssets)

  const getRiskScoreVariant = (score: number): 'destructive' | 'default' | 'secondary' => {
    if (score >= 7) return 'destructive'
    if (score >= 4) return 'default'
    return 'secondary'
  }

  const getRiskScoreColor = (score: number): string => {
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-amber-600'
    return 'text-green-600'
  }

  const getStatusVariant = (status: string): 'destructive' | 'default' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'maintenance':
        return 'secondary'
      case 'inactive':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'maintenance':
        return 'text-amber-600'
      case 'inactive':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  const handleAssetClick = (asset: Asset) => {
    navigate(`/asset/${asset.id}`)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline Assets</h1>
          <p className="text-slate-600 mt-2">View detailed information about pipeline infrastructure assets</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Assets</p>
              <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
            </div>
            <Activity className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {assets.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Maintenance</p>
              <p className="text-2xl font-bold text-amber-600">
                {assets.filter(a => a.status === 'maintenance').length}
              </p>
            </div>
            <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {(assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length).toFixed(1)}
              </p>
            </div>
            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Length (KM)</TableHead>
              <TableHead>MAOP (PSI)</TableHead>
              <TableHead>Diameter</TableHead>
              <TableHead>Material Grade</TableHead>
              <TableHead>Install Year</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Inspection</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow
                key={asset.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => handleAssetClick(asset)}
              >
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.length}</TableCell>
                <TableCell>{asset.maop.toLocaleString()}</TableCell>
                <TableCell>{asset.diameter}</TableCell>
                <TableCell>{asset.materialGrade}</TableCell>
                <TableCell>{asset.installYear}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRiskScoreVariant(asset.riskScore)}>
                      {asset.riskScore.toFixed(1)}
                    </Badge>
                    <span className={`text-sm font-medium ${getRiskScoreColor(asset.riskScore)}`}>
                      {asset.riskScore >= 7 ? 'High' : asset.riskScore >= 4 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(asset.status)}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {asset.lastInspection.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}