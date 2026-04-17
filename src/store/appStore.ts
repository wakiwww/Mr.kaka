import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AIRecommendation } from '@/types'
import type { AIResponse } from '@/services/aiService'

export const useAppStore = defineStore('app', () => {
  // State
  const userInput = ref('')
  const recommendation = ref<AIRecommendation | null>(null)
  const aiResponse = ref<AIResponse | null>(null)  // 完整的AI响应（含对话/预约等）
  const highlightedZoneId = ref<string | null>(null)
  const selectedZoneId = ref<string | null>(null)
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const socketConnected = ref(false)

  // Actions
  function setUserInput(input: string) {
    userInput.value = input
  }

  function setSocketStatus(connected: boolean) {
    socketConnected.value = connected
  }

  function setStreaming(streaming: boolean) {
    isStreaming.value = streaming
  }

  function setRecommendation(rec: AIRecommendation | null) {
    recommendation.value = rec
    if (rec) {
      highlightedZoneId.value = rec.zoneId
    }
  }

  function setAIResponse(response: AIResponse | null) {
    aiResponse.value = response
    if (response?.recommendation) {
      recommendation.value = response.recommendation
      highlightedZoneId.value = response.recommendation.zoneId
    } else {
      recommendation.value = null
    }
  }

  /**
   * 追加流式内容
   */
  function appendAIContent(chunk: string) {
    if (!aiResponse.value) {
      aiResponse.value = { content: '', type: 'chat' }
    }
    aiResponse.value.content += chunk
  }

  function setHighlightedZone(zoneId: string | null) {
    highlightedZoneId.value = zoneId
  }

  function setSelectedZone(zoneId: string | null) {
    selectedZoneId.value = zoneId
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function reset() {
    userInput.value = ''
    recommendation.value = null
    aiResponse.value = null
    highlightedZoneId.value = null
    selectedZoneId.value = null
    isLoading.value = false
    isStreaming.value = false
  }

  return {
    userInput,
    recommendation,
    aiResponse,
    highlightedZoneId,
    selectedZoneId,
    isLoading,
    isStreaming,
    socketConnected,
    setUserInput,
    setSocketStatus,
    setStreaming,
    setRecommendation,
    setAIResponse,
    appendAIContent,
    setHighlightedZone,
    setSelectedZone,
    setLoading,
    reset,
  }
})