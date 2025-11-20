<template>
  <div class="data-card" :class="colorClass">
    <div class="card-header">
      <div class="title">{{ title }}</div>
      <div class="icon-wrapper">
        <Icon :icon="icon" :size="32" />
      </div>
    </div>
    <div class="card-body">
      <div class="value">
        <span v-if="prefix" class="prefix">{{ prefix }}</span>
        <count-to
          :start-val="0"
          :end-val="Number(value) || 0"
          :duration="2000"
          :decimals="decimals"
          class="count"
        />
        <span v-if="suffix" class="suffix">{{ suffix }}</span>
      </div>
      <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
    </div>
    <div v-if="trend !== undefined" class="card-footer">
      <div class="trend" :class="trend >= 0 ? 'up' : 'down'">
        <Icon :icon="trend >= 0 ? 'ant-design:arrow-up-outlined' : 'ant-design:arrow-down-outlined'" />
        <span>{{ Math.abs(trend) }}%</span>
        <span class="trend-label">{{ trendLabel }}</span>
      </div>
    </div>
    <div class="card-glow"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Icon } from '/@/components/Icon';
import { CountTo } from '/@/components/CountTo';

interface Props {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';
  trend?: number;
  trendLabel?: string;
  decimals?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  decimals: 0,
});

const colorClass = computed(() => `color-${props.color}`);
</script>

<style lang="less" scoped>
.data-card {
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(100, 200, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 32px rgba(100, 200, 255, 0.3);
    border-color: rgba(100, 200, 255, 0.6);

    .card-glow {
      opacity: 1;
    }
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(100, 200, 255, 0.1);
      border: 1px solid rgba(100, 200, 255, 0.3);
      color: #64c8ff;
    }
  }

  .card-body {
    margin-bottom: 12px;

    .value {
      font-size: 36px;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      font-family: 'Orbitron', 'Arial', sans-serif;
      text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);

      .prefix,
      .suffix {
        font-size: 24px;
        margin: 0 4px;
        color: rgba(255, 255, 255, 0.8);
      }

      .count {
        display: inline-block;
      }
    }

    .subtitle {
      margin-top: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .card-footer {
    .trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.up {
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
        border: 1px solid rgba(82, 196, 26, 0.4);
      }

      &.down {
        background: rgba(255, 77, 79, 0.2);
        color: #ff4d4f;
        border: 1px solid rgba(255, 77, 79, 0.4);
      }

      .trend-label {
        margin-left: 4px;
        opacity: 0.8;
      }
    }
  }

  // 颜色主题
  &.color-blue {
    border-color: rgba(100, 200, 255, 0.3);

    .icon-wrapper {
      background: rgba(100, 200, 255, 0.1);
      border-color: rgba(100, 200, 255, 0.3);
      color: #64c8ff;
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(100, 200, 255, 0.3);
    }
  }

  &.color-green {
    border-color: rgba(82, 196, 26, 0.3);

    .icon-wrapper {
      background: rgba(82, 196, 26, 0.1);
      border-color: rgba(82, 196, 26, 0.3);
      color: #52c41a;
    }

    .value {
      text-shadow: 0 0 20px rgba(82, 196, 26, 0.5);
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(82, 196, 26, 0.3);
      border-color: rgba(82, 196, 26, 0.6);
    }
  }

  &.color-orange {
    border-color: rgba(250, 173, 20, 0.3);

    .icon-wrapper {
      background: rgba(250, 173, 20, 0.1);
      border-color: rgba(250, 173, 20, 0.3);
      color: #faad14;
    }

    .value {
      text-shadow: 0 0 20px rgba(250, 173, 20, 0.5);
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(250, 173, 20, 0.3);
      border-color: rgba(250, 173, 20, 0.6);
    }
  }

  &.color-purple {
    border-color: rgba(114, 46, 209, 0.3);

    .icon-wrapper {
      background: rgba(114, 46, 209, 0.1);
      border-color: rgba(114, 46, 209, 0.3);
      color: #722ed1;
    }

    .value {
      text-shadow: 0 0 20px rgba(114, 46, 209, 0.5);
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(114, 46, 209, 0.3);
      border-color: rgba(114, 46, 209, 0.6);
    }
  }

  &.color-red {
    border-color: rgba(255, 77, 79, 0.3);

    .icon-wrapper {
      background: rgba(255, 77, 79, 0.1);
      border-color: rgba(255, 77, 79, 0.3);
      color: #ff4d4f;
    }

    .value {
      text-shadow: 0 0 20px rgba(255, 77, 79, 0.5);
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(255, 77, 79, 0.3);
      border-color: rgba(255, 77, 79, 0.6);
    }
  }

  &.color-cyan {
    border-color: rgba(19, 194, 194, 0.3);

    .icon-wrapper {
      background: rgba(19, 194, 194, 0.1);
      border-color: rgba(19, 194, 194, 0.3);
      color: #13c2c2;
    }

    .value {
      text-shadow: 0 0 20px rgba(19, 194, 194, 0.5);
    }

    &:hover {
      box-shadow: 0 8px 32px rgba(19, 194, 194, 0.3);
      border-color: rgba(19, 194, 194, 0.6);
    }
  }
}
</style>
