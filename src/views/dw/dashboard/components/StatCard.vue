<template>
  <Card :bordered="false" class="stat-card">
    <div class="stat-card-content">
      <div class="stat-card-left">
        <div class="stat-title">{{ data.title }}</div>
        <div class="stat-value">
          <span v-if="data.prefix" class="prefix">{{ data.prefix }}</span>
          <span class="value">{{ formatValue(data.value) }}</span>
          <span v-if="data.suffix" class="suffix">{{ data.suffix }}</span>
        </div>
        <div v-if="data.trend !== undefined" class="stat-trend">
          <span :class="['trend-value', getTrendClass()]">
            <Icon v-if="data.trend > 0" icon="ant-design:arrow-up-outlined" />
            <Icon v-else-if="data.trend < 0" icon="ant-design:arrow-down-outlined" />
            <Icon v-else icon="ant-design:minus-outlined" />
            {{ Math.abs(data.trend) }}%
          </span>
          <span class="trend-label">{{ data.trendLabel }}</span>
        </div>
      </div>
      <div class="stat-card-right">
        <div
          class="stat-icon"
          :style="{ backgroundColor: data.color ? `${data.color}15` : '#1890ff15' }"
        >
          <Icon
            :icon="data.icon || 'ant-design:bar-chart-outlined'"
            :style="{ color: data.color || '#1890ff' }"
            :size="48"
          />
        </div>
      </div>
    </div>
    <div v-if="data.footer" class="stat-footer">
      {{ data.footer }}
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Card } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import type { StatCardData } from '../Dashboard.data';

interface Props {
  data: StatCardData;
}

const props = defineProps<Props>();

const formatValue = (value: number | string): string => {
  if (typeof value === 'number') {
    if (value >= 10000) {
      return (value / 10000).toFixed(2) + 'w';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'k';
    }
    return value.toFixed(0);
  }
  return value;
};

const getTrendClass = () => {
  if (props.data.trend && props.data.trend > 0) {
    return 'trend-up';
  } else if (props.data.trend && props.data.trend < 0) {
    return 'trend-down';
  }
  return 'trend-stable';
};
</script>

<style lang="less" scoped>
.stat-card {
  height: 100%;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  :deep(.ant-card-body) {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-card-left {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.2;
  margin-bottom: 8px;

  .prefix,
  .suffix {
    font-size: 20px;
    font-weight: 400;
    margin: 0 4px;
  }
}

.stat-trend {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .trend-value {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;

    &.trend-up {
      color: #52c41a;
    }

    &.trend-down {
      color: #ff4d4f;
    }

    &.trend-stable {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .trend-label {
    color: rgba(0, 0, 0, 0.45);
  }
}

.stat-card-right {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
