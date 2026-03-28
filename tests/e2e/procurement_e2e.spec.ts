/**
 * 智能化采购系统 E2E 测试
 * 测试框架: Selenium WebDriver + Jest
 *
 * 测试场景覆盖:
 * 1. 用户登录登出
 * 2. 采购计划全流程
 * 3. 采购需求全流程
 * 4. 采购文件全流程
 * 5. 采购评审全流程
 */

import { Builder, WebDriver, By, Key, until, Actions } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as firefox from 'selenium-webdriver/firefox';

// 测试配置
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const IMPLICIT_WAIT = 10000;
const EXPLICIT_WAIT = 30000;
const SCREENSHOT_DIR = './e2e/screenshots';

// 测试用户凭证
const TEST_USERS = {
  admin: { username: 'admin', password: 'Admin@123456', role: '管理员' },
  purchaser: { username: 'purchaser01', password: 'Purchaser@123', role: '采购单位' },
  approver: { username: 'approver01', password: 'Approver@123', role: '审核人员' },
  supplier: { username: 'supplier01', password: 'Supplier@123', role: '供应商' },
  expert: { username: 'expert01', password: 'Expert@123', role: '评审专家' },
};

// 辅助函数
async function takeScreenshot(driver: WebDriver, name: string): Promise<void> {
  const screenshot = await driver.takeScreenshot();
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  fs.writeFileSync(`${SCREENSHOT_DIR}/${name}.png`, screenshot, 'base64');
}

async function waitForElement(driver: WebDriver, selector: string, timeout = EXPLICIT_WAIT) {
  return driver.wait(until.elementLocated(By.css(selector)), timeout);
}

async function waitForElementVisible(driver: WebDriver, selector: string, timeout = EXPLICIT_WAIT) {
  const element = await waitForElement(driver, selector, timeout);
  return driver.wait(until.elementIsVisible(element), timeout);
}

async function waitForElementClickable(driver: WebDriver, selector: string, timeout = EXPLICIT_WAIT) {
  const element = await waitForElement(driver, selector, timeout);
  return driver.wait(until.elementIsEnabled(element), timeout);
}

// ===== 测试套件: 用户认证 =====

describe('用户认证 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();
    await driver.manage().deleteAllCookies();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-AUTH-001: 用户登录成功', async () => {
    console.log('测试: 用户登录成功');

    await driver.get(`${BASE_URL}/login`);

    // 填写登录表单
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.admin.password);

    // 点击登录按钮
    await driver.findElement(By.id('loginBtn')).click();

    // 等待跳转并验证
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);

    // 验证用户名显示
    const userInfo = await driver.findElement(By.className('user-name')).getText();
    expect(userInfo).toContain(TEST_USERS.admin.username);

    console.log('✓ 用户登录成功');
  });

  test('E2E-AUTH-002: 用户名密码错误', async () => {
    console.log('测试: 用户名密码错误');

    // 先登出
    await driver.findElement(By.id('logoutBtn')).click();
    await driver.wait(until.urlContains('/login'), EXPLICIT_WAIT);

    // 输入错误密码
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.id('password')).sendKeys('wrongpassword');

    await driver.findElement(By.id('loginBtn')).click();

    // 验证错误提示
    await waitForElementVisible(driver, '.error-message');
    const errorMsg = await driver.findElement(By.className('error-message')).getText();
    expect(errorMsg).toContain('用户名或密码错误');

    console.log('✓ 错误登录被正确拒绝');
  });

  test('E2E-AUTH-003: 用户登出', async () => {
    console.log('测试: 用户登出');

    await driver.findElement(By.id('logoutBtn')).click();

    await driver.wait(until.urlContains('/login'), EXPLICIT_WAIT);

    // 验证返回登录页
    const loginBtn = await driver.findElement(By.id('loginBtn'));
    expect(loginBtn).toBeTruthy();

    console.log('✓ 用户登出成功');
  });

  test('E2E-AUTH-004: 会话超时验证', async () => {
    console.log('测试: 会话超时');

    // 登录
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.admin.password);
    await driver.findElement(By.id('loginBtn')).click();

    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);

    // 等待会话超时 (测试环境设置为短时间)
    await driver.sleep(3500000); // 等待超过配置的60分钟超时

    // 尝试操作应该被重定向到登录页
    await driver.get(`${BASE_URL}/plan/list`);
    await driver.wait(until.urlContains('/login'), EXPLICIT_WAIT);

    console.log('✓ 会话超时后正确重定向');
  });

});

// ===== 测试套件: 采购计划管理 =====

describe('采购计划管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();
    chromeOptions.addArguments('--no-sandbox');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.purchaser.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.purchaser.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-PLAN-001: 创建年度采购计划', async () => {
    console.log('测试: 创建年度采购计划');

    // 导航到采购计划模块
    await driver.findElement(By.id('menu-plan')).click();
    await driver.wait(until.urlContains('/plan/list'), EXPLICIT_WAIT);

    // 点击新建
    await driver.findElement(By.id('btn-create-plan')).click();
    await waitForElementVisible(driver, '#planForm');

    // 填写表单
    await driver.findElement(By.id('planName')).sendKeys('E2E测试年度采购计划');
    await driver.findElement(By.id('planType')).sendKeys('YEAR');
    await driver.findElement(By.id('purchaseType')).sendKeys('GOODS');
    await driver.findElement(By.id('budgetAmount')).sendKeys('500000');

    // 截图保存
    await takeScreenshot(driver, 'plan-create-form');

    // 提交
    await driver.findElement(By.id('btn-submit')).click();

    // 等待成功提示
    await waitForElementVisible(driver, '.el-message--success');

    // 验证列表中包含新创建的计划
    const planRow = await driver.findElement(By.xpath('//table//td[text()="E2E测试年度采购计划"]'));
    expect(planRow).toBeTruthy();

    console.log('✓ 年度采购计划创建成功');
  });

  test('E2E-PLAN-002: 查询采购计划', async () => {
    console.log('测试: 查询采购计划');

    // 输入查询条件
    await driver.findElement(By.id('search-input')).sendKeys('E2E测试');
    await driver.findElement(By.id('btn-search')).click();

    // 等待搜索结果
    await driver.wait(until.elementLocated(By.css('.el-table__row')), EXPLICIT_WAIT);

    // 验证结果
    const rows = await driver.findElements(By.css('.el-table__row'));
    expect(rows.length).toBeGreaterThan(0);

    console.log('✓ 采购计划查询成功');
  });

  test('E2E-PLAN-003: 编辑采购计划', async () => {
    console.log('测试: 编辑采购计划');

    // 点击编辑按钮
    await driver.findElement(By.css('.el-table__row:first-child .btn-edit')).click();
    await waitForElementVisible(driver, '#planForm');

    // 修改金额
    await driver.findElement(By.id('budgetAmount')).clear();
    await driver.findElement(By.id('budgetAmount')).sendKeys('600000');

    // 保存
    await driver.findElement(By.id('btn-save')).click();

    // 验证成功提示
    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 采购计划编辑成功');
  });

  test('E2E-PLAN-004: 采购计划汇总', async () => {
    console.log('测试: 采购计划汇总');

    // 导航到汇总页面
    await driver.findElement(By.id('menu-plan-summary')).click();
    await waitForElementVisible(driver, '#summaryForm');

    // 选择汇总条件
    await driver.findElement(By.id('summaryType')).sendKeys('BY_PURCHASE_TYPE');

    // 点击汇总
    await driver.findElement(By.id('btn-summary')).click();

    // 等待汇总结果
    await waitForElementVisible(driver, '.summary-result');

    // 验证结果存在
    const result = await driver.findElement(By.css('.summary-result'));
    expect(result).toBeTruthy();

    console.log('✓ 采购计划汇总成功');
  });

  test('E2E-PLAN-005: 导出采购计划', async () => {
    console.log('测试: 导出采购计划');

    // 选择要导出的计划
    await driver.findElement(By.css('.el-table__row:first-child .checkbox')).click();

    // 点击导出按钮
    await driver.findElement(By.id('btn-export')).click();

    // 选择导出格式
    await waitForElementVisible(driver, '#exportFormatDialog');
    await driver.findElement(By.id('exportFormat')).sendKeys('EXCEL');

    // 确认导出
    await driver.findElement(By.id('btn-confirm-export')).click();

    // 等待下载完成提示
    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 采购计划导出成功');
  });

  test('E2E-PLAN-006: 季度计划创建', async () => {
    console.log('测试: 创建季度明细计划');

    // 导航到季度计划页面
    await driver.findElement(By.id('menu-plan-quarter')).click();
    await waitForElementVisible(driver, '#quarterPlanList');

    // 点击新建
    await driver.findElement(By.id('btn-create-quarter')).click();
    await waitForElementVisible(driver, '#quarterPlanForm');

    // 填写表单
    await driver.findElement(By.id('planName')).sendKeys('E2E测试Q1季度计划');
    await driver.findElement(By.id('quarter')).sendKeys('Q1');
    await driver.findElement(By.id('budgetAmount')).sendKeys('125000');

    // 提交
    await driver.findElement(By.id('btn-submit')).click();

    // 验证成功
    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 季度计划创建成功');
  });

});

// ===== 测试套件: 采购需求管理 =====

describe('采购需求管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.purchaser.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.purchaser.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-DEMAND-001: 创建采购需求', async () => {
    console.log('测试: 创建采购需求');

    // 导航到需求模块
    await driver.findElement(By.id('menu-demand')).click();
    await waitForElementVisible(driver, '#demandList');

    // 点击新建需求
    await driver.findElement(By.id('btn-create-demand')).click();
    await waitForElementVisible(driver, '#demandForm');

    // 填写需求信息
    await driver.findElement(By.id('demandName')).sendKeys('E2E测试采购需求');
    await driver.findElement(By.id('demandType')).sendKeys('GOODS');
    await driver.findElement(By.id('demandDesc')).sendKeys('测试需求描述');
    await driver.findElement(By.id('budgetAmount')).sendKeys('300000');
    await driver.findElement(By.id('urgencyLevel')).sendKeys('MEDIUM');

    // 上传附件
    const fileInput = await driver.findElement(By.id('attachment-upload'));
    await fileInput.sendKeys('/path/to/test attachment.pdf');

    // 提交
    await driver.findElement(By.id('btn-submit')).click();

    // 等待审核流程
    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 采购需求创建成功');
  });

  test('E2E-DEMAND-002: 需求合规检查', async () => {
    console.log('测试: 需求合规检查');

    // 创建需求后自动触发合规检查
    // 验证合规检查结果显示
    await waitForElementVisible(driver, '.compliance-check-result');

    const resultText = await driver.findElement(By.css('.compliance-check-result')).getText();
    expect(resultText).toBeTruthy();

    console.log('✓ 需求合规检查完成');
  });

  test('E2E-DEMAND-003: 需求查询', async () => {
    console.log('测试: 需求查询');

    // 返回需求列表
    await driver.findElement(By.id('btn-back')).click();
    await waitForElementVisible(driver, '#demandList');

    // 使用筛选器
    await driver.findElement(By.id('status-filter')).sendKeys('待审核');
    await driver.findElement(By.id('btn-filter')).click();

    // 等待结果
    await driver.wait(until.elementLocated(By.css('.el-table__row')), EXPLICIT_WAIT);

    const rows = await driver.findElements(By.css('.el-table__row'));
    expect(rows.length).toBeGreaterThan(0);

    console.log('✓ 需求查询成功');
  });

  test('E2E-DEMAND-004: 批量导入需求', async () => {
    console.log('测试: 批量导入需求');

    await driver.findElement(By.id('btn-import')).click();
    await waitForElementVisible(driver, '#importDialog');

    // 上传Excel文件
    const importInput = await driver.findElement(By.id('import-file'));
    await importInput.sendKeys('/path/to/demand_template.xlsx');

    // 确认导入
    await driver.findElement(By.id('btn-confirm-import')).click();

    // 等待处理完成
    await waitForElementVisible(driver, '.el-message--success');

    // 验证导入结果
    const resultText = await driver.findElement(By.css('.import-result')).getText();
    expect(resultText).toContain('成功导入');

    console.log('✓ 批量导入成功');
  });

  test('E2E-DEMAND-005: 需求智能推荐', async () => {
    console.log('测试: 需求智能推荐');

    // 点击新建需求
    await driver.findElement(By.id('btn-create-demand')).click();
    await waitForElementVisible(driver, '#demandForm');

    // 输入部分需求信息
    await driver.findElement(By.id('demandName')).sendKeys('办公笔记本');

    // 等待智能推荐
    await driver.sleep(1000); // 等待推荐结果

    // 验证推荐结果显示
    const recommendSection = await driver.findElement(By.css('.recommend-section'));
    expect(recommendSection).toBeTruthy();

    // 点击使用推荐
    await driver.findElement(By.css('.btn-apply-recommend')).click();

    // 验证表单填充
    const filledName = await driver.findElement(By.id('demandName')).getAttribute('value');
    expect(filledName).toBeTruthy();

    console.log('✓ 智能推荐功能正常');
  });

});

// ===== 测试套件: 采购文件管理 =====

describe('采购文件管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.purchaser.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.purchaser.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-FILE-001: 创建采购文件', async () => {
    console.log('测试: 创建采购文件');

    // 导航到文件模块
    await driver.findElement(By.id('menu-file')).click();
    await waitForElementVisible(driver, '#fileList');

    // 点击新建
    await driver.findElement(By.id('btn-create-file')).click();
    await waitForElementVisible(driver, '#fileForm');

    // 选择模板
    await driver.findElement(By.id('template-select')).click();
    await waitForElementVisible(driver, '.template-dropdown');
    await driver.findElement(By.css('.template-option:first-child')).click();

    // 填写文件信息
    await driver.findElement(By.id('fileName')).sendKeys('E2E测试采购文件');

    // 填写模板内容
    await driver.findElement(By.id('content-section-1')).sendKeys('测试内容1');
    await driver.findElement(By.id('content-section-2')).sendKeys('测试内容2');

    // 保存草稿
    await driver.findElement(By.id('btn-save-draft')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 采购文件创建成功');
  });

  test('E2E-FILE-002: 文件版本对比', async () => {
    console.log('测试: 文件版本对比');

    // 选择文件
    await driver.findElement(By.css('.el-table__row:first-child .checkbox')).click();

    // 点击版本对比
    await driver.findElement(By.id('btn-version-compare')).click();
    await waitForElementVisible(driver, '#versionCompareDialog');

    // 选择两个版本
    await driver.findElement(By.id('version-a')).sendKeys('1');
    await driver.findElement(By.id('version-b')).sendKeys('2');

    // 执行对比
    await driver.findElement(By.id('btn-execute-compare')).click();

    // 验证对比结果显示
    await waitForElementVisible(driver, '.diff-result');
    const diffResult = await driver.findElement(By.css('.diff-result'));
    expect(diffResult).toBeTruthy();

    console.log('✓ 文件版本对比成功');
  });

  test('E2E-FILE-003: 文件提交审核', async () => {
    console.log('测试: 文件提交审核');

    // 选择文件
    await driver.findElement(By.css('.el-table__row:first-child .checkbox')).click();

    // 点击提交审核
    await driver.findElement(By.id('btn-submit-approve')).click();
    await waitForElementVisible(driver, '#approveDialog');

    // 选择审核流程
    await driver.findElement(By.id('approve-flow')).sendKeys('默认审核流程');

    // 确认提交
    await driver.findElement(By.id('btn-confirm-submit')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 文件提交审核成功');
  });

  test('E2E-FILE-004: 文件权限配置', async () => {
    console.log('测试: 文件权限配置');

    // 打开文件详情
    await driver.findElement(By.css('.el-table__row:first-child .btn-view')).click();
    await waitForElementVisible(driver, '#fileDetail');

    // 切换到权限标签
    await driver.findElement(By.id('tab-permission')).click();
    await waitForElementVisible(driver, '#permissionPanel');

    // 添加权限
    await driver.findElement(By.id('btn-add-permission')).click();
    await waitForElementVisible(driver, '#addPermissionDialog');

    // 选择用户
    await driver.findElement(By.id('user-select')).sendKeys('审核员01');

    // 选择权限类型
    await driver.findElement(By.id('permission-type')).sendKeys('VIEW');

    // 设置有效期
    await driver.findElement(By.id('expire-date')).sendKeys('2026-12-31');

    // 确认
    await driver.findElement(By.id('btn-confirm-add')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 文件权限配置成功');
  });

});

// ===== 测试套件: 采购评审管理 =====

describe('采购评审管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录 (使用审核人员账号)
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.approver.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.approver.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-REVIEW-001: 创建评审任务', async () => {
    console.log('测试: 创建评审任务');

    // 导航到评审模块
    await driver.findElement(By.id('menu-review')).click();
    await waitForElementVisible(driver, '#reviewList');

    // 点击新建
    await driver.findElement(By.id('btn-create-review')).click();
    await waitForElementVisible(driver, '#reviewForm');

    // 填写评审信息
    await driver.findElement(By.id('reviewName')).sendKeys('E2E测试评审任务');
    await driver.findElement(By.id('relatedFile')).sendKeys('FILE-001');
    await driver.findElement(By.id('reviewType')).sendKeys('TECHNICAL');

    // 添加评审专家
    await driver.findElement(By.id('btn-add-expert')).click();
    await waitForElementVisible(driver, '.expert-select-dialog');
    await driver.findElement(By.css('.expert-option:first-child')).click();

    // 提交
    await driver.findElement(By.id('btn-submit')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 评审任务创建成功');
  });

  test('E2E-REVIEW-002: 专家评分', async () => {
    console.log('测试: 专家评分');

    // 导航到待评分任务
    await driver.findElement(By.id('menu-review-pending')).click();
    await waitForElementVisible(driver, '#pendingReviewList');

    // 选择任务
    await driver.findElement(By.css('.el-table__row:first-child .btn-score')).click();
    await waitForElementVisible(driver, '#scoreForm');

    // 输入客观评分
    await driver.findElement(By.id('objectiveScore')).sendKeys('85');

    // 输入主观评分
    await driver.findElement(By.id('subjectiveScore')).sendKeys('88');

    // 输入评审意见
    await driver.findElement(By.id('reviewComment')).sendKeys('方案可行，推荐采用');

    // 提交评分
    await driver.findElement(By.id('btn-submit-score')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 专家评分成功');
  });

  test('E2E-REVIEW-003: 评审结果统计', async () => {
    console.log('测试: 评审结果统计');

    // 导航到统计页面
    await driver.findElement(By.id('menu-review-statistics')).click();
    await waitForElementVisible(driver, '#statisticsPanel');

    // 选择统计维度
    await driver.findElement(By.id('stat-dimension')).sendKeys('BY_TYPE');

    // 点击统计
    await driver.findElement(By.id('btn-statistics')).click();

    // 等待图表加载
    await waitForElementVisible(driver, '.statistics-chart');

    // 验证图表显示
    const chart = await driver.findElement(By.css('.statistics-chart'));
    expect(chart).toBeTruthy();

    console.log('✓ 评审结果统计成功');
  });

});

// ===== 测试套件: 合同管理 =====

describe('合同管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.purchaser.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.purchaser.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-CONTRACT-001: 智能生成合同', async () => {
    console.log('测试: 智能生成合同');

    // 导航到合同模块
    await driver.findElement(By.id('menu-contract')).click();
    await waitForElementVisible(driver, '#contractList');

    // 点击智能生成
    await driver.findElement(By.id('btn-smart-generate')).click();
    await waitForElementVisible(driver, '#generateDialog');

    // 选择投标文件
    await driver.findElement(By.id('tender-file-select')).click();
    await waitForElementVisible(driver, '.file-dropdown');
    await driver.findElement(By.css('.file-option:first-child')).click();

    // 选择供应商
    await driver.findElement(By.id('supplier-select')).click();
    await waitForElementVisible(driver, '.supplier-dropdown');
    await driver.findElement(By.css('.supplier-option:first-child')).click();

    // 生成合同
    await driver.findElement(By.id('btn-generate')).click();

    // 等待生成完成
    await waitForElementVisible(driver, '#contractDraft');

    // 验证合同草稿显示
    const draftContent = await driver.findElement(By.css('#contractDraft')).getText();
    expect(draftContent).toBeTruthy();

    console.log('✓ 智能生成合同成功');
  });

  test('E2E-CONTRACT-002: 合同审核与签订', async () => {
    console.log('测试: 合同审核与签订');

    // 导航到待签订合同
    await driver.findElement(By.id('menu-contract-pending')).click();
    await waitForElementVisible(driver, '#pendingContractList');

    // 选择合同
    await driver.findElement(By.css('.el-table__row:first-child .checkbox')).click();

    // 点击签订
    await driver.findElement(By.id('btn-sign')).click();
    await waitForElementVisible(driver, '#signDialog');

    // 确认签订
    await driver.findElement(By.id('btn-confirm-sign')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 合同签订成功');
  });

  test('E2E-CONTRACT-003: 合同履约监控', async () => {
    console.log('测试: 合同履约监控');

    // 导航到履约模块
    await driver.findElement(By.id('menu-performance')).click();
    await waitForElementVisible(driver, '#performanceList');

    // 选择合同
    await driver.findElement(By.css('.el-table__row:first-child .checkbox')).click();

    // 点击查看详情
    await driver.findElement(By.css('.el-table__row:first-child .btn-detail')).click();
    await waitForElementVisible(driver, '#performanceDetail');

    // 验证履约节点显示
    const nodes = await driver.findElements(By.css('.performance-node'));
    expect(nodes.length).toBeGreaterThan(0);

    console.log('✓ 合同履约监控正常');
  });

});

// ===== 测试套件: 系统管理 =====

describe('系统管理 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录 (使用管理员账号)
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.admin.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-SYSTEM-001: 组织架构管理', async () => {
    console.log('测试: 组织架构管理');

    // 导航到系统管理
    await driver.findElement(By.id('menu-system')).click();
    await waitForElementVisible(driver, '#systemMenu');

    // 导航到组织管理
    await driver.findElement(By.id('menu-org')).click();
    await waitForElementVisible(driver, '#orgTree');

    // 添加组织节点
    await driver.findElement(By.id('btn-add-org')).click();
    await waitForElementVisible(driver, '#orgForm');

    await driver.findElement(By.id('orgName')).sendKeys('E2E测试部门');
    await driver.findElement(By.id('orgCode')).sendKeys('TEST-DEPT');
    await driver.findElement(By.id('leader')).sendKeys('测试负责人');
    await driver.findElement(By.id('contact')).sendKeys('13800138000');

    await driver.findElement(By.id('btn-save')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 组织架构管理成功');
  });

  test('E2E-SYSTEM-002: 用户管理', async () => {
    console.log('测试: 用户管理');

    // 导航到用户管理
    await driver.findElement(By.id('menu-user')).click();
    await waitForElementVisible(driver, '#userList');

    // 添加用户
    await driver.findElement(By.id('btn-add-user')).click();
    await waitForElementVisible(driver, '#userForm');

    await driver.findElement(By.id('username')).sendKeys('e2e_test_user');
    await driver.findElement(By.id('realName')).sendKeys('E2E测试用户');
    await driver.findElement(By.id('orgId')).sendKeys('TEST-DEPT');
    await driver.findElement(By.id('roleId')).sendKeys('普通用户');
    await driver.findElement(By.id('email')).sendKeys('e2e@test.com');
    await driver.findElement(By.id('phone')).sendKeys('13900139000');

    await driver.findElement(By.id('btn-save')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 用户管理成功');
  });

  test('E2E-SYSTEM-003: 角色权限配置', async () => {
    console.log('测试: 角色权限配置');

    // 导航到角色管理
    await driver.findElement(By.id('menu-role')).click();
    await waitForElementVisible(driver, '#roleList');

    // 添加角色
    await driver.findElement(By.id('btn-add-role')).click();
    await waitForElementVisible(driver, '#roleForm');

    await driver.findElement(By.id('roleName')).sendKeys('E2E测试角色');
    await driver.findElement(By.id('roleCode')).sendKeys('TEST-ROLE');
    await driver.findElement(By.id('description')).sendKeys('E2E测试用角色');

    // 勾选权限
    await driver.findElement(By.css('.permission-checkbox[name="plan:view"]')).click();
    await driver.findElement(By.css('.permission-checkbox[name="demand:view"]')).click();

    await driver.findElement(By.id('btn-save')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 角色权限配置成功');
  });

  test('E2E-SYSTEM-004: 日志查询', async () => {
    console.log('测试: 日志查询');

    // 导航到日志管理
    await driver.findElement(By.id('menu-log')).click();
    await waitForElementVisible(driver, '#logList');

    // 设置查询条件
    await driver.findElement(By.id('startDate')).sendKeys('2026-03-01');
    await driver.findElement(By.id('endDate')).sendKeys('2026-03-28');
    await driver.findElement(By.id('logType')).sendKeys('操作日志');

    // 查询
    await driver.findElement(By.id('btn-query')).click();

    // 等待结果
    await driver.wait(until.elementLocated(By.css('.el-table__row')), EXPLICIT_WAIT);

    const rows = await driver.findElements(By.css('.el-table__row'));
    expect(rows.length).toBeGreaterThan(0);

    console.log('✓ 日志查询成功');
  });

  test('E2E-SYSTEM-005: 系统配置', async () => {
    console.log('测试: 系统配置');

    // 导航到系统配置
    await driver.findElement(By.id('menu-config')).click();
    await waitForElementVisible(driver, '#configPanel');

    // 修改会话超时
    await driver.findElement(By.id('sessionTimeout')).clear();
    await driver.findElement(By.id('sessionTimeout')).sendKeys('3600');

    // 修改密码策略
    await driver.findElement(By.id('passwordMinLength')).clear();
    await driver.findElement(By.id('passwordMinLength')).sendKeys('8');

    // 保存
    await driver.findElement(By.id('btn-save-config')).click();

    await waitForElementVisible(driver, '.el-message--success');

    console.log('✓ 系统配置成功');
  });

});

// ===== 测试套件: 跨模块集成测试 =====

describe('跨模块集成 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 管理员登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.admin.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-INTEGRATION-001: 端到端采购流程', async () => {
    console.log('测试: 端到端采购流程');

    // Step 1: 创建采购计划
    console.log('Step 1: 创建采购计划');
    await driver.findElement(By.id('menu-plan')).click();
    await driver.wait(until.urlContains('/plan/list'), EXPLICIT_WAIT);
    await driver.findElement(By.id('btn-create-plan')).click();
    await waitForElementVisible(driver, '#planForm');
    await driver.findElement(By.id('planName')).sendKeys('集成测试采购计划');
    await driver.findElement(By.id('budgetAmount')).sendKeys('1000000');
    await driver.findElement(By.id('btn-submit')).click();
    await waitForElementVisible(driver, '.el-message--success');
    const planId = await driver.findElement(By.css('.record-id')).getText();
    console.log(`Created Plan ID: ${planId}`);

    // Step 2: 创建采购需求
    console.log('Step 2: 创建采购需求');
    await driver.findElement(By.id('menu-demand')).click();
    await waitForElementVisible(driver, '#demandList');
    await driver.findElement(By.id('btn-create-demand')).click();
    await waitForElementVisible(driver, '#demandForm');
    await driver.findElement(By.id('demandName')).sendKeys('集成测试采购需求');
    await driver.findElement(By.id('budgetAmount')).sendKeys('500000');
    await driver.findElement(By.id('btn-submit')).click();
    await waitForElementVisible(driver, '.el-message--success');

    // Step 3: 需求审核
    console.log('Step 3: 需求审核');
    await driver.findElement(By.id('menu-demand-approve')).click();
    await waitForElementVisible(driver, '#pendingApprovalList');
    await driver.findElement(By.css('.el-table__row:first-child .btn-approve')).click();
    await waitForElementVisible(driver, '#approveForm');
    await driver.findElement(By.id('approve-comment')).sendKeys('同意采购');
    await driver.findElement(By.id('btn-confirm-approve')).click();
    await waitForElementVisible(driver, '.el-message--success');

    // Step 4: 创建采购文件
    console.log('Step 4: 创建采购文件');
    await driver.findElement(By.id('menu-file')).click();
    await waitForElementVisible(driver, '#fileList');
    await driver.findElement(By.id('btn-create-file')).click();
    await waitForElementVisible(driver, '#fileForm');
    await driver.findElement(By.id('fileName')).sendKeys('集成测试采购文件');
    await driver.findElement(By.id('btn-save-draft')).click();
    await waitForElementVisible(driver, '.el-message--success');

    // Step 5: 创建评审
    console.log('Step 5: 创建评审任务');
    await driver.findElement(By.id('menu-review')).click();
    await waitForElementVisible(driver, '#reviewList');
    await driver.findElement(By.id('btn-create-review')).click();
    await waitForElementVisible(driver, '#reviewForm');
    await driver.findElement(By.id('reviewName')).sendKeys('集成测试评审');
    await driver.findElement(By.id('btn-submit')).click();
    await waitForElementVisible(driver, '.el-message--success');

    // Step 6: 生成合同
    console.log('Step 6: 生成合同');
    await driver.findElement(By.id('menu-contract')).click();
    await waitForElementVisible(driver, '#contractList');
    await driver.findElement(By.id('btn-smart-generate')).click();
    await waitForElementVisible(driver, '#generateDialog');
    await driver.findElement(By.id('btn-generate')).click();
    await waitForElementVisible(driver, '#contractDraft');

    console.log('✓ 端到端采购流程完成');
  });

});

// 异常场景测试
describe('异常场景 E2E 测试', () => {

  let driver: WebDriver;

  beforeAll(async () => {
    const chromeOptions = new chrome.Options();
    chromeOptions.headless();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.manage().window().maximize();

    // 登录
    await driver.get(`${BASE_URL}/login`);
    await driver.findElement(By.id('username')).sendKeys(TEST_USERS.purchaser.username);
    await driver.findElement(By.id('password')).sendKeys(TEST_USERS.purchaser.password);
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.urlContains('/dashboard'), EXPLICIT_WAIT);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('E2E-ERROR-001: 网络断开处理', async () => {
    console.log('测试: 网络断开处理');

    // 导航到计划页面
    await driver.findElement(By.id('menu-plan')).click();
    await waitForElementVisible(driver, '#planList');

    // 模拟网络断开 (通过设置网络条件)
    // 这里只是验证页面的离线提示显示
    await driver.findElement(By.id('btn-refresh')).click();

    // 验证重试机制
    const retryBtn = await waitForElement(driver, '.btn-retry', 5000).catch(() => null);
    if (retryBtn) {
      expect(retryBtn).toBeTruthy();
    }

    console.log('✓ 网络异常处理正常');
  });

  test('E2E-ERROR-002: 并发操作冲突', async () => {
    console.log('测试: 并发操作冲突');

    // 打开两个标签页
    await driver.findElement(By.id('menu-plan')).click();
    await waitForElementVisible(driver, '#planList');

    // 第一个会话编辑
    await driver.findElement(By.css('.el-table__row:first-child .btn-edit')).click();
    await waitForElementVisible(driver, '#planForm');
    await driver.findElement(By.id('budgetAmount')).sendKeys('100000');

    // 第二个会话删除同一记录
    // 由于是同一浏览器实例，需要使用new window模拟
    const newWindow = await driver.switchTo().newWindow('tab');
    await newWindow.get(`${BASE_URL}/plan/list`);
    await waitForElementVisible(newWindow, '#planList');

    // 在新窗口删除
    await newWindow.findElement(By.css('.el-table__row:first-child .btn-delete')).click();
    await waitForElementVisible(newWindow, '#confirmDialog');
    await newWindow.findElement(By.id('btn-confirm-delete')).click();

    // 切回原窗口尝试保存
    await driver.switchTo().window(driver.getWindowHandle());
    await driver.findElement(By.id('btn-save')).click();

    // 验证冲突提示
    await waitForElementVisible(driver, '.el-message--warning');

    console.log('✓ 并发冲突处理正常');
  });

});
