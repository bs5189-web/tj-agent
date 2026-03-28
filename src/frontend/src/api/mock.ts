// API Mock - 前端缓存数据
import { reactive } from 'vue'

export interface Plan {
  id: number
  planNo: string
  planName: string
  unitId: number
  unitName: string
  budgetAmount: number
  usedAmount: number
  planType: 'ANNUAL' | 'QUARTER'
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'EXECUTING' | 'COMPLETED'
  planYear: number
  quarter?: number
  remark?: string
  createTime: string
}

export interface Requirement {
  id: number
  reqNo: string
  title: string
  unitId: number
  unitName: string
  budget: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  description: string
  createTime: string
}

export interface Document {
  id: number
  docNo: string
  title: string
  type: string
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED'
  version: number
  createTime: string
}

export interface Contract {
  id: number
  contractNo: string
  title: string
  supplier: string
  amount: number
  status: 'PENDING' | 'SIGNED' | 'EXECUTING' | 'COMPLETED'
  signDate: string
  createTime: string
}

// 初始化数据
const initPlans: Plan[] = [
  { id: 1, planNo: 'JH-2026-001', planName: '办公设备采购计划', unitId: 1, unitName: '技术部', budgetAmount: 150, usedAmount: 90, planType: 'ANNUAL', status: 'EXECUTING', planYear: 2026, remark: '年度办公设备更新', createTime: '2026-01-15 10:00:00' },
  { id: 2, planNo: 'JH-2026-002', planName: '信息系统采购计划', unitId: 2, unitName: '财务部', budgetAmount: 500, usedAmount: 225, planType: 'ANNUAL', status: 'EXECUTING', planYear: 2026, remark: 'ERP系统升级', createTime: '2026-01-20 14:30:00' },
  { id: 3, planNo: 'JD-2026-Q1-001', planName: '办公用品采购', unitId: 1, unitName: '技术部', budgetAmount: 25, usedAmount: 7.5, planType: 'QUARTER', status: 'EXECUTING', planYear: 2026, quarter: 1, remark: 'Q1办公用品', createTime: '2026-03-01 09:00:00' }
]

const initRequirements: Requirement[] = [
  { id: 1, reqNo: 'XQ-2026-001', title: '服务器采购需求', unitId: 1, unitName: '技术部', budget: 50, urgency: 'HIGH', status: 'APPROVED', description: '采购2台高性能服务器', createTime: '2026-03-20 10:00:00' },
  { id: 2, reqNo: 'XQ-2026-002', title: '办公桌椅更换', unitId: 2, unitName: '财务部', budget: 15, urgency: 'MEDIUM', status: 'SUBMITTED', description: '更换10套办公桌椅', createTime: '2026-03-22 14:30:00' }
]

const initDocuments: Document[] = [
  { id: 1, docNo: 'WJ-2026-001', title: '招标文件中', type: '招标', status: 'APPROVED', version: 2, createTime: '2026-03-15 10:00:00' },
  { id: 2, docNo: 'WJ-2026-002', title: '采购合同模板', type: '合同', status: 'DRAFT', version: 1, createTime: '2026-03-18 14:30:00' }
]

const initContracts: Contract[] = [
  { id: 1, contractNo: 'HT-2026-001', title: '服务器采购合同', supplier: '华为技术有限公司', amount: 48, status: 'EXECUTING', signDate: '2026-03-25', createTime: '2026-03-25 10:00:00' },
  { id: 2, contractNo: 'HT-2026-002', title: '办公用品采购合同', supplier: '得力集团有限公司', amount: 12.5, status: 'SIGNED', signDate: '2026-03-20', createTime: '2026-03-20 15:30:00' }
]

// 数据存储
class MockStore {
  private plans: Plan[] = reactive(initPlans)
  private requirements: Requirement[] = reactive(initRequirements)
  private documents: Document[] = reactive(initDocuments)
  private contracts: Contract[] = reactive(initContracts)

  // Plan CRUD
  getPlans() { return this.plans }
  getPlanById(id: number) { return this.plans.find(p => p.id === id) }
  addPlan(plan: Omit<Plan, 'id'>) {
    const newPlan = { ...plan, id: Math.max(...this.plans.map(p => p.id)) + 1 }
    this.plans.push(newPlan)
    return newPlan
  }
  updatePlan(id: number, data: Partial<Plan>) {
    const index = this.plans.findIndex(p => p.id === id)
    if (index !== -1) Object.assign(this.plans[index], data)
    return this.plans[index]
  }
  deletePlan(id: number) {
    const index = this.plans.findIndex(p => p.id === id)
    if (index !== -1) this.plans.splice(index, 1)
  }

  // Requirement CRUD
  getRequirements() { return this.requirements }
  getRequirementById(id: number) { return this.requirements.find(r => r.id === id) }
  addRequirement(req: Omit<Requirement, 'id'>) {
    const newReq = { ...req, id: Math.max(...this.requirements.map(r => r.id)) + 1 }
    this.requirements.push(newReq)
    return newReq
  }
  updateRequirement(id: number, data: Partial<Requirement>) {
    const index = this.requirements.findIndex(r => r.id === id)
    if (index !== -1) Object.assign(this.requirements[index], data)
    return this.requirements[index]
  }
  deleteRequirement(id: number) {
    const index = this.requirements.findIndex(r => r.id === id)
    if (index !== -1) this.requirements.splice(index, 1)
  }

  // Document CRUD
  getDocuments() { return this.documents }
  getDocumentById(id: number) { return this.documents.find(d => d.id === id) }
  addDocument(doc: Omit<Document, 'id'>) {
    const newDoc = { ...doc, id: Math.max(...this.documents.map(d => d.id)) + 1 }
    this.documents.push(newDoc)
    return newDoc
  }
  updateDocument(id: number, data: Partial<Document>) {
    const index = this.documents.findIndex(d => d.id === id)
    if (index !== -1) Object.assign(this.documents[index], data)
    return this.documents[index]
  }
  deleteDocument(id: number) {
    const index = this.documents.findIndex(d => d.id === id)
    if (index !== -1) this.documents.splice(index, 1)
  }

  // Contract CRUD
  getContracts() { return this.contracts }
  getContractById(id: number) { return this.contracts.find(c => c.id === id) }
  addContract(contract: Omit<Contract, 'id'>) {
    const newContract = { ...contract, id: Math.max(...this.contracts.map(c => c.id)) + 1 }
    this.contracts.push(newContract)
    return newContract
  }
  updateContract(id: number, data: Partial<Contract>) {
    const index = this.contracts.findIndex(c => c.id === id)
    if (index !== -1) Object.assign(this.contracts[index], data)
    return this.contracts[index]
  }
  deleteContract(id: number) {
    const index = this.contracts.findIndex(c => c.id === id)
    if (index !== -1) this.contracts.splice(index, 1)
  }
}

export const mockStore = new MockStore()
