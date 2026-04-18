<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="app-nav">
      <div class="nav-left">
        <button 
          :class="{ active: currentView === 'main' }"
          @click="currentView = 'main'"
        >
          🏫 智能调度
        </button>
        <button 
          :class="{ active: currentView === 'overview' }"
          @click="currentView = 'overview'"
        >
          📊 场所总览
        </button>
      </div>
      <div class="nav-right">
        <button 
          :class="{ active: currentView === 'test' }"
          @click="currentView = 'test'"
        >
          🤖 工作流调试
        </button>
      </div>
    </nav>
    
    <!-- 主视图 -->
    <div v-if="currentView === 'main'" class="app-main-view">
      <main class="app-main">
        <div class="map-section">
          <CampusMap />
        </div>
        
        <div class="chat-section">
          <ChatPanel />
        </div>
      </main>
    </div>
    
    <!-- 场所总览 -->
    <div v-else-if="currentView === 'overview'" class="overview-view">
      <BookingOverview />
    </div>

    <!-- 测试视图 -->
    <div v-else class="test-view">
      <WorkflowTest />
    </div>

    <!-- 使用说明弹窗 -->
    <UsageInstructions ref="instructionsRef" />
    
    <!-- 悬浮帮助按钮 -->
    <a-button 
      type="primary" 
      shape="circle" 
      size="large" 
      class="help-fab"
      @click="showInstructions"
    >
      <template #icon><QuestionOutlined /></template>
    </a-button>
    
    <!-- 全局预约弹窗 -->
    <BookingModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { QuestionOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/store/appStore'
import { socketService } from '@/services/socketService'
import CampusMap from './components/CampusMap.vue'
import WorkflowTest from './components/WorkflowTest.vue'
import UsageInstructions from './components/UsageInstructions.vue'
import BookingOverview from './components/BookingOverview.vue'
import ChatPanel from './components/ChatPanel.vue'
import BookingModal from './components/BookingModal.vue'

const currentView = ref<'main' | 'test' | 'overview'>('main')
const instructionsRef = ref<any>(null)
const store = useAppStore()

function showInstructions() {
  instructionsRef.value?.show()
}

// 全局初始化 WebSocket 连接
onMounted(async () => {
  try {
    await socketService.connect({
      onStatusChange: (status) => {
        store.setSocketStatus(status === 'connected')
      },
      onReply: (msg) => {
        if (!msg.isFromSelf) {
          store.setLoading(false)
          store.setStreaming(true)
          store.appendAIContent(msg.content)
          if (msg.isFinal) {
            store.stopStreaming()
          }
        }
      },
      onError: (err) => {
        console.error('Socket Error:', err)
      }
    })
  } catch (error) {
    console.error('Failed to initialize socket:', error)
  }
})

onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style>
.help-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #000 !important;
  border-color: #000 !important;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #000000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.app-nav {
  display: flex;
  justify-content: space-between;
  padding: 12px 32px;
  background: #ffffff;
  border-bottom: 1px solid #eeeeee;
}

.nav-left, .nav-right {
  display: flex;
  gap: 8px;
}

.app-nav button {
  padding: 6px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.app-nav button:hover {
  background: #f5f5f5;
  color: #000;
}

.app-nav button.active {
  background: #000000;
  color: #ffffff;
}

.app-main-view {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  padding: 0;
  gap: 0;
  background: #ffffff;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.view-header h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.status-indicators {
  font-size: 12px;
  color: #888;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #ff4d4f;
  border-radius: 50%;
}

.dot.connected {
  background: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.map-section {
  flex: 6;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  overflow: hidden;
  position: relative;
}

.chat-section {
  flex: 4;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  min-width: 400px;
}

.test-view, .overview-view {
  flex: 1;
  padding: 0;
  background: #ffffff;
  overflow-y: auto;
}
</style>