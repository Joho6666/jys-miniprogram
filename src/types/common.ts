/**
 * 通用业务类型 —— 全系统统一状态与文件格式的唯一来源
 */

/** 全系统统一业务状态（8 态）：状态视觉由 StatusTag 组件唯一渲染 */
export type BizStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DUE_SOON'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'REJECTED';

export interface StatusMeta {
  label: string;
  /** 标签底色 */
  bg: string;
  /** 标签文字色 */
  color: string;
  /** 标签描边色 */
  border: string;
}

/** 状态三件套：成功 / 警示 / 待审 / 驳回-逾期 / 中性 */
export const STATUS_META: Record<BizStatus, StatusMeta> = {
  NOT_STARTED: { label: '未开始', bg: '#F2F3F5', color: '#4E5969', border: '#E5E7EB' },
  IN_PROGRESS: { label: '进行中', bg: '#E8F3FF', color: '#1677FF', border: '#91CAFF' },
  DUE_SOON: { label: '即将截止', bg: '#FFF7E6', color: '#FA8C16', border: '#FFD591' },
  PENDING_REVIEW: { label: '待审核', bg: '#FFFBE6', color: '#FAAD14', border: '#FFE58F' },
  APPROVED: { label: '已通过', bg: '#F6FFED', color: '#52C41A', border: '#B7EB8F' },
  COMPLETED: { label: '已完成', bg: '#F6FFED', color: '#52C41A', border: '#B7EB8F' },
  OVERDUE: { label: '已逾期', bg: '#FFF1F0', color: '#FF4D4F', border: '#FFA39E' },
  REJECTED: { label: '已驳回', bg: '#FFF1F0', color: '#FF4D4F', border: '#FFA39E' },
};

/** 支持上传的文件格式 */
export type FileFormat = 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX' | 'JPG' | 'PNG';

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/* ---------------------------------------------------------------------
   任务紧急度（设计规范：任务卡展示「紧急 / 即将截止 / 普通」）
   与业务状态互补：待审核 / 已驳回 / 已完成 显示业务状态，其余显示紧急度
   --------------------------------------------------------------------- */
export type UrgencyLevel = 'URGENT' | 'SOON' | 'NORMAL';

export const URGENCY_META: Record<UrgencyLevel, StatusMeta> = {
  URGENT: { label: '紧急', bg: '#FFF1F0', color: '#FF4D4F', border: '#FFA39E' },
  SOON: { label: '即将截止', bg: '#FFF7E6', color: '#FA8C16', border: '#FFD591' },
  NORMAL: { label: '普通', bg: '#F2F3F5', color: '#4E5969', border: '#E5E7EB' },
};

/** 标签类徽标可取的全部键（业务状态 + 紧急度） */
export type BadgeKey = BizStatus | UrgencyLevel;

/** 徽标配色总表：StatusTag 是唯一消费方 */
export const BADGE_META: Record<BadgeKey, StatusMeta> = {
  ...STATUS_META,
  ...URGENCY_META,
};

/* ---------------------------------------------------------------------
   图标色调（设计规范：彩色图标 + 浅色底托 / 实心色块）
   全项目图标配色唯一来源，app-icon 组件消费
   --------------------------------------------------------------------- */
export type IconTone = 'primary' | 'warning' | 'success' | 'danger' | 'review' | 'neutral';

export interface IconToneMeta {
  /** 浅底（soft 变体的底托色） */
  bg: string;
  /** 图标色（soft 变体字形色 / solid 变体的底托色） */
  color: string;
}

export const ICON_TONE_META: Record<IconTone, IconToneMeta> = {
  primary: { bg: '#E8F3FF', color: '#1677FF' },
  warning: { bg: '#FFF7E6', color: '#FA8C16' },
  success: { bg: '#F6FFED', color: '#52C41A' },
  danger: { bg: '#FFF1F0', color: '#FF4D4F' },
  review: { bg: '#FFFBE6', color: '#FAAD14' },
  neutral: { bg: '#F2F3F5', color: '#4E5969' },
};

/** 实心图标块上的字形色 */
export const ICON_ON_SOLID = '#FFFFFF';

export interface FileFormatMeta {
  /** 文件色块内文字 */
  tile: string;
  bg: string;
  color: string;
}

/** 文件类型色块（唯一来源，页面不得自造） */
export const FORMAT_META: Record<FileFormat, FileFormatMeta> = {
  PDF: { tile: 'PDF', bg: '#FFF1F0', color: '#FF4D4F' },
  DOC: { tile: 'W', bg: '#E8F3FF', color: '#1677FF' },
  DOCX: { tile: 'W', bg: '#E8F3FF', color: '#1677FF' },
  XLS: { tile: 'X', bg: '#F6FFED', color: '#52C41A' },
  XLSX: { tile: 'X', bg: '#F6FFED', color: '#52C41A' },
  PPT: { tile: 'P', bg: '#FFF7E6', color: '#FA8C16' },
  PPTX: { tile: 'P', bg: '#FFF7E6', color: '#FA8C16' },
  JPG: { tile: '图', bg: '#FFF7E6', color: '#FA8C16' },
  PNG: { tile: '图', bg: '#FFF7E6', color: '#FA8C16' },
};

/** 允许上传的扩展名 */
export const ACCEPT_EXTENSIONS: string[] = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];

/** 单文件大小上限（KB）= 20MB */
export const MAX_FILE_SIZE_KB = 20 * 1024;

/** 由文件名推断格式，不支持时返回 null */
export function detectFormat(fileName: string): FileFormat | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, FileFormat> = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOCX',
    xls: 'XLS',
    xlsx: 'XLSX',
    ppt: 'PPT',
    pptx: 'PPTX',
    jpg: 'JPG',
    jpeg: 'JPG',
    png: 'PNG',
  };
  return map[ext] ?? null;
}
