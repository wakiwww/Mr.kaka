import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIRecommendation, AIResponse, Booking, Zone, Classroom, ChatMessage } from '@/types'
import { campusZones as initialZones } from '@/data/campusZones'

export const useAppStore = defineStore('app', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const highlightedZoneId = ref<string | null>(null)
  const selectedZoneId = ref<string | null>(null)
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const socketConnected = ref(false)
  
  // 视图模式 ('map' | 'overview')
  const currentView = ref<'map' | 'overview' | 'test'>('map')
  
  // 教室数据与预约记录
  const zones = ref<Zone[]>(initialZones)
  const bookings = ref<Booking[]>([])

  // Getters
  const selectedZone = computed(() => 
    zones.value.find(z => z.id === selectedZoneId.value) || null
  )

  const allClassrooms = computed(() => {
    return zones.value.flatMap(z => z.classrooms)
  })

  // Actions
  function toggleView(view: 'map' | 'overview' | 'test') {
    currentView.value = view
  }

  function setSocketStatus(connected: boolean) {
    socketConnected.value = connected
  }

  /**
   * 添加用户消息
   */
  function addUserMessage(content: string) {
    messages.value.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString(),
    })
  }

  /**
   * 添加正在流式输出的 AI 消息占位
   */
  function addAIStreamingPlaceholder() {
    messages.value.push({
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
      type: 'chat'
    })
  }

  /**
   * 追加流式内容到最新的 AI 消息
   */
  function appendAIContent(chunk: string) {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'ai') {
      lastMsg.content += chunk
      // 智能提取: 如果文字中包含教室编号，自动高亮对应区域
      matchRoomInText(lastMsg.content)
    }
  }

  /**
   * 停止流式输出状态
   */
  function stopStreaming() {
    isStreaming.value = false
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'ai') {
      lastMsg.isStreaming = false
    }
  }

  function matchRoomInText(text: string) {
    for (const zone of zones.value) {
      for (const room of zone.classrooms) {
        if (text.toLowerCase().includes(room.id.toLowerCase())) {
          highlightedZoneId.value = zone.id
          return
        }
      }
    }
  }

  function setHighlightedZone(id: string | null) {
    highlightedZoneId.value = id
  }

  function setSelectedZone(id: string | null) {
    selectedZoneId.value = id
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setStreaming(streaming: boolean) {
    isStreaming.value = streaming
  }

  // 预约逻辑
  function addBooking(roomId: string, user: string = '当前用户') {
    const room = allClassrooms.value.find(r => r.id === roomId)
    if (!room || room.status !== 'available') return false

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      roomId,
      roomName: room.name,
      user,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'confirmed'
    }

    bookings.value.push(newBooking)
    
    // 更新教室状态
    zones.value.forEach(z => {
      z.classrooms.forEach(r => {
        if (r.id === roomId) r.status = 'booked'
      })
    })

    return true
  }

  return {
    messages,
    highlightedZoneId,
    selectedZoneId,
    selectedZone,
    isLoading,
    isStreaming,
    socketConnected,
    currentView,
    zones,
    bookings,
    allClassrooms,
    addUserMessage,
    addAIStreamingPlaceholder,
    appendAIContent,
    stopStreaming,
    setSocketStatus,
    setHighlightedZone,
    setSelectedZone,
    setLoading,
    setStreaming,
    toggleView,
    addBooking
  }
})