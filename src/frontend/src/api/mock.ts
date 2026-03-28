// 采购系统Mock数据

export interface Plan {
  id: number
  planNo: string
  planYear: number
  unitName: string
  totalAmount: number
  itemCount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createTime: string
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
}

export interface Contract {
  id: number
  contractNo: string
  title: string
  supplierName: string
  totalAmount: number
  signDate: string
  status: 'draft' | 'pending' | 'signed' | 'performing' | 'completed'
}

// 采购计划数据
export const planData: Plan[] = [
  { id: 1, planNo: 'PLAN-2024-001', planYear: 2024, unitName: '信息中心', totalAmount: 5000000, itemCount: 45, status: 'approved', createTime: '2024-01-15' },
  { id: 2, planNo: 'PLAN-2024-002', planYear: 2024, unitName: '后勤保障部', totalAmount: 3200000, itemCount: 28, status: 'pending', createTime: '2024-01-18' },
  { id: 3, planNo: 'PLAN-2024-003', planYear: 2024, unitName: '装备管理部', totalAmount: 8500000, itemCount: 62, status: 'draft', createTime: '2024-02-01' },
  { id: 4, planNo: 'PLAN-2024-004', planYear: 2024, unitName: '科研技术部', totalAmount: 4200000, itemCount: 35, status: 'approved', createTime: '2024-02-10' },
  { id: 5, planNo: 'PLAN-2024-005', planYear: 2024, unitName: '财务部', totalAmount: 1800000, itemCount: 15, status: 'rejected', createTime: '2024-02-15' },
  { id: 6, planNo: 'PLAN-2024-006', planYear: 2024, unitName: '综合管理部', totalAmount: 2800000, itemCount: 22, status: 'approved', createTime: '2024-02-20' },
  { id: 7, planNo: 'PLAN-2024-007', planYear: 2024, unitName: '人事部', totalAmount: 950000, itemCount: 12, status: 'pending', createTime: '2024-03-01' },
  { id: 8, planNo: 'PLAN-2024-008', planYear: 2024, unitName: '信息中心', totalAmount: 6200000, itemCount: 48, status: 'draft', createTime: '2024-03-05' },
  { id: 9, planNo: 'PLAN-2024-009', planYear: 2024, unitName: '后勤保障部', totalAmount: 1580000, itemCount: 18, status: 'approved', createTime: '2024-03-10' },
  { id: 10, planNo: 'PLAN-2024-010', planYear: 2024, unitName: '装备管理部', totalAmount: 4800000, itemCount: 38, status: 'pending', createTime: '2024-03-15' },
  { id: 11, planNo: 'PLAN-2024-011', planYear: 2024, unitName: '科研技术部', totalAmount: 7200000, itemCount: 55, status: 'approved', createTime: '2024-03-18' },
  { id: 12, planNo: 'PLAN-2024-012', planYear: 2024, unitName: '财务部', totalAmount: 2100000, itemCount: 20, status: 'draft', createTime: '2024-03-20' },
]

// 采购需求数据
export const requirementData: Requirement[] = [
  { id: 1, reqNo: 'REQ-2024-156', title: '办公设备采购', department: '信息中心', goodsName: '笔记本电脑', estimatedPrice: 80000, urgencyLevel: 'medium', status: 'approved', createTime: '2024-03-15' },
  { id: 2, reqNo: 'REQ-2024-157', title: '会议室设备更新', department: '后勤保障部', goodsName: '投影仪', estimatedPrice: 45000, urgencyLevel: 'low', status: 'pending', createTime: '2024-03-18' },
  { id: 3, reqNo: 'REQ-2024-158', title: '安全监控系统', department: '装备管理部', goodsName: '监控摄像头', estimatedPrice: 120000, urgencyLevel: 'high', status: 'checking', createTime: '2024-03-20' },
  { id: 4, reqNo: 'REQ-2024-159', title: '网络设备升级', department: '信息中心', goodsName: '交换机', estimatedPrice: 150000, urgencyLevel: 'high', status: 'pending', createTime: '2024-03-21' },
  { id: 5, reqNo: 'REQ-2024-160', title: '办公桌椅采购', department: '综合管理部', goodsName: '办公桌椅', estimatedPrice: 60000, urgencyLevel: 'low', status: 'approved', createTime: '2024-03-22' },
  { id: 6, reqNo: 'REQ-2024-161', title: '打印设备更新', department: '财务部', goodsName: '打印机', estimatedPrice: 35000, urgencyLevel: 'medium', status: 'pending', createTime: '2024-03-23' },
  { id: 7, reqNo: 'REQ-2024-162', title: '空调设备采购', department: '后勤保障部', goodsName: '空调', estimatedPrice: 200000, urgencyLevel: 'high', status: 'draft', createTime: '2024-03-24' },
  { id: 8, reqNo: 'REQ-2024-163', title: '消防设备更新', department: '装备管理部', goodsName: '灭火器', estimatedPrice: 25000, urgencyLevel: 'medium', status: 'approved', createTime: '2024-03-25' },
]

// 采购文档数据
export const documentData: Document[] = [
  { id: 1, docNo: 'DOC-2024-001', title: '办公设备采购招标文件', category: '货物类', purchaseType: '公开招标', status: 'approved', version: 'V2.1', createTime: '2024-03-10' },
  { id: 2, docNo: 'DOC-2024-002', title: '软件开发服务采购文件', category: '服务类', purchaseType: '竞争性谈判', status: 'pending', version: 'V1.0', createTime: '2024-03-15' },
  { id: 3, docNo: 'DOC-2024-003', title: '网络安全设备采购文件', category: '货物类', purchaseType: '邀请招标', status: 'draft', version: 'V1.0', createTime: '2024-03-20' },
  { id: 4, docNo: 'DOC-2024-004', title: '办公家具采购招标文件', category: '货物类', purchaseType: '公开招标', status: 'approved', version: 'V1.2', createTime: '2024-03-12' },
  { id: 5, docNo: 'DOC-2024-005', title: '空调设备采购文件', category: '货物类', purchaseType: '询价采购', status: 'pending', version: 'V1.0', createTime: '2024-03-18' },
  { id: 6, docNo: 'DOC-2024-006', title: '网络运维服务采购文件', category: '服务类', purchaseType: '竞争性谈判', status: 'approved', version: 'V2.0', createTime: '2024-03-08' },
]

// 采购评审数据
export const reviewData: Review[] = [
  { id: 1, sessionNo: 'REV-2024-001', documentTitle: '办公设备采购评审', expertCount: 5, status: 'completed', progress: 100, startTime: '2024-03-15 09:00', endTime: '2024-03-15 17:00' },
  { id: 2, sessionNo: 'REV-2024-002', documentTitle: '软件开发服务采购评审', expertCount: 7, status: 'ongoing', progress: 65, startTime: '2024-03-20 09:00', endTime: '-' },
  { id: 3, sessionNo: 'REV-2024-003', documentTitle: '网络安全设备评审', expertCount: 5, status: 'preparing', progress: 0, startTime: '-', endTime: '-' },
  { id: 4, sessionNo: 'REV-2024-004', documentTitle: '办公家具采购评审', expertCount: 6, status: 'ongoing', progress: 40, startTime: '2024-03-22 09:00', endTime: '-' },
  { id: 5, sessionNo: 'REV-2024-005', documentTitle: '空调设备采购评审', expertCount: 5, status: 'preparing', progress: 10, startTime: '-', endTime: '-' },
]

// 采购合同数据
export const contractData: Contract[] = [
  { id: 1, contractNo: 'CON-2024-089', title: '办公设备采购合同', supplierName: 'XX科技有限公司', totalAmount: 800000, signDate: '2024-02-15', status: 'performing' },
  { id: 2, contractNo: 'CON-2024-090', title: '软件开发服务合同', supplierName: 'YY软件公司', totalAmount: 1500000, signDate: '2024-03-01', status: 'signed' },
  { id: 3, contractNo: 'CON-2024-091', title: '网络安全设备合同', supplierName: 'ZZ网络公司', totalAmount: 2000000, signDate: '2024-03-10', status: 'pending' },
  { id: 4, contractNo: 'CON-2024-088', title: '办公家具采购合同', supplierName: 'AA家具公司', totalAmount: 350000, signDate: '2024-01-20', status: 'completed' },
  { id: 5, contractNo: 'CON-2024-092', title: '空调设备采购合同', supplierName: 'BB制冷公司', totalAmount: 500000, signDate: '2024-03-05', status: 'signed' },
  { id: 6, contractNo: 'CON-2024-093', title: '网络运维服务合同', supplierName: 'CC网络公司', totalAmount: 800000, signDate: '2024-02-28', status: 'performing' },
  { id: 7, contractNo: 'CON-2024-087', title: '打印设备采购合同', supplierName: 'DD办公公司', totalAmount: 280000, signDate: '2024-01-15', status: 'completed' },
  { id: 8, contractNo: 'CON-2024-094', title: '监控设备采购合同', supplierName: 'EE安防公司', totalAmount: 650000, signDate: '2024-03-12', status: 'pending' },
]

// 待办事项
export const todoListData = [
  { id: 1, title: '审批2024年度采购计划', time: '03-28', priority: '高' },
  { id: 2, title: '审核采购需求单 #REQ-2024-159', time: '03-28', priority: '高' },
  { id: 3, title: '合同履约节点确认', time: '03-29', priority: '中' },
  { id: 4, title: '评审会议安排', time: '03-30', priority: '中' },
  { id: 5, title: '招标文件审批', time: '03-31', priority: '低' },
]

// 预警通知
export const warningListData = [
  { id: 1, title: '合同CON-2024-089即将到期', time: '剩余7天', type: 'warning' },
  { id: 2, title: '履约节点超期3天未处理', time: '超期', type: 'error' },
  { id: 3, title: '采购需求待审核(2条)', time: '待处理', type: 'info' },
  { id: 4, title: '合同CON-2024-091待签署', time: '待签署', type: 'warning' },
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
