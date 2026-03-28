/**
 * 采购系统 API接口测试
 * 测试框架: Jest + Supertest
 */

const request = require('supertest');

// 测试配置
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 10000;

// 辅助函数：生成随机ID
const generateId = () => `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 辅助函数：等待一定时间
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('采购计划 API 测试', () => {

  // ===== 年度计划测试 =====

  describe('年度计划管理', () => {

    test('PP-API-01: 创建年度采购计划', async () => {
      const planData = {
        planName: '2026年度办公设备采购计划',
        planType: 'YEAR',
        purchaseType: 'GOODS',
        budgetAmount: 500000,
        budgetRange: '50万-100万',
        deptId: 'DEPT-001',
        deptName: '信息技术部',
        creatorId: 'USER-001',
      };

      const response = await request(BASE_URL)
        .post('/plan/year/create')
        .send(planData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('success');
      expect(response.body.data).toHaveProperty('planId');
      expect(response.body.data.status).toBe('DRAFT');
    }, TEST_TIMEOUT);

    test('PP-API-02: 更新年度采购计划', async () => {
      const planId = 'PLAN-2026-001';
      const updateData = {
        planName: '2026年度办公设备采购计划(修订版)',
        budgetAmount: 550000,
      };

      const response = await request(BASE_URL)
        .put('/plan/year/update')
        .send({ planId, ...updateData })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('success');
    }, TEST_TIMEOUT);

    test('PP-API-03: 删除年度采购计划', async () => {
      const planId = 'PLAN-2026-002';

      const response = await request(BASE_URL)
        .delete(`/plan/year/delete?planId=${planId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('success');
    }, TEST_TIMEOUT);

    test('PP-API-04: 查询年度计划列表', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        planType: 'YEAR',
      };

      const response = await request(BASE_URL)
        .get('/plan/year/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.list)).toBe(true);
    }, TEST_TIMEOUT);

    test('PP-API-05: 汇总年度计划', async () => {
      const summaryParams = {
        deptId: 'DEPT-001',
        summaryType: 'BY_PURCHASE_TYPE',
      };

      const response = await request(BASE_URL)
        .get('/plan/year/summary')
        .query(summaryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('summaryList');
    }, TEST_TIMEOUT);

  });

  // ===== 季度计划测试 =====

  describe('季度明细计划', () => {

    test('PP-API-06: 创建季度计划', async () => {
      const quarterData = {
        planName: '2026年Q1办公设备采购明细',
        parentPlanId: 'PLAN-2026-001',
        quarter: 'Q1',
        purchaseType: 'GOODS',
        budgetAmount: 125000,
        deptId: 'DEPT-001',
        creatorId: 'USER-001',
      };

      const response = await request(BASE_URL)
        .post('/plan/quarter/create')
        .send(quarterData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.parentPlanId).toBe('PLAN-2026-001');
    }, TEST_TIMEOUT);

    test('PP-API-07: 调整季度计划', async () => {
      const adjustData = {
        planId: 'PLAN-Q1-001',
        adjustType: 'INCREASE',
        adjustAmount: 20000,
        adjustReason: '补充采购需求',
      };

      const response = await request(BASE_URL)
        .put('/plan/quarter/adjust')
        .send(adjustData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  // ===== 统计与分析测试 =====

  describe('采购计划统计', () => {

    test('PP-API-08: 采购计划统计分析', async () => {
      const statsParams = {
        deptId: 'DEPT-001',
        planType: 'YEAR',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      };

      const response = await request(BASE_URL)
        .get('/plan/statistics')
        .query(statsParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data).toHaveProperty('totalBudget');
    }, TEST_TIMEOUT);

    test('PP-API-09: 归档采购计划', async () => {
      const archiveData = {
        planId: 'PLAN-2026-003',
        archiveType: 'AUTO',
      };

      const response = await request(BASE_URL)
        .post('/plan/archive')
        .send(archiveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PP-API-10: 导出采购计划', async () => {
      const exportParams = {
        planIds: ['PLAN-2026-001', 'PLAN-2026-002'],
        format: 'EXCEL',
      };

      const response = await request(BASE_URL)
        .get('/plan/export')
        .query(exportParams)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.ms-excel');
    }, TEST_TIMEOUT);

  });

});

describe('采购需求 API 测试', () => {

  describe('需求发起管理', () => {

    test('PD-API-01: 创建采购需求', async () => {
      const demandData = {
        demandName: '办公笔记本电脑采购',
        demandType: 'GOODS',
        demandDesc: '采购联想ThinkPad笔记本50台',
        deptId: 'DEPT-001',
        deptName: '信息技术部',
        budgetAmount: 300000,
        urgencyLevel: 'MEDIUM',
        planId: 'PLAN-2026-001',
        creatorId: 'USER-001',
      };

      const response = await request(BASE_URL)
        .post('/demand/create')
        .send(demandData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('demandId');
      expect(response.body.data.status).toBe('DRAFT');
    }, TEST_TIMEOUT);

    test('PD-API-02: 更新采购需求', async () => {
      const demandId = 'DEMAND-001';
      const updateData = {
        demandName: '办公笔记本电脑采购(修订版)',
        budgetAmount: 320000,
      };

      const response = await request(BASE_URL)
        .put('/demand/update')
        .send({ demandId, ...updateData })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PD-API-03: 提交采购需求', async () => {
      const demandId = 'DEMAND-001';

      const response = await request(BASE_URL)
        .post('/demand/submit')
        .send({ demandId })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.status).toBe('PENDING_APPROVAL');
    }, TEST_TIMEOUT);

    test('PD-API-04: 查询需求列表', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        status: 'PENDING_APPROVAL',
      };

      const response = await request(BASE_URL)
        .get('/demand/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.list)).toBe(true);
    }, TEST_TIMEOUT);

  });

  describe('需求合规检查', () => {

    test('PD-API-05: 合规检查', async () => {
      const checkData = {
        demandId: 'DEMAND-001',
      };

      const response = await request(BASE_URL)
        .post('/demand/compliance/check')
        .send(checkData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('checkResult');
      expect(response.body.data).toHaveProperty('checkReport');
    }, TEST_TIMEOUT);

  });

  describe('需求审核', () => {

    test('PD-API-06: 需求审批', async () => {
      const approveData = {
        demandId: 'DEMAND-001',
        approveResult: 'APPROVED',
        approveComment: '同意采购',
        approverId: 'USER-002',
      };

      const response = await request(BASE_URL)
        .post('/demand/approve')
        .send(approveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PD-API-07: 撤销需求', async () => {
      const revokeData = {
        demandId: 'DEMAND-002',
        revokeReason: '需求变更',
      };

      const response = await request(BASE_URL)
        .post('/demand/revoke')
        .send(revokeData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PD-API-08: 智能推荐需求', async () => {
      const recommendParams = {
        demandName: '笔记本',
      };

      const response = await request(BASE_URL)
        .get('/demand/recommend')
        .query(recommendParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.recommendList)).toBe(true);
    }, TEST_TIMEOUT);

  });

  describe('需求汇总', () => {

    test('PD-API-09: 需求汇总', async () => {
      const summaryParams = {
        summaryType: 'BY_TYPE',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      };

      const response = await request(BASE_URL)
        .get('/demand/summary')
        .query(summaryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('summaryList');
    }, TEST_TIMEOUT);

    test('PD-API-10: 归档需求', async () => {
      const archiveData = {
        demandId: 'DEMAND-003',
      };

      const response = await request(BASE_URL)
        .post('/demand/archive')
        .send(archiveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

});

describe('采购文件 API 测试', () => {

  describe('文件管理', () => {

    test('PF-API-01: 创建采购文件', async () => {
      const fileData = {
        fileName: '办公设备采购招标文件',
        fileType: 'GOODS',
        purchaseMethod: 'OPEN_TENDER',
        templateId: 'TPL-001',
        creatorId: 'USER-001',
      };

      const response = await request(BASE_URL)
        .post('/file/create')
        .send(fileData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('fileId');
    }, TEST_TIMEOUT);

    test('PF-API-02: 更新采购文件', async () => {
      const fileId = 'FILE-001';
      const updateData = {
        fileName: '办公设备采购招标文件(修订版)',
      };

      const response = await request(BASE_URL)
        .put('/file/update')
        .send({ fileId, ...updateData })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PF-API-03: 删除采购文件', async () => {
      const fileId = 'FILE-002';

      const response = await request(BASE_URL)
        .delete(`/file/delete?fileId=${fileId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PF-API-04: 查询文件列表', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        fileType: 'GOODS',
      };

      const response = await request(BASE_URL)
        .get('/file/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.list)).toBe(true);
    }, TEST_TIMEOUT);

  });

  describe('文件审核', () => {

    test('PF-API-05: 文件审批', async () => {
      const approveData = {
        fileId: 'FILE-001',
        approveResult: 'APPROVED',
        approveComment: '文件符合要求',
        approverId: 'USER-002',
      };

      const response = await request(BASE_URL)
        .post('/file/approve')
        .send(approveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PF-API-09: 文件合规检查', async () => {
      const checkData = {
        fileId: 'FILE-001',
      };

      const response = await request(BASE_URL)
        .post('/file/compliance/check')
        .send(checkData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('riskItems');
    }, TEST_TIMEOUT);

  });

  describe('版本管理', () => {

    test('PF-API-06: 获取版本列表', async () => {
      const fileId = 'FILE-001';

      const response = await request(BASE_URL)
        .get(`/file/version/list?fileId=${fileId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.versionList)).toBe(true);
    }, TEST_TIMEOUT);

    test('PF-API-07: 版本对比', async () => {
      const compareParams = {
        fileId: 'FILE-001',
        versionA: 1,
        versionB: 2,
      };

      const response = await request(BASE_URL)
        .get('/file/version/compare')
        .query(compareParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('diffReport');
    }, TEST_TIMEOUT);

  });

  describe('模板管理', () => {

    test('PF-API-10: 获取模板列表', async () => {
      const queryParams = {
        fileType: 'GOODS',
      };

      const response = await request(BASE_URL)
        .get('/file/template/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.templateList)).toBe(true);
    }, TEST_TIMEOUT);

  });

});

describe('采购评审 API 测试', () => {

  describe('评审任务管理', () => {

    test('PR-API-01: 创建评审任务', async () => {
      const reviewData = {
        reviewName: '办公设备采购项目评审',
        relatedFileId: 'FILE-001',
        reviewType: 'TECHNICAL',
        creatorId: 'USER-001',
      };

      const response = await request(BASE_URL)
        .post('/review/create')
        .send(reviewData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('reviewId');
    }, TEST_TIMEOUT);

    test('PR-API-02: 上传投标文件', async () => {
      const uploadData = {
        reviewId: 'REVIEW-001',
        fileName: '投标文件.pdf',
        fileType: 'PDF',
      };

      const response = await request(BASE_URL)
        .post('/review/upload')
        .send(uploadData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('评审流程', () => {

    test('PR-API-03: 投标文件审核', async () => {
      const auditData = {
        reviewId: 'REVIEW-001',
        tenderFileId: 'TENDER-001',
        auditResult: 'PASSED',
        auditComment: '文件符合要求',
      };

      const response = await request(BASE_URL)
        .post('/review/file/audit')
        .send(auditData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PR-API-04: 专家评分', async () => {
      const scoreData = {
        reviewId: 'REVIEW-001',
        expertId: 'EXPERT-001',
        objectiveScore: 85,
        subjectiveScore: 88,
        reviewComment: '方案可行',
      };

      const response = await request(BASE_URL)
        .post('/review/score')
        .send(scoreData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data.totalScore).toBe(173);
    }, TEST_TIMEOUT);

  });

  describe('评审结果', () => {

    test('PR-API-05: 获取评审结果', async () => {
      const reviewId = 'REVIEW-001';

      const response = await request(BASE_URL)
        .get(`/review/result?reviewId=${reviewId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('reviewResult');
    }, TEST_TIMEOUT);

    test('PR-API-06: 导入评审结果', async () => {
      const importData = {
        reviewId: 'REVIEW-001',
        resultFile: '评审结果.xlsx',
      };

      const response = await request(BASE_URL)
        .post('/review/result/import')
        .send(importData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('评审专家', () => {

    test('PR-API-07: 评审统计分析', async () => {
      const statsParams = {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      };

      const response = await request(BASE_URL)
        .get('/review/statistics')
        .query(statsParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PR-API-08: 获取专家列表', async () => {
      const queryParams = {
        expertType: 'TECHNICAL',
      };

      const response = await request(BASE_URL)
        .get('/review/expert/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.expertList)).toBe(true);
    }, TEST_TIMEOUT);

    test('PR-API-10: 添加评审专家', async () => {
      const expertData = {
        name: '张专家',
        dept: '技术部',
        title: '高级工程师',
        expertType: 'TECHNICAL',
        idCard: '110101197001011234',
        contactPhone: '13800138000',
      };

      const response = await request(BASE_URL)
        .post('/review/expert/add')
        .send(expertData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('评审归档', () => {

    test('PR-API-09: 归档评审', async () => {
      const archiveData = {
        reviewId: 'REVIEW-001',
      };

      const response = await request(BASE_URL)
        .post('/review/archive')
        .send(archiveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

});

describe('合同管理 API 测试', () => {

  describe('合同生成', () => {

    test('PC-API-01: 智能生成合同', async () => {
      const generateData = {
        tenderFileId: 'TENDER-001',
        supplierId: 'SUPPLIER-001',
      };

      const response = await request(BASE_URL)
        .post('/contract/generate')
        .send(generateData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('contractId');
      expect(response.body.data).toHaveProperty('contractDraft');
    }, TEST_TIMEOUT);

    test('PC-API-02: 创建合同', async () => {
      const contractData = {
        contractName: '办公设备采购合同',
        partyA: '某采购单位',
        partyB: '某供应商',
        contractAmount: 300000,
        signDate: '2026-03-15',
        deliveryDeadline: '2026-06-15',
        relatedFileId: 'FILE-001',
      };

      const response = await request(BASE_URL)
        .post('/contract/create')
        .send(contractData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('合同信息', () => {

    test('PC-API-03: 更新合同', async () => {
      const contractId = 'CONTRACT-001';
      const updateData = {
        contractAmount: 320000,
      };

      const response = await request(BASE_URL)
        .put('/contract/update')
        .send({ contractId, ...updateData })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PC-API-04: 合同签订', async () => {
      const signData = {
        contractId: 'CONTRACT-001',
        signResult: 'SIGNED',
      };

      const response = await request(BASE_URL)
        .post('/contract/sign')
        .send(signData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PC-API-05: 查询合同列表', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        status: 'SIGNED',
      };

      const response = await request(BASE_URL)
        .get('/contract/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PC-API-06: 提取合同信息', async () => {
      const contractId = 'CONTRACT-001';

      const response = await request(BASE_URL)
        .get(`/contract/extract?contractId=${contractId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('contractName');
      expect(response.body.data).toHaveProperty('contractAmount');
    }, TEST_TIMEOUT);

  });

});

describe('合同履约 API 测试', () => {

  describe('履约信息管理', () => {

    test('PL-API-01: 填写履约信息', async () => {
      const inputData = {
        contractId: 'CONTRACT-001',
        performanceInfo: {
          currentStage: '生产中',
          completionRate: 60,
          estimatedDelivery: '2026-06-10',
        },
      };

      const response = await request(BASE_URL)
        .post('/performance/input')
        .send(inputData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PL-API-02: 更新履约信息', async () => {
      const updateData = {
        contractId: 'CONTRACT-001',
        performanceInfo: {
          currentStage: '生产完成',
          completionRate: 100,
        },
      };

      const response = await request(BASE_URL)
        .put('/performance/update')
        .send(updateData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PL-API-03: 设置报警规则', async () => {
      const alarmData = {
        contractId: 'CONTRACT-001',
        alarmRules: [
          { type: 'DELIVERY_OVERDUE', threshold: 7, enabled: true },
          { type: 'QUALITY_ISSUE', threshold: 1, enabled: true },
        ],
      };

      const response = await request(BASE_URL)
        .post('/performance/alarm')
        .send(alarmData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('履约监控', () => {

    test('PL-API-04: 履约数据查询', async () => {
      const queryParams = {
        contractId: 'CONTRACT-001',
      };

      const response = await request(BASE_URL)
        .get('/performance/query')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PL-API-05: 履约监控', async () => {
      const monitorParams = {
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      };

      const response = await request(BASE_URL)
        .get('/performance/monitor')
        .query(monitorParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('alarmList');
    }, TEST_TIMEOUT);

  });

});

describe('档案管理 API 测试', () => {

  describe('归档操作', () => {

    test('PA-API-01: 自动归档', async () => {
      const archiveData = {
        relatedType: 'PURCHASE_CONTRACT',
        relatedId: 'CONTRACT-001',
        archiveType: 'AUTO',
      };

      const response = await request(BASE_URL)
        .post('/archive/auto')
        .send(archiveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('PA-API-02: 手动归档', async () => {
      const archiveData = {
        relatedType: 'PURCHASE_FILE',
        relatedId: 'FILE-001',
        archiveType: 'MANUAL',
      };

      const response = await request(BASE_URL)
        .post('/archive/manual')
        .send(archiveData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('归档查询', () => {

    test('PA-API-03: 归档查询', async () => {
      const queryParams = {
        archiveType: 'PURCHASE_CONTRACT',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      };

      const response = await request(BASE_URL)
        .get('/archive/query')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.archiveList)).toBe(true);
    }, TEST_TIMEOUT);

    test('PA-API-04: 下载档案', async () => {
      const archiveId = 'ARCHIVE-001';

      const response = await request(BASE_URL)
        .get(`/archive/download?archiveId=${archiveId}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    }, TEST_TIMEOUT);

  });

});

describe('数据查询 API 测试', () => {

  describe('问答查询', () => {

    test('PQ-API-01: 问答查询', async () => {
      const queryParams = {
        question: '2026年第一季度采购总额是多少',
      };

      const response = await request(BASE_URL)
        .get('/query/qa')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('answer');
      expect(response.body.data).toHaveProperty('chartData');
    }, TEST_TIMEOUT);

  });

  describe('条件查询', () => {

    test('PQ-API-02: 条件查询', async () => {
      const queryParams = {
        purchaseType: 'GOODS',
        deptId: 'DEPT-001',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      };

      const response = await request(BASE_URL)
        .get('/query/filter')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.resultList)).toBe(true);
    }, TEST_TIMEOUT);

    test('PQ-API-03: 查询结果导出', async () => {
      const exportParams = {
        queryId: 'QUERY-001',
        format: 'EXCEL',
      };

      const response = await request(BASE_URL)
        .get('/query/export')
        .query(exportParams)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.ms-excel');
    }, TEST_TIMEOUT);

  });

});

describe('系统管理 API 测试', () => {

  describe('组织管理', () => {

    test('SM-API-01: 创建组织', async () => {
      const orgData = {
        orgName: '信息技术部',
        orgCode: 'DEPT-IT',
        parentOrgId: 'ROOT',
        leader: '张三',
        contact: '13800138000',
      };

      const response = await request(BASE_URL)
        .post('/system/org/create')
        .send(orgData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('SM-API-02: 更新组织', async () => {
      const orgId = 'DEPT-IT';
      const updateData = {
        orgName: '信息技术部(修订)',
        leader: '李四',
      };

      const response = await request(BASE_URL)
        .put('/system/org/update')
        .send({ orgId, ...updateData })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('用户管理', () => {

    test('SM-API-03: 创建用户', async () => {
      const userData = {
        username: 'zhangsan',
        realName: '张三',
        orgId: 'DEPT-IT',
        roleId: 'ROLE_USER',
        email: 'zhangsan@example.com',
        phone: '13800138001',
      };

      const response = await request(BASE_URL)
        .post('/system/user/create')
        .send(userData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('SM-API-04: 用户列表查询', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: 'DEPT-IT',
      };

      const response = await request(BASE_URL)
        .get('/system/user/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('角色与权限', () => {

    test('SM-API-05: 创建角色', async () => {
      const roleData = {
        roleName: '采购审核员',
        roleCode: 'ROLE_PURCHASE_AUDITOR',
        description: '负责采购审核的角色',
      };

      const response = await request(BASE_URL)
        .post('/system/role/create')
        .send(roleData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

    test('SM-API-06: 分配权限', async () => {
      const assignData = {
        roleId: 'ROLE-001',
        permissions: [
          'PERM-PLAN-VIEW',
          'PERM-PLAN-APPROVE',
          'PERM-DEMAND-VIEW',
        ],
      };

      const response = await request(BASE_URL)
        .post('/system/role/assign')
        .send(assignData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

  describe('日志管理', () => {

    test('SM-API-07: 日志查询', async () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 20,
        startDate: '2026-03-01',
        endDate: '2026-03-28',
      };

      const response = await request(BASE_URL)
        .get('/system/log/list')
        .query(queryParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data.logList)).toBe(true);
    }, TEST_TIMEOUT);

  });

  describe('系统配置', () => {

    test('SM-API-08: 获取系统配置', async () => {
      const response = await request(BASE_URL)
        .get('/system/config/get')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('sessionTimeout');
    }, TEST_TIMEOUT);

    test('SM-API-09: 设置系统配置', async () => {
      const configData = {
        sessionTimeout: 3600,
        passwordMinLength: 8,
        backupEnabled: true,
      };

      const response = await request(BASE_URL)
        .put('/system/config/set')
        .send(configData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.code).toBe(200);
    }, TEST_TIMEOUT);

  });

});

// 错误处理测试
describe('API 错误处理测试', () => {

  test('无效的参数应返回400错误', async () => {
    const invalidData = {
      planName: '', // 空名称应该被拒绝
    };

    const response = await request(BASE_URL)
      .post('/plan/year/create')
      .send(invalidData)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.code).toBe(400);
    expect(response.body.message).toContain('参数验证失败');
  });

  test('不存在的资源应返回404错误', async () => {
    const response = await request(BASE_URL)
      .get('/plan/year/detail?planId=NON-EXISTENT')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.code).toBe(404);
  });

  test('未授权访问应返回401错误', async () => {
    // 不带token访问需要认证的接口
    const response = await request(BASE_URL)
      .get('/system/user/list')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body.code).toBe(401);
  });

  test('无权限操作应返回403错误', async () => {
    // 使用普通用户token访问管理员接口
    const response = await request(BASE_URL)
      .get('/system/config/set')
      .set('Authorization', 'Bearer USER_TOKEN')
      .expect('Content-Type', /json/)
      .expect(403);

    expect(response.body.code).toBe(403);
  });

});
