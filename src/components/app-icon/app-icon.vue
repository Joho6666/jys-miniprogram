<template>
  <view
    class="app-icon"
    :class="[`app-icon--${size}`, `app-icon--${variant}`, `app-icon--${radius}`]"
    :style="boxStyle"
  >
    <uni-icons :type="name" :size="glyphSize" :color="glyphColor" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IconTone } from '@/types';
import { ICON_ON_SOLID, ICON_TONE_META } from '@/types';

/**
 * 全项目图标统一出口：负责图标底托与配色。
 * - soft：浅色底托 + 彩色字形（宫格、列表、信息行）
 * - solid：实心色块 + 白色字形（统计卡、消息类型）
 * - plain：无底托，仅字形（行内小图标）
 * 颜色一律取自 ICON_TONE_META，页面不得自行指定图标颜色。
 */
type IconSize = 'sm' | 'md' | 'lg';
type IconVariant = 'soft' | 'solid' | 'plain';
type IconRadius = 'circle' | 'square';

interface Props {
  /** uni-icons 图标名 */
  name: string;
  tone?: IconTone;
  variant?: IconVariant;
  size?: IconSize;
  radius?: IconRadius;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'primary',
  variant: 'soft',
  size: 'md',
  radius: 'square',
});

const GLYPH_SIZE: Record<IconSize, number> = { sm: 14, md: 18, lg: 22 };

const meta = computed(() => ICON_TONE_META[props.tone]);
const glyphSize = computed(() => GLYPH_SIZE[props.size]);

const glyphColor = computed(() => (props.variant === 'solid' ? ICON_ON_SOLID : meta.value.color));

const boxStyle = computed(() => {
  if (props.variant === 'plain') return {};
  return { background: props.variant === 'solid' ? meta.value.color : meta.value.bg };
});
</script>

<style lang="scss" scoped>
.app-icon {
  @include flex-center;
  flex-shrink: 0;
}

.app-icon--sm {
  width: $icon-sm;
  height: $icon-sm;
}

.app-icon--md {
  width: $icon-md;
  height: $icon-md;
}

.app-icon--lg {
  width: $icon-lg;
  height: $icon-lg;
}

.app-icon--circle {
  border-radius: 50%;
}

.app-icon--square.app-icon--sm {
  border-radius: 12rpx;
}

.app-icon--square.app-icon--md {
  border-radius: 16rpx;
}

.app-icon--square.app-icon--lg {
  border-radius: 20rpx;
}

.app-icon--plain {
  width: auto;
  height: auto;
  background: transparent;
}
</style>
