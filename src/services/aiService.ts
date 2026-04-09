import type { AIRecommendation } from '@/types'
import { campusZones } from '@/data/campusZones'

// ==================== 类型定义 ====================

export type IntentType = 'teacher-booking' | 'daily-chat' | 'classroom-recommend' | 'unknown'

export interface IntentResult {
  intent: IntentType
  confidence: number  // 置信度 0-1
  slots?: Record<string, string>  // 提取的关键信息
}

export interface AIResponse {
  type: 'recommendation' | 'booking' | 'chat' | 'fallback'
  content: string
  recommendation?: AIRecommendation
  metadata?: Record<string, any>
}

// ==================== 意图识别 ====================

// 意图关键词规则
const intentKeywordRules: Record<IntentType, string[]> = {
  'teacher-booking': ['预约', '借用', '申请', '预定', '占用', '排课', '时间表'],
  'daily-chat': ['你好', '谢谢', '再见', '请问', '帮助', '怎么用', '是什么', '为什么', '怎么样'],
  'classroom-recommend': ['教室', '房间', '场地', '空间', '推荐', '找', '需要', '想要', '有没有'],
  'unknown': [],
}

// 区域推荐关键词（仅在教室推荐意图下使用）
const zoneKeywordRules: Record<string, string[]> = {
  'teaching-b': ['实验', '化学', '物理', '生物', '计算机', '编程', '上机', '电脑'],
  'library': ['自习', '研讨', '阅读', '看书', '安静', '论文', '复习'],
  'activity-center': ['演出', '文艺', '舞蹈', '音乐', '汇演', '晚会', '演讲', '大型', '讲座', '公开课'],
  'gym': ['体育', '运动', '篮球', '羽毛球', '游泳', '健身', '锻炼'],
  'teaching-a': ['上课', '教学', '课程', '培训', '考试', '笔试', '普通'],
}

/**
 * 意图识别 - 对应用作流中的"大模型意图识别-1"节点
 * 返回识别出的意图类型和置信度
 */
export function recognizeIntent(userInput: string): IntentResult {
  const input = userInput.toLowerCase().trim()
  if (!input) {
    return { intent: 'unknown', confidence: 0 }
  }

  let bestIntent: IntentType = 'unknown'
  let bestConfidence = 0

  for (const [intent, keywords] of Object.entries(intentKeywordRules) as [IntentType, string[]][]) {
    if (intent === 'unknown') continue

    const matchCount = keywords.filter(kw => input.includes(kw)).length
    const confidence = Math.min(matchCount * 0.25 + 0.2, 1.0)

    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestIntent = intent
    }
  }

  // 如果所有意图置信度都很低，判定为 unknown
  if (bestConfidence < 0.3) {
    return { intent: 'unknown', confidence: bestConfidence }
  }

  // 提取槽位信息（人数、设备等）
  const slots = extractSlots(input)

  return { intent: bestIntent, confidence: bestConfidence, slots }
}

/**
 * 从用户输入中提取关键信息槽位
 */
function extractSlots(input: string): Record<string, string> {
  const slots: Record<string, string> = {}

  // 提取人数
  const peopleMatch = input.match(/(\d+)\s*[人位个]/)
  if (peopleMatch) {
    slots.capacity = peopleMatch[1]
  }

  // 提取楼层
  const floorMatch = input.match(/([一二三四五六七八九十\d]+)\s*楼/)
  if (floorMatch) {
    slots.floor = floorMatch[1]
  }

  // 提取设备需求
  const equipmentKeywords = ['投影', '电脑', '实验', '音响', '空调', '网络']
  const foundEquipment = equipmentKeywords.filter(eq => input.includes(eq))
  if (foundEquipment.length > 0) {
    slots.equipment = foundEquipment.join(',')
  }

  return slots
}

function generateReason(zoneId: string, keywords: string[], zone: typeof campusZones[0]): string {
  const reasons: Record<string, string> = {
    'teaching-a': `该区域拥有${zone.totalCapacity}个座位的常规教室，配备投影仪和空调，适合一般教学活动。`,
    'teaching-b': `检测到"${keywords.join('、')}"相关需求，该区域配备专业实验设备和计算机，完全满足您的要求。`,
    'library': `检测到"${keywords.join('、')}"相关需求，图书馆提供安静的学习环境和研讨空间。`,
    'activity-center': `检测到"${keywords.join('、')}"相关需求，活动中心拥有完善的舞台和音响设备。`,
    'gym': `检测到"${keywords.join('、')}"相关需求，体育馆设施齐全，可满足各类体育活动。`,
  }
  return reasons[zoneId] || '该区域符合您的需求。'
}

// ==================== 主入口：意图路由分发 ====================

/**
 * 主函数 - 对应工作流的完整执行链路：
 *   开始 → 意图识别 → (各意图分支处理) → 返回结果
 */
export async function processUserQuery(userInput: string): Promise<AIResponse> {
  // 模拟AI处理延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  // Step 1: 意图识别
  const intentResult = recognizeIntent(userInput)

  // Step 2: 根据意图路由到不同处理器
  switch (intentResult.intent) {
    case 'classroom-recommend':
      return handleClassroomRecommend(userInput, intentResult)
    case 'teacher-booking':
      return handleTeacherBooking(userInput, intentResult)
    case 'daily-chat':
      return handleDailyChat(userInput, intentResult)
    case 'unknown':
    default:
      return handleFallback(userInput, intentResult)
  }
}

// ==================== 各意图处理器 ====================

/**
 * 教室推荐意图处理
 * 对应工作流：意图识别(教室推荐) → 知识检索 → 区域匹配 → 推荐结果
 */
function handleClassroomRecommend(input: string, intent: IntentResult): AIResponse {
  const matchedKeywords = matchZoneKeywords(input)
  const { zoneId, score } = findBestZone(matchedKeywords)

  const zone = campusZones.find(z => z.id === zoneId)!
  const reason = generateReason(zoneId, matchedKeywords, zone)

  return {
    type: 'recommendation',
    content: reason,
    recommendation: {
      zoneId,
      reason,
      score: Math.round(score * 100),
      suggestedClassrooms: zone.classrooms.map(c => c.id),
    },
    metadata: { intent: intent.intent, confidence: intent.confidence, slots: intent.slots },
  }
}

/**
 * 教师预约意图处理
 * 对应工作流：意图识别(教师预约) → 教室可用性查询 → 预约确认/冲突提示
 */
function handleTeacherBooking(input: string, intent: IntentResult): AIResponse {
  // TODO: 实际项目中这里应调用预约API，检查教室占用情况
  const slots = intent.slots || {}
  let response = '已收到您的预约请求。'

  if (slots.capacity) {
    response += ` 您需要容纳${slots.capacity}人的教室。`
  }
  if (slots.equipment) {
    response += ` 设备需求：${slots.equipment}。`
  }

  response += '\n\n⚠️ 当前为演示模式，实际预约功能需要对接教务系统。'

  return {
    type: 'booking',
    content: response,
    metadata: { intent: intent.intent, confidence: intent.confidence, slots },
  }
}

/**
 * 日常对话意图处理
 * 对应工作流：意图识别(日常对话) → 通用大模型自由回答
 */
function handleDailyChat(input: string, intent: IntentResult): AIResponse {
  const greetings = ['你好', '您好', 'hi', 'hello']
  const thanks = ['谢谢', '感谢', 'thank']
  const help = ['帮助', '怎么用', '如何使用']

  if (greetings.some(g => input.includes(g))) {
    return {
      type: 'chat',
      content: '你好！我是智慧校园调度助手，可以帮您推荐教室、查询场地信息等。请告诉我您的需求~',
      metadata: { intent: intent.intent },
    }
  }

  if (thanks.some(t => input.includes(t))) {
    return {
      type: 'chat',
      content: '不客气！如果还有其他需求，随时告诉我哦 😊',
      metadata: { intent: intent.intent },
    }
  }

  if (help.some(h => input.includes(h))) {
    return {
      type: 'chat',
      content: '我可以帮您：\n1. 🏫 推荐合适的教室（如："我需要一个有电脑的教室"）\n2. 📅 预约教室（如："我想预约一间教室"）\n3. ❓ 回答校园相关问题\n\n请直接描述您的需求即可！',
      metadata: { intent: intent.intent },
    }
  }

  return {
    type: 'chat',
    content: '我理解您的问题了。作为智慧校园调度助手，我主要帮助您推荐教室和管理场地。有什么具体需求可以告诉我~',
    metadata: { intent: intent.intent },
  }
}

/**
 * 未知意图兜底处理
 * 对应工作流：意图识别(其他) → 引导用户明确需求
 */
function handleFallback(input: string, intent: IntentResult): AIResponse {
  return {
    type: 'fallback',
    content: `抱歉，我不太确定您的意思。您可以尝试：\n• 推荐教室："我需要一个有投影仪的教室，大概50人"\n• 预约教室："我想预约一间教室做实验"\n• 日常交流："你好"、"帮助"\n\n请重新描述您的需求~`,
    metadata: { intent: intent.intent, confidence: intent.confidence },
  }
}

// ==================== 工具函数 ====================

/**
 * 匹配用户输入中的区域关键词
 */
function matchZoneKeywords(input: string): string[] {
  const allKeywords = Object.values(zoneKeywordRules).flat()
  return allKeywords.filter(kw => input.includes(kw))
}

/**
 * 根据匹配的关键词找到最佳区域
 */
function findBestZone(matchedKeywords: string[]): { zoneId: string; score: number } {
  let bestZoneId = 'teaching-a'
  let bestScore = 0.3

  for (const [zoneId, keywords] of Object.entries(zoneKeywordRules)) {
    const matchCount = keywords.filter(kw => matchedKeywords.includes(kw)).length
    if (matchCount > 0) {
      const score = 0.3 + matchCount * 0.2
      if (score > bestScore) {
        bestScore = Math.min(score, 1.0)
        bestZoneId = zoneId
      }
    }
  }

  return { zoneId: bestZoneId, score: bestScore }
}

// ==================== 兼容旧接口（向后兼容） ====================

/**
 * 保留旧的 getAIRecommendation 函数以兼容现有调用
 * 内部调用新的 processUserQuery
 */
export async function getAIRecommendation(userInput: string): Promise<AIRecommendation> {
  const response = await processUserQuery(userInput)
  if (response.recommendation) {
    return response.recommendation
  }
  // 如果没有推荐结果，返回默认值
  return {
    zoneId: 'teaching-a',
    reason: response.content,
    score: 50,
    suggestedClassrooms: campusZones.find(z => z.id === 'teaching-a')!.classrooms.map(c => c.id),
  }
}