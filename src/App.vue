<template>
  <div class="app-container">
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
</template>

<script setup lang="ts">
import InputPanel from './components/InputPanel.vue'
import CampusMap from './components/CampusMap.vue'
import ResultPanel from './components/ResultPanel.vue'
</script>