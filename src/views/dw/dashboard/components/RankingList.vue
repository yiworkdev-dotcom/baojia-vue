<template>
  <div class="ranking-list">
    <div class="ranking-header">
      <h3 class="ranking-title">{{ title }}</h3>
      <div class="ranking-subtitle">{{ subtitle }}</div>
    </div>
    <div class="ranking-body">
      <div
        v-for="(item, index) in data"
        :key="item.userId || index"
        class="ranking-item"
        :class="{ 'is-top': index < 3 }"
      >
        <div class="rank" :class="`rank-${index + 1}`">
          <span v-if="index < 3" class="rank-medal">
            <Icon v-if="index === 0" icon="ant-design:trophy-filled" />
            <Icon v-else-if="index === 1" icon="ant-design:trophy-filled" />
            <Icon v-else icon="ant-design:trophy-filled" />
          </span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ item.realName || item.userName }}</div>
          <div class="user-id">ID: {{ item.userId }}</div>
        </div>
        <div class="user-value">
          <div class="value">
            {{ formatValue(item.value) }}
          </div>
          <div class="value-label">{{ valueLabel }}</div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${getProgress(item.value)}%` }"
          ></div>
        </div>
      </div>
      <div v-if="!data || data.length === 0" class="empty-state">
        <Icon icon="ant-design:inbox-outlined" :size="48" />
        <div class="empty-text">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Icon } from '/@/components/Icon';

interface RankingItem {
  userId: string;
  userName: string;
  realName?: string;
  value: number;
  rank?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data: RankingItem[];
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: 'TOP 10 排行榜',
  valueLabel: '',
});

const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return 0;
  return Math.max(...props.data.map((item) => item.value));
});

const formatValue = (value: number) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value);
  }
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }
  return value.toLocaleString();
};

const getProgress = (value: number) => {
  if (maxValue.value === 0) return 0;
  return (value / maxValue.value) * 100;
};
</script>

<style lang="less" scoped>
.ranking-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(100, 200, 255, 0.3);
  overflow: hidden;
  backdrop-filter: blur(10px);

  .ranking-header {
    padding: 20px 24px;
    background: linear-gradient(90deg, rgba(100, 200, 255, 0.2) 0%, rgba(100, 200, 255, 0.05) 100%);
    border-bottom: 1px solid rgba(100, 200, 255, 0.3);

    .ranking-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 4px 0;
      letter-spacing: 1px;
    }

    .ranking-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .ranking-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(100, 200, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(100, 200, 255, 0.5);
      }
    }

    .ranking-item {
      position: relative;
      display: grid;
      grid-template-columns: 50px 1fr auto;
      grid-template-rows: auto auto;
      gap: 8px 12px;
      padding: 16px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(100, 200, 255, 0.5);
        transform: translateX(5px);
      }

      &.is-top {
        background: linear-gradient(90deg, rgba(100, 200, 255, 0.1) 0%, rgba(100, 200, 255, 0.05) 100%);
        border-color: rgba(100, 200, 255, 0.3);
      }

      .rank {
        grid-row: 1 / 3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;

        .rank-medal {
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rank-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        &.rank-1 .rank-medal {
          color: #ffd700;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
        }

        &.rank-2 .rank-medal {
          color: #c0c0c0;
          filter: drop-shadow(0 0 8px rgba(192, 192, 192, 0.8));
        }

        &.rank-3 .rank-medal {
          color: #cd7f32;
          filter: drop-shadow(0 0 8px rgba(205, 127, 50, 0.8));
        }
      }

      .user-info {
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .user-id {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'Consolas', monospace;
        }
      }

      .user-value {
        text-align: right;

        .value {
          font-size: 18px;
          font-weight: 700;
          color: #64c8ff;
          font-family: 'Orbitron', 'Arial', sans-serif;
          text-shadow: 0 0 10px rgba(100, 200, 255, 0.5);
        }

        .value-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 2px;
        }
      }

      .progress-bar {
        grid-column: 2 / 4;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #64c8ff 0%, #0088ff 100%);
          border-radius: 2px;
          transition: width 1s ease;
          box-shadow: 0 0 10px rgba(100, 200, 255, 0.6);
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: rgba(255, 255, 255, 0.3);

      .empty-text {
        margin-top: 16px;
        font-size: 14px;
      }
    }
  }
}
</style>
