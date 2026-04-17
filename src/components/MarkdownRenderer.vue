<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

const renderedHtml = computed(() => {
  return md.render(props.content || '')
})
</script>

<style>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  word-break: break-word;
}

.markdown-body p {
  margin-bottom: 12px;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body strong {
  color: #1890ff;
  font-weight: 600;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 20px;
  margin-bottom: 12px;
}

.markdown-body li {
  margin-bottom: 4px;
}

.markdown-body code {
  background-color: #f0f2f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  background-color: #f6f8fa;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.markdown-body h1 { font-size: 1.25em; }
.markdown-body h2 { font-size: 1.1em; }
.markdown-body h3 { font-size: 1em; }

.markdown-body blockquote {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding-left: 16px;
  margin: 0 0 12px 0;
}
</style>
