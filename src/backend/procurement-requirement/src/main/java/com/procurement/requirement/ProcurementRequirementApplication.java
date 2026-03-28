package com.procurement.requirement;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.procurement")
@MapperScan("com.procurement.requirement.mapper")
public class ProcurementRequirementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementRequirementApplication.class, args);
    }
}
