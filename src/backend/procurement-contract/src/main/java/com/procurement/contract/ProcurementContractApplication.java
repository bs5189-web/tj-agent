package com.procurement.contract;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.procurement")
@MapperScan("com.procurement.contract.mapper")
public class ProcurementContractApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementContractApplication.class, args);
    }
}
