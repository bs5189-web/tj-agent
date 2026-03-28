/**
 * 智能化采购系统 - 性能测试场景 (k6)
 * 使用 k6 进行负载测试
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const loginDuration = new Trend('login_duration');
const queryDuration = new Trend('query_duration');
const createDuration = new Trend('create_duration');
const errorRate = new Rate('error_rate');

// 测试配置
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// 测试场景1: 100用户并发登录
export const options = {
  scenarios: {
    // 场景1: 用户登录压力测试
    loginStressTest: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },  // 30秒内增加到100用户
        { duration: '4m', target: 100 },   // 保持100用户4分钟
        { duration: '30s', target: 0 },     // 30秒内减少到0
      ],
      tags: { test_type: 'login_stress' },
    },

    // 场景2: 大数据量查询测试
    bigDataQueryTest: {
      executor: 'constant-vus',
      vus: 30,
      duration: '5m',
      tags: { test_type: 'big_data_query' },
    },

    // 场景3: 采购需求并发创建
    requirementCreateTest: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 50 },    // 1分钟内达到每秒50请求
        { duration: '3m', target: 50 },    // 保持每秒50请求3分钟
        { duration: '30s', target: 0 },    // 30秒内停止
      ],
      tags: { test_type: 'requirement_create' },
    },
  },

  thresholds: {
    // 登录接口性能要求
    'login_duration': ['p(95)<500', 'p(99)<1000'],
    // 查询接口性能要求
    'query_duration': ['p(95)<1000', 'p(99)<2000'],
    // 创建接口性能要求
    'create_duration': ['p(95)<2000', 'p(99)<3000'],
    // 错误率要求
    'error_rate': ['rate<0.05'],  // 错误率小于5%
    // HTTP相关指标
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.1'],
  },
};

// 测试数据生成
function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    requirementName: `采购需求-${timestamp}-${random}`,
    specification: `规格说明-${random}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    budget: Math.floor(Math.random() * 90000) + 10000,
  };
}

// 场景1: 用户登录测试
export function loginStressTest() {
  group('用户登录', () => {
    const startTime = Date.now();

    const loginData = {
      username: `user${__VU}`,
      password: 'password123',
    };

    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify(loginData),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'POST /api/auth/login' },
      }
    );

    loginDuration.add(Date.now() - startTime);

    check(loginRes, {
      '登录响应状态为200': (r) => r.status === 200,
      '登录响应包含token': (r) => r.json('data.token') !== undefined,
    });

    if (loginRes.status !== 200) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }

    sleep(1);
  });
}

// 场景2: 大数据量查询测试
export function bigDataQueryTest() {
  group('采购计划查询', () => {
    const startTime = Date.now();

    // 分页查询
    const queryRes = http.get(
      `${BASE_URL}/api/plan/annual?page=1&pageSize=100`,
      {
        headers: { 'Authorization': 'Bearer dummy-token' },
        tags: { name: 'GET /api/plan/annual' },
      }
    );

    queryDuration.add(Date.now() - startTime);

    check(queryRes, {
      '查询响应状态为200': (r) => r.status === 200,
      '查询响应包含数据': (r) => r.json('data') !== undefined,
    });

    if (queryRes.status !== 200) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }

    sleep(0.5);

    // 统计查询
    const statsStartTime = Date.now();
    const statsRes = http.post(
      `${BASE_URL}/api/plan/statistics`,
      JSON.stringify({
        startDate: '2023-01-01',
        endDate: '2024-12-31',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token',
        },
        tags: { name: 'POST /api/plan/statistics' },
      }
    );

    queryDuration.add(Date.now() - statsStartTime);

    check(statsRes, {
      '统计查询响应状态为200': (r) => r.status === 200,
    });

    sleep(1);
  });
}

// 场景3: 采购需求并发创建测试
export function requirementCreateTest() {
  group('采购需求创建', () => {
    const testData = generateTestData();
    const startTime = Date.now();

    const createRes = http.post(
      `${BASE_URL}/api/requirement`,
      JSON.stringify({
        name: testData.requirementName,
        specification: testData.specification,
        quantity: testData.quantity,
        budget: testData.budget,
        category: 'goods',
        department: '技术部',
        requester: `用户${__VU}`,
        urgency: 'normal',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token',
        },
        tags: { name: 'POST /api/requirement' },
      }
    );

    createDuration.add(Date.now() - startTime);

    check(createRes, {
      '创建响应状态为200或201': (r) => r.status === 200 || r.status === 201,
      '创建响应包含需求ID': (r) => r.json('data.id') !== undefined,
    });

    if (createRes.status !== 200 && createRes.status !== 201) {
      errorRate.add(1);
      console.error(`创建失败: ${createRes.body}`);
    } else {
      errorRate.add(0);
    }

    sleep(0.5);
  });
}

// 默认测试函数 (用于单场景测试)
export default function () {
  // 场景1: 登录测试
  loginStressTest();
}

// 预设测试场景
export const testScenarios = {
  // 场景A: 100用户并发登录
  scenarioA_100UsersLogin: () => {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ username: `user${__VU}`, password: 'password123' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, {
      '登录成功': (r) => r.status === 200,
    });
    return res;
  },

  // 场景B: 查询大数据量
  scenarioB_BigDataQuery: () => {
    const res = http.get(
      `${BASE_URL}/api/plan/annual?page=1&pageSize=100`,
      { headers: { 'Authorization': 'Bearer token' } }
    );
    check(res, {
      '查询成功': (r) => r.status === 200,
      '数据量正确': (r) => r.json('data').length <= 100,
    });
    return res;
  },

  // 场景C: 批量创建需求
  scenarioC_BatchCreate: () => {
    const testData = generateTestData();
    const res = http.post(
      `${BASE_URL}/api/requirement`,
      JSON.stringify(testData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, {
      '创建成功': (r) => r.status === 201 || r.status === 200,
    });
    return res;
  },
};

// 性能测试报告生成
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.html': htmlSummary(data),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  let summary = '\n';
  summary += '='.repeat(60) + '\n';
  summary += '智能化采购系统 - 性能测试报告\n';
  summary += '='.repeat(60) + '\n\n';

  summary += '测试概要:\n';
  summary += `- 总迭代次数: ${metrics.iterations.values.count}\n`;
  summary += `- 总虚拟用户: ${metrics.vus.values.max}\n`;
  summary += `- 测试时长: ${(metrics.data_received.values.total / 1000 / 60).toFixed(2)} 分钟\n\n`;

  summary += '性能指标:\n';
  summary += `- 平均响应时间: ${metrics.http_req_duration.values.avg.toFixed(2)} ms\n`;
  summary += `- P95响应时间: ${metrics.http_req_duration.values['p(95)'].toFixed(2)} ms\n`;
  summary += `- P99响应时间: ${metrics.http_req_duration.values['p(99)'].toFixed(2)} ms\n`;
  summary += `- 最大响应时间: ${metrics.http_req_duration.values.max.toFixed(2)} ms\n\n`;

  summary += '错误率:\n`;
  summary += `- HTTP错误率: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += `- 应用错误率: ${(metrics.error_rate.values.rate * 100).toFixed(2)}%\n\n`;

  summary += '吞吐量:\n`;
  summary += `- 请求速率: ${metrics.http_reqs.values.rate.toFixed(2)} req/s\n`;
  summary += `- 总请求数: ${metrics.http_reqs.values.count}\n\n`;

  summary += '='.repeat(60) + '\n';

  return summary;
}

function htmlSummary(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>性能测试报告 - 智能化采购系统</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .metric { font-weight: bold; }
    .passed { color: green; }
    .failed { color: red; }
  </style>
</head>
<body>
  <h1>智能化采购系统 - 性能测试报告</h1>
  <table>
    <tr><th>指标</th><th>值</th><th>状态</th></tr>
    <tr><td>总迭代次数</td><td>${data.metrics.iterations.values.count}</td><td>-</td></tr>
    <tr><td>平均响应时间</td><td>${data.metrics.http_req_duration.values.avg.toFixed(2)} ms</td><td class="${data.metrics.http_req_duration.values.avg < 500 ? 'passed' : 'failed'}">${data.metrics.http_req_duration.values.avg < 500 ? '通过' : '未通过'}</td></tr>
    <tr><td>P95响应时间</td><td>${data.metrics.http_req_duration.values['p(95)'].toFixed(2)} ms</td><td class="${data.metrics.http_req_duration.values['p(95)'] < 2000 ? 'passed' : 'failed'}">${data.metrics.http_req_duration.values['p(95)'] < 2000 ? '通过' : '未通过'}</td></tr>
    <tr><td>P99响应时间</td><td>${data.metrics.http_req_duration.values['p(99)'].toFixed(2)} ms</td><td class="${data.metrics.http_req_duration.values['p(99)'] < 3000 ? 'passed' : 'failed'}">${data.metrics.http_req_duration.values['p(99)'] < 3000 ? '通过' : '未通过'}</td></tr>
    <tr><td>错误率</td><td>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</td><td class="${data.metrics.http_req_failed.values.rate < 0.05 ? 'passed' : 'failed'}">${data.metrics.http_req_failed.values.rate < 0.05 ? '通过' : '未通过'}</td></tr>
    <tr><td>请求速率</td><td>${data.metrics.http_reqs.values.rate.toFixed(2)} req/s</td><td>-</td></tr>
  </table>
</body>
</html>
  `;
}
