# 智能化采购系统 - 后端

## 项目结构

```
src/backend/
├── procurement-parent/           # 父项目
├── procurement-common/           # 公共模块
├── procurement-gateway/          # API网关
├── procurement-system/           # 系统管理服务 (8080)
├── procurement-plan/             # 采购计划服务 (8081)
├── procurement-requirement/      # 采购需求服务
├── procurement-document/         # 采购文件服务
├── procurement-review/           # 采购评审服务
└── procurement-contract/        # 采购合同服务
```

## 技术栈

- Spring Boot 3.2
- MyBatis-Plus 3.5
- MySQL 8.0
- Redis
- JWT

## 快速开始

### 1. 创建数据库

```sql
CREATE DATABASE procurement_system;
CREATE DATABASE procurement_plan;
```

### 2. 编译项目

```bash
cd src/backend
mvn clean install -DskipTests
```

### 3. 启动服务

```bash
# 启动系统管理服务
cd procurement-system
mvn spring-boot:run

# 启动采购计划服务
cd procurement-plan
mvn spring-boot:run
```

## API接口

### 系统管理服务 (端口 8080)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/system/user/login | 用户登录 |
| GET | /api/system/user/list | 用户列表 |
| GET | /api/system/user/{id} | 用户详情 |
| POST | /api/system/user | 创建用户 |
| PUT | /api/system/user/{id} | 更新用户 |
| DELETE | /api/system/user/{id} | 删除用户 |

### 采购计划服务 (端口 8081)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/plan/annual | 创建年度计划 |
| GET | /api/plan/annual/list | 计划列表 |
| GET | /api/plan/annual/{id} | 计划详情 |
| PUT | /api/plan/annual/{id} | 更新计划 |
| DELETE | /api/plan/annual/{id} | 删除计划 |
| POST | /api/plan/annual/{id}/submit | 提交审核 |
| POST | /api/plan/annual/{id}/approve | 审批通过 |
| POST | /api/plan/annual/{id}/reject | 审批拒绝 |
| GET | /api/plan/annual/statistics | 统计信息 |

## 数据库表

### sys_user (系统用户)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | bigint | 主键 |
| username | varchar | 用户名 |
| password | varchar | 密码(MD5) |
| real_name | varchar | 姓名 |
| phone | varchar | 手机号 |
| email | varchar | 邮箱 |
| dept_id | bigint | 部门ID |
| status | int | 状态(0禁用1启用) |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### annual_plan (年度采购计划)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | bigint | 主键 |
| plan_no | varchar | 计划编号 |
| plan_name | varchar | 计划名称 |
| unit_id | bigint | 采购单位ID |
| unit_name | varchar | 采购单位名称 |
| budget_amount | decimal | 预算金额(万元) |
| used_amount | decimal | 已使用金额(万元) |
| plan_type | varchar | 计划类型 |
| status | varchar | 状态 |
| plan_year | int | 计划年度 |
| quarter | int | 季度 |
| remark | varchar | 备注 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

## 开发指南

### 添加新模块

1. 在父pom.xml的<modules>中添加新模块
2. 创建模块目录结构
3. 创建pom.xml
4. 实现Entity、Mapper、Service、Controller
5. 创建application.yml配置
