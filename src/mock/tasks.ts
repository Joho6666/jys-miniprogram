import type { FileFormat, Task, TaskCategory } from '@/types';
import { at } from './db';

/**
 * 教研室事务任务（教师端可见的教研室共享事务池）
 * 说明：owner 为该事务牵头教师，publisher 为发布人（教学秘书 / 教研室主任）。
 */
const NAMED_TASKS: Task[] = [
  {
    id: 'task-001',
    title: '省级一流课程申报材料提交',
    category: '项目申报',
    ownerId: 'user-001',
    ownerName: '张老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-6, '10:00'),
    deadline: at(2, '18:00'),
    description:
      '根据本科生院《关于开展本年度省级一流课程申报工作的通知》要求，提交省级一流课程申报支撑材料，包括课程建设报告、教学团队介绍、教学资源清单等。材料须经教研室初审后统一上传，请确保各项佐证文件真实、完备、格式符合规范。',
    guide: '教通字〔2026〕42号',
    attachments: [
      { id: 'att-001', name: '申报材料模板.docx', format: 'DOCX', sizeKB: 1220, note: '规范申报书格式' },
      { id: 'att-002', name: '填报说明与撰写指南.pdf', format: 'PDF', sizeKB: 856, note: '填写要点及范例' },
      { id: 'att-003', name: '评分指标体系与自评表.xlsx', format: 'XLSX', sizeKB: 492, note: '专家评审参考细则' },
    ],
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-002',
    title: '2026年秋季教学进度表提交',
    category: '教学建设',
    ownerId: 'user-002',
    ownerName: '王老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-20, '09:00'),
    deadline: at(-10, '18:00'),
    description: '请各课程负责人提交本学期教学进度表，需与人才培养方案学时分配一致。',
    attachments: [{ id: 'att-006', name: '教学进度表模板.xlsx', format: 'XLSX', sizeKB: 86, note: '按模板填写' }],
    status: 'COMPLETED',
  },
  {
    id: 'task-003',
    title: '课程教学大纲提交',
    category: '教学建设',
    ownerId: 'user-001',
    ownerName: '张老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-13, '09:00'),
    deadline: at(-3, '18:00'),
    description:
      '按照新版培养方案修订课程教学大纲，须包含课程目标与毕业要求的支撑关系矩阵、考核方式与成绩构成说明。修订稿需经课程组集体讨论后提交。',
    guide: '教通字〔2026〕38号',
    attachments: [{ id: 'att-007', name: '教学大纲模板.docx', format: 'DOCX', sizeKB: 210, note: '含支撑关系矩阵示例' }],
    status: 'COMPLETED',
  },
  {
    id: 'task-004',
    title: '青年教师听课记录提交',
    category: '日常事务',
    ownerId: 'user-003',
    ownerName: '李老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-6, '09:30'),
    deadline: at(9, '18:00'),
    description: '请提交本学期青年教师互相听课记录，每位教师不少于 4 次，记录需包含课堂评价与改进建议，并附院系领导签章页。',
    attachments: [{ id: 'att-004', name: '听课记录表模板.docx', format: 'DOCX', sizeKB: 380, note: '含评价维度说明' }],
    status: 'REJECTED',
  },
  {
    id: 'task-005',
    title: '教学质量检查材料',
    category: '材料归档',
    ownerId: 'user-004',
    ownerName: '陈老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-5, '10:00'),
    deadline: at(19, '18:00'),
    description: '根据学校期中教学检查安排，提交课程教学质量自查表与试卷抽查情况汇总。',
    attachments: [{ id: 'att-008', name: '教学质量自查表.docx', format: 'DOCX', sizeKB: 260, note: '按检查要点逐项填写' }],
    status: 'PENDING_REVIEW',
  },
  {
    id: 'task-006',
    title: '教研室经费使用情况汇报',
    category: '经费管理',
    ownerId: 'user-007',
    ownerName: '李主任',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-2, '09:50'),
    deadline: at(1, '18:00'),
    description: '请汇报本年度教研室经费使用明细及下学期预算计划，明细表需与财务系统支出凭证一一对应。',
    attachments: [{ id: 'att-005', name: '经费使用明细表.xlsx', format: 'XLSX', sizeKB: 210, note: '含预算科目说明' }],
    status: 'NOT_STARTED',
  },
  {
    id: 'task-007',
    title: '教改项目申报材料',
    category: '项目申报',
    ownerId: 'user-005',
    ownerName: '刘老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-3, '14:00'),
    deadline: at(24, '18:00'),
    description: '本年度教育教学改革研究项目申报，需提交项目申请书、前期研究基础说明及经费预算表。',
    guide: '教通字〔2026〕45号',
    attachments: [{ id: 'att-009', name: '教改项目申请书.docx', format: 'DOCX', sizeKB: 320, note: '校级评审统一格式' }],
    status: 'NOT_STARTED',
  },
  {
    id: 'task-008',
    title: '教材编写立项申请',
    category: '教材建设',
    ownerId: 'user-001',
    ownerName: '张老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-11, '10:00'),
    deadline: at(17, '18:00'),
    description: '申请专业核心课程教材编写立项，需提交编写大纲、样章及出版社意向函。',
    attachments: [{ id: 'att-010', name: '教材立项申请书.docx', format: 'DOCX', sizeKB: 180, note: '附样章格式要求' }],
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-009',
    title: '实验室建设方案论证',
    category: '实验室建设',
    ownerId: 'user-006',
    ownerName: '赵老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-19, '09:00'),
    deadline: at(-9, '18:00'),
    description: '提交专业实验室建设方案论证报告，包含设备清单、经费概算与安全评估。',
    attachments: [{ id: 'att-011', name: '实验室建设方案模板.docx', format: 'DOCX', sizeKB: 240, note: '含设备清单表' }],
    status: 'COMPLETED',
  },
  {
    id: 'task-010',
    title: '教研活动总结',
    category: '日常事务',
    ownerId: 'user-003',
    ownerName: '李老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-24, '09:00'),
    deadline: at(-16, '18:00'),
    description: '提交上学期教研活动开展情况总结，含活动主题、参与人数与成效说明。',
    attachments: [{ id: 'att-012', name: '教研活动总结模板.docx', format: 'DOCX', sizeKB: 120, note: '按条目整理' }],
    status: 'COMPLETED',
  },
  {
    id: 'task-011',
    title: '学生评教结果确认表',
    category: '教学建设',
    ownerId: 'user-002',
    ownerName: '王老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-16, '09:00'),
    deadline: at(-6, '18:00'),
    description: '核对上学期学生评教结果并提交确认表，如有异议需在备注栏说明。',
    attachments: [{ id: 'att-013', name: '学生评教确认表.xlsx', format: 'XLSX', sizeKB: 96, note: '含评教得分明细' }],
    status: 'COMPLETED',
  },
  {
    id: 'task-012',
    title: '课程思政示范课堂申报',
    category: '教学建设',
    ownerId: 'user-005',
    ownerName: '刘老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-1, '10:00'),
    deadline: at(29, '18:00'),
    description: '申报课程思政示范课堂，需提交课程思政教学设计、课堂实录安排与育人成效说明。',
    attachments: [{ id: 'att-014', name: '课程思政申报表.docx', format: 'DOCX', sizeKB: 150, note: '含教学设计模板' }],
    status: 'NOT_STARTED',
  },
  {
    id: 'task-013',
    title: '毕业设计（论文）选题汇总表',
    category: '教学建设',
    ownerId: 'user-001',
    ownerName: '张老师',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-9, '10:00'),
    deadline: at(14, '18:00'),
    description: '汇总本届毕业设计（论文）选题，确保题目与专业方向匹配且无重复选题。',
    attachments: [{ id: 'att-015', name: '毕业设计选题汇总表.xlsx', format: 'XLSX', sizeKB: 130, note: '按专业方向分类' }],
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-014',
    title: '教师个人年度考核表提交',
    category: '人事事务',
    ownerId: 'user-007',
    ownerName: '李主任',
    publisherId: 'user-002',
    publisherName: '王老师',
    publishedAt: at(-13, '09:00'),
    deadline: at(39, '18:00'),
    description: '填写个人年度考核表，教学工作量以教务系统导出数据为准，科研情况附佐证材料。',
    attachments: [{ id: 'att-016', name: '年度考核表.docx', format: 'DOCX', sizeKB: 200, note: '含工作量核算说明' }],
    status: 'IN_PROGRESS',
  },
  {
    id: 'task-015',
    title: '教师企业实践情况登记表',
    category: '人事事务',
    ownerId: 'user-004',
    ownerName: '陈老师',
    publisherId: 'user-007',
    publisherName: '李主任',
    publishedAt: at(-16, '09:00'),
    deadline: at(-3, '18:00'),
    description: '登记本年度教师企业实践情况，需提供实践单位证明与工作总结。',
    attachments: [{ id: 'att-017', name: '企业实践登记表.docx', format: 'DOCX', sizeKB: 110, note: '需实践单位盖章' }],
    status: 'IN_PROGRESS',
  },
];

/* ---------------------------------------------------------------------
   历年已归档任务（用于让「我的任务 / 已完成」具备真实体量）
   --------------------------------------------------------------------- */
const COURSES = [
  '工程经济学',
  '工程项目管理',
  '建筑工程计量与计价',
  '运筹学',
  '工程合同管理',
  'BIM技术基础',
  '工程施工技术',
  '工程财务管理',
];

const HISTORY_KINDS: Array<{ label: string; format: FileFormat; sizeKB: number; ext: string }> = [
  { label: '教学日历', format: 'XLSX', sizeKB: 88, ext: 'xlsx' },
  { label: '作业批改记录', format: 'PDF', sizeKB: 462, ext: 'pdf' },
];

const HISTORY_OWNERS = ['王老师', '李老师', '陈老师', '刘老师', '赵老师'];

function buildHistoryTasks(): Task[] {
  const list: Task[] = [];
  let index = 0;
  for (let i = 0; i < COURSES.length; i += 1) {
    for (let k = 0; k < HISTORY_KINDS.length; k += 1) {
      const course = COURSES[i];
      const kind = HISTORY_KINDS[k];
      const ownerName = HISTORY_OWNERS[index % HISTORY_OWNERS.length];
      const id = `task-${String(index + 16).padStart(3, '0')}`;
      list.push({
        id,
        title: `《${course}》${kind.label}提交`,
        category: '教学建设' as TaskCategory,
        ownerId: `user-00${(index % 5) + 2}`,
        ownerName,
        publisherId: 'user-002',
        publisherName: '王老师',
        publishedAt: at(-30 + index, '09:00'),
        deadline: at(-22 + index, '18:00'),
        description: `按教学管理要求提交《${course}》本学期${kind.label}，材料需经课程组核对后上传归档。`,
        attachments: [
          {
            id: `att-${String(index + 20).padStart(3, '0')}`,
            name: `${course}_${kind.label}模板.${kind.ext}`,
            format: kind.format,
            sizeKB: 60,
            note: '统一模板',
          },
        ],
        status: 'COMPLETED',
      });
      index += 1;
    }
  }
  return list;
}

/** 全部任务（具名 + 历史归档） */
export const MOCK_TASKS: Task[] = [...NAMED_TASKS, ...buildHistoryTasks()];
