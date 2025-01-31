<script setup>
import { onMounted } from 'vue'
import { useAssetStore } from './stores/asset'
import AssetTable from './components/AssetTable.vue'

const store = useAssetStore()

onMounted(() => {
  store.initialize()
})
</script>

<template>
  <div class="app-container">
    <el-container class="app-layout">
      <el-header class="app-header" :style="{ height: 'var(--header-height)' }">
        <div class="responsive-container h-full flex items-center">
          <h1 class="app-title">资产管理系统</h1>
        </div>
      </el-header>
      <el-main class="app-main">
        <div class="responsive-container h-full">
          <AssetTable />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.app-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.app-header {
  flex: 0 0 var(--header-height);
  background-color: var(--el-color-primary);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.app-title {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.app-main {
  flex: 1;
  min-height: 0;
  padding: 0;
  width: 100%;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 1.25rem;
  }
}
</style>
