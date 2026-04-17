<template>
  <Transition name="slide">
    <div v-if="selectedZone" class="zone-drawer">
      <header class="drawer-header">
        <div class="header-main">
          <h2>{{ selectedZone.name }}</h2>
          <span class="room-count">{{ selectedZone.classrooms.length }} 间教室</span>
        </div>
        <button class="close-btn" @click="closeDrawer">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>

      <div class="drawer-body">
        <!-- 区域摘要 -->
        <div class="zone-summary">
          <div class="stat-item">
            <label>总容量</label>
            <span>{{ selectedZone.totalCapacity }} 座</span>
          </div>
          <div class="stat-item">
            <label>核心配套</label>
            <div class="tag-group">
              <span v-for="eq in selectedZone.equipment" :key="eq" class="eq-tag">{{ eq }}</span>
            </div>
          </div>
        </div>

        <!-- 教室列表 -->
        <div class="room-list">
          <h3>教室矩阵</h3>
          <div 
            v-for="room in selectedZone.classrooms" 
            :key="room.id" 
            class="room-card"
          >
            <div class="room-header">
              <div class="room-name">
                <span class="status-dot" :class="room.status"></span>
                <strong>{{ room.name }}</strong>
              </div>
              <span class="capacity-tag">{{ room.capacity }}座</span>
            </div>
            
            <div class="room-details">
              <p class="floor-info">{{ room.building }} - {{ room.floor }}层</p>
              <div class="room-eq">
                <span v-for="tag in room.equipment" :key="tag" class="mini-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="room-footer">
              <span class="status-label" :class="room.status">
                {{ getStatusText(room.status) }}
              </span>
              <button 
                class="quick-book-btn"
                :disabled="room.status !== 'available'"
                @click="handleBook(room.id)"
              >
                {{ room.status === 'available' ? '立即建立预约' : '暂时不可用' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { useAppStore } from '@/store/appStore'

const store = useAppStore()
const selectedZone = computed(() => store.selectedZone)

function closeDrawer() {
  store.setSelectedZone(null)
}

function getStatusText(status: string) {
  const map: any = { available: '可使用', booked: '使用中', maintenance: '维护中' }
  return map[status] || status
}

function handleBook(roomId: string) {
  const success = store.addBooking(roomId, '地图侧滑舱快捷预约')
  if (success) {
    message.success(`已成功预约教室: ${roomId}`)
  } else {
    message.error('该教室已被占用，请选择其他时段')
  }
}
</script>

<style scoped>
.zone-drawer {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.12);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.header-main h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.room-count {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #000;
  color: #fff;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.zone-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.stat-item label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.stat-item span {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.eq-tag {
  font-size: 11px;
  background: #fff;
  border: 1px solid #eee;
  padding: 2px 8px;
  border-radius: 4px;
  color: #666;
}

.room-list h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  color: #333;
}

.room-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.room-card:hover {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.available { background: #10b981; }
.status-dot.booked { background: #f59e0b; }
.status-dot.maintenance { background: #ef4444; }

.capacity-tag {
  font-size: 11px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.room-details {
  margin-bottom: 16px;
}

.floor-info {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.room-eq {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mini-tag {
  font-size: 10px;
  color: #999;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f9f9f9;
}

.status-label { font-size: 12px; font-weight: 600; }
.status-label.available { color: #10b981; }
.status-label.booked { color: #d97706; }
.status-label.maintenance { color: #dc2626; }

.quick-book-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.quick-book-btn:disabled {
  background: #eee;
  color: #ccc;
  cursor: not-allowed;
}

/* 动效 */
.slide-enter-active, .slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
