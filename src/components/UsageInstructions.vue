<template>
  <a-modal
    v-model:open="visible"
    title="💡 智慧校园调度系统 - 使用说明"
    @ok="handleOk"
    width="600px"
    :footer="null"
  >
    <div class="instructions-content">
      <div class="step">
        <div class="step-header">
          <a-avatar :size="32" style="background-color: #1890ff">1</a-avatar>
          <h3>输入需求</h3>
        </div>
        <p>在左侧面板的输入框中，用自然语言描述您的教室需求。例如：<strong>“我想要一个能容纳 50 人的计算机实验室，最好在 1 楼。”</strong></p>
      </div>

      <div class="step">
        <div class="step-header">
          <a-avatar :size="32" style="background-color: #52c41a">2</a-avatar>
          <h3>AI 智能分析</h3>
        </div>
        <p>点击<strong>“获取 AI 推荐”</strong>按钮。系统会将您的需求发送至腾讯云智能体，AI 将根据实时数据进行槽位提取和逻辑匹配。</p>
      </div>

      <div class="step">
        <div class="step-header">
          <a-avatar :size="32" style="background-color: #faad14">3</a-avatar>
          <h3>查看结果</h3>
        </div>
        <p>系统会在<strong>校园地图</strong>中高亮显示推荐区域，并在右侧面板展示最匹配的教室列表及其详细设备。您可以点击地图区域查看备选方案。</p>
      </div>

      <div class="step">
        <div class="step-header">
          <a-avatar :size="32" style="background-color: #eb2f96">4</a-avatar>
          <h3>进阶调度</h3>
        </div>
        <p>如果推荐不够精准，您可以切换至<strong>“工作流测试”</strong>页面，与 AI 进行多轮对话，进一步明确需求或进行在线预约。</p>
      </div>

      <a-divider />
      
      <div class="tips-section">
        <h4 style="margin-bottom: 10px;">🌟 小贴士：</h4>
        <a-tag color="blue">关键词搜索</a-tag>
        <a-tag color="green">快捷键提交</a-tag>
        <a-tag color="orange">实时状态</a-tag>
        <p style="margin-top: 10px; color: #8c8c8c; font-size: 12px;">提示：如遇 API 调用失败，请检查网络连接及环境配置中 SECRET_ID 是否正确。</p>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue'

const visible = ref(false)

const show = () => {
  visible.value = true
}

const handleOk = () => {
  visible.value = false
}

defineExpose({
  show
})
</script>

<style scoped>
.instructions-content {
  padding: 10px 0;
}

.step {
  margin-bottom: 24px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.step h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.step p {
  margin-left: 44px;
  color: #595959;
  line-height: 1.6;
}

.tips-section {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
</style>
