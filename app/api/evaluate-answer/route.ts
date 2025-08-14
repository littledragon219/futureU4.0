import { type NextRequest, NextResponse } from "next/server"

const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions"
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

interface EvaluationRequest {
  questionId: number
  question: string
  userAnswer: string
  keyPoints: string[]
  category: string
  difficulty: string
}

interface EvaluationResponse {
  overallScore: number
  coreCompetencyScores: {
    productThinking: number
    technicalUnderstanding: number
    projectManagement: number
    businessAcumen: number
  }
  performanceScores: {
    communication: number
    logicalStructure: number
    confidence: number
    adaptability: number
  }
  rating: string
  summary: string
  highlights: Array<{
    tag: string
    description: string
  }>
  improvements: Array<{
    tag: string
    description: string
  }>
  strategicSuggestions: Array<{
    tag: string
    suggestion: string
    example: string
  }>
}

function buildEvaluationPrompt(data: EvaluationRequest): string {
  return `你是一位资深AI产品总监，拥有10年以上的AI产品管理经验。请扮演一名严谨且专业的面试官角色，但用一种轻松调侃的方式来总结表现，并直接指出如何优化，帮助候选人把"框架"变成"血肉"。

面试问题：${data.question}
问题类别：${data.category}
难度等级：${data.difficulty}

评分关键要点：
${data.keyPoints.map((point, index) => `${index + 1}. ${point}`).join("\n")}

用户回答：
${data.userAnswer}

### 新的评估模式 - 轻松调侃式反馈：

**关于自我介绍类问题的反馈模板：**
- 表现总结："嗯，你的故事很完整，像是一部制作精良的简历纪录片。但听下来，感觉你像是 AI 产品的'旁白'，而不是'导演'。"
- 改进建议：成为"导演"，突出独特性，展现职业动机

**关于AI产品思维项目类问题的反馈模板：**
- 表现总结："你描述的这个项目很像是一部优秀的传统产品续集，很精彩！但作为一部 AI 大片，它还缺了点'数据飞轮'的特效。"
- 改进建议：展现"数据-模型-业务"闭环，具体说明解决路径，用数据说话

**关于职业规划类问题的反馈模板：**
- 表现总结："你的未来规划很宏大，像一幅美丽的蓝图，但缺少了施工图。听起来你很想成为高手，但我们想知道你准备如何一步步爬到山顶。"
- 改进建议：具体化、可验证，双轴发展，与公司对齐

### 核心能力维度（1-10分）：**
1. **产品思维**：用户痛点识别、商业理解、数据驱动思维。优秀回答需体现产品落地、商业价值和数据验证思维。
2. **技术理解**：AI技术原理阐述、业务场景结合能力。需清晰解释AI技术并与业务场景结合。
3. **项目管理**：团队协调、资源管理、风险管理能力。需展现跨团队协作和资源优化能力。
4. **商业化能力**：ROI思维、市场洞察、竞争分析。需考虑投资回报率和市场竞争。

### 综合表现维度（1-10分）：**
1. **沟通表达**：语言流畅度、专业性、精确性
2. **逻辑结构**：条理清晰、重点突出、结构完整
3. **自信度**：表达自信、有说服力
4. **临场反应**：面对问题的敏捷解决能力

### 高分回答的关键要素：

**自我介绍优化要点：**
- 成为"导演"：别只说"我做了什么"，要说"我为什么这么做"
- 用具体量化数据证明技术决策如何实现商业目标
- 突出AI时代关键词：RAG、AI Agent、多模态交互
- 体现AI产品经理特有思维：概率型决策与用户体验平衡
- 职业动机要与目标公司产品理念结合

**AI产品思维项目优化要点：**
- 展现"数据-模型-业务"的闭环思维
- 清晰阐述传统方案痛点及AI技术解决路径
- 提供具体数据证明AI技术对业务的贡献
- 体现模型选择、数据策略的深度思考

**职业规划优化要点：**
- 具体化、可验证的阶段性目标
- 体现"技术深度-商��广度"双轴发展
- 与目标公司业务方向匹配
- 避免"提升能力"等空泛表述

### 反馈要求：
- 使用轻松调侃但专业的语调
- 每个评估都要有具体的比喻和形象化描述
- 直接指出问题所在，不绕弯子
- 提供可操作的具体改进建议
- 必须基于用户实际回答内容进行评估

### 特别要求：
1. 总结部分必须使用调侃式的比喻，但保持专业性
2. 每个建议都必须具体可操作，包含量化指标或具体示例
3. 避免使用"整体表现良好"等模糊表述
4. 必须体现"为什么只能得这么多分"的逻辑

请严格按照以下JSON格式返回评估结果：
{
  "overallScore": <综合得分，1-100整数，计算公式：(核心能力平均分*0.7 + 综合表现平均分*0.3)*10>,
  "coreCompetencyScores": {
    "productThinking": <产品思维得分，1-10>,
    "technicalUnderstanding": <技术理解得分，1-10>,
    "projectManagement": <项目管理得分，1-10>,
    "businessAcumen": <商业化能力得分，1-10>
  },
  "performanceScores": {
    "communication": <沟通表达得分，1-10>,
    "logicalStructure": <逻辑结构得分，1-10>,
    "confidence": <自信度得分，1-10>,
    "adaptability": <临场反应得分，1-10>
  },
  "rating": "<根据总分给出评级：90+为'卓越'，80-89为'优秀'，70-79为'良好'，60-69为'及格'，<60为'需改进'>",
  "summary": "<使用轻松调侃的语调进行总结，必须包含形象化比喻，格式：'你的回答就像是[比喻]，在[具体方面]表现[评价]，但[问题所在]。建议[具体改进方向]，这样才能从[当前状态]变成[目标状态]。'必须具体分析为什么是这个分数>",
  "highlights": [
    {
      "tag": "<具体标签，如'数据驱动决策'、'技术可行性分析'、'ROI量化思维'等>",
      "description": "<详细描述该亮点，必须引用用户回答中的具体内容，分析其体现的能力，至少60字>"
    }
  ],
  "improvements": [
    {
      "tag": "<具体问题标签，如'缺少导演思维'、'数据飞轮特效不足'、'施工图缺失'等>",
      "description": "<使用调侃但专业的语调描述问题，分析根本原因，提供改进方向和具体方法，至少80字>"
    }
  ],
  "strategicSuggestions": [
    {
      "tag": "<建议标签，如'从旁白升级为导演'、'添加数据飞轮特效'、'绘制职业施工图'等>",
      "suggestion": "<详细的改进建议，必须具体可操作，包含实施步骤，使用轻松但专业的语调，至少100字>",
      "example": "<提供具体的量化示例或补充内容，如：'可以这样说：通过引入RAG架构，将问题解决率从68%提升至85%，用户满意度提升30%，这不仅是技术升级，更是商业价值的飞跃'，至少60字>"
    }
  ]
}`
}

function cleanJsonResponse(content: string): string {
  console.log("🔧 [JSON清理] 开始清理AI响应")

  // Remove markdown code blocks and language identifiers
  let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "")

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim()

  // Remove any text before the first { and after the last }
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  // Fix common JSON formatting issues
  cleaned = cleaned
    // Remove any trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, "$1")
    // Fix unescaped quotes in strings
    .replace(/([^\\])"/g, '$1\\"')
    // Fix the previous replacement if it affected JSON structure
    .replace(/\\"/g, '"')
    // Ensure proper spacing around colons and commas
    .replace(/:\s*/g, ": ")
    .replace(/,\s*/g, ", ")
    // Remove any control characters that might cause parsing issues
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Fix any double quotes that got mangled
    .replace(/"{2,}/g, '"')

  console.log("✨ [JSON清理] 清理完成，长度:", cleaned.length)

  // Validate basic JSON structure
  const openBraces = (cleaned.match(/{/g) || []).length
  const closeBraces = (cleaned.match(/}/g) || []).length

  if (openBraces !== closeBraces) {
    console.warn("⚠️ [JSON清理] 大括号不匹配:", { openBraces, closeBraces })
  }

  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [API] 开始处理增强版评估请求")

    if (!SILICONFLOW_API_KEY) {
      console.error("❌ [API] SiliconFlow API密钥未配置")
      return NextResponse.json(
        {
          error: "SiliconFlow API key not configured",
          message: "请在项目设置中添加 SILICONFLOW_API_KEY 环境变量",
        },
        { status: 500 },
      )
    }

    const body: EvaluationRequest = await request.json()
    console.log("📝 [API] 收到评估请求:", {
      questionId: body.questionId,
      category: body.category,
      difficulty: body.difficulty,
      answerLength: body.userAnswer?.length,
    })

    // 验证请求数据
    if (!body.question || !body.userAnswer || !body.keyPoints) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = buildEvaluationPrompt(body)
    console.log("📋 [API] 构建增强版提示词完成")

    const requestPayload = {
      model: "deepseek-ai/DeepSeek-V3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000,
    }

    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API] SiliconFlow API错误:`, errorText)
      throw new Error(`SiliconFlow API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const aiContent = aiResponse.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error("No response from AI")
    }

    console.log("🔧 [API] 原始AI响应长度:", aiContent.length)

    let evaluationResult: EvaluationResponse
    try {
      const cleanedContent = cleanJsonResponse(aiContent)
      console.log("✨ [API] JSON清理完成，准备解析")

      try {
        evaluationResult = JSON.parse(cleanedContent)
      } catch (parseError) {
        console.error("❌ [JSON解析] 详细错误信息:", parseError)
        console.error("🔍 [JSON解析] 清理后内容前500字符:", cleanedContent.substring(0, 500))
        console.error(
          "🔍 [JSON解析] 清理后内容后500字符:",
          cleanedContent.substring(Math.max(0, cleanedContent.length - 500)),
        )

        // Try to identify the problematic character position
        if (parseError instanceof SyntaxError && parseError.message.includes("position")) {
          const match = parseError.message.match(/position (\d+)/)
          if (match) {
            const position = Number.parseInt(match[1])
            const context = cleanedContent.substring(Math.max(0, position - 50), position + 50)
            console.error("🎯 [JSON解析] 错误位置上下文:", context)
          }
        }

        throw parseError
      }

      console.log("✅ [API] 增强版评估解析成功:", {
        overallScore: evaluationResult.overallScore,
        rating: evaluationResult.rating,
        highlightsCount: evaluationResult.highlights?.length,
      })
    } catch (parseError) {
      console.error("❌ [API] JSON解析失败:", parseError)
      throw new Error("Invalid AI response format")
    }

    return NextResponse.json(evaluationResult)
  } catch (error) {
    console.error("💥 [API] 增强版评估API错误:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: errorMessage,
        message: "AI评估服务暂时不可用，请稍后再试",
      },
      { status: 500 },
    )
  }
}
