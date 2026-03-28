/**
 * 智能化采购系统 - E2E测试
 * 使用 Playwright 进行端到端测试
 */

import { test, expect, Page } from '@playwright/test';

// 测试配置
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000;

test.describe('智能化采购系统 E2E测试', () => {

  // ============================================
  // 辅助函数
  // ============================================

  async function loginAs(page: Page, username: string, password: string) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  }

  async function waitForLoading(page: Page) {
    await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden' });
  }

  // ============================================
  // 1. 用户认证流程
  // ============================================

  test.describe('用户认证', () => {
    test('用户登录 - 正常流程', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // 填写登录表单
      await page.fill('[data-testid="username-input"]', 'admin');
      await page.fill('[data-testid="password-input"]', 'admin123');

      // 提交登录
      await page.click('[data-testid="login-button"]');

      // 等待跳转到仪表盘
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // 验证登录成功
      await expect(page.locator('[data-testid="user-info"]')).toContainText('管理员');
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    });

    test('用户登录 - 错误密码', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // 填写错误的登录信息
      await page.fill('[data-testid="username-input"]', 'admin');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');

      // 提交登录
      await page.click('[data-testid="login-button"]');

      // 验证错误提示
      await expect(page.locator('[data-testid="error-message"]'))
        .toContainText('用户名或密码错误');

      // 验证仍然在登录页
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('用户登录 - 空字段验证', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // 不填写直接提交
      await page.click('[data-testid="login-button"]');

      // 验证错误提示
      await expect(page.locator('[data-testid="username-error"]'))
        .toContainText('用户名不能为空');
      await expect(page.locator('[data-testid="password-error"]'))
        .toContainText('密码不能为空');
    });

    test('用户登出', async ({ page }) => {
      // 先登录
      await loginAs(page, 'admin', 'admin123');

      // 点击登出
      await page.click('[data-testid="logout-button"]');

      // 验证跳转到登录页
      await page.waitForURL(`${BASE_URL}/login`);
    });
  });

  // ============================================
  // 2. 采购计划管理流程
  // ============================================

  test.describe('采购计划管理', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin', 'admin123');
    });

    test('创建年度采购计划', async ({ page }) => {
      // 导航到计划管理页面
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);

      // 点击新建按钮
      await page.click('[data-testid="create-plan-button"]');

      // 填写计划表单
      await page.fill('[data-testid="plan-name-input"]', '2024年度办公设备采购计划');
      await page.fill('[data-testid="plan-budget-input"]', '500000');
      await page.selectOption('[data-testid="plan-category-select"]', 'goods');
      await page.selectOption('[data-testid="plan-department-select"]', '技术部');

      // 添加计划明细
      await page.click('[data-testid="add-item-button"]');
      await page.fill('[data-testid="item-name-input"]', '联想ThinkPad笔记本');
      await page.fill('[data-testid="item-spec-input"]', 'ThinkPad X1 Carbon');
      await page.fill('[data-testid="item-quantity-input"]', '10');
      await page.fill('[data-testid="item-price-input"]', '10000');

      // 提交表单
      await page.click('[data-testid="submit-plan-button"]');

      // 等待创建成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('计划创建成功');

      // 验证计划状态为待审批
      await expect(page.locator('[data-testid="plan-status"]'))
        .toContainText('待审批');
    });

    test('查询采购计划', async ({ page }) => {
      // 导航到计划列表页面
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);

      // 等待列表加载
      await waitForLoading(page);

      // 验证计划列表不为空
      const planList = page.locator('[data-testid="plan-list"]');
      await expect(planList).not.toBeEmpty();

      // 验证分页信息
      await expect(page.locator('[data-testid="pagination-info"]'))
        .toContainText('共');
    });

    test('编辑采购计划', async ({ page }) => {
      // 导航到计划列表页面
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);

      await waitForLoading(page);

      // 点击编辑按钮
      await page.click('[data-testid="edit-plan-button"]');

      // 修改计划名称
      await page.fill('[data-testid="plan-name-input"]', '2024年度办公设备采购计划(修订)');

      // 保存修改
      await page.click('[data-testid="save-plan-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('计划更新成功');
    });

    test('删除采购计划', async ({ page }) => {
      // 导航到计划列表页面
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);

      await waitForLoading(page);

      // 点击删除按钮
      page.on('dialog', dialog => dialog.accept());
      await page.click('[data-testid="delete-plan-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('计划删除成功');
    });

    test('审批采购计划', async ({ page }) => {
      // 导航到计划列表页面
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);

      await waitForLoading(page);

      // 点击审批按钮(针对待审批状态的计划)
      await page.click('[data-testid="approve-plan-button"]');

      // 选择审批意见
      await page.click('[data-testid="approve-option"]');

      // 填写审批备注
      await page.fill('[data-testid="approve-comment"]', '同意按预算执行');

      // 提交审批
      await page.click('[data-testid="submit-approval-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('审批成功');
    });
  });

  // ============================================
  // 3. 采购需求管理流程
  // ============================================

  test.describe('采购需求管理', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin', 'admin123');
    });

    test('发起采购需求', async ({ page }) => {
      // 导航到需求管理页面
      await page.click('[data-testid="menu-requirement"]');
      await page.waitForURL(`${BASE_URL}/requirement`);

      // 点击新建需求
      await page.click('[data-testid="create-requirement-button"]');

      // 填写需求表单
      await page.fill('[data-testid="requirement-name-input"]', '联想ThinkPad笔记本采购');
      await page.fill('[data-testid="requirement-spec-input"]', 'ThinkPad X1 Carbon');
      await page.fill('[data-testid="requirement-quantity-input"]', '10');
      await page.fill('[data-testid="requirement-budget-input"]', '100000');
      await page.selectOption('[data-testid="requirement-category-select"]', 'goods');
      await page.selectOption('[data-testid="requirement-urgency-select"]', 'normal');

      // 提交需求
      await page.click('[data-testid="submit-requirement-button"]');

      // 等待创建成功
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('需求创建成功');

      // 验证需求状态
      await expect(page.locator('[data-testid="requirement-status"]'))
        .toContainText('待审核');
    });

    test('需求合规检查', async ({ page }) => {
      // 导航到需求详情页
      await page.goto(`${BASE_URL}/requirement/REQ-2024-001`);

      // 等待页面加载
      await waitForLoading(page);

      // 触发合规检查
      await page.click('[data-testid="run-compliance-check"]');

      // 等待检查完成
      await page.waitForSelector('[data-testid="compliance-result"]');

      // 验证合规检查结果
      const complianceResult = page.locator('[data-testid="compliance-result"]');
      await expect(complianceResult).toBeVisible();
    });

    test('需求审核流转', async ({ page }) => {
      // 导航到待审核的需求
      await page.goto(`${BASE_URL}/requirement/REQ-2024-001`);

      await waitForLoading(page);

      // 部门主管审批
      await page.click('[data-testid="department-approve-button"]');
      await page.fill('[data-testid="approval-comment"]', '部门同意');
      await page.click('[data-testid="submit-department-approval"]');

      // 验证流转到下一节点
      await expect(page.locator('[data-testid="current-node"]'))
        .toContainText('财务主管审批');

      // 财务主管审批
      await page.click('[data-testid="finance-approve-button"]');
      await page.fill('[data-testid="approval-comment"]', '财务同意');
      await page.click('[data-testid="submit-finance-approval"]');

      // 验证需求已批准
      await expect(page.locator('[data-testid="requirement-status"]'))
        .toContainText('已批准');
    });
  });

  // ============================================
  // 4. 采购文件管理流程
  // ============================================

  test.describe('采购文件管理', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin', 'admin123');
    });

    test('生成采购文件', async ({ page }) => {
      // 导航到文件管理页面
      await page.click('[data-testid="menu-document"]');
      await page.waitForURL(`${BASE_URL}/document`);

      // 点击生成文件
      await page.click('[data-testid="generate-document-button"]');

      // 选择文件类型
      await page.selectOption('[data-testid="document-type-select"]', 'tender_document');

      // 选择关联的需求
      await page.selectOption('[data-testid="requirement-select"]', 'REQ-2024-001');

      // 填写文件标题
      await page.fill('[data-testid="document-title-input"]', '办公设备采购招标书');

      // 填写文件内容
      await page.fill('[data-testid="document-content-input"]', '招标详细内容...');

      // 生成文件
      await page.click('[data-testid="submit-document-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('文件生成成功');
    });

    test('应用文件模板', async ({ page }) => {
      // 导航到文件管理页面
      await page.click('[data-testid="menu-document"]');
      await page.waitForURL(`${BASE_URL}/document`);

      // 点击应用模板
      await page.click('[data-testid="apply-template-button"]');

      // 选择模板
      await page.selectOption('[data-testid="template-select"]', 'TPL-001');

      // 填写模板变量
      await page.fill('[data-testid="template-var甲方"]', 'XX公司');
      await page.fill('[data-testid="template-var乙方"]', 'YY供应商');

      // 生成文件
      await page.click('[data-testid="generate-from-template"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('文件生成成功');
    });

    test('文件版本对比', async ({ page }) => {
      // 导航到文件详情页
      await page.goto(`${BASE_URL}/document/DOC-001`);

      await waitForLoading(page);

      // 点击版本历史
      await page.click('[data-testid="version-history-button"]');

      // 选择两个版本进行对比
      await page.check('[data-testid="version-1-checkbox"]');
      await page.check('[data-testid="version-2-checkbox"]');

      // 点击对比按钮
      await page.click('[data-testid="compare-versions-button"]');

      // 等待对比结果显示
      await page.waitForSelector('[data-testid="diff-result"]');

      // 验证差异高亮
      const diffResult = page.locator('[data-testid="diff-result"]');
      await expect(diffResult).toBeVisible();
      await expect(diffResult.locator('[data-testid="diff-added"]')).toHaveCount(0);
      await expect(diffResult.locator('[data-testid="diff-removed"]')).toHaveCount(0);
    });
  });

  // ============================================
  // 5. 采购评审管理流程
  // ============================================

  test.describe('采购评审管理', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'expert', 'expert123');
    });

    test('专家评分', async ({ page }) => {
      // 导航到评审项目页面
      await page.click('[data-testid="menu-evaluation"]');
      await page.waitForURL(`${BASE_URL}/evaluation`);

      // 选择评审项目
      await page.click('[data-testid="evaluate-button-EVA-2024-001"]');

      // 等待评审表单加载
      await page.waitForSelector('[data-testid="score-form"]');

      // 填写技术评分
      await page.fill('[data-testid="score-technical"]', '85');

      // 填写价格评分
      await page.fill('[data-testid="score-price"]', '90');

      // 填写服务评分
      await page.fill('[data-testid="score-service"]', '88');

      // 填写交货评分
      await page.fill('[data-testid="score-delivery"]', '86');

      // 填写评审意见
      await page.fill('[data-testid="score-comment"]', '技术方案优秀，价格合理');

      // 选择推荐意见
      await page.click('[data-testid="recommendation-approve"]');

      // 提交评分
      await page.click('[data-testid="submit-score-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('评分提交成功');
    });

    test('查看评审结果', async ({ page }) => {
      // 导航到评审结果页面
      await page.goto(`${BASE_URL}/evaluation/EVA-2024-001/result`);

      await waitForLoading(page);

      // 验证结果汇总信息
      await expect(page.locator('[data-testid="final-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="ranking-list"]')).toBeVisible();

      // 验证排名信息
      const ranking = page.locator('[data-testid="ranking-list"]');
      await expect(ranking).toContainText('第一名');
    });
  });

  // ============================================
  // 6. 合同管理流程
  // ============================================

  test.describe('合同管理', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin', 'admin123');
    });

    test('生成采购合同', async ({ page }) => {
      // 导航到合同管理页面
      await page.click('[data-testid="menu-contract"]');
      await page.waitForURL(`${BASE_URL}/contract`);

      // 点击生成合同
      await page.click('[data-testid="generate-contract-button"]');

      // 选择供应商
      await page.selectOption('[data-testid="supplier-select"]', 'SUP-001');

      // 填写合同信息
      await page.fill('[data-testid="contract-amount"]', '98000');
      await page.fill('[data-testid="payment-terms"]', '预付30%，交货后付70%');
      await page.fill('[data-testid="delivery-date"]', '2024-04-30');
      await page.fill('[data-testid="warranty-period"]', '12个月');

      // 生成合同
      await page.click('[data-testid="submit-contract-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('合同生成成功');

      // 验证合同状态为草稿
      await expect(page.locator('[data-testid="contract-status"]'))
        .toContainText('草稿');
    });

    test('合同履约跟踪', async ({ page }) => {
      // 导航到合同详情页
      await page.goto(`${BASE_URL}/contract/CON-2024-001`);

      await waitForLoading(page);

      // 验证履约状态
      await expect(page.locator('[data-testid="performance-status"]'))
        .toBeVisible();

      // 验证里程碑列表
      const milestones = page.locator('[data-testid="milestone-list"]');
      await expect(milestones).not.toBeEmpty();

      // 更新履约状态
      await page.click('[data-testid="update-performance-button"]');
      await page.selectOption('[data-testid="milestone-select"]', 'delivery');
      await page.selectOption('[data-testid="milestone-status-select"]', 'completed');
      await page.fill('[data-testid="actual-date-input"]', '2024-04-15');
      await page.fill('[data-testid="performance-remark"]', '设备已送达并验收合格');

      // 提交更新
      await page.click('[data-testid="submit-performance-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('履约状态更新成功');
    });
  });

  // ============================================
  // 7. 完整业务流程
  // ============================================

  test.describe('完整业务流程 - 采购全流程', () => {
    test('登录 → 创建计划 → 发起需求 → 审核 → 生成合同', async ({ page }) => {
      // Step 1: 登录
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'admin');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);
      console.log('Step 1: 登录成功');

      // Step 2: 创建年度采购计划
      await page.click('[data-testid="menu-plan"]');
      await page.waitForURL(`${BASE_URL}/plan/annual`);
      await page.click('[data-testid="create-plan-button"]');

      await page.fill('[data-testid="plan-name-input"]', '2024年度办公设备采购计划');
      await page.fill('[data-testid="plan-budget-input"]', '500000');
      await page.selectOption('[data-testid="plan-category-select"]', 'goods');
      await page.selectOption('[data-testid="plan-department-select"]', '技术部');

      await page.click('[data-testid="submit-plan-button"]');
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('计划创建成功');
      console.log('Step 2: 年度计划创建成功');

      // Step 3: 审批计划
      await page.click('[data-testid="approve-plan-button"]');
      await page.click('[data-testid="approve-option"]');
      await page.fill('[data-testid="approve-comment"]', '同意执行');
      await page.click('[data-testid="submit-approval-button"]');
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('审批成功');
      console.log('Step 3: 计划审批成功');

      // Step 4: 发起采购需求
      await page.click('[data-testid="menu-requirement"]');
      await page.waitForURL(`${BASE_URL}/requirement`);
      await page.click('[data-testid="create-requirement-button"]');

      await page.fill('[data-testid="requirement-name-input"]', '办公设备采购');
      await page.fill('[data-testid="requirement-spec-input"]', 'ThinkPad笔记本');
      await page.fill('[data-testid="requirement-quantity-input"]', '10');
      await page.fill('[data-testid="requirement-budget-input"]', '100000');

      await page.click('[data-testid="submit-requirement-button"]');
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('需求创建成功');
      console.log('Step 4: 采购需求发起成功');

      // Step 5: 审核需求
      await page.click('[data-testid="department-approve-button"]');
      await page.fill('[data-testid="approval-comment"]', '部门同意');
      await page.click('[data-testid="submit-department-approval"]');
      console.log('Step 5: 需求审核完成');

      // Step 6: 生成合同
      await page.click('[data-testid="menu-contract"]');
      await page.waitForURL(`${BASE_URL}/contract`);
      await page.click('[data-testid="generate-contract-button"]');

      await page.selectOption('[data-testid="supplier-select"]', 'SUP-001');
      await page.fill('[data-testid="contract-amount"]', '98000');
      await page.fill('[data-testid="payment-terms"]', '预付30%，交货后付70%');
      await page.fill('[data-testid="delivery-date"]', '2024-04-30');

      await page.click('[data-testid="submit-contract-button"]');
      await expect(page.locator('[data-testid="success-message"]'))
        .toContainText('合同生成成功');
      console.log('Step 6: 合同生成成功');

      // 验证完整流程完成
      await expect(page.locator('[data-testid="contract-status"]'))
        .toContainText('草稿');
      console.log('完整业务流程测试通过!');
    });
  });

  // ============================================
  // 8. 异常场景测试
  // ============================================

  test.describe('异常场景', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin', 'admin123');
    });

    test('会话超时后跳转到登录页', async ({ page }) => {
      // 模拟会话超时
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
      });

      // 尝试访问受保护页面
      await page.goto(`${BASE_URL}/dashboard`);

      // 验证跳转到登录页
      await page.waitForURL(`${BASE_URL}/login`);
      await expect(page.locator('[data-testid="error-message"]'))
        .toContainText('会话已过期，请重新登录');
    });

    test('无权限访问应显示403页面', async ({ page }) => {
      // 使用普通用户登录
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
      });

      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'user');
      await page.fill('[data-testid="password-input"]', 'user123');
      await page.click('[data-testid="login-button"]');

      // 尝试访问管理页面
      await page.goto(`${BASE_URL}/admin`);

      // 验证显示403
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
    });

    test('页面加载失败应显示错误提示', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.goto(`${BASE_URL}/dashboard`);

      // 验证错误提示
      await expect(page.locator('[data-testid="error-boundary"]'))
        .toContainText('页面加载失败');
    });
  });
});

// ============================================
// Playwright 配置
// ============================================

export default {
  testDir: './e2e',
  timeout: TEST_TIMEOUT,
  retries: 2,
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
};
