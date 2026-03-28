package com.procurement.document;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.procurement")
@MapperScan("com.procurement.document.mapper")
public class ProcurementDocumentApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementDocumentApplication.class, args);
    }
}
