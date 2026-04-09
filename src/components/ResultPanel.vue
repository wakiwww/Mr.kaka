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
      <a-alert
        v-if="aiResponse && aiResponse.type !== 'recommendation'"
        :message="getResponseTitle(aiResponse.type)"
        :description="aiResponse.content"
        :type="getAlertType(aiResponse.type)"
        show-icon
        closable
        class="response-alert"
      />
      
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
import type { AIResponse } from '@/services/aiService'

const store = useAppStore()
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const aiResponse = computed(() => store.aiResponse)
const recommendation = computed(() => store.recommendation)
const isLoading = computed(() => store.isLoading)
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