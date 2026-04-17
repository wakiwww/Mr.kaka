<template>
  <div class="workflow-test">
    <div class="header">
      <h2>🤖 智能体工作流测试</h2>
      <div :class="['status-badge', socketStatus]">
        {{ socketStatus === 'connected' ? '已连接' : socketStatus === 'connecting' ? '连接中...' : '未连接' }}
      </div>
    </div>
    
    <!-- 对话历史 -->
    <div class="chat-history" ref="chatHistoryRef">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="content-wrapper">
          <!-- 思考过程展示 -->
          <div v-if="msg.thought" class="thought-process">
            <div class="thought-header">🤔 正在思考: {{ msg.thoughtTitle || '思考中' }}</div>
            <div class="thought-content">{{ msg.thought }}</div>
          </div>
          <div class="content">{{ msg.content }}</div>
        </div>
      </div>
      
      <!-- 加载动画 -->
      <div v-if="loading && !currentBotMessage" class="message bot">
        <div class="avatar">🤖</div>
        <div class="content typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
    
    <!-- 输入框 -->
    <div class="input-area">
      <input 
        v-model="userInput"
        @keyup.enter="handleSend"
        placeholder="输入您的问题，例如：我需要一间有电脑的教室，50人"
        :disabled="loading"
      />
      <button @click="handleSend" :disabled="loading || !userInput.trim() || socketStatus !== 'connected'">
        {{ loading ? '响应中...' : '发送' }}
      </button>
    </div>
    
    <!-- 调试信息 -->
    <details class="debug-info">
      <summary>🔧 调试信息（WebSocket 事件日志）</summary>
      <div class="debug-log">
        <div v-for="(log, i) in debugLogs" :key="i" class="log-item">
          <span class="log-time">[{{ log.time }}]</span> {{ log.msg }}
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { socketService, type ChatMessage } from '@/services/socketService'

interface DisplayMessage {
  role: 'user' | 'bot'
  content: string
  thought?: string
  thoughtTitle?: string
}

const userInput = ref('')
const messages = ref<DisplayMessage[]>([])
const loading = ref(false)
const socketStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')
const debugLogs = ref<{time: string, msg: string}[]>([])
const chatHistoryRef = ref<HTMLElement>()

// 当前正在接收的机器人回复（用于流式展示）
let currentBotMessage: DisplayMessage | null = null

/**
 * 添加日志
 */
function addLog(msg: string) {
  debugLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    msg
  })
}

/**
 * 初始化连接
 */
onMounted(async () => {
  await socketService.connect({
    onStatusChange: (status) => {
      socketStatus.value = status
      addLog(`连接状态变更: ${status}`)
    },
    onReply: async (msg: ChatMessage) => {
      loading.value = false
      if (msg.isFromSelf) return // 忽略回显

      if (!currentBotMessage) {
        currentBotMessage = { role: 'bot', content: msg.content }
        messages.value.push(currentBotMessage)
      } else {
        // 增量更新内容（由于在 socketService 中配置了 incremental: true）
        currentBotMessage.content += msg.content
      }

      if (msg.isFinal) {
        addLog('✅ 对话完成')
        currentBotMessage = null
      }
      
      await nextTick()
      scrollToBottom()
    },
    onThought: (content, title) => {
      if (!currentBotMessage) {
        currentBotMessage = { role: 'bot', content: '', thought: content, thoughtTitle: title }
        messages.value.push(currentBotMessage)
      } else {
        currentBotMessage.thought = (currentBotMessage.thought || '') + content
        if (title) currentBotMessage.thoughtTitle = title
      }
      scrollToBottom()
    },
    onError: (err) => {
      addLog(`❌ 错误: ${JSON.stringify(err)}`)
      messages.value.push({
        role: 'bot',
        content: `[系统错误] ${typeof err === 'string' ? err : '无法连接到 AI 服务'}`
      })
      loading.value = false
    }
  })
})

onUnmounted(() => {
  socketService.disconnect()
})

/**
 * 发送消息
 */
async function handleSend() {
  const query = userInput.value.trim()
  if (!query || socketStatus.value !== 'connected') return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: query
  })
  
  userInput.value = ''
  loading.value = true
  currentBotMessage = null // 重置当前回复指针
  
  try {
    socketService.sendMessage(query)
    addLog(`发送请求: ${query}`)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    loading.value = false
  }
}

/**
 * 滚动到聊天底部
 */
function scrollToBottom() {
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
  }
}
</script>

<style scoped>
.workflow-test {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}
.status-badge.connected { background: #e6fffa; color: #38a169; }
.status-badge.connecting { background: #fffaf0; color: #dd6b20; }
.status-badge.disconnected { background: #fff5f5; color: #e53e3e; }

.chat-history {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  background: white;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.message {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.message.user { flex-direction: row-reverse; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.content-wrapper {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thought-process {
  background: #f8fafc;
  border-left: 4px solid #cbd5e0;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
}

.thought-header {
  font-weight: bold;
  color: #64748b;
  margin-bottom: 4px;
}

.thought-content {
  color: #94a3b8;
  white-space: pre-wrap;
}

.content {
  padding: 14px 18px;
  border-radius: 16px;
  background: #edf2f7;
  color: #2d3748;
  line-height: 1.6;
}

.message.user .content {
  background: #3182ce;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .content {
  border-bottom-left-radius: 4px;
}

.input-area {
  display: flex;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
}

.input-area input {
  flex: 1;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
}

.input-area input:focus { border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49,130,206,0.1); }

.input-area button {
  padding: 0 28px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

.input-area button:disabled { background: #cbd5e0; cursor: not-allowed; }

.debug-info {
  margin-top: 20px;
  font-size: 12px;
}

.debug-log {
  max-height: 150px;
  overflow-y: auto;
  background: #1a202c;
  color: #a0aec0;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
}

.log-item { margin-bottom: 4px; }
.log-time { color: #4a5568; }
</style>
