/**
 * 采购系统前端组件测试
 * 测试框架: React Testing Library + Jest
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 待测试的组件路径 (假设采用路径别名)
import PlanForm from '@/components/plan/PlanForm';
import DemandList from '@/components/demand/DemandList';
import FileViewer from '@/components/file/FileViewer';
import ReviewScoreCard from '@/components/review/ReviewScoreCard';
import ContractGenerator from '@/components/contract/ContractGenerator';
import ApprovalFlow from '@/components/common/ApprovalFlow';
import DataChart from '@/components/common/DataChart';
import SearchBox from '@/components/common/SearchBox';

// ===== 采购计划组件测试 =====

describe('PlanForm 组件测试', () => {

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    initialValues: {
      planName: '',
      planType: 'YEAR',
      purchaseType: 'GOODS',
      budgetAmount: 0,
    },
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-001: 计划表单渲染', () => {
    render(<PlanForm {...defaultProps} />);

    expect(screen.getByLabelText(/计划名称/)).toBeInTheDocument();
    expect(screen.getByLabelText(/计划类型/)).toBeInTheDocument();
    expect(screen.getByLabelText(/采购类型/)).toBeInTheDocument();
    expect(screen.getByLabelText(/预算金额/)).toBeInTheDocument();
  });

  test('TC-COMP-002: 表单输入与提交', async () => {
    render(<PlanForm {...defaultProps} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/计划名称/), '2026年度测试计划');
    await user.selectOptions(screen.getByLabelText(/计划类型/), 'YEAR');
    await user.selectOptions(screen.getByLabelText(/采购类型/), 'GOODS');
    await user.type(screen.getByLabelText(/预算金额/), '500000');

    fireEvent.click(screen.getByRole('button', { name: /提交/ }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          planName: '2026年度测试计划',
          planType: 'YEAR',
          purchaseType: 'GOODS',
          budgetAmount: 500000,
        })
      );
    });
  });

  test('TC-COMP-003: 表单必填验证', async () => {
    render(<PlanForm {...defaultProps} />);

    const user = userEvent.setup();

    // 不填写直接提交
    fireEvent.click(screen.getByRole('button', { name: /提交/ }));

    await waitFor(() => {
      expect(screen.getByText(/计划名称不能为空/)).toBeInTheDocument();
      expect(screen.getByText(/预算金额必须大于0/)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('TC-COMP-004: 取消按钮功能', () => {
    render(<PlanForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /取消/ }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('TC-COMP-005: 加载状态显示', () => {
    render(<PlanForm {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /提交/ })).toBeDisabled();
  });

  test('TC-COMP-006: 历史数据回显', () => {
    const propsWithData = {
      ...defaultProps,
      initialValues: {
        planName: '已存在的计划',
        planType: 'QUARTER',
        purchaseType: 'SERVICE',
        budgetAmount: 300000,
      },
    };

    render(<PlanForm {...propsWithData} />);

    expect(screen.getByDisplayValue('已存在的计划')).toBeInTheDocument();
    expect(screen.getByDisplayValue('300000')).toBeInTheDocument();
  });

});

describe('DemandList 组件测试', () => {

  const mockDemands = [
    {
      demandId: 'DEMAND-001',
      demandName: '办公设备采购',
      demandType: 'GOODS',
      budgetAmount: 100000,
      status: 'PENDING_APPROVAL',
      createTime: '2026-03-15 10:00:00',
    },
    {
      demandId: 'DEMAND-002',
      demandName: '咨询服务采购',
      demandType: 'SERVICE',
      budgetAmount: 50000,
      status: 'APPROVED',
      createTime: '2026-03-14 09:00:00',
    },
  ];

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const defaultProps = {
    demands: mockDemands,
    loading: false,
    pagination: {
      pageNum: 1,
      pageSize: 10,
      total: 2,
    },
    onView: mockOnView,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-007: 需求列表渲染', () => {
    render(<DemandList {...defaultProps} />);

    expect(screen.getByText('办公设备采购')).toBeInTheDocument();
    expect(screen.getByText('咨询服务采购')).toBeInTheDocument();
    expect(screen.getByText('100,000')).toBeInTheDocument();
  });

  test('TC-COMP-008: 需求状态标签显示', () => {
    render(<DemandList {...defaultProps} />);

    expect(screen.getByText('待审核')).toBeInTheDocument();
    expect(screen.getByText('已通过')).toBeInTheDocument();
  });

  test('TC-COMP-009: 分页信息显示', () => {
    render(<DemandList {...defaultProps} />);

    expect(screen.getByText(/共 2 条/)).toBeInTheDocument();
  });

  test('TC-COMP-010: 查看需求详情', async () => {
    render(<DemandList {...defaultProps} />);

    const user = userEvent.setup();

    // 点击第一条的查看按钮
    const viewButtons = screen.getAllByRole('button', { name: /查看/ });
    await user.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalledWith('DEMAND-001');
  });

  test('TC-COMP-011: 编辑需求', async () => {
    render(<DemandList {...defaultProps} />);

    const user = userEvent.setup();

    // 点击第一条的编辑按钮
    const editButtons = screen.getAllByRole('button', { name: /编辑/ });
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith('DEMAND-001');
  });

  test('TC-COMP-012: 删除需求', async () => {
    render(<DemandList {...defaultProps} />);

    const user = userEvent.setup();

    // 点击第一条的删除按钮
    const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
    await user.click(deleteButtons[0]);

    // 确认删除对话框
    expect(screen.getByText(/确认删除/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /确定/ }));

    expect(mockOnDelete).toHaveBeenCalledWith('DEMAND-001');
  });

  test('TC-COMP-013: 空列表状态', () => {
    render(<DemandList {...defaultProps} demands={[]} pagination={{ ...defaultProps.pagination, total: 0 }} />);

    expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
  });

  test('TC-COMP-014: 加载状态', () => {
    render(<DemandList {...defaultProps} loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

});

describe('FileViewer 组件测试', () => {

  const mockOnClose = jest.fn();

  const defaultProps = {
    fileId: 'FILE-001',
    fileName: '采购招标文件.pdf',
    fileUrl: '/files/test.pdf',
    version: 1,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-015: 文件查看器渲染', () => {
    render(<FileViewer {...defaultProps} />);

    expect(screen.getByText('采购招标文件.pdf')).toBeInTheDocument();
    expect(screen.getByText('版本: 1')).toBeInTheDocument();
  });

  test('TC-COMP-016: 关闭按钮功能', () => {
    render(<FileViewer {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /关闭/ }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('TC-COMP-017: 版本历史切换', async () => {
    const versions = [
      { version: 1, updateTime: '2026-03-15' },
      { version: 2, updateTime: '2026-03-16' },
    ];

    render(<FileViewer {...defaultProps} versions={versions} />);

    const user = userEvent.setup();

    // 选择版本2
    await user.selectOptions(screen.getByLabelText(/选择版本/), '2');

    expect(screen.getByText('版本: 2')).toBeInTheDocument();
  });

});

describe('ReviewScoreCard 组件测试', () => {

  const mockOnScoreChange = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    reviewId: 'REVIEW-001',
    expertName: '张专家',
    objectiveScore: 0,
    subjectiveScore: 0,
    maxObjectiveScore: 100,
    maxSubjectiveScore: 100,
    onScoreChange: mockOnScoreChange,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-018: 评分卡片渲染', () => {
    render(<ReviewScoreCard {...defaultProps} />);

    expect(screen.getByText('张专家')).toBeInTheDocument();
    expect(screen.getByLabelText(/客观评分/)).toBeInTheDocument();
    expect(screen.getByLabelText(/主观评分/)).toBeInTheDocument();
  });

  test('TC-COMP-019: 评分输入', async () => {
    render(<ReviewScoreCard {...defaultProps} />);

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText(/客观评分/));
    await user.type(screen.getByLabelText(/客观评分/), '85');

    expect(mockOnScoreChange).toHaveBeenCalled();
  });

  test('TC-COMP-020: 评分超限验证', async () => {
    render(<ReviewScoreCard {...defaultProps} />);

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText(/客观评分/));
    await user.type(screen.getByLabelText(/客观评分/), '150');

    await waitFor(() => {
      expect(screen.getByText(/评分不能超过/)).toBeInTheDocument();
    });
  });

  test('TC-COMP-021: 提交评分', async () => {
    render(<ReviewScoreCard {...defaultProps} />);

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText(/客观评分/));
    await user.type(screen.getByLabelText(/客观评分/), '85');
    await user.clear(screen.getByLabelText(/主观评分/));
    await user.type(screen.getByLabelText(/主观评分/), '90');

    fireEvent.click(screen.getByRole('button', { name: /提交/ }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          objectiveScore: 85,
          subjectiveScore: 90,
        })
      );
    });
  });

});

describe('ContractGenerator 组件测试', () => {

  const mockOnGenerate = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    tenderFileId: 'TENDER-001',
    supplierId: 'SUPPLIER-001',
    onGenerate: mockOnGenerate,
    onCancel: mockOnCancel,
    isGenerating: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-022: 合同生成器渲染', () => {
    render(<ContractGenerator {...defaultProps} />);

    expect(screen.getByText(/合同智能生成/)).toBeInTheDocument();
    expect(screen.getByText(/投标文件/)).toBeInTheDocument();
    expect(screen.getByText(/供应商/)).toBeInTheDocument();
  });

  test('TC-COMP-023: 合同生成', async () => {
    render(<ContractGenerator {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /生成合同/ }));

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith({
        tenderFileId: 'TENDER-001',
        supplierId: 'SUPPLIER-001',
      });
    });
  });

  test('TC-COMP-024: 生成中状态', () => {
    render(<ContractGenerator {...defaultProps} isGenerating={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /生成合同/ })).toBeDisabled();
  });

  test('TC-COMP-025: 合同预览', async () => {
    const mockContractDraft = {
      contractName: '办公设备采购合同',
      partyA: '采购单位',
      partyB: '供应商',
      contractAmount: 300000,
    };

    render(<ContractGenerator {...defaultProps} generatedContract={mockContractDraft} />);

    expect(screen.getByText('办公设备采购合同')).toBeInTheDocument();
    expect(screen.getByText('300,000')).toBeInTheDocument();
  });

});

describe('ApprovalFlow 组件测试', () => {

  const mockNodes = [
    { nodeId: '1', nodeName: '提交申请', status: 'COMPLETED', operator: '张三', operatorTime: '2026-03-15 10:00' },
    { nodeId: '2', nodeName: '部门审核', status: 'APPROVED', operator: '李四', operatorTime: '2026-03-15 14:00' },
    { nodeId: '3', nodeName: '领导审批', status: 'PENDING', operator: null, operatorTime: null },
  ];

  const defaultProps = {
    flowId: 'FLOW-001',
    flowName: '采购需求审批流程',
    nodes: mockNodes,
    currentNodeId: '3',
  };

  test('TC-COMP-026: 审批流程渲染', () => {
    render(<ApprovalFlow {...defaultProps} />);

    expect(screen.getByText('采购需求审批流程')).toBeInTheDocument();
    expect(screen.getByText('提交申请')).toBeInTheDocument();
    expect(screen.getByText('部门审核')).toBeInTheDocument();
    expect(screen.getByText('领导审批')).toBeInTheDocument();
  });

  test('TC-COMP-027: 节点状态显示', () => {
    render(<ApprovalFlow {...defaultProps} />);

    expect(screen.getByText(/已完成/)).toBeInTheDocument();
    expect(screen.getByText(/已通过/)).toBeInTheDocument();
    expect(screen.getByText(/待处理/)).toBeInTheDocument();
  });

  test('TC-COMP-028: 当前节点高亮', () => {
    render(<ApprovalFlow {...defaultProps} />);

    const currentNode = screen.getByText('领导审批').closest('.flow-node');
    expect(currentNode).toHaveClass('current');
  });

  test('TC-COMP-029: 流程时间线显示', () => {
    render(<ApprovalFlow {...defaultProps} />);

    expect(screen.getByText('2026-03-15 10:00')).toBeInTheDocument();
    expect(screen.getByText('2026-03-15 14:00')).toBeInTheDocument();
  });

});

describe('DataChart 组件测试', () => {

  const mockData = {
    labels: ['1月', '2月', '3月'],
    datasets: [
      {
        label: '采购金额',
        data: [100000, 150000, 200000],
      },
    ],
  };

  const defaultProps = {
    chartType: 'BAR',
    data: mockData,
    title: '季度采购统计',
    height: 300,
  };

  test('TC-COMP-030: 图表渲染', () => {
    render(<DataChart {...defaultProps} />);

    expect(screen.getByText('季度采购统计')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('TC-COMP-031: 图表类型切换', async () => {
    render(<DataChart {...defaultProps} supportTypes={['BAR', 'LINE', 'PIE']} />);

    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/图表类型/), 'LINE');

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('TC-COMP-032: 空数据状态', () => {
    render(<DataChart {...defaultProps} data={{ labels: [], datasets: [] }} />);

    expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
  });

});

describe('SearchBox 组件测试', () => {

  const mockOnSearch = jest.fn();
  const mockOnFilterChange = jest.fn();

  const defaultProps = {
    placeholder: '搜索采购计划',
    onSearch: mockOnSearch,
    onFilterChange: mockOnFilterChange,
    filters: [
      { key: 'planType', label: '计划类型', options: [{ value: 'YEAR', label: '年度' }, { value: 'QUARTER', label: '季度' }] },
      { key: 'status', label: '状态', options: [{ value: 'DRAFT', label: '草稿' }, { value: 'APPROVED', label: '已通过' }] },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-COMP-033: 搜索框渲染', () => {
    render(<SearchBox {...defaultProps} />);

    expect(screen.getByPlaceholderText('搜索采购计划')).toBeInTheDocument();
  });

  test('TC-COMP-034: 搜索功能', async () => {
    render(<SearchBox {...defaultProps} />);

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('搜索采购计划'), '办公设备');
    fireEvent.click(screen.getByRole('button', { name: /搜索/ }));

    expect(mockOnSearch).toHaveBeenCalledWith('办公设备');
  });

  test('TC-COMP-035: 筛选条件切换', async () => {
    render(<SearchBox {...defaultProps} />);

    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/计划类型/), 'YEAR');

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ planType: 'YEAR' }));
  });

  test('TC-COMP-036: 清空筛选', async () => {
    render(<SearchBox {...defaultProps} />);

    const user = userEvent.setup();

    // 先选择一个筛选条件
    await user.selectOptions(screen.getByLabelText(/计划类型/), 'YEAR');

    // 点击清空按钮
    fireEvent.click(screen.getByRole('button', { name: /清空/ }));

    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });

  test('TC-COMP-037: 回车键搜索', async () => {
    render(<SearchBox {...defaultProps} />);

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('搜索采购计划'), '测试计划{enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('测试计划');
  });

});

// 集成测试
describe('组件集成测试', () => {

  test('TC-COMP-038: 计划创建到需求提交流程', async () => {
    // 模拟完整流程: 创建计划 -> 创建需求 -> 提交
    const user = userEvent.setup();

    // 1. 创建计划
    const mockOnPlanSubmit = jest.fn();
    render(<PlanForm
      initialValues={{}}
      onSubmit={mockOnPlanSubmit}
      onCancel={jest.fn()}
      isLoading={false}
    />);

    await user.type(screen.getByLabelText(/计划名称/), '集成测试计划');
    fireEvent.click(screen.getByRole('button', { name: /提交/ }));

    await waitFor(() => {
      expect(mockOnPlanSubmit).toHaveBeenCalled();
    });
  });

  test('TC-COMP-039: 需求列表与详情联动', async () => {
    const mockDemands = [
      { demandId: 'DEMAND-001', demandName: '测试需求', status: 'PENDING_APPROVAL' },
    ];

    const mockOnView = jest.fn();

    render(<DemandList
      demands={mockDemands}
      loading={false}
      pagination={{ pageNum: 1, pageSize: 10, total: 1 }}
      onView={mockOnView}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /查看/ }));

    expect(mockOnView).toHaveBeenCalledWith('DEMAND-001');
  });

});

// 性能测试
describe('组件性能测试', () => {

  test('TC-COMP-040: 大数据量列表渲染性能', () => {
    const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
      demandId: `DEMAND-${i}`,
      demandName: `需求${i}`,
      status: 'PENDING_APPROVAL',
    }));

    const start = performance.now();

    render(<DemandList
      demands={largeDataSet}
      loading={false}
      pagination={{ pageNum: 1, pageSize: 10, total: 1000 }}
      onView={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />);

    const duration = performance.now() - start;

    // 渲染应该在500ms内完成
    expect(duration).toBeLessThan(500);
  });

});
