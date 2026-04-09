<template>
  <div class="input-panel">
    <h2 class="panel-title">📝 输入需求</h2>
    <p class="panel-desc">描述您的教室需求，AI将为您推荐最合适的区域</p>
    
    <a-textarea
      v-model:value="userInput"
      placeholder="例如：我需要一个有计算机的教室进行编程教学，大约30人..."
      :rows="6"
      :maxlength="500"
      show-count
      class="input-area"
      @keydown.ctrl.enter="handleSubmit"
    />
    
    <a-button
      type="primary"
      size="large"
      block
      :loading="isLoading"
      :disabled="!userInput.trim()"
      @click="handleSubmit"
      class="submit-btn"
    >
      <template #icon><SendOutlined /></template>
      获取AI推荐
    </a-button>
    
    <div class="tips">
      <a-divider orientation="left">💡 提示</a-divider>
      <ul>
        <li>试试输入：<strong>"实验课"</strong>、<strong>"自习"</strong>、<strong>"文艺演出"</strong></li>
        <li>可以指定人数、设备需求等详细信息</li>
        <li>按 Ctrl+Enter 快速提交</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SendOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/store/appStore'
import { getAIRecommendation, processUserQuery } from '@/services/aiService'

const store = useAppStore()

const userInput = computed({
  get: () => store.userInput,
  set: (val) => store.setUserInput(val),
})

const isLoading = computed(() => store.isLoading)

async function handleSubmit() {
  if (!userInput.value.trim() || isLoading.value) return
  
  store.setLoading(true)
  try {
    const response = await processUserQuery(userInput.value)
    store.setAIResponse(response)
  } catch (error) {
    console.error('AI处理失败:', error)
  } finally {
    store.setLoading(false)
  }
}
</script>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.panel-desc {
  color: #666;
  font-size: 13px;
  margin: 0;
}

.input-area {
  width: 100%;
}

.submit-btn {
  height: 48px;
  font-size: 16px;
}

.tips {
  margin-top: auto;
}

.tips ul {
  padding-left: 20px;
  color: #666;
  font-size: 13px;
}

.tips li {
  margin-bottom: 6px;
}

.tips strong {
  color: #1890ff;
}
</style>