<template>
  <a-modal
    v-model:open="visible"
    :title="null"
    @cancel="handleCancel"
    :footer="null"
    :width="480"
    centered
    class="booking-modal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-icon">🕒</div>
        <div class="header-text">
          <h2>建立新预约</h2>
          <p>请选择您需要使用 {{ room?.name }} 的时间段</p>
        </div>
      </div>

      <div class="form-container">
        <div class="form-item">
          <label>预约时段</label>
          <a-range-picker
            v-model:value="timeRange"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="['开始时间', '结束时间']"
            class="full-width-picker"
            size="large"
            :disabled-date="disabledDate"
          />
        </div>

        <div v-if="timeRange" class="duration-hint">
          预计时长: {{ durationHint }}
        </div>

        <div class="action-footer">
          <button class="cancel-btn" @click="handleCancel">取消</button>
          <button 
            class="submit-btn" 
            :disabled="!isFormValid || isSubmitting" 
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>确认预约</span>
          </button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { useAppStore } from '@/store/appStore'

const store = useAppStore()

const visible = computed({
  get: () => store.bookingModalVisible,
  set: (val) => { if (!val) store.closeBookingModal() }
})

const roomId = computed(() => store.bookingRoomId)
const room = computed(() => store.allClassrooms.find(r => r.id === roomId.value))
const initialTimes = computed(() => store.bookingInitialTimes)

const timeRange = ref<[Dayjs, Dayjs] | null>(null)
const isSubmitting = ref(false)

// 初始时间自动填充逻辑
watch([visible, initialTimes], ([newVisible, newTimes]) => {
  if (newVisible) {
    if (newTimes) {
      timeRange.value = [dayjs(newTimes.start), dayjs(newTimes.end)]
    } else {
      // 默认提供从现在开始的一个小时
      const start = dayjs().startOf('hour').add(1, 'hour')
      timeRange.value = [start, start.add(1, 'hour')]
    }
  } else {
    timeRange.value = null
  }
})

const isFormValid = computed(() => {
  return timeRange.value && timeRange.value[0] && timeRange.value[1]
})

const durationHint = computed(() => {
  if (!timeRange.value) return ''
  const diff = timeRange.value[1].diff(timeRange.value[0], 'minute')
  if (diff <= 0) return '时间范围无效'
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours > 0 ? hours + '小时' : ''}${mins > 0 ? mins + '分钟' : ''}`
})

function disabledDate(current: Dayjs) {
  // 禁止选择今天以前的日期
  return current && current < dayjs().startOf('day')
}

function handleCancel() {
  store.closeBookingModal()
}

async function handleSubmit() {
  if (!roomId.value || !timeRange.value) return

  isSubmitting.value = true
  
  const start = timeRange.value[0].toISOString()
  const end = timeRange.value[1].toISOString()
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const success = store.addBooking(roomId.value, start, end, '当前用户')
  
  if (success) {
    message.success('预约成功！快去准备吧 🚀')
    store.closeBookingModal()
  } else {
    message.error('该时段已有冲突预约，请重新选择 🕒')
  }
  
  isSubmitting.value = false
}
</script>

<style scoped>
.booking-modal :deep(.ant-modal-content) {
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
}

.modal-content {
  padding: 32px;
}

.modal-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.header-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  background: #f8f9fa;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h2 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #111;
}

.header-text p {
  font-size: 13px;
  color: #888;
  margin: 4px 0 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.full-width-picker {
  width: 100%;
}

.duration-hint {
  font-size: 12px;
  font-weight: 600;
  color: #1890ff;
  background: #e6f7ff;
  padding: 8px 12px;
  border-radius: 8px;
  width: fit-content;
}

.action-footer {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover { background: #eee; }

.submit-btn {
  flex: 2;
  padding: 12px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #eee;
  color: #ccc;
  cursor: not-allowed;
}

:deep(.ant-picker-range) {
  border-radius: 10px;
  border-color: #eee;
}

:deep(.ant-picker-range:hover),
:deep(.ant-picker-range-focused) {
  border-color: #000 !important;
  box-shadow: none !important;
}
</style>
