<template>
  <div class="booking-overview">
    <div class="overview-header">
      <div class="header-title">
        <h1>全校场所调度总览</h1>
        <p>实时监控 8 大功能分区，共 {{ allClassrooms.length }} 个教学场所</p>
      </div>
      
      <div class="stats-widgets">
        <div class="widget total">
          <span class="widget-label">总场所</span>
          <span class="widget-value">{{ allClassrooms.length }}</span>
        </div>
        <div class="widget available">
          <span class="widget-label">可用</span>
          <span class="widget-value">{{ availableCount }}</span>
        </div>
        <div class="widget booked">
          <span class="widget-label">已预约</span>
          <span class="widget-value">{{ bookedCount }}</span>
        </div>
      </div>
    </div>

    <div class="building-grid-outer">
      <div v-for="zone in zones" :key="zone.id" class="building-card">
        <header class="building-header" :style="{ borderLeftColor: zone.color }">
          <div class="title-wrap">
            <span class="zone-icon">🏢</span>
            <h3>{{ zone.name }}</h3>
          </div>
          <span class="building-room-count">{{ zone.classrooms.length }} 室</span>
        </header>
        
        <div class="rooms-strip">
          <div 
            v-for="room in zone.classrooms" 
            :key="room.id"
            :class="['room-unit', room.status]"
            @click="handleRoomClick(room)"
          >
            <div class="room-top">
              <span class="room-id">{{ room.id.toUpperCase() }}</span>
              <span class="dot" :class="room.status"></span>
            </div>
            <div class="room-main">
              <span class="room-label">{{ room.name }}</span>
            </div>
            <div class="room-meta">
              <span>{{ room.capacity }}座</span>
              <span class="room-status-text">{{ getStatusText(room.status) }}</span>
            </div>
            
            <!-- 占用时的脉冲动效 -->
            <div v-if="room.status === 'booked'" class="pulse-ring"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 极简预约模态框 -->
    <a-modal
      v-model:open="showModal"
      :title="null"
      :footer="null"
      centered
      width="480px"
      wrapClassName="chrome-modal"
    >
      <div v-if="selectedRoom" class="modal-content">
        <div class="modal-header">
          <span class="modal-room-id">{{ selectedRoom.id.toUpperCase() }}</span>
          <h2>{{ selectedRoom.name }}</h2>
          <p class="modal-subtitle">{{ selectedRoom.building }} - {{ selectedRoom.floor }}层</p>
        </div>

        <div class="modal-info-grid">
          <div class="info-item">
            <label>容纳人数</label>
            <span>{{ selectedRoom.capacity }} 人</span>
          </div>
          <div class="info-item">
            <label>当前状态</label>
            <span :class="['status-val', selectedRoom.status]">{{ getStatusText(selectedRoom.status) }}</span>
          </div>
        </div>

        <div class="modal-specs">
          <label>配备设施</label>
          <div class="spec-tags">
            <span v-for="eq in selectedRoom.equipment" :key="eq" class="spec-tag">{{ eq }}</span>
          </div>
        </div>
        
        <div v-if="selectedRoom.status === 'available'" class="booking-action-box">
          <div class="input-wrap">
            <label>预约人姓名</label>
            <input v-model="userName" placeholder="请输入姓名" />
          </div>
          <button class="modal-book-btn" @click="confirmBooking" :disabled="bookingLoading">
            {{ bookingLoading ? '正在锁定...' : '建立即时预约' }}
          </button>
        </div>
        <div v-else class="modal-booked-tip">
          该教室目前不可预约，预计 60 分钟后释放
        </div>

        <button class="modal-close-x" @click="showModal = false">关闭窗口</button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useAppStore } from '@/store/appStore'
import type { Classroom } from '@/types'

const store = useAppStore()

const zones = computed(() => store.zones)
const allClassrooms = computed(() => store.allClassrooms)

const availableCount = computed(() => allClassrooms.value.filter(r => r.status === 'available').length)
const bookedCount = computed(() => allClassrooms.value.filter(r => r.status === 'booked').length)

const showModal = ref(false)
const selectedRoom = ref<Classroom | null>(null)
const userName = ref('王晓明')
const bookingLoading = ref(false)

function getStatusText(status: string) {
  const map: Record<string, string> = {
    available: '空闲',
    booked: '占用',
    maintenance: '停用'
  }
  return map[status] || status
}

function handleRoomClick(room: Classroom) {
  selectedRoom.value = room
  showModal.value = true
}

async function confirmBooking() {
  if (!selectedRoom.value) return
  if (selectedRoom.value.status !== 'available') {
    showModal.value = false
    return
  }

  bookingLoading.value = true
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const success = store.addBooking(selectedRoom.value.id, userName.value)
  if (success) {
    message.success(`已锁定教室: ${selectedRoom.value.name}`)
  } else {
    message.error('操作失败，教室已被突发占用')
  }
  
  bookingLoading.value = false
  showModal.value = false
}
</script>

<style scoped>
.booking-overview {
  padding: 40px;
  background: #fbfbfb;
  min-height: 100%;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.header-title p {
  color: #888;
  font-size: 14px;
}

.stats-widgets {
  display: flex;
  gap: 12px;
}

.widget {
  background: #ffffff;
  padding: 20px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.widget-label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.widget-value {
  font-size: 28px;
  font-weight: 800;
  color: #000;
}

.widget.available .widget-value { color: #111; }
.widget.booked { background: #000; }
.widget.booked .widget-label { color: rgba(255,255,255,0.5); }
.widget.booked .widget-value { color: #fff; }

.building-grid-outer {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.building-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.03);
}

.building-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-left: 4px solid #eee;
  padding-left: 16px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-icon { font-size: 20px; }

.building-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.building-room-count {
  font-size: 13px;
  color: #bbb;
}

.rooms-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.room-unit {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.room-unit:hover {
  border-color: #000;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.room-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-id {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #aaa;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.available { background: #10b981; }
.dot.booked { background: #f59e0b; }
.dot.maintenance { background: #ef4444; }

.room-main {
  margin-bottom: 16px;
}

.room-label {
  font-weight: 700;
  font-size: 16px;
  color: #000;
}

.room-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.room-status-text {
  font-weight: 600;
  opacity: 0.6;
}

/* 脉冲效果 */
.pulse-ring {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 10px;
  height: 10px;
  border: 2px solid #f59e0b;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}

/* Modal Styling Overrides */
.modal-content {
  padding: 8px;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-room-id {
  font-size: 12px;
  font-weight: 800;
  color: #bbb;
  letter-spacing: 0.1em;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0;
}

.modal-subtitle {
  font-size: 13px;
  color: #999;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.info-item label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.info-item span {
  font-size: 16px;
  font-weight: 600;
}

.status-val.available { color: #10b981; }
.status-val.booked { color: #d97706; }

.modal-specs {
  margin-bottom: 32px;
}

.modal-specs label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
  display: block;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tag {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

.booking-action-box {
  border-top: 2px solid #f0f0f0;
  padding-top: 24px;
}

.input-wrap label {
  font-size: 12px;
  font-weight: 700;
  display: block;
  margin-bottom: 8px;
}

.input-wrap input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus {
  border-color: #000;
}

.modal-book-btn {
  width: 100%;
  background: #000;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.modal-book-btn:hover { opacity: 0.85; }
.modal-book-btn:disabled { background: #ccc; cursor: not-allowed; }

.modal-booked-tip {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
}

.modal-close-x {
  width: 100%;
  background: transparent;
  border: none;
  color: #bbb;
  margin-top: 16px;
  font-size: 12px;
  cursor: pointer;
}
</style>
