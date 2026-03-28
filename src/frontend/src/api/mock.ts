// 采购系统Mock数据

// 项目编号前缀列表，用于串联各模块数据
const projectNos = ['PJ-2024-001', 'PJ-2024-002', 'PJ-2024-003', 'PJ-2024-004', 'PJ-2024-005']

export interface Plan {
  id: number
  planNo: string
  planYear: number
  unitName: string
  totalAmount: number
  itemCount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createTime: string
  projectNo?: string  // 关联项目编号
}

export interface Requirement {
  id: number
  reqNo: string
  title: string
  department: string
  goodsName: string
  estimatedPrice: number
  urgencyLevel: 'low' | 'medium' | 'high'
  status: 'draft' | 'checking' | 'pending' | 'approved' | 'rejected'
  createTime: string
  projectNo?: string  // 关联项目编号
  planId?: number     // 关联计划ID
  contractId?: number // 关联合同ID
}

export interface Document {
  id: number
  docNo: string
  title: string
  category: string
  purchaseType: string
  version: string
  status: 'draft' | 'pending' | 'approved'
  createTime: string
  projectNo?: string  // 关联项目编号
  requirementId?: number // 关联需求ID
}

export interface Review {
  id: number
  sessionNo: string
  documentTitle: string
  expertCount: number
  status: 'preparing' | 'ongoing' | 'completed'
  progress: number
  startTime: string
  endTime: string
  score?: number
  scoreTime?: string
  projectNo?: string  // 关联项目编号
  contractId?: number // 关联合同ID
}

export interface Contract {
  id: number
  contractNo: string
  title: string
  supplierName: string
  totalAmount: number
  signDate: string
  status: 'draft' | 'pending' | 'signed' | 'performing' | 'completed'
  projectNo?: string  // 关联项目编号
  requirementId?: number // 关联需求ID
}

// 部门列表
const departments = ['信息中心', '后勤保障部', '装备管理部', '科研技术部', '财务部', '综合管理部', '人事部', '采购部', '质量管理部', '安全监督部']

// 物品列表
const goodsList = ['笔记本电脑', '台式电脑', '投影仪', '打印机', '复印机', '扫描仪', '显示器', '键盘鼠标', '办公桌椅', '文件柜', '空调', '冰箱', '饮水机', '监控摄像头', '交换机', '路由器', '服务器', '防火墙', '办公用品', '打印纸']

// 供应商列表
const suppliers = ['XX科技有限公司', 'YY软件公司', 'ZZ网络公司', 'AA家具公司', 'BB制冷公司', 'CC网络公司', 'DD办公公司', 'EE安防公司', 'FF信息技术公司', 'GG电子科技公司', 'HH办公设备公司', 'II系统集成公司', 'JJ安全设备公司', 'KK办公用品公司']

// 文档类型
const docCategories = ['货物类', '服务类', '工程类']
const purchaseTypes = ['公开招标', '邀请招标', '竞争性谈判', '询价采购', '单一来源']

// 状态
const planStatuses: Plan['status'][] = ['draft', 'pending', 'approved', 'rejected']
const requirementStatuses: Requirement['status'][] = ['draft', 'checking', 'pending', 'approved', 'rejected']
const documentStatuses: Document['status'][] = ['draft', 'pending', 'approved']
const reviewStatuses: Review['status'][] = ['preparing', 'ongoing', 'completed']
const contractStatuses: Contract['status'][] = ['draft', 'pending', 'signed', 'performing', 'completed']
const urgencyLevels: Requirement['urgencyLevel'][] = ['low', 'medium', 'high']

// 随机选择
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// 生成日期
const generateDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

// 生成采购计划数据 (120条)
export const planData: Plan[] = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  planNo: `PLAN-2024-${String(i + 1).padStart(3, '0')}`,
  planYear: 2024,
  unitName: randomPick(departments),
  totalAmount: randomInt(500000, 15000000),
  itemCount: randomInt(5, 100),
  status: randomPick(planStatuses),
  createTime: generateDate(randomInt(0, 90)),
  projectNo: projectNos[i % projectNos.length],
}))

// 生成采购需求数据 (80条) - 关联到计划和合同
export const requirementData: Requirement[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  reqNo: `REQ-2024-${156 + i}`,
  title: `${randomPick(goodsList)}采购`,
  department: randomPick(departments),
  goodsName: randomPick(goodsList),
  estimatedPrice: randomInt(10000, 500000),
  urgencyLevel: randomPick(urgencyLevels),
  status: randomPick(requirementStatuses),
  createTime: generateDate(randomInt(0, 60)),
  projectNo: projectNos[i % projectNos.length],
  planId: (i % 40) + 1,      // 关联到前40个计划
  contractId: (i % 30) + 1,  // 部分需求关联到合同
}))

// 生成采购文档数据 (60条) - 关联到需求
export const documentData: Document[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  docNo: `DOC-2024-${String(i + 1).padStart(3, '0')}`,
  title: `${randomPick(goodsList)}采购招标文件`,
  category: randomPick(docCategories),
  purchaseType: randomPick(purchaseTypes),
  version: `V1.${randomInt(0, 9)}`,
  status: randomPick(documentStatuses),
  createTime: generateDate(randomInt(0, 45)),
  projectNo: projectNos[i % projectNos.length],
  requirementId: (i % 40) + 1,  // 关联到需求
}))

// 生成采购评审数据 (50条) - 关联到合同
export const reviewData: Review[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  sessionNo: `REV-2024-${String(i + 1).padStart(3, '0')}`,
  documentTitle: `${randomPick(goodsList)}采购评审`,
  expertCount: randomInt(5, 9),
  status: randomPick(reviewStatuses),
  progress: randomInt(0, 100),
  startTime: randomInt(0, 1) === 0 ? '-' : `2024-03-${randomInt(10, 25)} 09:00`,
  endTime: randomInt(0, 1) === 0 ? '-' : `2024-03-${randomInt(10, 25)} 17:00`,
  projectNo: projectNos[i % projectNos.length],
  contractId: (i % 30) + 1,  // 关联到合同
}))

// 生成采购合同数据 (80条) - 关联到需求
export const contractData: Contract[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  contractNo: `CON-2024-${String(87 + i).padStart(3, '0')}`,
  title: `${randomPick(goodsList)}采购合同`,
  supplierName: randomPick(suppliers),
  totalAmount: randomInt(100000, 5000000),
  signDate: generateDate(randomInt(0, 120)),
  status: randomPick(contractStatuses),
  projectNo: projectNos[i % projectNos.length],
  requirementId: (i % 40) + 1,  // 关联到需求
}))

// 待办事项
export const todoListData = [
  { id: 1, title: '审批2024年度采购计划', time: '03-28', priority: '高' },
  { id: 2, title: '审核采购需求单 #REQ-2024-159', time: '03-28', priority: '高' },
  { id: 3, title: '合同履约节点确认', time: '03-29', priority: '中' },
  { id: 4, title: '评审会议安排', time: '03-30', priority: '中' },
  { id: 5, title: '招标文件审批', time: '03-31', priority: '低' },
  { id: 6, title: '采购合同签署确认', time: '04-01', priority: '高' },
  { id: 7, title: '供应商资质审核', time: '04-02', priority: '中' },
  { id: 8, title: '采购预算调整审批', time: '04-03', priority: '中' },
  { id: 9, title: '紧急采购需求处理', time: '04-04', priority: '高' },
  { id: 10, title: '季度采购总结报告', time: '04-05', priority: '低' },
]

// 预警通知
export const warningListData = [
  { id: 1, title: '合同CON-2024-089即将到期', time: '剩余7天', type: 'warning' },
  { id: 2, title: '履约节点超期3天未处理', time: '超期', type: 'error' },
  { id: 3, title: '采购需求待审核(5条)', time: '待处理', type: 'info' },
  { id: 4, title: '合同CON-2024-091待签署', time: '待签署', type: 'warning' },
  { id: 5, title: '预算执行率低于预期', time: '提醒', type: 'warning' },
  { id: 6, title: '多个合同即将到期', time: '剩余10天', type: 'warning' },
]

// 统计计算
export const getDashboardStats = () => {
  const pendingRequirements = requirementData.filter(r => r.status === 'pending' || r.status === 'checking').length
  const performingContracts = contractData.filter(c => c.status === 'performing').length
  const completedContracts = contractData.filter(c => c.status === 'completed').length
  const completionRate = Math.round((completedContracts / contractData.length) * 100)

  return {
    totalPlans: planData.length,
    pendingRequirements,
    performingContracts,
    completionRate,
  }
}
