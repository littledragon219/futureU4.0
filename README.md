# FutureU AI Interview Coach

一个基于AI的面试训练平台，帮助用户提升面试技能。

## 功能特性

- **多模块面试训练**: HR面试、专业面试、终面三个模块
- **AI智能评分**: 使用DeepSeek V3模型进行专业评估
- **实时反馈**: 提供详细的优点分析和改进建议
- **关键要点覆盖**: 分析回答对关键知识点的覆盖情况
- **个性化建议**: 基于具体回答内容提供可操作的改进方案

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI组件**: Shadcn/ui
- **AI服务**: DeepSeek V3 API
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd futureu-interview-coach
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
# 或
yarn install
\`\`\`

### 3. 环境配置

复制环境变量模板文件：

\`\`\`bash
cp .env.example .env.local
\`\`\`

在 `.env.local` 文件中配置必要的环境变量：

\`\`\`env
# DeepSeek AI API密钥 (必需)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
\`\`\`

#### 获取DeepSeek API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册账号并登录
3. 前往 [API密钥页面](https://platform.deepseek.com/api_keys)
4. 创建新的API密钥
5. 将密钥复制到 `.env.local` 文件中

### 4. 启动开发服务器

\`\`\`bash
npm run dev
# 或
yarn dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

\`\`\`
├── app/
│   ├── api/
│   │   └── evaluate-answer/     # AI评估API路由
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页面
├── components/
│   └── ui/                      # UI组件库
├── lib/
│   ├── ai-service.ts            # AI服务封装
│   └── utils.ts                 # 工具函数
├── interview-practice.tsx       # 面试练习组件
├── landing-page.tsx            # 首页组件
└── interview-modules.tsx       # 模块选择组件
\`\`\`

## API说明

### POST /api/evaluate-answer

评估用户的面试回答。

**请求体:**

\`\`\`json
{
  "questionId": 1,
  "question": "面试问题内容",
  "userAnswer": "用户的回答",
  "keyPoints": ["关键要点1", "关键要点2"],
  "category": "问题类别",
  "difficulty": "难度等级"
}
\`\`\`

**响应:**

\`\`\`json
{
  "score": 85,
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"],
  "coverageAnalysis": [
    {
      "point": "关键要点1",
      "covered": true,
      "score": 90
    }
  ],
  "detailedScore": {
    "content": 34,
    "logic": 26,
    "expression": 25
  }
}
\`\`\`

## 部署

### Vercel部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 在Vercel项目设置中添加环境变量：
   - `DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
4. 部署完成

### 环境变量配置

在生产环境中，确保设置以下环境变量：

- `DEEPSEEK_API_KEY`: DeepSeek AI API密钥（必需）

## 开发说明

### 添加新的面试问题

在 `interview-practice.tsx` 文件中的 `questionBank` 对象中添加新问题：

\`\`\`typescript
{
  id: 5,
  question: "你的问题内容",
  category: "问题类别",
  difficulty: "基础|进阶|高级",
  keyPoints: ["关键要点1", "关键要点2"],
  standardAnswer: "参考答案说明",
  timeLimit: 180 // 秒
}
\`\`\`

### 自定义AI评估逻辑

修改 `lib/ai-service.ts` 中的 `buildPrompt` 方法来调整AI评估的提示词和评分标准。

## 故障排除

### 常见问题

1. **AI评估失败**
   - 检查 `DEEPSEEK_API_KEY` 是否正确配置
   - 确认API密钥有效且有足够的配额
   - 查看浏览器控制台和服务器日志

2. **环境变量未生效**
   - 确保 `.env.local` 文件在项目根目录
   - 重启开发服务器
   - 检查变量名是否正确

3. **部署问题**
   - 确认在部署平台正确设置了环境变量
   - 检查构建日志中的错误信息

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License
