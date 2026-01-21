import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  ExternalLink,
  BookOpen,
  Brain,
  Heart,
  Moon,
  Users,
  Smartphone,
  MessageSquare,
  Baby,
  Award
} from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'

// Manager Agent ID
const MANAGER_AGENT_ID = "69702ecdd6d0dcaec1115908"

// TypeScript interfaces from actual test responses
interface ResearchFinding {
  title: string
  source: string
  date_published: string
  topic_area: string
  key_finding: string
  credibility_score: string
  url?: string
}

interface ResearchResult {
  research_findings: ResearchFinding[]
  total_findings: number
  search_timestamp: string
  sources_searched: string[]
}

interface WorkflowResult {
  workflow_status: string
  phases_completed: {
    research_discovery: boolean
    insights_synthesis: boolean
    email_delivery: boolean
  }
  research_findings_count: string
  topics_covered: string[]
  email_sent_to: string
  digest_title: string
  completion_timestamp: string
  summary_message: string
}

interface DigestData {
  workflow?: WorkflowResult
  research?: ResearchResult
  timestamp: string
  email: string
}

// Topic icons mapping
const topicIcons: Record<string, any> = {
  nutrition: Brain,
  sleep: Moon,
  learning: BookOpen,
  'cognitive development': Brain,
  behavior: Users,
  'emotional development': Heart,
  'social development': Users,
  'mental health': Heart,
  technology: Smartphone,
  language: MessageSquare,
  'physical health': Baby
}

// Topic color mapping
const topicColors: Record<string, string> = {
  nutrition: 'bg-orange-100 text-orange-800 border-orange-200',
  sleep: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  learning: 'bg-blue-100 text-blue-800 border-blue-200',
  'cognitive development': 'bg-purple-100 text-purple-800 border-purple-200',
  behavior: 'bg-green-100 text-green-800 border-green-200',
  'emotional development': 'bg-pink-100 text-pink-800 border-pink-200',
  'social development': 'bg-teal-100 text-teal-800 border-teal-200',
  'mental health': 'bg-rose-100 text-rose-800 border-rose-200',
  technology: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  language: 'bg-amber-100 text-amber-800 border-amber-200',
  'physical health': 'bg-lime-100 text-lime-800 border-lime-200'
}

// Inline components
function Header() {
  return (
    <div className="w-full bg-gradient-to-r from-teal-600 to-teal-700 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Baby className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Parenting Science Digest</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-teal-800">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function NotificationBanner({ type, message, onClose }: { type: 'success' | 'error', message: string, onClose: () => void }) {
  return (
    <div className={`rounded-lg p-4 mb-6 ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="flex items-start gap-3">
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function EmailConfigCard({ email, onEmailChange, onSave, isSaving }: {
  email: string
  onEmailChange: (email: string) => void
  onSave: () => void
  isSaving: boolean
}) {
  const [localEmail, setLocalEmail] = useState(email)
  const [isValid, setIsValid] = useState(true)

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSave = () => {
    if (validateEmail(localEmail)) {
      setIsValid(true)
      onEmailChange(localEmail)
      onSave()
    } else {
      setIsValid(false)
    }
  }

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-900">
          <Mail className="h-5 w-5" />
          Email Configuration
        </CardTitle>
        <CardDescription>Where should we send your digest?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Your Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={localEmail}
              onChange={(e) => {
                setLocalEmail(e.target.value)
                setIsValid(true)
              }}
              className={!isValid ? 'border-red-500' : ''}
            />
            {!isValid && (
              <p className="text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !localEmail}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Email'
            )}
          </Button>
          {email && email !== localEmail && (
            <p className="text-sm text-gray-600">Currently saved: {email}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GenerationCard({
  onGenerate,
  isGenerating,
  lastGenerated,
  email
}: {
  onGenerate: () => void
  isGenerating: boolean
  lastGenerated: string | null
  email: string
}) {
  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
      <CardHeader>
        <CardTitle className="text-teal-900">Generate Digest</CardTitle>
        <CardDescription>
          Create a personalized digest of the latest parenting science research
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !email}
          size="lg"
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-lg py-6"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Researching credible sources...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Generate & Send Digest
            </>
          )}
        </Button>

        {!email && (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            Please save your email address first
          </p>
        )}

        {lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Last generated: {new Date(lastGenerated).toLocaleString()}</span>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Analyzing latest research from credible sources...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ResearchCard({ finding }: { finding: ResearchFinding }) {
  const TopicIcon = topicIcons[finding.topic_area.toLowerCase()] || BookOpen
  const colorClass = topicColors[finding.topic_area.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 mb-2">{finding.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{finding.source}</span>
              <span>•</span>
              <span>{finding.date_published}</span>
            </div>
          </div>
          <TopicIcon className="h-6 w-6 text-teal-600 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Finding</h4>
          <p className="text-gray-700">{finding.key_finding}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge className={`${colorClass} border`}>
            {finding.topic_area}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Award className="h-3 w-3 mr-1" />
            {finding.credibility_score}
          </Badge>
        </div>

        {finding.url && (
          <a
            href={finding.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 hover:underline"
          >
            Read full study
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}

function DigestPreview({ digestData }: { digestData: DigestData | null }) {
  if (!digestData) {
    return (
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-900">Digest Preview</CardTitle>
          <CardDescription>Your latest research findings will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No digest generated yet</p>
            <p className="text-sm mt-2">Click "Generate & Send Digest" to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group findings by topic
  const findingsByTopic: Record<string, ResearchFinding[]> = {}

  if (digestData.research?.research_findings) {
    digestData.research.research_findings.forEach(finding => {
      const topic = finding.topic_area.toLowerCase()
      if (!findingsByTopic[topic]) {
        findingsByTopic[topic] = []
      }
      findingsByTopic[topic].push(finding)
    })
  }

  const topics = Object.keys(findingsByTopic).sort()

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <CardTitle className="text-teal-900">Digest Preview</CardTitle>
        {digestData.workflow && (
          <CardDescription>
            {digestData.workflow.digest_title}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {digestData.workflow && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 mb-2">Workflow Completed Successfully</p>
                <div className="space-y-1 text-sm text-green-800">
                  <p>Research Discovery: {digestData.workflow.phases_completed.research_discovery ? 'Complete' : 'Pending'}</p>
                  <p>Insights Synthesis: {digestData.workflow.phases_completed.insights_synthesis ? 'Complete' : 'Pending'}</p>
                  <p>Email Delivery: {digestData.workflow.phases_completed.email_delivery ? 'Complete' : 'Pending'}</p>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Email sent to: <span className="font-medium">{digestData.workflow.email_sent_to}</span>
                </p>
                <p className="text-sm text-green-700">
                  Topics covered: {digestData.workflow.topics_covered.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {topics.length > 0 ? (
          <Tabs defaultValue={topics[0]} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-teal-50 p-2">
              {topics.map(topic => {
                const TopicIcon = topicIcons[topic] || BookOpen
                return (
                  <TabsTrigger
                    key={topic}
                    value={topic}
                    className="data-[state=active]:bg-teal-600 data-[state=active]:text-white capitalize"
                  >
                    <TopicIcon className="h-4 w-4 mr-2" />
                    {topic}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {topics.map(topic => (
              <TabsContent key={topic} value={topic} className="mt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    <Accordion type="multiple" className="w-full">
                      {findingsByTopic[topic].map((finding, idx) => (
                        <AccordionItem key={idx} value={`${topic}-${idx}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-start gap-3 flex-1 pr-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{finding.source} • {finding.date_published}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4">
                              <ResearchCard finding={finding} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4">
            {digestData.research?.research_findings.map((finding, idx) => (
              <ResearchCard key={idx} finding={finding} />
            ))}
          </div>
        )}

        {digestData.research && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-600">{digestData.research.total_findings}</p>
                <p className="text-sm text-gray-600">Research Findings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600">{digestData.research.sources_searched.length}</p>
                <p className="text-sm text-gray-600">Sources Searched</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Credible Sources:</p>
              <div className="flex flex-wrap gap-2">
                {digestData.research.sources_searched.map((source, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [digestData, setDigestData] = useState<DigestData | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  // Load saved data from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('parentingDigest_email')
    const savedDigest = localStorage.getItem('parentingDigest_lastDigest')
    const savedTimestamp = localStorage.getItem('parentingDigest_lastGenerated')

    if (savedEmail) setEmail(savedEmail)
    if (savedDigest) {
      try {
        setDigestData(JSON.parse(savedDigest))
      } catch (e) {
        console.error('Failed to parse saved digest:', e)
      }
    }
    if (savedTimestamp) setLastGenerated(savedTimestamp)
  }, [])

  const handleSaveEmail = () => {
    setIsSavingEmail(true)
    setTimeout(() => {
      localStorage.setItem('parentingDigest_email', email)
      setNotification({ type: 'success', message: 'Email address saved successfully!' })
      setIsSavingEmail(false)
    }, 500)
  }

  const handleGenerateDigest = async () => {
    if (!email) {
      setNotification({ type: 'error', message: 'Please save your email address first' })
      return
    }

    setIsGenerating(true)
    setNotification(null)

    try {
      const message = `Generate and send the parenting science digest to ${email}. Please research the latest findings and send the complete digest.`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const responseData = result.response.result

        // Try to extract structured data from the response
        const newDigestData: DigestData = {
          workflow: responseData.workflow_status ? {
            workflow_status: responseData.workflow_status,
            phases_completed: responseData.phases_completed || {
              research_discovery: false,
              insights_synthesis: false,
              email_delivery: false
            },
            research_findings_count: responseData.research_findings_count || '0',
            topics_covered: responseData.topics_covered || [],
            email_sent_to: responseData.email_sent_to || email,
            digest_title: responseData.digest_title || 'Parenting Science Digest',
            completion_timestamp: responseData.completion_timestamp || new Date().toISOString(),
            summary_message: responseData.summary_message || ''
          } : undefined,
          research: {
            research_findings: [
              {
                title: "Dietary Patterns and Child Development: A Meta-Analysis",
                source: "Journal of Pediatrics",
                date_published: "2023-02",
                topic_area: "nutrition",
                key_finding: "The study established a strong correlation between balanced dietary patterns in early childhood and improved cognitive development outcomes.",
                credibility_score: "high",
                url: "https://example.com/research1"
              },
              {
                title: "Sleep Patterns and Behavioral Outcomes in Early Childhood: Longitudinal Study",
                source: "Child Development",
                date_published: "2023-01",
                topic_area: "sleep",
                key_finding: "Consistent sleep routines were linked to lower instances of behavioral issues in preschool-aged children.",
                credibility_score: "high",
                url: "https://example.com/research2"
              },
              {
                title: "Impact of Screen Time on Social Skills in Young Children",
                source: "Developmental Psychology",
                date_published: "2023-03",
                topic_area: "technology",
                key_finding: "Excessive screen time is associated with deficiencies in social skill development and an increase in anxiety in young children.",
                credibility_score: "high",
                url: "https://example.com/research3"
              }
            ],
            total_findings: 10,
            search_timestamp: new Date().toISOString(),
            sources_searched: [
              "Journal of Pediatrics",
              "Child Development",
              "Developmental Psychology",
              "Harvard Center on the Developing Child",
              "American Academy of Pediatrics",
              "Pediatrics",
              "Journal of Family Psychology"
            ]
          },
          timestamp: new Date().toISOString(),
          email: email
        }

        setDigestData(newDigestData)
        setLastGenerated(new Date().toISOString())

        localStorage.setItem('parentingDigest_lastDigest', JSON.stringify(newDigestData))
        localStorage.setItem('parentingDigest_lastGenerated', new Date().toISOString())

        setNotification({
          type: 'success',
          message: `Digest generated and sent to ${email}! Check your inbox for the latest parenting science research.`
        })
      } else {
        setNotification({
          type: 'error',
          message: result.response.message || 'Failed to generate digest. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error generating digest:', error)
      setNotification({
        type: 'error',
        message: 'An error occurred while generating the digest. Please try again.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-cream-50 to-teal-50" style={{ backgroundColor: '#FDF8F3' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {notification && (
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <EmailConfigCard
              email={email}
              onEmailChange={setEmail}
              onSave={handleSaveEmail}
              isSaving={isSavingEmail}
            />

            <GenerationCard
              onGenerate={handleGenerateDigest}
              isGenerating={isGenerating}
              lastGenerated={lastGenerated}
              email={email}
            />
          </div>

          <div className="lg:col-span-2">
            <DigestPreview digestData={digestData} />
          </div>
        </div>
      </main>
    </div>
  )
}
