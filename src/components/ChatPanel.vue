<template>
  <div class="chat-panel">
    <!-- 聊天记录区 -->
    <div class="chat-history" ref="historyRef">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="hero-section">
          <div class="bot-avatar">🤖</div>
          <h1>您好，很高兴为您服务</h1>
          <p>我是校园智慧调度助手。您可以向我咨询教室地点、设备情况，或者直接发起预约需求。</p>
        </div>
        <div class="quick-tips">
          <div class="tip-card" @click="inputContent = '推荐一个有投影仪的教室'">“推荐一个有投影仪的教室”</div>
          <div class="tip-card" @click="inputContent = 'B101机房现在有人吗？'">“B101机房现在有人吗？”</div>
        </div>
      </div>
      
      <div class="message-container">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          :class="['message-row', msg.role]"
        >
          <div class="avatar-area">
            <div class="avatar" :class="msg.role">
              {{ msg.role === 'ai' ? '🤖' : 'U' }}
            </div>
          </div>
          
          <div class="content-area">
            <div class="role-name">{{ msg.role === 'ai' ? '智慧智体' : '您' }}</div>
            <div class="message-body">
              <MarkdownRenderer v-if="msg.role === 'ai'" :content="msg.content" />
              <div v-else class="user-text">{{ msg.content }}</div>
              <div v-if="msg.isStreaming" class="typing-cursor"></div>
            </div>
            
            <!-- 智能联动卡片集 -->
            <div v-if="msg.role === 'ai'" class="inline-action-group">
              <div v-for="room in getDetectedRooms(msg.content)" :key="room.id" class="action-pill">
                <span class="room-name">📍 {{ room.name }}</span>
                <span class="divider"></span>
                <span class="room-status" :class="room.status">
                  {{ getStatusText(room.status) }}
                </span>
                <button 
                  class="pill-book-btn" 
                  :disabled="room.status !== 'available'"
                  @click="handleQuickBook(room.id)"
                >
                  {{ room.status === 'available' ? '建立预约' : '已满' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载中 (仅在没有正在生成的消息时显示) -->
        <div v-if="isLoading && messages[messages.length-1]?.role !== 'ai'" class="message-row ai loading">
          <div class="avatar-area"><div class="avatar ai">🤖</div></div>
          <div class="content-area">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮式输入区 -->
    <div class="input-layer">
      <div class="floating-pill">
        <textarea 
          v-model="inputContent" 
          placeholder="给智慧智体发送消息..." 
          @keydown.enter.prevent="handleSend"
          rows="1"
          ref="inputRef"
        ></textarea>
        <button class="send-icon-btn" @click="handleSend" :disabled="!inputContent.trim() || isLoading">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="disclaimer">系统可能产生不准确的信息，请核实关键调度决策</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { useAppStore } from '@/store/appStore'
import { socketService } from '@/services/socketService'
import MarkdownRenderer from './MarkdownRenderer.vue'

const store = useAppStore()
const inputContent = ref('')
const historyRef = ref<HTMLElement | null>(null)

const messages = computed(() => store.messages)
const isLoading = computed(() => store.isLoading)
const isStreaming = computed(() => store.isStreaming)

// 自动滚动到最下方
watch(() => messages.value.length, () => {
  scrollToBottom()
}, { deep: true })

function scrollToBottom() {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight
    }
  })
}

function getDetectedRooms(text: string) {
  const detected: any[] = []
  const seenIds = new Set()
  
  for (const zone of store.zones) {
    for (const room of zone.classrooms) {
      if (text.toLowerCase().includes(room.id.toLowerCase()) && !seenIds.has(room.id)) {
        detected.push(room)
        seenIds.add(room.id)
      }
    }
  }
  return detected
}

function getStatusText(status: string = '') {
  const map: any = { available: '空闲中', booked: '使用中', maintenance: '维护中' }
  return map[status] || status
}

async function handleSend() {
  if (!inputContent.value.trim() || isLoading.value || isStreaming.value) return

  const originalContent = inputContent.value
  inputContent.value = ''
  
  // 1. 添加用户消息
  store.addUserMessage(originalContent)
  store.setLoading(true)
  
  // 2. 注入上下文并发送
  const bookingSummary = store.bookings.length > 0 
    ? `【实时调度信息】当前已占用教室: ${store.bookings.map(b => b.roomId).join(', ')}。请避开这些教室进行推荐。`
    : '【实时调度信息】当前全校教室均空闲，可自由推荐。'
    
  const contextualMessage = `${bookingSummary}\n用户需求: ${originalContent}`
  
  try {
    store.addAIStreamingPlaceholder() // 预留 AI 消息位
    socketService.sendMessage(contextualMessage)
  } catch (error) {
    message.error('发送失败，请检查网络连接')
    store.setLoading(false)
  }
}

async function handleQuickBook(roomId: string | undefined) {
  if (!roomId) return
  const success = store.addBooking(roomId, '对话式一键预约')
  if (success) {
    message.success('已成功预约该教室')
  } else {
    message.error('预约失败，该教室可能已被占用')
  }
}
</script>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
  scroll-behavior: smooth;
  mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
}

.message-container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px 32px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Empty State Styling */
.empty-state {
  max-width: 500px;
  margin: 80px auto;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

.hero-section {
  margin-bottom: 40px;
}

.bot-avatar {
  font-size: 56px;
  margin-bottom: 16px;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
}

.hero-section h1 {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
  color: #111;
}

.hero-section p {
  color: #666;
  font-size: 15px;
  line-height: 1.6;
}

.quick-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-card {
  padding: 14px 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.tip-card:hover {
  border-color: #000;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Message Bubble Styling */
.message-row {
  display: flex;
  gap: 16px;
  animation: slideUp 0.4s ease-out;
}

.avatar-area {
  flex-shrink: 0;
  padding-top: 4px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.avatar.ai { background: #f0f0f0; border: 1px solid #eee; }
.avatar.user { background: #000; color: #fff; }

.content-area {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  color: #999;
}

.message-body {
  font-size: 15px;
  line-height: 1.6;
  color: #222;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-row.user .role-name {
  text-align: right;
}

.user-text {
  background: #000;
  color: #fff;
  padding: 12px 20px;
  border-radius: 18px 4px 18px 18px;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.ai .message-body {
  background: #fff;
  border: 1px solid #f0f0f0;
  padding: 16px 20px;
  border-radius: 4px 18px 18px 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

/* 智能操作药丸组 */
.inline-action-group {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
}

.room-name { font-weight: 700; font-size: 13px; color: #000; }
.divider { width: 1px; height: 16px; background: #eee; }
.room-status { font-size: 12px; font-weight: 600; }
.room-status.available { color: #10b981; }
.room-status.booked { color: #f59e0b; }

.pill-book-btn {
  background: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-book-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
.pill-book-btn:disabled { background: #eee; color: #bbb; cursor: not-allowed; }

/* Input Area Styling */
.input-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 32px 32px;
  background: linear-gradient(to top, #fff 60%, transparent);
}

.floating-pill {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 18px;
  padding: 10px 14px 10px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.floating-pill:focus-within {
  border-color: #000;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  max-height: 150px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  padding: 8px 0;
  color: #111;
  outline: none;
}

.send-icon-btn {
  width: 36px;
  height: 36px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-icon-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
.send-icon-btn:hover:not(:disabled) { background: #333; transform: scale(1.05); }

.disclaimer {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  margin-top: 12px;
}

/* Indicators */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 10px;
  width: fit-content;
}

.typing-indicator span {
  width: 4px;
  height: 4px;
  background: #bbb;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 15px;
  background: #000;
  vertical-align: middle;
  margin-left: 4px;
  animation: blink 0.8s infinite;
}

@keyframes blink { 50% { opacity: 0; } }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
