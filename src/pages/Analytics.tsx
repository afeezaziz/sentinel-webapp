import { useState, useEffect } from 'react'
import { Download, FileText, Plus, Calendar, AlertCircle, Brain, Database, FileEdit, CheckCircle, Loader2, BarChart3, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { toast } from 'sonner'

interface Report {
  id: string
  name: string
  type: 'incident' | 'monthly'
  dateGenerated: string
  status: 'ready' | 'generating'
  alertId?: string
  dateRange?: { start: string; end: string }
}

interface DataSource {
  id: string
  name: string
  type: 'satellite' | 'telemetry' | 'design' | 'inspection' | 'soil' | 'operational'
  available: boolean
  lastUpdated: Date
  description: string
  dataPoints?: number
}

interface AnalysisScope {
  type: 'pipeline' | 'section' | 'facility'
  id: string
  name: string
  description: string
  length?: number
  criticality: 'high' | 'medium' | 'low'
}

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    name: 'DOSH Incident Report - Pipeline Section A-12',
    type: 'incident',
    dateGenerated: '2024-12-10T10:30:00Z',
    status: 'ready',
    alertId: '1'
  },
  {
    id: '2',
    name: 'Monthly Integrity Summary - December 2024',
    type: 'monthly',
    dateGenerated: '2024-12-08T14:20:00Z',
    status: 'ready',
    dateRange: { start: '2024-12-01', end: '2024-12-31' }
  }
]

const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Satellite Telemetry Data',
    type: 'satellite',
    available: true,
    lastUpdated: new Date('2024-12-10'),
    description: 'High-resolution satellite imagery and position data',
    dataPoints: 15600
  },
  {
    id: '2',
    name: 'Design Parameters',
    type: 'design',
    available: true,
    lastUpdated: new Date('2024-11-15'),
    description: 'Pipeline design specifications and material properties',
    dataPoints: 2400
  },
  {
    id: '3',
    name: 'Inspection Reports',
    type: 'inspection',
    available: true,
    lastUpdated: new Date('2024-12-01'),
    description: 'In-line inspection and NDT reports',
    dataPoints: 8900
  },
  {
    id: '4',
    name: 'Soil Survey Data',
    type: 'soil',
    available: true,
    lastUpdated: new Date('2024-10-28'),
    description: 'Geotechnical and corrosion studies',
    dataPoints: 3200
  },
  {
    id: '5',
    name: 'Operational Data',
    type: 'operational',
    available: false,
    lastUpdated: new Date('2024-12-09'),
    description: 'Pressure, flow, and operational parameters',
    dataPoints: 45000
  }
]

const mockScopes: AnalysisScope[] = [
  {
    type: 'pipeline',
    id: 'main-line',
    name: 'Main Transmission Line',
    description: 'Complete pipeline network from terminal to refinery',
    length: 45.8,
    criticality: 'high'
  },
  {
    type: 'section',
    id: 'section-a12',
    name: 'Pipeline Section A-12',
    description: 'Critical section near industrial zone',
    length: 2.4,
    criticality: 'high'
  },
  {
    type: 'facility',
    id: 'kelang-terminal',
    name: 'Klang Terminal',
    description: 'Main oil terminal facility',
    criticality: 'high'
  }
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalysisWizardOpen, setIsAnalysisWizardOpen] = useState(false)

  // Analysis wizard state
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedScope, setSelectedScope] = useState<AnalysisScope | null>(null)
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<string>('')
  const [editableDraft, setEditableDraft] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGenerateAnalysis = async () => {
    if (!selectedScope || selectedDataSources.length === 0) {
      toast.error('Please select scope and at least one data source')
      return
    }

    setIsAnalyzing(true)
    setWizardStep(3)
    setAnalysisProgress(0)

    // Simulate AI analysis process
    const steps = [
      { progress: 20, message: 'Collecting data from selected sources...' },
      { progress: 40, message: 'Analyzing satellite imagery patterns...' },
      { progress: 60, message: 'Processing inspection data...' },
      { progress: 80, message: 'Running RBI algorithms...' },
      { progress: 100, message: 'Generating analysis report...' }
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAnalysisProgress(steps[i].progress)
    }

    // Generate mock analysis result
    const result = `# Risk-Based Inspection Analysis Report

## Executive Summary
**Scope:** ${selectedScope.name}
**Analysis Date:** ${new Date().toLocaleDateString()}

## Risk Assessment Results
**Overall Risk Score:** 7.8/10 (High Risk)

### Key Findings:
1. **Corrosion Risk:** Elevated in sections with high soil moisture content
2. **External Damage:** Medium risk based on satellite monitoring data
3. **Operational Stress:** Within acceptable limits

### Recommendations:
1. Prioritize inspection of Section A-12 within 30 days
2. Implement enhanced cathodic protection monitoring
3. Schedule detailed corrosion assessment in Q1 2025

## RBI Prioritization
| Section | Risk Score | Priority | Next Inspection |
|---------|-------------|----------|-----------------|
| A-12 | 8.5 | Critical | 30 days |
| B-8 | 6.2 | High | 90 days |
| C-3 | 4.1 | Medium | 180 days |

## Data Sources Used
- Satellite Telemetry (${selectedDataSources.includes('1') ? '✓' : '✗'})
- Design Parameters (${selectedDataSources.includes('2') ? '✓' : '✗'})
- Inspection Reports (${selectedDataSources.includes('3') ? '✓' : '✗'})
- Soil Survey Data (${selectedDataSources.includes('4') ? '✓' : '✗'})

This analysis was performed using advanced AI algorithms that correlate multiple data sources to provide a comprehensive risk assessment. The results are based on current data and should be validated by experienced pipeline integrity engineers.`

    setAnalysisResult(result)
    setEditableDraft(result)
    setIsAnalyzing(false)
  }

  const handleGeneratePDF = () => {
    toast.success('Generating official PDF report...')
    // In real implementation, this would call PDF generation API
    setTimeout(() => {
      toast.success('PDF report generated successfully!')
    }, 2000)
  }

  const resetWizard = () => {
    setWizardStep(1)
    setSelectedScope(null)
    setSelectedDataSources([])
    setAnalysisProgress(0)
    setAnalysisResult('')
    setEditableDraft('')
    setIsAnalysisWizardOpen(false)
  }

  const formatDataSourceType = (type: string) => {
    const types: Record<string, string> = {
      satellite: 'Satellite',
      telemetry: 'Telemetry',
      design: 'Design',
      inspection: 'Inspection',
      soil: 'Soil',
      operational: 'Operational'
    }
    return types[type] || type
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-600 mt-2">Generate compliance reports and perform advanced RBI analysis</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            RBI Analysis
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Compliance Reports</h2>
              <p className="text-slate-600 mt-1">Generate and download compliance reports for regulatory requirements</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Previously Generated Reports</CardTitle>
              <CardDescription>
                View and download your compliance reports. Incident reports are generated for individual alerts,
                while monthly summaries cover all activity within a specified date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <FileText className="h-8 w-8" />
                            <p>No reports generated yet</p>
                            <p className="text-sm">Generate your first report to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-slate-900 truncate">{report.name}</p>
                              {report.alertId && (
                                <p className="text-xs text-slate-500">Alert ID: {report.alertId}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.type === 'incident' ? 'destructive' : 'default'}>
                              {report.type === 'incident' ? 'Incident' : 'Monthly'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.dateGenerated).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {report.status === 'generating' ? (
                                <>
                                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                                  <Badge variant="outline">Generating</Badge>
                                </>
                              ) : (
                                <>
                                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                                  <Badge variant="outline">Ready</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={report.status !== 'ready'}
                              className="flex items-center gap-1"
                              onClick={() => toast.success(`Downloading ${report.name}`)}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Risk-Based Inspection Analysis</h2>
              <p className="text-slate-600 mt-1">Perform comprehensive RBI analysis using AI-powered data synthesis</p>
            </div>
            <Button
              onClick={() => setIsAnalysisWizardOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4" />
              Start Analysis
            </Button>
          </div>

          {/* Analysis Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Available Data Sources</p>
                    <p className="text-lg font-semibold text-slate-900">{mockDataSources.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Analysis Templates</p>
                    <p className="text-lg font-semibold text-slate-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Recent Analyses</p>
                    <p className="text-lg font-semibold text-slate-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Analysis Results</CardTitle>
              <CardDescription>View your recent RBI analysis results and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No analyses performed yet</h3>
                <p className="text-sm text-slate-500 mb-4">Start your first RBI analysis to see results here</p>
                <Button
                  onClick={() => setIsAnalysisWizardOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Wizard Modal */}
      {isAnalysisWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={resetWizard} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">RBI Analysis Wizard</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        wizardStep >= step
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step}
                      </div>
                      {step < 4 && (
                        <div className={`w-8 h-1 mx-2 ${
                          wizardStep > step ? 'bg-blue-600' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={resetWizard}>
                  ×
                </Button>
              </div>
              <div className="text-sm text-slate-600">
                {wizardStep === 1 && 'Step 1: Select Analysis Scope'}
                {wizardStep === 2 && 'Step 2: Select Data Sources'}
                {wizardStep === 3 && 'Step 3: AI Synthesis & RBI Calculation'}
                {wizardStep === 4 && 'Step 4: Review & Generate Report'}
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Step 1: Select Scope */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Select Analysis Scope</h3>
                  <p className="text-sm text-slate-600">Choose the pipeline section or facility you want to analyze</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockScopes.map((scope) => (
                      <div
                        key={scope.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedScope?.id === scope.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedScope(scope)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900">{scope.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{scope.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {scope.length && (
                                <span className="text-xs text-slate-500">{scope.length} km</span>
                              )}
                              <Badge variant={
                                scope.criticality === 'high' ? 'destructive' :
                                scope.criticality === 'medium' ? 'default' : 'secondary'
                              }>
                                {scope.criticality} criticality
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Data Sources */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Select Data Sources</h3>
                  <p className="text-sm text-slate-600">Choose the data sources to include in your analysis</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockDataSources.map((source) => (
                      <div
                        key={source.id}
                        className={`p-4 border rounded-lg ${
                          source.available
                            ? selectedDataSources.includes(source.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200'
                            : 'border-slate-200 opacity-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedDataSources.includes(source.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDataSources([...selectedDataSources, source.id])
                              } else {
                                setSelectedDataSources(selectedDataSources.filter(id => id !== source.id))
                              }
                            }}
                            disabled={!source.available}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{source.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{source.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <span>{formatDataSourceType(source.type)}</span>
                              {source.dataPoints && (
                                <span>• {source.dataPoints.toLocaleString()} data points</span>
                              )}
                              <span>• Updated {source.lastUpdated.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: AI Processing */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-slate-900">AI Synthesis & RBI Calculation</h3>
                  <p className="text-sm text-slate-600">Processing your data with advanced AI algorithms</p>

                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                        <p className="text-lg font-medium text-slate-900 mb-2">Analyzing Pipeline Data</p>
                        <p className="text-sm text-slate-600">This may take a few moments...</p>
                      </div>
                      <div className="space-y-2">
                        <Progress value={analysisProgress} className="h-2" />
                        <p className="text-sm text-slate-600 text-center">
                          {analysisProgress < 20 && 'Initializing analysis...'}
                          {analysisProgress >= 20 && analysisProgress < 40 && 'Collecting data from selected sources...'}
                          {analysisProgress >= 40 && analysisProgress < 60 && 'Analyzing satellite imagery patterns...'}
                          {analysisProgress >= 60 && analysisProgress < 80 && 'Processing inspection data...'}
                          {analysisProgress >= 80 && analysisProgress < 100 && 'Running RBI algorithms...'}
                          {analysisProgress >= 100 && 'Generating analysis report...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-slate-900 mb-2">Analysis Complete!</p>
                      <p className="text-sm text-slate-600">Your RBI analysis has been successfully generated</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Edit */}
              {wizardStep === 4 && analysisResult && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Review & Generate Report</h3>
                  <p className="text-sm text-slate-600">Review the generated analysis and make any necessary edits before finalizing</p>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Analysis Report Preview</h4>
                    <Textarea
                      value={editableDraft}
                      onChange={(e) => setEditableDraft(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                  disabled={wizardStep === 1 || isAnalyzing}
                >
                  Previous
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetWizard}
                  disabled={isAnalyzing}
                >
                  Cancel
                </Button>
                {wizardStep < 2 && (
                  <Button
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={!selectedScope}
                  >
                    Next
                  </Button>
                )}
                {wizardStep === 2 && (
                  <Button
                    onClick={handleGenerateAnalysis}
                    disabled={!selectedScope || selectedDataSources.length === 0}
                  >
                    Start Analysis
                  </Button>
                )}
                {wizardStep === 3 && !isAnalyzing && (
                  <Button
                    onClick={() => setWizardStep(4)}
                  >
                    Review Report
                  </Button>
                )}
                {wizardStep === 4 && (
                  <Button
                    onClick={handleGeneratePDF}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Generate Official PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}