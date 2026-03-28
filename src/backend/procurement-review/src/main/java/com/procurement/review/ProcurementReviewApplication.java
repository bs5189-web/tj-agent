package com.procurement.review;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.procurement")
@MapperScan("com.procurement.review.mapper")
public class ProcurementReviewApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementReviewApplication.class, args);
    }
}
