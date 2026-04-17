<template>
  <div class="campus-map">
    <h2 class="map-title">🗺️ 校园地图</h2>
    <p class="map-desc">点击区域查看详情，推荐区域会高亮显示</p>
    
    <div class="map-container">
      <svg viewBox="0 0 720 780" class="map-svg" @click="clearSelection">
        <!-- 辅助网格 -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="720" height="780" fill="url(#grid)" />
        
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
            @click.stop="handleZoneClick(zone.id)"
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
            @click.stop="handleZoneClick(zone.id)"
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
            @click.stop="handleZoneClick(zone.id)"
          >
            {{ zone.totalCapacity }}座
          </text>
        </g>
      </svg>
    </div>
    
    <!-- 侧边详情抽屉 -->
    <ZoneDetailDrawer />

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
import ZoneDetailDrawer from './ZoneDetailDrawer.vue'

const store = useAppStore()

const zones = campusZones
const highlightedZoneId = computed(() => store.highlightedZoneId)
const selectedZoneId = computed(() => store.selectedZoneId)

function getZoneFill(zoneId: string): string {
  if (selectedZoneId.value === zoneId) {
    return '#000000'
  }
  if (highlightedZoneId.value === zoneId) {
    return '#f0f0f0'
  }
  return '#ffffff'
}

function getZoneStroke(zoneId: string): string {
  if (selectedZoneId.value === zoneId) {
    return '#000000'
  }
  if (highlightedZoneId.value === zoneId) {
    // 高亮时使用粗边框
    return '#000000'
  }
  return '#e5e5e5'
}

function handleZoneClick(zoneId: string) {
  store.setSelectedZone(zoneId === selectedZoneId.value ? null : zoneId)
}

function clearSelection() {
  store.setSelectedZone(null)
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
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 16px;
  color: #000;
  margin: 0;
  z-index: 10;
  font-weight: 700;
}

.map-desc {
  position: absolute;
  top: 40px;
  left: 16px;
  color: #888;
  font-size: 11px;
  margin: 0;
  z-index: 10;
}

.map-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 60px; /* Bring back breathing room */
  background: radial-gradient(circle, #fdfdfd 0%, #ffffff 100%);
}

.map-svg {
  width: 100%;
  height: auto; /* Change to auto with max-width for better scaling */
  max-width: 900px;
  filter: drop-shadow(0 10px 30px rgba(0,0,0,0.04));
}

.zone-rect {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  stroke-linejoin: round;
}

.zone-rect:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08));
}

.zone-label {
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
  letter-spacing: -0.01em;
}

.zone-capacity {
  font-size: 11px;
  pointer-events: none;
  opacity: 0.6;
}

.legend {
  position: absolute;
  bottom: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #333;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>