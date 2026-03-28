# 智能化采购系统 - 测试文档

## 测试目录结构

```
tests/
├── api/                    # API接口测试
│   ├── postman-collection.json   # Postman测试集合
│   └── test-script.spec.ts       # API集成测试脚本
├── components/             # 前端组件测试
│   └── components.spec.tsx       # React组件测试
├── e2e/                    # E2E测试
│   └── purchase-flow.spec.ts     # 端到端测试
├── functional/             # 功能测试用例
│   └── testcases.md            # 功能测试用例文档
├── performance/            # 性能测试
│   ├── load-test.jmx           # JMeter测试脚本
│   └── k6-load-test.js         # k6负载测试脚本
├── setup.ts                # 测试环境配置
├── vitest.config.ts        # Vitest配置
├── tsconfig.json           # TypeScript配置
└── package.json            # 测试依赖
```

## 测试类型说明

### 1. 功能测试用例 (Functional Test Cases)
- **位置**: `functional/testcases.md`
- **内容**: 覆盖采购计划、采购需求、采购文件、采购评审、合同管理等模块的手工测试用例
- **格式**: Markdown表格格式，包含用例编号、前置条件、测试步骤、预期结果

### 2. API接口测试 (API Tests)
- **Postman集合**: `api/postman-collection.json`
  - 支持Postman导入
  - 包含所有API端点的请求示例
  - 内置测试脚本验证响应

- **集成测试**: `api/test-script.spec.ts`
  - 使用原生Fetch API
  - 支持Vitest执行
  - 包含正向和异常场景测试

### 3. 前端组件测试 (Component Tests)
- **位置**: `components/components.spec.tsx`
- **框架**: Vitest + React Testing Library
- **覆盖组件**:
  - LoginForm (登录表单)
  - PlanTable (计划列表表格)
  - RequirementForm (需求申请表单)
  - StatisticsChart (数据统计图表)
  - ApprovalFlow (审批流程)
  - FileUpload (文件上传)
  - Notification (通知消息)

### 4. E2E测试 (End-to-End Tests)
- **位置**: `e2e/purchase-flow.spec.ts`
- **框架**: Playwright
- **测试场景**:
  - 用户认证 (登录/登出)
  - 采购计划管理 (创建/查询/编辑/删除/审批)
  - 采购需求管理 (发起/审核/合规检查)
  - 采购文件管理 (生成/模板应用/版本对比)
  - 采购评审管理 (专家评分/结果汇总)
  - 合同管理 (生成/履约跟踪)
  - 完整业务流程
  - 异常场景处理

### 5. 性能测试 (Performance Tests)

#### JMeter测试
- **位置**: `performance/load-test.jmx`
- **测试场景**:
  - 100用户并发登录
  - 采购计划查询
  - 大数据量查询 (10000+记录)
  - 采购需求并发创建
  - 审批流程并发测试
  - 文件生成并发测试
  - 合同履约查询

#### k6负载测试
- **位置**: `performance/k6-load-test.js`
- **特性**:
  - 可配置的虚拟用户数
  - 渐进式负载增加
  - 实时性能指标
  - 自动生成HTML报告

## 运行测试

### 环境准备
```bash
# 安装依赖
npm install

# 安装Playwright浏览器
npx playwright install --with-deps
```

### 运行单元/组件测试
```bash
# 运行所有测试
npm test

# 运行API测试
npm run test:api

# 运行组件测试
npm run test:components

# 监听模式 (开发时使用)
npm run test:watch
```

### 运行E2E测试
```bash
# 运行所有E2E测试
npm run test:e2e

# UI模式 (可视化)
npm run test:e2e:ui

# Debug模式
npm run test:e2e:debug
```

### 运行性能测试
```bash
# 使用k6运行负载测试
npm run test:performance

# 或直接使用k6
k6 run tests/performance/k6-load-test.js

# 使用JMeter (需要安装JMeter)
jmeter -n -t tests/performance/load-test.jmx -l results.jtl
```

## API接口列表

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |

### 采购计划接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/plan/annual | 创建年度计划 |
| GET | /api/plan/annual/:id | 查询计划详情 |
| GET | /api/plan/annual | 查询计划列表 |
| PUT | /api/plan/quarterly/:id/approve | 审批季度计划 |

### 采购需求接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/requirement | 发起需求 |
| GET | /api/requirement/:id | 查询需求详情 |
| PUT | /api/requirement/:id/approve | 审批需求 |
| POST | /api/requirement/:id/compliance-check | 合规检查 |

### 采购文件接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/document/generate | 生成文件 |
| GET | /api/document | 查询文件列表 |
| GET | /api/document/:id/versions/compare | 版本对比 |

### 采购评审接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/evaluation/:id/score | 专家评分 |
| GET | /api/evaluation/:id/result | 评审结果汇总 |

### 合同管理接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/contract/generate | 生成合同 |
| GET | /api/contract | 查询合同列表 |
| GET | /api/contract/:id/performance | 履约跟踪 |
| PUT | /api/contract/:id/performance/update | 更新履约状态 |

## 测试数据说明

### 测试用户
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| user | user123 | 普通用户 |
| expert | expert123 | 评审专家 |

### 测试数据格式
- 计划ID格式: `PLAN-YYYY-NNN`
- 需求ID格式: `REQ-YYYY-NNN`
- 文件ID格式: `DOC-NNN`
- 评审ID格式: `EVA-YYYY-NNN`
- 合同ID格式: `CON-YYYY-NNN`

## 注意事项

1. **前置条件**: 运行测试前请确保后端服务已启动
2. **环境变量**: 可通过环境变量配置测试目标URL
   - API测试: `API_BASE_URL=http://localhost:3000`
   - E2E测试: `E2E_BASE_URL=http://localhost:3000`
3. **并行执行**: E2E测试支持在多个浏览器中并行执行
4. **测试隔离**: 每个测试用例相互独立，可单独运行
