"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  Target,
  Play,
  Send,
  Brain,
  CheckCircle,
  Lightbulb,
  Smile,
  Users,
  Briefcase,
  Trophy,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { getRandomQuestions, getQuestionCount, type Question, getQuestionStats } from "@/lib/questions-service"

const stageConfig = {
  hr: {
    title: "HR面 - 职业匹配度与潜力评估",
    description: "评估职业动机、自我认知、沟通协作、职业规划",
    icon: Users,
    color: "blue",
    stageId: 1,
  },
  professional: {
    title: "专业面 - 硬核能力与实践评估",
    description: "评估产品设计思维、技术理解力、商业化能力、数据驱动能力",
    icon: Briefcase,
    color: "green",
    stageId: 2,
  },
  final: {
    title: "终面 - 战略思维与行业洞察评估",
    description: "评估战略思维、行业洞察、商业模式设计、复杂场景分析",
    icon: Trophy,
    color: "purple",
    stageId: 3,
  },
}

const abilityDimensions = {
  hr: [
    {
      name: "职业动机真实性",
      weight: "高",
      description:
        "对AI PM岗位的理解是否深入，动机是否源于热爱而非盲从。评估你是否真正理解AI产品经理与传统PM的本质区别。",
      standards: [
        "优秀：能清晰阐述AI PM与传统PM的本质区别，结合具体案例说明职业选择的必然性，展现对AI产品的深度认知",
        "良好：理解AI PM的基本职责，但对独特价值的认知还不够深入，缺乏具体的差异化表达",
        "待提升：对AI PM角色认知模糊，缺乏具体的职业规划和动机支撑，容易与传统PM混淆",
      ],
      evaluationFocus: "重点关注：是否能用'数据-模型-业务'闭环思维来解释职业选择，是否提到AI产品的概率性决策特点",
    },
    {
      name: "自我认知清晰度",
      weight: "高",
      description: "对自身优势、劣势和未来发展路径是否有清晰规划。评估你的自我反思能力和成长规划的可执行性。",
      standards: [
        "优秀：能客观分析自身能力模型，提出具体可验证的成长计划，有明确的里程碑和评估标准",
        "良好：有基本的自我认知，但成长规划还不够具体，缺乏量化的目标设定",
        "待提升：自我认知不够客观，缺乏明确的发展方向，规划过于宏观缺乏可操作性",
      ],
      evaluationFocus: "重点关注：是否有具体的技能提升计划，是否能识别AI PM特有的能力要求",
    },
    {
      name: "团队协作软实力",
      weight: "高",
      description: "能否在复杂团队环境中有效沟通和解决冲突。特别关注与技术团队（算法、工程）的协作能力。",
      standards: [
        "优秀：能用具体案例展示跨职能协作能力，有成熟的冲突解决方法论，特别是技术与业务的平衡",
        "良好：有团队协作经验，但处理复杂冲突的能力还需提升，缺乏系统性的协调方法",
        "待提升：团队协作经验有限，缺乏系统性的沟通协调方法，对技术团队协作理解不足",
      ],
      evaluationFocus: "重点关注：是否有与数据科学家、算法工程师协作的具体经验和方法论",
    },
  ],
  professional: [
    {
      name: "技术理解深度",
      weight: "高",
      description: "能否清晰解释AI技术原理，并与产品场景结合。不要求成为技术专家，但需要有足够的技术判断力。",
      standards: [
        "优秀：能深入解释技术原理，并结合具体产品场景进行权衡分析，有独立的技术选型判断能力",
        "良好：理解基本技术概念，但在产品化应用方面还需加强，技术判断依赖他人意见",
        "待提升：技术理解停留在表面，缺乏产品化思维，无法独立进行技术方案评估",
      ],
      evaluationFocus: "重点关注：是否能解释RAG vs 微调的适用场景，是否理解模型部署的成本考量",
    },
    {
      name: "产品落地能力",
      weight: "高",
      description: "是否能设计出可行的AI产品方案，并考虑数据飞轮。评估从0到1的产品设计能力。",
      standards: [
        "优秀：能设计完整的AI产品方案，深度考虑数据获取和增长飞轮，有清晰的MVP规划",
        "良好：有基本的产品设计能力，但对数据驱动增长的理解还不够深入，缺乏系统性思考",
        "待提升：产品设计思路不够系统，缺乏数据驱动的产品思维，对AI产品特性理解不足",
      ],
      evaluationFocus: "重点关注：是否考虑冷启动问题，是否设计了用户反馈闭环，是否有数据质量保障机制",
    },
    {
      name: "商业化平衡能力",
      weight: "高",
      description: "在追求技术效果的同时，能否兼顾成本、收益和用户价值。这是AI PM的核心能力之一。",
      standards: [
        "优秀：能在技术理想与商业现实间找到最佳平衡点，有成熟的权衡方法论和量化分析能力",
        "良好：理解商业化的重要性，但在具体权衡时还需要更多经验，缺乏量化分析工具",
        "待提升：过于关注技术实现，对商业化考量不够充分，缺乏成本效益分析思维",
      ],
      evaluationFocus: "重点关注：是否能量化技术投入与商业回报，是否考虑了模型维护成本",
    },
  ],
  final: [
    {
      name: "行业洞察力",
      weight: "高",
      description: "对AI行业趋势有前瞻性见解，能预判技术发展方向。不是要求预测未来，而是基于现状的合理推演。",
      standards: [
        "优秀：对AI前沿技术有深度洞察，能结合商业场景预判发展趋势，有独特的行业观点",
        "良好：关注行业动态，但洞察深度和前瞻性还需提升，观点缺乏独特性",
        "待提升：对行业趋势的理解较为表面，缺乏独特见解，容易人云亦云",
      ],
      evaluationFocus: "重点关注：是否能分析AI Agent的商业化瓶颈，是否理解多模态技术的应用前景",
    },
    {
      name: "战略规划能力",
      weight: "高",
      description: "能从宏观层面思考产品，并设计可行的商业模式。评估你的系统性思维和商业敏感度。",
      standards: [
        "优秀：能制定系统性的产品战略，设计可持续的商业模式，有清晰的竞争策略",
        "良好：有基本的战略思维，但在商业模式设计方面还需加强，缺乏竞争分析",
        "待提升：战略思维不够系统，缺乏宏观视角，商业模式设计能力不足",
      ],
      evaluationFocus: "重点关注：是否考虑了不同客户群体的定价策略，是否分析了竞争环境",
    },
    {
      name: "复杂问题拆解能力",
      weight: "高",
      description: "面对开放性难题，能结构化地分析和解决。这是高级PM必备的思维能力。",
      standards: [
        "优秀：能系统性拆解复杂问题，提供结构化的解决方案，有清晰的优先级排序",
        "良好：有一定的问题分析能力，但结构化思维还需提升，解决方案不够系统",
        "待提升：面对复杂问题时思路不够清晰，缺乏系统性方法，容易陷入细节",
      ],
      evaluationFocus: "重点关注：是否使用了结构化分析框架，是否考虑了多个利益相关方的需求",
    },
  ],
}

interface InterviewPracticeProps {
  moduleType: "hr" | "professional" | "final"
  onBack: () => void
}

interface QualitativeEvaluationResponse {
  performanceLevel: "优秀表现" | "良好表现" | "有待提升"
  summary: string
  strengths: Array<{
    area: string
    description: string
  }>
  improvements: Array<{
    area: string
    suggestion: string
    example: string
  }>
  nextSteps: Array<{
    focus: string
    actionable: string
  }>
  encouragement?: string
}

export default function InterviewPractice({ moduleType = "hr", onBack }: InterviewPracticeProps) {
  const [currentStep, setCurrentStep] = useState<"overview" | "answering" | "analyzing" | "result">("overview")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [feedback, setFeedback] = useState<QualitativeEvaluationResponse | null>(null)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [stageProgress, setStageProgress] = useState(0)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [totalQuestionsInStage, setTotalQuestionsInStage] = useState(0)
  const [questionStats, setQuestionStats] = useState<{ totalQuestions: number; questionsByStage: any[] }>({
    totalQuestions: 0,
    questionsByStage: [],
  })

  const currentStage = stageConfig[moduleType]
  const IconComponent = currentStage.icon

  const loadQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      console.log(`🔍 [前端] 开始加载 ${currentStage.title} 的题目，stageId: ${currentStage.stageId}`)

      const [fetchedQuestions, totalCount] = await Promise.all([
        getRandomQuestions(currentStage.stageId, undefined, 3),
        getQuestionCount(currentStage.stageId),
      ])

      console.log(
        `📚 [前端] 成功获取 ${fetchedQuestions.length} 道题目:`,
        fetchedQuestions.map((q) => ({
          id: q.id,
          text: q.question_text.substring(0, 50) + "...",
        })),
      )
      console.log(`📊 [前端] 该阶段题库总数: ${totalCount}`)

      setQuestions(fetchedQuestions)
      setTotalQuestionsInStage(totalCount)

      // 同时获取题库统计信息
      const stats = await getQuestionStats()
      setQuestionStats(stats)
      console.log(`📊 [前端] 题库统计:`, stats)
    } catch (error) {
      console.error("💥 [前端] 加载题目失败:", error)
      setQuestions([])
      setTotalQuestionsInStage(0)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [moduleType])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === "answering" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startPractice = () => {
    if (questions.length === 0) {
      console.warn("⚠️ [前端] 没有可用题目，重新加载")
      loadQuestions()
      return
    }

    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentAnswer("")
    setTimeLeft(300) // 5分钟每题
    setCurrentStep("answering")
    setFeedback(null)
    setEvaluationError(null)
    setStageProgress(0)
    console.log("🔄 [前端] 开始阶段练习:", currentStage.title, `共${questions.length}道题`)
  }

  const submitCurrentAnswer = () => {
    if (!currentAnswer.trim()) return

    const newAnswers = [...answers, currentAnswer]
    setAnswers(newAnswers)
    setCurrentAnswer("")
    setStageProgress(((currentQuestionIndex + 1) / questions.length) * 100)

    if (currentQuestionIndex < questions.length - 1) {
      // 继续下一题
      setCurrentQuestionIndex((prev) => prev + 1)
      setTimeLeft(300)
      console.log(`➡️ [前端] 进入第 ${currentQuestionIndex + 2} 题`)
    } else {
      // 完成所有题目，开始分析
      console.log(`✅ [前端] 完成所有 ${questions.length} 道题目，开始评估`)
      submitAllAnswers(newAnswers)
    }
  }

  const submitAllAnswers = async (allAnswers: string[]) => {
    console.log("🎯 [前端] 提交阶段答案:", {
      stage: moduleType,
      questionCount: questions.length,
      answerCount: allAnswers.length,
    })

    setCurrentStep("analyzing")
    setIsEvaluating(true)
    setEvaluationError(null)

    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 90) progress = 90
      setStageProgress(progress)
    }, 200)

    try {
      const requestData = {
        stageType: moduleType,
        questions: questions.map((q) => q.question_text),
        answers: allAnswers,
        stageTitle: currentStage.title,
        async: false, // 同步模式
      }

      console.log("📤 [前端] 发送评估请求:", requestData)

      const response = await fetch("/api/evaluate-question-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseData = await response.json()
      clearInterval(progressInterval)
      setStageProgress(100)

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || "评估服务暂时不可用")
      }

      if (responseData.performanceLevel) {
        const evaluationResult: QualitativeEvaluationResponse = responseData
        setFeedback(evaluationResult)
        setCurrentStep("result")
        console.log("✅ [前端] 评估完成:", evaluationResult.performanceLevel)
      } else {
        throw new Error("评估结果格式错误")
      }
    } catch (error) {
      clearInterval(progressInterval)
      console.error("💥 [前端] 评估失败:", error)
      setEvaluationError(error instanceof Error ? error.message : "评估失败，请稍后重试")

      const fallbackResult = generateFallbackEvaluation()
      setFeedback(fallbackResult)
      setCurrentStep("result")
      console.log("🔄 [前端] 使用备用评估结果")
    } finally {
      setIsEvaluating(false)
    }
  }

  const generateFallbackEvaluation = (): QualitativeEvaluationResponse => {
    const stageSpecificFeedback = {
      hr: {
        summary:
          "你的故事很完整，像是一部制作精良的简历纪录片。但听下来，感觉你像是AI产品的'旁白'，而不是'导演'。我们想听听你当导演时的心路历程。",
        improvements: [
          {
            area: "成为'导演'",
            suggestion:
              "别只说'我做了什么'，要说'我为什么这么做'。用具体量化的数据证明你是如何通过技术决策，一步步实现商业目标的。",
            example:
              "比如说'将问题解决率从68%提升至85%，通过重新设计推荐算法架构实现，这个决策基于我对用户行为数据的深度分析'",
          },
          {
            area: "突出AI PM独特性",
            suggestion:
              "你的介绍里要有AI时代的'关键词'：RAG、AI Agent、多模态交互。更重要的是，要体现AI产品经理特有的思维模式。",
            example:
              "比如'在设计推荐系统时，我需要平衡模型精度与用户体验，最终选择了85%精度的轻量模型，因为响应速度对用户留存的影响更大'",
          },
          {
            area: "量化你的影响力",
            suggestion: "每个项目都要有具体的数据支撑，让面试官看到你的'导演'能力不是空谈。",
            example:
              "不要说'优化了用户体验'，要说'通过A/B测试验证，新的AI交互方式使用户完成率提升了23%，月活跃用户增长15%'",
          },
        ],
      },
      professional: {
        summary:
          "你对技术的理解就像是看了一场精彩的球赛，规则都懂，战术也清楚。但我们想知道你作为教练，是如何制定战术、调整阵容的。",
        improvements: [
          {
            area: "技术翻译官",
            suggestion:
              "在阐述技术时，将技术名词转化为业务收益，突出你的'教练'角色。不要只展示技术理解，要展示技术判断。",
            example:
              "不要只说'使用RAG技术'，要说'选择RAG而非微调，是因为我们的知识库更新频繁，RAG能降低30%的模型维护成本，同时保持85%的准确率'",
          },
          {
            area: "数据飞轮设计师",
            suggestion: "AI产品的核心是数据驱动增长，你需要展示如何设计这个增长引擎。",
            example: "比如'用户每次纠错都会成为训练数据，预计3个月后模型准确率可提升到92%，形成越用越准的正向循环'",
          },
          {
            area: "商业化平衡大师",
            suggestion: "展示你如何在技术理想与商业现实间找平衡，这是AI PM的核心价值。",
            example: "当数据科学家要求95%精度时，我会分析：从85%到95%需要额外投入50万，但业务收益只增加8%，ROI不划算",
          },
        ],
      },
      final: {
        summary:
          "你对未来的描绘很宏大，就像一位优秀的航海家描述远方的大陆。但我们想知道，这艘'未来之船'的发动机在哪里，航线图是什么样的？",
        improvements: [
          {
            area: "趋势落地专家",
            suggestion: "在谈论行业趋势时，将其与具体产品形态和商业模式结合，而非泛泛而谈。要有自己的独特洞察。",
            example:
              "不要只说'AI Agent很有前景'，要说'AI Agent在客服场景下可以降低40%人力成本，但目前的技术瓶颈是多轮对话的上下文理解，预计2年内突破'",
          },
          {
            area: "商业模式建筑师",
            suggestion: "设计商业模式时，要考虑不同客户群体的需求差异和支付能力，展示你的商业敏感度。",
            example:
              "中小企业按使用量付费（$0.1/次调用），大企业按年订阅（$50万/年含定制化），这样既保证了现金流又满足了不同需求",
          },
          {
            area: "复杂问题拆解高手",
            suggestion: "面对复杂场景，要展示结构化思维，用框架来分析问题，而不是凭直觉。",
            example:
              "医疗AI的三个维度可以用'技术-体验-合规'框架分析：技术上追求95%精度，体验上设计医生确认机制，合规上建立审计追踪",
          },
        ],
      },
    }

    const feedback = stageSpecificFeedback[moduleType]

    return {
      performanceLevel: "良好表现",
      summary: feedback.summary,
      strengths: [
        {
          area: "表达逻辑",
          description: "回答结构清晰，能够按照逻辑顺序组织内容，体现了良好的沟通基础。这是成为优秀AI PM的重要基石。",
        },
        {
          area: "学习态度",
          description: "对AI产品经理角色有基本认知，展现出学习和成长的积极态度。这种开放的心态很难得。",
        },
        {
          area: "专业素养",
          description: "在回答中体现出对产品工作的基本理解，有一定的专业基础，这为进一步提升奠定了基础。",
        },
      ],
      improvements: feedback.improvements,
      nextSteps: [
        {
          focus: "深化AI产品理解",
          actionable: "每周研读2-3个AI产品的成功案例，特别关注他们如何将技术能力转化为商业价值，建立自己的案例库",
        },
        {
          focus: "建立量化思维",
          actionable: "在描述任何项目时，都要准备3个关键数据：投入成本、产出效果、时间周期。用数据说话，而不是感觉",
        },
        {
          focus: "实践AI产品设计",
          actionable: "选择一个你熟悉的产品，设计一个AI功能的完整方案：技术选型、数据获取、用户体验、商业模式",
        },
      ],
      encouragement:
        "记住，每个优秀的AI产品经理都是从'旁白'开始，逐步成长为'导演'的。你已经有了很好的基础，现在需要的是更多的实战经验和深度思考。继续保持这种学习热情，相信你很快就能从观众席走到导演椅！",
    }
  }

  const restartPractice = () => {
    setCurrentStep("overview")
    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentAnswer("")
    setFeedback(null)
    setEvaluationError(null)
    setStageProgress(0)
    loadQuestions()
  }

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">正在加载题库...</h3>
            <p className="text-gray-600">从数据库中获取最新的面试题目</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无可用题目</h3>
            <p className="text-gray-600 mb-4">该阶段的题目正在准备中，请稍后再试</p>
            <div className="space-y-2">
              <Button onClick={loadQuestions} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新加载
              </Button>
              <Button variant="outline" onClick={onBack}>
                返回选择
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 p-1 sm:p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">返回</span>
              </Button>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">F</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">FutureU</span>
                <IconComponent className="w-4 h-4 text-gray-600 ml-2" />
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {currentStage.title.split(" - ")[0]}
                </h1>
              </div>
            </div>
            {currentStep === "answering" && (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-600">
                  {currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className={`font-mono text-sm ${timeLeft < 30 ? "text-red-500" : "text-orange-500"}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {currentStep === "overview" && (
          <div className="space-y-4 sm:space-y-6">
            <Card
              className={`bg-gradient-to-br from-${currentStage.color}-600 via-${currentStage.color}-500 to-purple-600 text-white shadow-2xl border-0`}
            >
              <CardContent className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-6">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <IconComponent className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-4">
                    <h2 className="text-xl sm:text-3xl font-bold text-white">{currentStage.title}</h2>
                    <p className="text-white/90 text-sm sm:text-lg leading-relaxed">{currentStage.description}</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                        <div className="text-lg sm:text-2xl font-bold text-white">{questions.length}</div>
                        <div className="text-white/80 text-xs sm:text-sm">随机题目</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                        <div className="text-lg sm:text-2xl font-bold text-white">
                          {Math.ceil(questions.length * 5)}
                        </div>
                        <div className="text-white/80 text-xs sm:text-sm">预计分钟</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                        <div className="text-lg sm:text-2xl font-bold text-white">{totalQuestionsInStage}</div>
                        <div className="text-white/80 text-xs sm:text-sm">题库总数</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:gap-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="bg-white/80 backdrop-blur-sm border-white/20">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 bg-${currentStage.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <span className={`text-${currentStage.color}-600 font-bold text-xs sm:text-sm`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">题目预览 {index + 1}</h3>
                        <p className="text-xs sm:text-base text-gray-600 mb-3 leading-relaxed">
                          {question.question_text.length > 100
                            ? question.question_text.substring(0, 100) + "..."
                            : question.question_text}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-gray-700">
                            <strong>难度：</strong>
                            {question.difficulty_level || "中等"}
                            {question.keywords && question.keywords.length > 0 && (
                              <>
                                <strong className="ml-4">关键词：</strong>
                                {question.keywords.slice(0, 3).join(", ")}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={startPractice}
                size="lg"
                className={`bg-gradient-to-r from-${currentStage.color}-600 to-purple-600 hover:from-${currentStage.color}-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 w-full sm:w-auto text-sm sm:text-base`}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                开始{currentStage.title.split(" - ")[0]}练习
              </Button>
            </div>
          </div>
        )}

        {currentStep === "answering" && questions[currentQuestionIndex] && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <CardTitle className="text-base sm:text-xl text-gray-900">
                    题目 {currentQuestionIndex + 1}: 面试问题
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </Badge>
                </div>
                <Progress value={stageProgress} className="h-1 sm:h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg">
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                      {questions[currentQuestionIndex].question_text}
                    </p>
                  </div>
                  {questions[currentQuestionIndex].keywords && questions[currentQuestionIndex].keywords.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong>关键考察点：</strong>
                        {questions[currentQuestionIndex].keywords.join(", ")}
                      </p>
                    </div>
                  )}
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="请在这里输入你的回答..."
                    className="min-h-[120px] sm:min-h-[200px] text-sm sm:text-base"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm text-gray-500">建议回答时间：3-5分钟</div>
                    <Button
                      onClick={submitCurrentAnswer}
                      disabled={!currentAnswer.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 text-sm sm:text-base"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {currentQuestionIndex < questions.length - 1 ? "下一题" : "完成练习"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "analyzing" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">AI面试官正在分析你的回答</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">正在生成专业的调侃式评估报告，请稍候...</p>
                    <Progress value={stageProgress} className="h-2 sm:h-3 max-w-md mx-auto" />
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">分析进度: {Math.round(stageProgress)}%</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <p>🧠 分析回答逻辑和结构...</p>
                    <p>🎯 评估专业能力表现...</p>
                    <p>💡 生成个性化改进建议...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "result" && feedback && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl border-0">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <Smile className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold">😏 AI面试官的调侃总结</h2>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                    <p className="text-sm sm:text-lg text-white/95 leading-relaxed italic">"{feedback.summary}"</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3 py-1">
                    {feedback.performanceLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-700 text-sm sm:text-lg">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  AI产品经理能力维度评估标准
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  了解评估体系，让你清楚知道AI面试官是如何"调侃"你的 😉
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4">
                  {abilityDimensions[moduleType].map((dimension, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-base">{dimension.name}</h4>
                        <Badge variant="outline" className="text-xs font-medium">
                          权重 {dimension.weight}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                        {dimension.description}
                      </p>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs font-medium text-gray-600 mb-1 sm:mb-2">评估标准：</p>
                        <div className="grid gap-1">
                          {dimension.standards.map((standard, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <div
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  idx === 0 ? "bg-green-500" : idx === 1 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                              ></div>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{standard}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-700">
                    💡 <strong>评估哲学：</strong>我们不是在找"标准答案"，而是在寻找你独特的AI产品思维。
                    每个维度都是为了帮你成为更好的AI产品经理，而不是为了难倒你。
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700 text-sm sm:text-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    有点意思的地方 ({feedback.strengths.length}个)
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    这些地方让AI面试官眼前一亮，继续保持这种"导演"风格 🎬
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {feedback.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-500 pl-2 sm:pl-4 bg-green-50/50 rounded-r-lg py-2 sm:py-3"
                      >
                        <div className="flex items-center mb-1 sm:mb-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs font-medium">
                            {strength.area}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{strength.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700 text-sm sm:text-lg">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    怎么答会更好（直接版） ({feedback.improvements.length}个)
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-orange-600 mt-1">
                    别把这些当批评，把它们当成"从旁白升级为导演"的秘籍 📚
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {feedback.improvements.map((improvement, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-orange-500 pl-2 sm:pl-4 bg-orange-50/50 rounded-r-lg py-2 sm:py-3"
                      >
                        <div className="flex items-center mb-1 sm:mb-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs font-medium">
                            {improvement.area}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2">
                          {improvement.suggestion}
                        </p>
                        <div className="bg-white/80 rounded-lg p-2 border border-orange-200">
                          <p className="text-xs sm:text-sm text-orange-800">
                            <strong>具体这样说：</strong>
                            {improvement.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700 text-sm sm:text-lg">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    直接可行动的建议 ({feedback.nextSteps.length}个)
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-blue-600 mt-1">这些不是空话，都是可以立即开始做的具体行动 🚀</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-4">
                    {feedback.nextSteps.map((step, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-2 sm:pl-4 bg-blue-50/50 rounded-r-lg py-2 sm:py-3"
                      >
                        <div className="flex items-center mb-1 sm:mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs font-medium">
                            {step.focus}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{step.actionable}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {feedback.encouragement && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Smile className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-lg font-semibold text-purple-900 mb-2">AI面试官的鼓励</h3>
                    <p className="text-xs sm:text-base text-purple-700 leading-relaxed italic">
                      "{feedback.encouragement}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 登录提示卡片 */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-4">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">想要长期记录您的面试表现？</h3>
                <p className="text-blue-700 text-sm mb-3">
                  登录后可以保存面试记录、追踪进步轨迹、获得个性化建议
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100 text-sm px-4 py-2"
                    onClick={() => {
                      window.location.href = '/auth/login'
                    }}
                  >
                    立即登录
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 text-sm px-4 py-2"
                    onClick={() => {
                      window.location.href = '/auth/sign-up'
                    }}
                  >
                    免费注册
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={restartPractice}
                variant="outline"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-transparent"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                再来一次
              </Button>
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              >
                选择其他阶段
              </Button>
            </div>
          </div>
        )}

        {evaluationError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <p className="text-red-700 text-sm sm:text-base mb-3 sm:mb-4">{evaluationError}</p>
              <Button
                onClick={() => submitAllAnswers(answers)}
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100 text-sm sm:text-base"
              >
                重试评估
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
