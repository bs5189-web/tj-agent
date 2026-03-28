package com.procurement.contract.controller;

import com.procurement.common.utils.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "履约管理")
@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Operation(summary = "履约节点列表")
    @GetMapping("/node/list")
    public Result<Object> nodeList(@RequestParam Long contractId) {
        return Result.success(null);
    }

    @Operation(summary = "更新履约节点")
    @PostMapping("/node/update")
    public Result<Boolean> updateNode(@RequestBody Object params) {
        return Result.success(true);
    }

    @Operation(summary = "履约监控看板")
    @GetMapping("/monitor")
    public Result<Object> monitor() {
        return Result.success(null);
    }

    @Operation(summary = "报警信息")
    @GetMapping("/alarm")
    public Result<Object> alarm() {
        return Result.success(null);
    }

    @Operation(summary = "记录履约")
    @PostMapping("/record")
    public Result<Boolean> record(@RequestBody Object params) {
        return Result.success(true);
    }
}
