/**
 * 智能化采购系统 - API集成测试
 * 基于实际API接口的集成测试脚本
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

describe('采购计划管理 API', () => {
  const authToken = 'Bearer test-token';

  describe('POST /api/plan/annual - 创建年度计划', () => {
    it('应成功创建年度采购计划', async () => {
      const response = await fetch(`${API_BASE_URL}/plan/annual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: '2024年度办公设备采购计划',
          budget: 500000,
          category: 'goods',
          department: '技术部',
          year: 2024,
          items: [
            {
              name: '联想ThinkPad笔记本',
              specification: 'ThinkPad X1 Carbon',
              quantity: 10,
              unitPrice: 10000,
              totalPrice: 100000
            }
          ]
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.status).toBe('pending');
    });

    it('缺少必填字段应返回错误', async () => {
      const response = await fetch(`${API_BASE_URL}/plan/annual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: '2024年度计划'
          // 缺少 budget, category 等必填字段
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
    });

    it('预算超限应返回警告', async () => {
      const response = await fetch(`${API_BASE_URL}/plan/annual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: '2024年度超大预算计划',
          budget: 100000000, // 1亿，超出限制
          category: 'goods',
          department: '技术部',
          year: 2024,
          items: []
        })
      });

      const data = await response.json();
      // 应返回成功但带有警告
      expect(data.success).toBe(true);
      expect(data.warnings).toContain('预算超出年度限额');
    });
  });

  describe('GET /api/plan/annual/:id - 查询计划详情', () => {
    it('应返回正确的计划详情', async () => {
      const planId = 'PLAN-2024-001';
      const response = await fetch(`${API_BASE_URL}/plan/annual/${planId}`, {
        method: 'GET',
        headers: {
          'Authorization': authToken
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(planId);
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('budget');
      expect(data.data).toHaveProperty('items');
    });

    it('不存在的计划应返回404', async () => {
      const response = await fetch(`${API_BASE_URL}/plan/annual/NON-EXIST`, {
        method: 'GET',
        headers: {
          'Authorization': authToken
        }
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/plan/quarterly/:id/approve - 审批季度计划', () => {
    it('审批通过应更新计划状态', async () => {
      const planId = 'PLAN-2024-Q1-001';
      const response = await fetch(`${API_BASE_URL}/plan/quarterly/${planId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          action: 'approve',
          comment: '同意按预算执行',
          approverId: 'USER-001'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('审批驳回应记录驳回原因', async () => {
      const planId = 'PLAN-2024-Q1-002';
      const response = await fetch(`${API_BASE_URL}/plan/quarterly/${planId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          action: 'reject',
          comment: '预算过高，需重新评估',
          approverId: 'USER-001'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.status).toBe('rejected');
    });
  });
});

describe('采购需求管理 API', () => {
  const authToken = 'Bearer test-token';

  describe('POST /api/requirement - 发起需求', () => {
    it('应成功创建采购需求', async () => {
      const response = await fetch(`${API_BASE_URL}/requirement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: '联想ThinkPad笔记本采购',
          specification: 'ThinkPad X1 Carbon',
          quantity: 10,
          budget: 100000,
          category: 'goods',
          department: '技术部',
          requester: '张三',
          urgency: 'normal'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBeDefined();
      expect(data.data.status).toBe('pending_review');
    });

    it('应自动触发合规检查', async () => {
      const response = await fetch(`${API_BASE_URL}/requirement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          name: '超大额采购需求',
          specification: '高端服务器集群',
          quantity: 1,
          budget: 5000000,
          category: 'goods',
          department: '技术部',
          requester: '张三',
          urgency: 'urgent'
        })
      });

      const data = await response.json();
      expect(data.data.complianceCheck).toBeDefined();
      expect(data.data.complianceCheck.warnings).toBeDefined();
    });
  });

  describe('PUT /api/requirement/:id/approve - 审批需求', () => {
    it('应支持多级审批流转', async () => {
      const requirementId = 'REQ-2024-001';
      const response = await fetch(`${API_BASE_URL}/requirement/${requirementId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          action: 'approve',
          comment: '部门主管同意',
          node: 'department_review',
          approverId: 'USER-002'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.status).toBe('pending_next_approval');
      expect(data.data.currentNode).toBe('finance_review');
    });

    it('最终审批通过应更新需求状态为已批准', async () => {
      const requirementId = 'REQ-2024-001';
      const response = await fetch(`${API_BASE_URL}/requirement/${requirementId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          action: 'approve',
          comment: '采购主管最终批准',
          node: 'procurement_review',
          approverId: 'USER-003'
        })
      });

      const data = await response.json();
      expect(data.data.status).toBe('approved');
    });
  });

  describe('POST /api/requirement/:id/compliance-check - 合规检查', () => {
    it('应返回完整的合规检查结果', async () => {
      const requirementId = 'REQ-2024-001';
      const response = await fetch(`${API_BASE_URL}/requirement/${requirementId}/compliance-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          requirementId: requirementId
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('passed');
      expect(data.data).toHaveProperty('warnings');
      expect(data.data).toHaveProperty('suggestions');
    });
  });
});

describe('采购文件管理 API', () => {
  const authToken = 'Bearer test-token';

  describe('POST /api/document/generate - 生成文件', () => {
    it('应根据需求生成采购文件', async () => {
      const response = await fetch(`${API_BASE_URL}/document/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          type: 'tender_document',
          templateId: 'TPL-001',
          requirementId: 'REQ-2024-001',
          title: '办公设备采购招标书',
          content: {
            projectName: '2024年度办公设备采购',
            budget: 100000,
            qualification: '具有相关资质证书',
            deadline: '2024-03-31'
          }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBeDefined();
      expect(data.data.fileUrl).toBeDefined();
    });

    it('应支持多种文件类型生成', async () => {
      const fileTypes = ['tender_document', 'purchase_contract', 'requisition'];
      for (const type of fileTypes) {
        const response = await fetch(`${API_BASE_URL}/document/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify({
            type: type,
            templateId: 'TPL-001',
            requirementId: 'REQ-2024-001',
            title: `测试${type}`
          })
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.type).toBe(type);
      }
    });
  });

  describe('GET /api/document/:id/versions/compare - 版本对比', () => {
    it('应正确对比两个版本的差异', async () => {
      const documentId = 'DOC-001';
      const response = await fetch(
        `${API_BASE_URL}/document/${documentId}/versions/compare?version1=1&version2=2`,
        {
          method: 'GET',
          headers: {
            'Authorization': authToken
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.diff).toBeDefined();
      expect(data.data.versions).toHaveLength(2);
    });
  });
});

describe('采购评审管理 API', () => {
  const authToken = 'Bearer test-token';

  describe('POST /api/evaluation/:id/score - 专家评分', () => {
    it('应保存专家评分', async () => {
      const evaluationId = 'EVA-2024-001';
      const response = await fetch(`${API_BASE_URL}/evaluation/${evaluationId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          evaluationId: evaluationId,
          expertId: 'EXPERT-001',
          scores: {
            technical: 85,
            price: 90,
            service: 88,
            delivery: 86
          },
          comment: '技术方案优秀，价格合理',
          recommendation: '推荐中标'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('应验证评分维度的完整性', async () => {
      const evaluationId = 'EVA-2024-001';
      const response = await fetch(`${API_BASE_URL}/evaluation/${evaluationId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          evaluationId: evaluationId,
          expertId: 'EXPERT-001',
          scores: {
            technical: 85
            // 缺少其他维度
          }
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/evaluation/:id/result - 评审结果汇总', () => {
    it('应正确汇总所有专家评分', async () => {
      const evaluationId = 'EVA-2024-001';
      const response = await fetch(`${API_BASE_URL}/evaluation/${evaluationId}/result`, {
        method: 'GET',
        headers: {
          'Authorization': authToken
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.finalScore).toBeDefined();
      expect(data.data.ranking).toBeDefined();
    });
  });
});

describe('合同管理 API', () => {
  const authToken = 'Bearer test-token';

  describe('POST /api/contract/generate - 生成合同', () => {
    it('应根据采购结果生成合同', async () => {
      const response = await fetch(`${API_BASE_URL}/contract/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          requirementId: 'REQ-2024-001',
          supplierId: 'SUP-001',
          contractAmount: 98000,
          paymentTerms: '预付30%，交货后付70%',
          deliveryDate: '2024-04-30',
          warrantyPeriod: '12个月'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.contractNo).toBeDefined();
      expect(data.data.status).toBe('draft');
    });
  });

  describe('GET /api/contract/:id/performance - 履约跟踪', () => {
    it('应返回完整的履约信息', async () => {
      const contractId = 'CON-2024-001';
      const response = await fetch(`${API_BASE_URL}/contract/${contractId}/performance`, {
        method: 'GET',
        headers: {
          'Authorization': authToken
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.status).toBeDefined();
      expect(data.data.milestones).toBeDefined();
    });
  });

  describe('PUT /api/contract/:id/performance/update - 更新履约状态', () => {
    it('应成功更新履约节点', async () => {
      const contractId = 'CON-2024-001';
      const response = await fetch(`${API_BASE_URL}/contract/${contractId}/performance/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          milestone: 'delivery',
          status: 'completed',
          actualDate: '2024-04-15',
          remark: '设备已送达并验收合格'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});

describe('用户认证 API', () => {
  describe('POST /api/auth/login - 用户登录', () => {
    it('应返回有效的JWT Token', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.token).toBeDefined();
      expect(data.data.tokenType).toBe('Bearer');
    });

    it('错误的密码应返回401', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });
  });
});
