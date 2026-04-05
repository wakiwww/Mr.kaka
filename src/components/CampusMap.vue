<template>
  <div class="campus-map">
    <h2 class="map-title">🗺️ 校园地图</h2>
    <p class="map-desc">点击区域查看详情，推荐区域会高亮显示</p>
    
    <div class="map-container">
      <svg viewBox="0 0 600 420" class="map-svg">
        <!-- 背景网格 -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eee" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="600" height="420" fill="url(#grid)" />
        
        <!-- 渲染所有区域 -->
        <g v-for="zone in zones" :key="zone.id">
          <rect
            :x="zone.position.x"
            :y="zone.position.y"
            :width="zone.position.width"
            :height="zone.position.height"
            :fill="getZoneFill(zone.id)"
            :stroke="getZoneStroke(zone.id)"
            stroke-width="3"
            rx="8"
            class="zone-rect"
            @click="handleZoneClick(zone.id)"
            @mouseenter="handleZoneHover(zone.id)"
            @mouseleave="handleZoneLeave"
          />
          <text
            :x="zone.position.x + zone.position.width / 2"
            :y="zone.position.y + zone.position.height / 2"
            text-anchor="middle"
            dominant-baseline="middle"
            class="zone-label"
            :fill="selectedZoneId === zone.id ? '#fff' : '#333'"
          >
            {{ zone.name }}
          </text>
          <text
            :x="zone.position.x + zone.position.width / 2"
            :y="zone.position.y + zone.position.height / 2 + 20"
            text-anchor="middle"
            dominant-baseline="middle"
            class="zone-capacity"
            :fill="selectedZoneId === zone.id ? '#fff' : '#666'"
          >
            {{ zone.totalCapacity }}座
          </text>
        </g>
      </svg>
    </div>
    
    <!-- 图例 -->
    <div class="legend">
      <div v-for="zone in zones" :key="zone.id" class="legend-item">
        <span class="legend-dot" :style="{ backgroundColor: zone.color }"></span>
        <span>{{ zone.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/appStore'
import { campusZones } from '@/data/campusZones'

const store = useAppStore()

const zones = campusZones
const highlightedZoneId = computed(() => store.highlightedZoneId)
const selectedZoneId = computed(() => store.selectedZoneId)

function getZoneFill(zoneId: string): string {
  const zone = campusZones.find(z => z.id === zoneId)
  if (selectedZoneId.value === zoneId) {
    return zone?.color || '#ccc'
  }
  if (highlightedZoneId.value === zoneId) {
    return '#fff7e6'
  }
  return '#fafafa'
}

function getZoneStroke(zoneId: string): string {
  if (selectedZoneId.value === zoneId) {
    return '#000'
  }
  if (highlightedZoneId.value === zoneId) {
    return '#faad14'
  }
  return '#ddd'
}

function handleZoneClick(zoneId: string) {
  store.setSelectedZone(zoneId === selectedZoneId.value ? null : zoneId)
}

function handleZoneHover(zoneId: string) {
  if (!highlightedZoneId.value) {
    store.setHighlightedZone(zoneId)
  }
}

function handleZoneLeave() {
  if (!highlightedZoneId.value) {
    store.setHighlightedZone(null)
  }
}
</script>

<style scoped>
.campus-map {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 4px 0;
}

.map-desc {
  color: #666;
  font-size: 13px;
  margin: 0 0 12px 0;
}

.map-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.map-svg {
  width: 100%;
  max-width: 600px;
  height: auto;
}

.zone-rect {
  cursor: pointer;
  transition: all 0.3s ease;
}

.zone-rect:hover {
  filter: brightness(0.95);
}

.zone-label {
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
}

.zone-capacity {
  font-size: 12px;
  pointer-events: none;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>