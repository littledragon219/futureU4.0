import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { stageType, questions, answers, stageTitle, questionSetIndex, async } = await request.json()

    console.log("🎯 [API] 收到套题评估请求:", {
      stageType,
      stageTitle,
      questionSetIndex,
      questionCount: questions?.length,
      answerCount: answers?.length,
      asyncMode: async,
    })

    if (async) {
      // 生成评估ID
      const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 异步处理评估（实际项目中可以使用队列系统）
      setTimeout(async () => {
        try {
          await processEvaluation(stageType, questions, answers, stageTitle, questionSetIndex, evaluationId)
          console.log("✅ [API] 异步评估完成:", evaluationId)
          // 这里可以发送通知给用户
        } catch (error) {
          console.error("💥 [API] 异步评估失败:", evaluationId, error)
        }
      }, 0)

      return NextResponse.json({
        evaluationId,
        message: "评估已启动，结果将异步生成",
        status: "processing",
      })
    }

    // 同步评估模式（保持向后兼容）
    const result = await processEvaluation(stageType, questions, answers, stageTitle, questionSetIndex)
    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 [API] 套题评估错误:", error)

    return NextResponse.json(
      {
        error: "套题评估失败",
        message: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}

async function processEvaluation(
  stageType: string,
  questions: string[],
  answers: string[],
  stageTitle: string,
  questionSetIndex: number,
  evaluationId?: string,
) {
  const evaluationPrompt = `
你是一位专业的AI产品经理面试官，请用友好但直接的方式对候选人进行评估。

## 评估原则
- 明确说明评分依据和改进方向
- 用具体的例子和量化标准指导改进
- 保持专业性，避免过度调侃
- 重点关注实际能力和成长潜力

## 题目信息
套题标题: ${stageTitle}
面试模块: ${stageType}
题目组: 第${questionSetIndex}组
题目数量: ${questions.length}

## 题目与回答
${questions
  .map(
    (q: string, i: number) => `
题目${i + 1}: ${q}
回答${i + 1}: ${answers[i] || "未回答"}
`,
  )
  .join("\n")}

## 分阶段评估标准

### HR面试评估重点：
- **自我认知与表达（25%）**：能否清晰阐述职业动机，展现对AI PM角色的理解
- **沟通协作能力（30%）**：跨职能团队协调能力，冲突解决经验
- **适应性与学习力（25%）**：面对变化的应对策略，持续学习意识
- **价值观匹配度（20%）**：用户至上理念，AI伦理意识

评估要点：
- 是否有具体的项目案例和量化数据
- 能否体现AI产品经理的独特思维
- 表达是否清晰有逻辑

### 专业面试评估重点：
- **技术理解深度（35%）**：对AI技术原理、应用场景的掌握程度
- **产品设计思维（30%）**：AI产品设计能力，用户体验与技术平衡
- **商业化能力（25%）**：技术价值转化，ROI评估能力
- **风险控制意识（10%）**：AI伦理、模型风险的理解和应对

评估要点：
- 技术概念是否准确，能否转化为商业价值
- 产品设计是否考虑了AI特性
- 是否有实际的产品化经验

### 终面评估重点：
- **战略思维高度（40%）**：行业趋势判断，长期规划能力
- **商业模式设计（30%）**：定价策略，市场分析能力
- **复杂问题解决（20%）**：多维度权衡，系统性分析
- **领导力潜质（10%）**：决策能力，团队影响力

评估要点：
- 战略分析是否有数据支撑
- 商业思维是否成熟
- 能否处理复杂的业务场景

## 反馈风格要求
1. **总结部分**：用简洁的比喻说明当前水平，重点说明为什么得到这个评价
2. **优势分析**：具体指出表现好的地方，用实例说明
3. **改进建议**：直接指出需要改进的地方，提供具体的行动建议
4. **下一步行动**：给出明确的学习和提升路径

## 请严格按照以下JSON格式返回：

{
  "performanceLevel": "优秀表现",
  "summary": "简洁说明当前表现水平和评分依据，可以用适度的比喻但要直接明了，2-3句话",
  "strengths": [
    {
      "area": "具体优势领域",
      "description": "具体描述表现好的地方，说明为什么这样评价"
    }
  ],
  "improvements": [
    {
      "area": "改进领域", 
      "suggestion": "直接的改进建议，要具体可操作",
      "example": "举例说明具体怎么表达更好，包含具体的数据或案例要求"
    }
  ],
  "nextSteps": [
    {
      "focus": "重点关注领域",
      "actionable": "具体可执行的行动建议，包含时间节点和量化目标"
    }
  ],
  "encouragement": "鼓励性结语，要让人感到被理解和支持，指明成长方向"
}

## 评估要求
1. 每个建议都要具体可操作，包含量化标准
2. 明确说明评分依据，让用户理解为什么得到这个评价
3. 保持专业友好的语调，避免过度调侃
4. performanceLevel只能是："优秀表现"、"良好表现"、"有待提升"之一
5. 确保JSON格式正确，所有字符串值用双引号包围
6. 重点关注实际能力和成长潜力，提供建设性反馈

请提供专业、直接、有建设性的评估反馈。
`

  try {
    const aiResponse = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content:
              "你是一位专业友好的AI产品经理面试官。请严格按照要求的JSON格式返回评估结果，确保JSON语法完全正确。重点说明评分依据，提供具体可操作的改进建议，保持专业但友好的语调。",
          },
          {
            role: "user",
            content: evaluationPrompt,
          },
        ],
        temperature: 0.5, // 降低温度值，提高输出稳定性
        max_tokens: 3000,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI服务响应错误: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const evaluationText = aiResult.choices[0]?.message?.content

    if (!evaluationText) {
      throw new Error("AI服务返回空结果")
    }

    console.log("🤖 [API] AI原始评估结果:", evaluationText.substring(0, 200) + "...")

    let evaluationResult
    try {
      // 策略1: 直接解析（如果AI返回的就是纯JSON）
      evaluationResult = JSON.parse(evaluationText.trim())
    } catch (directParseError) {
      try {
        // 策略2: 提取JSON部分
        const jsonMatch = evaluationText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          let jsonStr = jsonMatch[0]
          // 清理常见的JSON格式问题
          jsonStr = jsonStr
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 移除控制字符
            .replace(/,(\s*[}\]])/g, "$1") // 移除多余的逗号
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 确保属性名有引号

          evaluationResult = JSON.parse(jsonStr)
        } else {
          throw new Error("无法从AI响应中提取JSON")
        }
      } catch (extractParseError) {
        // 策略3: 使用备用评估结果
        console.error("💥 [API] JSON解析失败，使用备用评估:", extractParseError)
        evaluationResult = createFallbackEvaluation(stageType, answers)
      }
    }

    if (!evaluationResult.performanceLevel || !evaluationResult.summary) {
      console.warn("⚠️ [API] 评估结果缺少必要字段，使用备用评估")
      evaluationResult = createFallbackEvaluation(stageType, answers)
    }

    console.log("✅ [API] 套题评估成功:", {
      evaluationId: evaluationId || "sync",
      performanceLevel: evaluationResult.performanceLevel,
      strengthsCount: evaluationResult.strengths?.length,
      improvementsCount: evaluationResult.improvements?.length,
    })

    return evaluationResult
  } catch (error) {
    console.error("💥 [API] 评估过程出错:", error)
    return createFallbackEvaluation(stageType, answers)
  }
}

function createFallbackEvaluation(stageType: string, answers: string[]) {
  const hasAnswers = answers.some((answer) => answer && answer.trim().length > 0)

  const stageSpecificFeedback = {
    hr: {
      summary:
        "你的回答有一定的逻辑性，但还需要更多具体的案例和数据来支撑。目前的表达更像是在描述工作内容，而不是展现你的决策思维和影响力。",
      improvements: [
        {
          area: "具体案例补充",
          suggestion:
            "每个回答都要包含具体的项目案例，用STAR框架（情境-任务-行动-结果）来组织，重点说明你的决策过程和量化结果。",
          example:
            "比如：'在某AI客服项目中，面对用户满意度只有3.2分的问题，我通过数据分析发现是响应准确率低，主导引入RAG技术，最终将满意度提升到4.6分，响应准确率从78%提升到94%'",
        },
        {
          area: "AI产品思维体现",
          suggestion: "要体现AI产品经理的独特价值，展现你对AI技术特性的理解和产品化能力。",
          example:
            "在描述项目时，要说明AI技术如何解决具体问题，比如'通过多模态AI让用户可以语音+图片描述问题，问题解决时间从8分钟缩短到2分钟'",
        },
      ],
    },
    professional: {
      summary:
        "你对技术概念有基本了解，但在技术与商业价值的转化上还需要加强。需要更多实际的产品化经验和量化的业务影响。",
      improvements: [
        {
          area: "技术商业化转化",
          suggestion: "在讨论技术时，要明确说明技术选择的商业考量和实际效果，用数据证明价值。",
          example:
            "不要只说'使用了RAG技术'，要说'选择RAG而不是微调是因为成本考虑，RAG方案节省了60%的算力成本，同时将响应准确率提升到92%，预计年节省运营成本50万'",
        },
        {
          area: "产品设计深度",
          suggestion: "要展现完整的产品设计思维，从用户需求到技术实现到商业价值的全链路思考。",
          example:
            "描述产品设计时要包含：用户痛点分析、技术方案选择、用户体验设计、商业模式考虑等完整链路，并用具体数据验证效果",
        },
      ],
    },
    final: {
      summary:
        "你有一定的行业认知，但在战略思维的深度和执行路径的具体性上还需要提升。需要更多数据支撑的分析和可执行的商业计划。",
      improvements: [
        {
          area: "战略分析深度",
          suggestion: "战略判断要有数据支撑，要说明分析的方法论和信息来源，避免空泛的趋势描述。",
          example:
            "不要只说'AI Agent有前景'，要说'基于对50家企业的调研，发现80%的公司在客服自动化上有需求，预计市场规模100亿，我们可以从金融行业切入，目标获得15%市场份额'",
        },
        {
          area: "商业模式设计",
          suggestion: "要展现完整的商业思维，包括市场分析、竞争策略、盈利模式等，并有具体的执行计划。",
          example:
            "描述商业策略时要包含：目标市场规模、竞争对手分析、差异化优势、定价策略、获客成本、盈利预期等具体要素",
        },
      ],
    },
  }

  const stageFeedback =
    stageSpecificFeedback[stageType as keyof typeof stageSpecificFeedback] || stageSpecificFeedback.hr

  return {
    performanceLevel: hasAnswers ? "良好表现" : "有待提升",
    summary: hasAnswers
      ? stageFeedback.summary
      : "你还没有完成回答，建议先完整回答所有问题。每个回答都要包含具体的案例、数据和你的思考过程，这样才能准确评估你的能力水平。",
    strengths: hasAnswers
      ? [
          {
            area: "基础理解",
            description: "对问题有基本的理解，回答有一定的逻辑性，这是一个好的开始",
          },
          {
            area: "学习态度",
            description: "愿意参与面试练习，展现了积极的学习态度和自我提升意识",
          },
        ]
      : [
          {
            area: "学习意愿",
            description: "主动进行面试练习，这是成长的重要第一步",
          },
        ],
    improvements: hasAnswers
      ? stageFeedback.improvements
      : [
          {
            area: "回答完整性",
            suggestion: "建议用STAR框架来组织回答，确保每个回答都包含具体的情境、任务、行动和结果。",
            example:
              "比如：'在某个项目中（情境），我需要解决什么问题（任务），我采取了什么行动（行动），最终达到了什么效果（结果），包含具体的数据和影响'",
          },
        ],
    nextSteps: [
      {
        focus: "案例准备",
        actionable:
          "准备3-5个完整的项目案例，每个案例都要包含背景、挑战、解决方案、结果和反思，重点突出你的决策过程和量化影响",
      },
      {
        focus: "技能提升",
        actionable:
          "深入学习AI产品相关知识，包括技术原理、产品设计、商业模式等，建议每周研究一个AI产品案例，形成自己的分析框架",
      },
    ],
    encouragement:
      "你已经迈出了重要的第一步！AI产品经理需要在技术理解、产品思维和商业洞察之间找到平衡。通过持续的学习和实践，相信你能够不断提升。记住，每个优秀的AI产品经理都是从第一次面试开始成长的。",
  }
}
