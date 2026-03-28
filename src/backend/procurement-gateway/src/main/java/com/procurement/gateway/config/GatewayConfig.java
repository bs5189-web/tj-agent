package com.procurement.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("system-service", r -> r.path("/api/system/**")
                        .uri("http://localhost:8081"))
                .route("plan-service", r -> r.path("/api/plan/**")
                        .uri("http://localhost:8082"))
                .route("requirement-service", r -> r.path("/api/requirement/**")
                        .uri("http://localhost:8083"))
                .route("document-service", r -> r.path("/api/document/**")
                        .uri("http://localhost:8084"))
                .route("review-service", r -> r.path("/api/review/**")
                        .uri("http://localhost:8085"))
                .route("contract-service", r -> r.path("/api/contract/**")
                        .uri("http://localhost:8086"))
                .build();
    }
}
