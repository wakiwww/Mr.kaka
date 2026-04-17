<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="app-nav">
      <button 
        :class="{ active: currentView === 'main' }"
        @click="currentView = 'main'"
      >
        🏫 主界面
      </button>
      <button 
        :class="{ active: currentView === 'test' }"
        @click="currentView = 'test'"
      >
        🤖 工作流测试
      </button>
    </nav>
    
    <!-- 主视图 -->
    <div v-if="currentView === 'main'" class="app-main-view">
      <header class="app-header">
        <h1>🏫 智慧校园调度系统</h1>
        <p>基于AI的智能教室推荐与调度平台</p>
      </header>
      
      <main class="app-main">
        <div class="left-panel">
          <InputPanel />
        </div>
        
        <div class="center-panel">
          <CampusMap />
        </div>
        
        <div class="right-panel">
          <ResultPanel />
        </div>
      </main>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { QuestionOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/store/appStore'
import { socketService } from '@/services/socketService'
import InputPanel from './components/InputPanel.vue'
import CampusMap from './components/CampusMap.vue'
import ResultPanel from './components/ResultPanel.vue'
import WorkflowTest from './components/WorkflowTest.vue'
import UsageInstructions from './components/UsageInstructions.vue'

const currentView = ref<'main' | 'test'>('main')
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
          store.setLoading(false) // 收到回复，停止加载动画
          store.setStreaming(true)
          store.appendAIContent(msg.content)
          if (msg.isFinal) {
            store.setStreaming(false)
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-nav {
  display: flex;
  gap: 16px;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.app-nav button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.app-nav button.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
}

.app-main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 16px 24px;
  background: white;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
}

.app-header p {
  margin: 4px 0 0;
  color: #8c8c8c;
}

.app-main {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  background: #f0f2f5;
}

.left-panel { width: 320px; background: white; padding: 20px; border-radius: 8px; }
.center-panel { flex: 1; background: white; padding: 20px; border-radius: 8px; }
.right-panel { width: 360px; background: white; padding: 20px; border-radius: 8px; }

.test-view {
  flex: 1;
  padding: 24px;
  background: #f0f2f5;
}
</style>