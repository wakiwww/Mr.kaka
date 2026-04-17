<template>
  <div class="result-panel">
    <h2 class="panel-title">🎯 AI推荐结果</h2>
    
    <!-- 空状态 -->
    <a-empty
      v-if="!aiResponse && !selectedZoneId"
      description="请输入需求并获取AI推荐"
      :image="simpleImage"
    />
    
    <!-- 加载状态 -->
    <div v-else-if="isLoading" class="loading-state">
      <a-spin size="large" tip="AI正在分析您的需求..." />
    </div>
    
    <!-- AI响应结果 -->
    <template v-else>
      <!-- 非推荐类响应（对话、预约、兜底） -->
      <div
        v-if="aiResponse && aiResponse.type !== 'recommendation'"
        class="ai-chat-bubble"
      >
        <div class="bubble-header">
          <div class="bot-icon">🤖</div>
          <span class="bubble-title">{{ getResponseTitle(aiResponse.type) }}</span>
          <div v-if="isStreaming" class="streaming-dot"></div>
        </div>
        <div class="bubble-content">
          <MarkdownRenderer :content="aiResponse.content" />
        </div>
      </div>
      
      <!-- AI推荐卡片 -->
      <a-card v-if="aiResponse?.recommendation" class="recommendation-card" :bordered="true">
        <template #title>
          <div class="card-header">
            <span>✅ 推荐区域</span>
            <a-tag color="blue">{{ recommendation.score }}% 匹配度</a-tag>
          </div>
        </template>
        
        <div class="zone-info">
          <h3>{{ getZoneName(recommendation.zoneId) }}</h3>
          <p class="reason">{{ recommendation.reason }}</p>
        </div>
        
        <!-- 推荐教室列表 -->
        <a-divider orientation="left">推荐教室</a-divider>
        <div class="classroom-list">
          <a-card
            v-for="classroom in recommendedClassrooms"
            :key="classroom.id"
            size="small"
            class="classroom-item"
            hoverable
          >
            <div class="classroom-header">
              <span class="classroom-name">{{ classroom.name }}</span>
              <a-tag color="green">{{ classroom.capacity }}人</a-tag>
            </div>
            <div class="classroom-equipment">
              <a-tag v-for="eq in classroom.equipment" :key="eq" size="small">{{ eq }}</a-tag>
            </div>
          </a-card>
        </div>
      </a-card>
      
      <!-- 点击区域详情 -->
      <a-card v-if="selectedZoneId && !recommendation" class="zone-detail-card" :bordered="true">
        <template #title>
          <div class="card-header">
            <span>📍 {{ getZoneName(selectedZoneId) }}</span>
            <a-button type="link" size="small" @click="store.setSelectedZone(null)">关闭</a-button>
          </div>
        </template>
        
        <div class="zone-stats">
          <a-statistic title="总座位数" :value="selectedZone?.totalCapacity" suffix="座" />
          <a-statistic title="教室数量" :value="selectedZone?.classrooms.length" suffix="间" />
        </div>
        
        <a-divider orientation="left">教室列表</a-divider>
        <div class="classroom-list">
          <a-card
            v-for="classroom in selectedZone?.classrooms"
            :key="classroom.id"
            size="small"
            class="classroom-item"
          >
            <div class="classroom-header">
              <span class="classroom-name">{{ classroom.name }}</span>
              <a-tag color="green">{{ classroom.capacity }}人</a-tag>
            </div>
            <div class="classroom-location">
              {{ classroom.building }} · {{ classroom.floor }}楼
            </div>
            <div class="classroom-equipment">
              <a-tag v-for="eq in classroom.equipment" :key="eq" size="small">{{ eq }}</a-tag>
            </div>
          </a-card>
        </div>
      </a-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Empty } from 'ant-design-vue'
import { useAppStore } from '@/store/appStore'
import { campusZones } from '@/data/campusZones'
import MarkdownRenderer from './MarkdownRenderer.vue'

const store = useAppStore()
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const aiResponse = computed(() => store.aiResponse)
const recommendation = computed(() => store.recommendation)
const isLoading = computed(() => store.isLoading)
const isStreaming = computed(() => store.isStreaming)
const selectedZoneId = computed(() => store.selectedZoneId)

const selectedZone = computed(() => {
  if (!selectedZoneId.value) return null
  return campusZones.find(z => z.id === selectedZoneId.value) || null
})

const recommendedClassrooms = computed(() => {
  if (!recommendation.value || !selectedZone.value) return []
  return selectedZone.value.classrooms.filter(c =>
    recommendation.value!.suggestedClassrooms.includes(c.id)
  )
})

function getZoneName(zoneId: string): string {
  return campusZones.find(z => z.id === zoneId)?.name || zoneId
}

function getResponseTitle(type: AIResponse['type']): string {
  const titles: Record<AIResponse['type'], string> = {
    recommendation: '✅ 推荐结果',
    booking: '📅 预约请求',
    chat: '💬 对话回复',
    fallback: '❓ 需要更多信息',
  }
  return titles[type] || 'AI 回复'
}

function getAlertType(type: AIResponse['type']): 'success' | 'info' | 'warning' {
  switch (type) {
    case 'booking': return 'info'
    case 'chat': return 'success'
    case 'fallback': return 'warning'
    default: return 'info'
  }
}
</script>

<style scoped>
.result-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.ai-chat-bubble {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #edf2f7;
}

.bot-icon {
  font-size: 20px;
}

.bubble-title {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.streaming-dot {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.3; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.2); }
}

.bubble-content {
  color: #2d3748;
}

.response-alert {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.zone-info h3 {
  margin: 0 0 8px 0;
  color: #1890ff;
}

.reason {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.classroom-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.classroom-item {
  transition: all 0.2s;
}

.classroom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.classroom-name {
  font-weight: 600;
  color: #333;
}

.classroom-location {
  color: #999;
  font-size: 12px;
  margin-bottom: 6px;
}

.classroom-equipment {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.zone-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}
</style>