import type { AIRecommendation } from '@/types'
import { campusZones } from '@/data/campusZones'

// 关键词到区域的映射规则
const keywordRules: Record<string, string[]> = {
  'teaching-b': ['实验', '化学', '物理', '生物', '计算机', '编程', '上机', '电脑'],
  'library': ['自习', '研讨', '阅读', '看书', '安静', '论文', '复习'],
  'activity-center': ['演出', '文艺', '舞蹈', '音乐', '汇演', '晚会', '演讲', '大型', '讲座', '公开课'],
  'gym': ['体育', '运动', '篮球', '羽毛球', '游泳', '健身', '锻炼'],
  'teaching-a': ['上课', '教学', '课程', '培训', '考试', '笔试', '普通'],
}

export async function getAIRecommendation(userInput: string): Promise<AIRecommendation> {
  // 模拟AI接口调用延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const input = userInput.toLowerCase()
  let bestZoneId = 'teaching-a'
  let bestScore = 0.5
  let matchedKeywords: string[] = []
  
  // 遍历所有区域规则，找到最佳匹配
  for (const [zoneId, keywords] of Object.entries(keywordRules)) {
    const score = keywords.reduce((acc, kw) => {
      if (input.includes(kw)) {
        matchedKeywords.push(kw)
        return acc + 0.2
      }
      return acc
    }, 0.3) // 基础分数
    
    if (score > bestScore) {
      bestScore = Math.min(score, 1.0)
      bestZoneId = zoneId
    }
  }
  
  // 获取推荐区域内的教室
  const zone = campusZones.find(z => z.id === bestZoneId)!
  const suggestedClassrooms = zone.classrooms.map(c => c.id)
  
  // 生成推荐理由
  const reason = generateReason(bestZoneId, matchedKeywords, zone)
  
  return {
    zoneId: bestZoneId,
    reason,
    score: Math.round(bestScore * 100),
    suggestedClassrooms,
  }
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