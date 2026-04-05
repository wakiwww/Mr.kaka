import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AIRecommendation } from '@/types'

export const useAppStore = defineStore('app', () => {
  // State
  const userInput = ref('')
  const recommendation = ref<AIRecommendation | null>(null)
  const highlightedZoneId = ref<string | null>(null)
  const selectedZoneId = ref<string | null>(null)
  const isLoading = ref(false)

  // Actions
  function setUserInput(input: string) {
    userInput.value = input
  }

  function setRecommendation(rec: AIRecommendation | null) {
    recommendation.value = rec
    if (rec) {
      highlightedZoneId.value = rec.zoneId
    }
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
    highlightedZoneId.value = null
    selectedZoneId.value = null
    isLoading.value = false
  }

  return {
    userInput,
    recommendation,
    highlightedZoneId,
    selectedZoneId,
    isLoading,
    setUserInput,
    setRecommendation,
    setHighlightedZone,
    setSelectedZone,
    setLoading,
    reset,
  }
})