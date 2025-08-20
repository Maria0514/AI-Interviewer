
<template>
  <div id="app">
    <transition name="route" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<style>
/* 路由过渡动画 */
.route-enter-active,
.route-leave-active {
  transition: all 0.3s ease;
}

.route-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Element Plus 组件样式覆盖 */
.el-card {
  border-radius: 16px !important;
  border: none !important;
}

.el-button {
  border-radius: 8px !important;
  font-weight: 500 !important;
}

.el-button--large {
  padding: 12px 20px !important;
  font-size: 16px !important;
}

.el-steps {
  margin: 0 !important;
}

.el-step__title {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.el-alert {
  border-radius: 12px !important;
  border: none !important;
}

.el-input__wrapper {
  border-radius: 8px !important;
}

.el-textarea__inner {
  border-radius: 8px !important;
}

/* 滚动条样式 */
.el-scrollbar__wrap {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.el-scrollbar__wrap::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.el-scrollbar__wrap::-webkit-scrollbar-track {
  background: transparent;
}

.el-scrollbar__wrap::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.el-scrollbar__wrap::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-secondary);
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 13px;
  }
}
</style>
