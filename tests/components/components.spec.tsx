/**
 * 智能化采购系统 - 前端组件测试
 * 使用 Vitest + React Testing Library
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// 1. 登录表单组件测试
// ============================================

describe('LoginForm 登录表单组件', () => {
  const mockOnSubmit = vi.fn();
  const mockOnForgotPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染登录表单', () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('应验证必填字段', async () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const submitButton = screen.getByRole('button', { name: /登录/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/用户名不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/密码不能为空/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('应验证用户名格式', async () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const usernameInput = screen.getByLabelText(/用户名/i);
    await userEvent.type(usernameInput, 'ab'); // 太短的用户名

    const submitButton = screen.getByRole('button', { name: /登录/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/用户名至少4个字符/i)).toBeInTheDocument();
    });
  });

  it('密码长度不足应提示错误', async () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const usernameInput = screen.getByLabelText(/用户名/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, '12345'); // 少于6位

    const submitButton = screen.getByRole('button', { name: /登录/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/密码至少6个字符/i)).toBeInTheDocument();
    });
  });

  it('表单填写完整后应能提交', async () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const usernameInput = screen.getByLabelText(/用户名/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, 'admin123');

    const submitButton = screen.getByRole('button', { name: /登录/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123'
      });
    });
  });

  it('登录失败应显示错误提示', async () => {
    const errorMessage = '用户名或密码错误';
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('点击忘记密码应触发回调', async () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const forgotLink = screen.getByText(/忘记密码/i);
    await userEvent.click(forgotLink);

    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  it('加载状态应禁用提交按钮', () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onForgotPassword={mockOnForgotPassword}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /登录中/i });
    expect(submitButton).toBeDisabled();
  });
});

// ============================================
// 2. 计划列表表格组件测试
// ============================================

describe('PlanTable 计划列表表格组件', () => {
  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnApprove = vi.fn();
  const mockOnPageChange = vi.fn();

  const mockPlans = [
    {
      id: 'PLAN-2024-001',
      name: '2024年度办公设备采购计划',
      budget: 500000,
      status: 'pending',
      department: '技术部',
      createTime: '2024-01-15 10:00:00'
    },
    {
      id: 'PLAN-2024-002',
      name: '2024年度办公家具采购计划',
      budget: 200000,
      status: 'approved',
      department: '行政部',
      createTime: '2024-01-16 14:30:00'
    },
    {
      id: 'PLAN-2024-003',
      name: '2024年度IT设备采购计划',
      budget: 800000,
      status: 'rejected',
      department: '技术部',
      createTime: '2024-01-17 09:15:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染计划列表', () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('2024年度办公设备采购计划')).toBeInTheDocument();
    expect(screen.getByText('2024年度办公家具采购计划')).toBeInTheDocument();
    expect(screen.getByText('2024年度IT设备采购计划')).toBeInTheDocument();
  });

  it('应正确显示状态标签', () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText(/待审批/i)).toBeInTheDocument();
    expect(screen.getByText(/已批准/i)).toBeInTheDocument();
    expect(screen.getByText(/已驳回/i)).toBeInTheDocument();
  });

  it('点击查看按钮应触发回调', async () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    const viewButtons = screen.getAllByRole('button', { name: /查看/i });
    await userEvent.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalledWith(mockPlans[0]);
  });

  it('点击编辑按钮应触发回调', async () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /编辑/i });
    await userEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPlans[0]);
  });

  it('点击删除按钮应显示确认对话框', async () => {
    window.confirm = vi.fn(() => true);

    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('确认删除该计划？');
    expect(mockOnDelete).toHaveBeenCalledWith(mockPlans[0]);
  });

  it('待审批状态应显示审批按钮', () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    const approveButtons = screen.getAllByRole('button', { name: /审批/i });
    expect(approveButtons.length).toBe(1); // 只有一条待审批
  });

  it('分页信息应正确显示', () => {
    render(
      <PlanTable
        data={mockPlans}
        total={100}
        page={1}
        pageSize={10}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText(/共 100 条记录/i)).toBeInTheDocument();
    expect(screen.getByText(/第 1 页\/共 10 页/i)).toBeInTheDocument();
  });

  it('点击分页应触发回调', async () => {
    render(
      <PlanTable
        data={mockPlans}
        total={100}
        page={1}
        pageSize={10}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /下一页/i });
    await userEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('空数据应显示空状态提示', () => {
    render(
      <PlanTable
        data={[]}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText(/暂无数据/i)).toBeInTheDocument();
  });

  it('预算金额应正确格式化显示', () => {
    render(
      <PlanTable
        data={mockPlans}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onApprove={mockOnApprove}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText(/500,000/)).toBeInTheDocument();
    expect(screen.getByText(/200,000/)).toBeInTheDocument();
    expect(screen.getByText(/800,000/)).toBeInTheDocument();
  });
});

// ============================================
// 3. 需求申请表单组件测试
// ============================================

describe('RequirementForm 需求申请表单组件', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染需求申请表单', () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/需求名称/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/规格要求/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/数量/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/预算金额/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/采购类别/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/紧急程度/i)).toBeInTheDocument();
  });

  it('应验证必填字段', async () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /提交需求/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/需求名称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/规格要求不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/数量不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/预算金额不能为空/i)).toBeInTheDocument();
    });
  });

  it('数量应只接受正整数', async () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const quantityInput = screen.getByLabelText(/数量/i);
    await userEvent.type(quantityInput, '-5');

    const submitButton = screen.getByRole('button', { name: /提交需求/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/数量必须为正整数/i)).toBeInTheDocument();
    });
  });

  it('预算金额应只接受正数', async () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const budgetInput = screen.getByLabelText(/预算金额/i);
    await userEvent.type(budgetInput, '-1000');

    const submitButton = screen.getByRole('button', { name: /提交需求/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/预算金额必须为正数/i)).toBeInTheDocument();
    });
  });

  it('表单填写完整后应能提交', async () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await userEvent.type(screen.getByLabelText(/需求名称/i), '办公设备采购');
    await userEvent.type(screen.getByLabelText(/规格要求/i), 'ThinkPad X1 Carbon');
    await userEvent.type(screen.getByLabelText(/数量/i), '10');
    await userEvent.type(screen.getByLabelText(/预算金额/i), '100000');

    const submitButton = screen.getByRole('button', { name: /提交需求/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('点击取消应触发回调', async () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /取消/i });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('编辑模式应回填已有数据', () => {
    const existingData = {
      id: 'REQ-2024-001',
      name: '办公设备采购',
      specification: 'ThinkPad X1 Carbon',
      quantity: 10,
      budget: 100000,
      category: 'goods',
      urgency: 'normal'
    };

    render(
      <RequirementForm
        initialData={existingData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('办公设备采购')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
  });

  it('提交中应禁用按钮', () => {
    render(
      <RequirementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    expect(screen.getByRole('button', { name: /提交中/i })).toBeDisabled();
  });
});

// ============================================
// 4. 数据统计图表组件测试
// ============================================

describe('StatisticsChart 数据统计图表组件', () => {
  const mockOnDateRangeChange = vi.fn();
  const mockOnExport = vi.fn();

  const mockData = {
    totalPlans: 150,
    totalBudget: 5000000,
    approvedPlans: 120,
    pendingPlans: 30,
    departmentDistribution: [
      { name: '技术部', value: 50 },
      { name: '行政部', value: 40 },
      { name: '财务部', value: 30 },
      { name: '市场部', value: 30 }
    ],
    monthlyTrend: [
      { month: '1月', plans: 20, budget: 500000 },
      { month: '2月', plans: 15, budget: 400000 },
      { month: '3月', plans: 25, budget: 600000 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染统计概览数据', () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/总计划数/)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/总预算/)).toBeInTheDocument();
    expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
  });

  it('应正确渲染状态统计', () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/已批准/)).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/待审批/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it('应正确渲染部门分布饼图', () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/部门分布/)).toBeInTheDocument();
    expect(screen.getByText(/技术部/)).toBeInTheDocument();
    expect(screen.getByText(/行政部/)).toBeInTheDocument();
  });

  it('应正确渲染月度趋势图', () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/月度趋势/)).toBeInTheDocument();
    expect(screen.getByText(/1月/)).toBeInTheDocument();
    expect(screen.getByText(/2月/)).toBeInTheDocument();
    expect(screen.getByText(/3月/)).toBeInTheDocument();
  });

  it('点击导出按钮应触发回调', async () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    const exportButton = screen.getByRole('button', { name: /导出报表/i });
    await userEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalled();
  });

  it('日期范围选择应触发回调', async () => {
    render(
      <StatisticsChart
        data={mockData}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    const dateRangePicker = screen.getByLabelText(/日期范围/i);
    await userEvent.click(dateRangePicker);

    // 选择预设的日期范围
    const thisMonthOption = screen.getByText(/本月/i);
    await userEvent.click(thisMonthOption);

    expect(mockOnDateRangeChange).toHaveBeenCalled();
  });

  it('空数据应显示空状态', () => {
    render(
      <StatisticsChart
        data={{
          totalPlans: 0,
          totalBudget: 0,
          approvedPlans: 0,
          pendingPlans: 0,
          departmentDistribution: [],
          monthlyTrend: []
        }}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/暂无统计数据/i)).toBeInTheDocument();
  });

  it('加载状态应显示骨架屏', () => {
    render(
      <StatisticsChart
        data={null}
        isLoading={true}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
  });
});

// ============================================
// 5. 审批流程组件测试
// ============================================

describe('ApprovalFlow 审批流程组件', () => {
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();

  const mockWorkflow = {
    currentNode: 'department_review',
    nodes: [
      {
        id: 'department_review',
        name: '部门主管审批',
        status: 'current',
        assignee: '张三',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 'finance_review',
        name: '财务主管审批',
        status: 'pending',
        assignee: '李四'
      },
      {
        id: 'procurement_review',
        name: '采购主管审批',
        status: 'pending',
        assignee: '王五'
      }
    ],
    history: [
      {
        node: 'submit',
        action: '提交',
        operator: '申请人',
        time: '2024-01-15 09:00:00',
        comment: '发起采购申请'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染审批流程', () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText(/部门主管审批/)).toBeInTheDocument();
    expect(screen.getByText(/财务主管审批/)).toBeInTheDocument();
    expect(screen.getByText(/采购主管审批/)).toBeInTheDocument();
  });

  it('当前节点应高亮显示', () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const currentNode = screen.getByText(/部门主管审批/i).closest('[class*="current"]');
    expect(currentNode).toBeInTheDocument();
  });

  it('应显示历史审批记录', () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText(/审批历史/)).toBeInTheDocument();
    expect(screen.getByText(/发起采购申请/)).toBeInTheDocument();
  });

  it('应显示审批按钮', () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByRole('button', { name: /通过/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /驳回/i })).toBeInTheDocument();
  });

  it('点击通过应触发回调', async () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const approveButton = screen.getByRole('button', { name: /通过/i });
    await userEvent.click(approveButton);

    expect(mockOnApprove).toHaveBeenCalled();
  });

  it('点击驳回应要求填写理由', async () => {
    render(
      <ApprovalFlow
        workflow={mockWorkflow}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /驳回/i });
    await userEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入驳回原因/i)).toBeInTheDocument();
    });
  });
});

// ============================================
// 6. 文件上传组件测试
// ============================================

describe('FileUpload 文件上传组件', () => {
  const mockOnUpload = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染上传区域', () => {
    render(
      <FileUpload
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/点击上传文件/i)).toBeInTheDocument();
    expect(screen.getByText(/或拖拽文件到此处/i)).toBeInTheDocument();
  });

  it('应显示支持的文件类型', () => {
    render(
      <FileUpload
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
    );

    expect(screen.getByText(/支持 PDF、Word、Excel 文件/i)).toBeInTheDocument();
  });

  it('应限制文件大小', () => {
    render(
      <FileUpload
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        maxSize={10 * 1024 * 1024} // 10MB
      />
    );

    expect(screen.getByText(/最大支持 10MB/i)).toBeInTheDocument();
  });

  it('应显示已上传文件列表', () => {
    const uploadedFiles = [
      { id: '1', name: '采购需求文档.pdf', size: 1024000 },
      { id: '2', name: '技术规格说明.docx', size: 512000 }
    ];

    render(
      <FileUpload
        files={uploadedFiles}
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('采购需求文档.pdf')).toBeInTheDocument();
    expect(screen.getByText('技术规格说明.docx')).toBeInTheDocument();
  });

  it('点击删除应触发回调', async () => {
    const uploadedFiles = [
      { id: '1', name: '采购需求文档.pdf', size: 1024000 }
    ];

    render(
      <FileUpload
        files={uploadedFiles}
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /删除/i);
    await userEvent.click(deleteButton);

    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('上传失败应显示错误提示', async () => {
    render(
      <FileUpload
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        error="文件上传失败，请重试"
      />
    );

    expect(screen.getByText(/文件上传失败，请重试/i)).toBeInTheDocument();
  });
});

// ============================================
// 7. 通知消息组件测试
// ============================================

describe('Notification 通知消息组件', () => {
  it('应正确渲染成功类型通知', () => {
    render(
      <Notification
        type="success"
        message="操作成功"
      />
    );

    expect(screen.getByText('操作成功')).toBeInTheDocument();
    expect(screen.getByTestId('notification-success')).toBeInTheDocument();
  });

  it('应正确渲染错误类型通知', () => {
    render(
      <Notification
        type="error"
        message="操作失败"
      />
    );

    expect(screen.getByText('操作失败')).toBeInTheDocument();
    expect(screen.getByTestId('notification-error')).toBeInTheDocument();
  });

  it('应正确渲染警告类型通知', () => {
    render(
      <Notification
        type="warning"
        message="数据已过期"
      />
    );

    expect(screen.getByText('数据已过期')).toBeInTheDocument();
    expect(screen.getByTestId('notification-warning')).toBeInTheDocument();
  });

  it('应支持自动关闭', async () => {
    vi.useFakeTimers();
    const { getByRole } = render(
      <Notification
        type="success"
        message="操作成功"
        autoClose={3000}
      />
    );

    // 3秒后应自动关闭
    await waitFor(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('操作成功')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('应显示关闭按钮', () => {
    const mockOnClose = vi.fn();
    render(
      <Notification
        type="success"
        message="操作成功"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /关闭/i });
    expect(closeButton).toBeInTheDocument();
  });
});

// ============================================
// 辅助组件占位符（实际项目中应从源码导入）
// ============================================

// 这些组件在实际项目中应从源码导入
// 这里提供简化版本用于测试结构展示

function LoginForm({ onSubmit, onForgotPassword, isLoading, error }: any) {
  return (
    <form data-testid="login-form">
      <label htmlFor="username">用户名</label>
      <input id="username" type="text" />

      <label htmlFor="password">密码</label>
      <input id="password" type="password" />

      {error && <div data-testid="login-error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中' : '登录'}
      </button>

      <button type="button" onClick={onForgotPassword}>
        忘记密码
      </button>
    </form>
  );
}

function PlanTable({ data, onView, onEdit, onDelete, onApprove, onPageChange, total, page, pageSize }: any) {
  if (!data || data.length === 0) {
    return <div data-testid="empty-state">暂无数据</div>;
  }

  return (
    <div data-testid="plan-table">
      <div data-testid="pagination-info">
        共 {total || data.length} 条记录
        第 {page || 1} 页/共 {Math.ceil((total || data.length) / (pageSize || 10))} 页
      </div>
      {data.map((plan: any) => (
        <div key={plan.id} data-plan-id={plan.id}>
          <span>{plan.name}</span>
          <span>{plan.budget.toLocaleString()}</span>
          <span>{plan.status === 'pending' ? '待审批' : plan.status === 'approved' ? '已批准' : '已驳回'}</span>
          <button onClick={() => onView(plan)}>查看</button>
          <button onClick={() => onEdit(plan)}>编辑</button>
          <button onClick={() => onDelete(plan)}>删除</button>
          {plan.status === 'pending' && <button onClick={() => onApprove(plan)}>审批</button>}
        </div>
      ))}
      <button onClick={() => onPageChange((page || 1) + 1)}>下一页</button>
    </div>
  );
}

function RequirementForm({ initialData, onSubmit, onCancel, isSubmitting }: any) {
  return (
    <form data-testid="requirement-form">
      <label htmlFor="name">需求名称</label>
      <input id="name" type="text" defaultValue={initialData?.name} />

      <label htmlFor="specification">规格要求</label>
      <input id="specification" type="text" defaultValue={initialData?.specification} />

      <label htmlFor="quantity">数量</label>
      <input id="quantity" type="number" defaultValue={initialData?.quantity} />

      <label htmlFor="budget">预算金额</label>
      <input id="budget" type="number" defaultValue={initialData?.budget} />

      <label htmlFor="category">采购类别</label>
      <select id="category" defaultValue={initialData?.category}>
        <option value="goods">货物类</option>
        <option value="service">服务类</option>
        <option value="project">工程类</option>
      </select>

      <label htmlFor="urgency">紧急程度</label>
      <select id="urgency" defaultValue={initialData?.urgency}>
        <option value="normal">普通</option>
        <option value="urgent">紧急</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中' : '提交需求'}
      </button>
      <button type="button" onClick={onCancel}>取消</button>
    </form>
  );
}

function StatisticsChart({ data, onDateRangeChange, onExport, isLoading }: any) {
  if (isLoading) {
    return <div data-testid="chart-skeleton">加载中...</div>;
  }

  if (!data || (data.totalPlans === 0 && data.totalBudget === 0)) {
    return <div data-testid="empty-chart">暂无统计数据</div>;
  }

  return (
    <div data-testid="statistics-chart">
      <div data-testid="date-range-picker">
        <label>日期范围</label>
        <button>本月</button>
      </div>

      <div data-testid="overview-stats">
        <div>总计划数: {data.totalPlans}</div>
        <div>总预算: {data.totalBudget.toLocaleString()}</div>
        <div>已批准: {data.approvedPlans}</div>
        <div>待审批: {data.pendingPlans}</div>
      </div>

      <div data-testid="department-chart">
        <h3>部门分布</h3>
        {data.departmentDistribution.map((d: any) => (
          <div key={d.name}>{d.name}</div>
        ))}
      </div>

      <div data-testid="trend-chart">
        <h3>月度趋势</h3>
        {data.monthlyTrend.map((t: any) => (
          <div key={t.month}>{t.month}</div>
        ))}
      </div>

      <button onClick={onExport}>导出报表</button>
    </div>
  );
}

function ApprovalFlow({ workflow, onApprove, onReject }: any) {
  return (
    <div data-testid="approval-flow">
      <h3>审批流程</h3>
      <div data-testid="workflow-nodes">
        {workflow.nodes.map((node: any) => (
          <div
            key={node.id}
            className={node.status === 'current' ? 'current' : ''}
          >
            {node.name}
          </div>
        ))}
      </div>

      <div data-testid="approval-history">
        <h4>审批历史</h4>
        {workflow.history.map((h: any, i: number) => (
          <div key={i}>{h.comment}</div>
        ))}
      </div>

      <button onClick={onApprove}>通过</button>
      <button onClick={onReject}>驳回</button>
    </div>
  );
}

function FileUpload({ files, onUpload, onRemove, error, accept, maxSize }: any) {
  return (
    <div data-testid="file-upload">
      <div>
        点击上传文件
        {accept && <span>支持 PDF、Word、Excel 文件</span>}
        {maxSize && <span>最大支持 {maxSize / 1024 / 1024}MB</span>}
      </div>

      {files?.map((file: any) => (
        <div key={file.id}>
          <span>{file.name}</span>
          <button onClick={() => onRemove(file.id)}>删除</button>
        </div>
      ))}

      {error && <div data-testid="upload-error">{error}</div>}
    </div>
  );
}

function Notification({ type, message, autoClose, onClose }: any) {
  return (
    <div data-testid={`notification-${type}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose}>关闭</button>}
    </div>
  );
}
