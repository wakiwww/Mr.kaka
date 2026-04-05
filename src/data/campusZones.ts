import type { Zone } from '@/types'

export const campusZones: Zone[] = [
  {
    id: 'teaching-a',
    name: '教学楼A区',
    color: '#1890ff',
    position: { x: 20, y: 20, width: 180, height: 200 },
    equipment: ['投影仪', '空调', '黑板'],
    totalCapacity: 500,
    classrooms: [
      { id: 'a101', name: 'A101', capacity: 60, equipment: ['投影仪', '空调', '黑板'], building: 'A栋', floor: 1 },
      { id: 'a102', name: 'A102', capacity: 80, equipment: ['投影仪', '空调', '黑板', '音响'], building: 'A栋', floor: 1 },
      { id: 'a201', name: 'A201', capacity: 50, equipment: ['投影仪', '空调'], building: 'A栋', floor: 2 },
      { id: 'a202', name: 'A202', capacity: 120, equipment: ['投影仪', '空调', '黑板', '麦克风'], building: 'A栋', floor: 2 },
      { id: 'a301', name: 'A301', capacity: 40, equipment: ['投影仪', '空调'], building: 'A栋', floor: 3 },
    ],
  },
  {
    id: 'teaching-b',
    name: '教学楼B区',
    color: '#52c41a',
    position: { x: 220, y: 20, width: 180, height: 200 },
    equipment: ['电脑', '实验台', '通风柜', '投影仪'],
    totalCapacity: 300,
    classrooms: [
      { id: 'b101', name: 'B101 计算机室', capacity: 50, equipment: ['电脑', '投影仪', '空调'], building: 'B栋', floor: 1 },
      { id: 'b102', name: 'B102 物理实验室', capacity: 40, equipment: ['实验台', '通风柜', '投影仪'], building: 'B栋', floor: 1 },
      { id: 'b201', name: 'B201 化学实验室', capacity: 35, equipment: ['实验台', '通风柜', '安全设备'], building: 'B栋', floor: 2 },
      { id: 'b202', name: 'B202 生物实验室', capacity: 40, equipment: ['显微镜', '实验台', '投影仪'], building: 'B栋', floor: 2 },
    ],
  },
  {
    id: 'library',
    name: '图书馆',
    color: '#722ed1',
    position: { x: 20, y: 240, width: 180, height: 160 },
    equipment: ['书架', '阅览桌', '自助借还机'],
    totalCapacity: 200,
    classrooms: [
      { id: 'l101', name: '自习室101', capacity: 60, equipment: ['阅览桌', '台灯', '插座'], building: '图书馆', floor: 1 },
      { id: 'l201', name: '研讨室201', capacity: 15, equipment: ['白板', '投影仪', '会议桌'], building: '图书馆', floor: 2 },
      { id: 'l202', name: '研讨室202', capacity: 10, equipment: ['白板', '投影仪'], building: '图书馆', floor: 2 },
      { id: 'l301', name: '电子阅览室', capacity: 40, equipment: ['电脑', '数据库终端'], building: '图书馆', floor: 3 },
    ],
  },
  {
    id: 'activity-center',
    name: '活动中心',
    color: '#fa8c16',
    position: { x: 220, y: 240, width: 180, height: 160 },
    equipment: ['舞台', '音响', '灯光', '投影仪'],
    totalCapacity: 400,
    classrooms: [
      { id: 'ac101', name: '大礼堂', capacity: 300, equipment: ['舞台', '音响', '灯光', '投影幕布'], building: '活动中心', floor: 1 },
      { id: 'ac201', name: '舞蹈室', capacity: 30, equipment: ['镜子', '把杆', '音响'], building: '活动中心', floor: 2 },
      { id: 'ac202', name: '音乐室', capacity: 25, equipment: ['钢琴', '音响', '隔音'], building: '活动中心', floor: 2 },
    ],
  },
  {
    id: 'gym',
    name: '体育馆',
    color: '#eb2f96',
    position: { x: 420, y: 20, width: 160, height: 380 },
    equipment: ['篮球架', '羽毛球网', '健身器材'],
    totalCapacity: 250,
    classrooms: [
      { id: 'g101', name: '主体育馆', capacity: 200, equipment: ['篮球架', '排球网', '记分牌'], building: '体育馆', floor: 1 },
      { id: 'g201', name: '健身房', capacity: 30, equipment: ['跑步机', '哑铃', '健身器材'], building: '体育馆', floor: 2 },
      { id: 'g202', name: '游泳馆', capacity: 50, equipment: ['泳池', '更衣室', '淋浴'], building: '体育馆', floor: 2 },
    ],
  },
]