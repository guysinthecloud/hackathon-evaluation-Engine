"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Clock,
  Users,
  TrendingUp,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  Cpu,
} from "lucide-react"

// Sample data - replace with your actual JSON data


export default function HackathonDashboard() {
  const [selectedTeam, setSelectedTeam] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const currentTeam = evaluationData[selectedTeam]
  const filteredTeams = evaluationData.filter((team) => team.team_name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const criteriaLabels = {
    impact_scalability: "Impact & Scalability",
    innovation_creativity: "Innovation & Creativity",
    google_technologies_usage: "Google Technologies Usage",
    presentation_documentation: "Presentation & Documentation",
    technical_implementation_ux: "Technical Implementation & UX",
  }

  const overallLabels = {
    consistency_score: "Consistency Score",
    completeness_score: "Completeness Score",
    presentation_flow_score: "Presentation Flow Score",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Hackathon Evaluation Dashboard</h1>
                <p className="text-sm text-gray-500">Google Technologies Open Domain Hackathon</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Teams ({filteredTeams.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTeams.map((team, index) => {
                  const originalIndex = evaluationData.findIndex((t) => t.team_name === team.team_name)
                  const avgScore = Object.values(team.gemini_response.criteria_scores).reduce((a, b) => a + b, 0) / 5
                  return (
                    <Button
                      key={team.team_name}
                      variant={selectedTeam === originalIndex ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 transition-colors duration-200 ${
                        selectedTeam === originalIndex 
                          ? "bg-blue-700 text-white hover:bg-blue-800" 
                          : "hover:bg-blue-200"
                      }`}
                      onClick={() => setSelectedTeam(originalIndex)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{team.team_name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getScoreBadgeColor(avgScore)}`}>
                            Avg: {avgScore.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Team Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{currentTeam.team_name}</CardTitle>
                    <CardDescription className="text-blue-100 mt-2">
                      {currentTeam.gemini_response.metadata.domain}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {(
                        Object.values(currentTeam.gemini_response.criteria_scores).reduce((a, b) => a + b, 0) / 5
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-100">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Metadata Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Evaluated</div>
                      <div className="font-medium text-sm">
                        {formatTimestamp(currentTeam.gemini_response.metadata.timestamp)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">Slides Analyzed</div>
                      <div className="font-medium text-lg">{currentTeam.gemini_response.metadata.slides_analyzed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-sm text-gray-500">Processing Time</div>
                      <div className="font-medium text-lg">
                        {currentTeam.gemini_response.metadata.processing_time_seconds.toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">AI Model</div>
                      <div className="font-medium text-sm">
                        {currentTeam.gemini_response.metadata.gemini_model.split("-").slice(0, 2).join("-")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="scores" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="scores" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Scores</TabsTrigger>
                <TabsTrigger value="feedback" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Feedback</TabsTrigger>
                <TabsTrigger value="summary" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Summary</TabsTrigger>
                <TabsTrigger value="slides" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Slides</TabsTrigger>
              </TabsList>

              <TabsContent value="scores" className="space-y-6">
                {/* Criteria Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span>Evaluation Criteria Scores</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(currentTeam.gemini_response.criteria_scores).map(([key, score]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {criteriaLabels[key as keyof typeof criteriaLabels]}
                          </span>
                          <Badge className={getScoreBadgeColor(score)}>{score}/10</Badge>
                        </div>
                        <Progress value={score * 10} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Overall Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Overall Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(currentTeam.gemini_response.overall_analysis)
                      .filter(([key]) => key !== "total_slides_analyzed")
                      .map(([key, score]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {overallLabels[key as keyof typeof overallLabels]}
                            </span>
                            <Badge className={getScoreBadgeColor(score)}>{score}/10</Badge>
                          </div>
                          <Progress value={score * 10} className="h-2" />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-700">
                      <Lightbulb className="w-5 h-5" />
                      <span>Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span>Executive Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{currentTeam.gemini_response.executive_summary}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="slides" className="space-y-4">
                {currentTeam.gemini_response.slide_by_slide_notes.map((slide, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Slide {slide.slide}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{slide.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
