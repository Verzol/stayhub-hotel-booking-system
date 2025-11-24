package com.verzol.stayhub.config;

import java.sql.Connection;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TestDbConnection { 

    @Bean
    public CommandLineRunner checkConnection(DataSource dataSource) {
        return args -> {
            System.out.println("------------------------------------------------");
            System.out.println("🔄 [StayHub] TESTING DATABASE CONNECTION...");
            try (Connection conn = dataSource.getConnection()) {
                // Thử chạy câu lệnh query nhẹ nhất
                boolean isValid = conn.isValid(2); 
                
                if (isValid) {
                    System.out.println("✅ [SUCCESS] Connected to Remote DB: " + conn.getMetaData().getURL());
                    System.out.println("👤 User: " + conn.getMetaData().getUserName());
                } else {
                    System.err.println("❌ [FAILED] Connection established but invalid!");
                }
            } catch (Exception e) {
                System.err.println("❌ [ERROR] Could not connect to database!");
                System.err.println("Reason: " + e.getMessage());
            }
            System.out.println("------------------------------------------------");
        };
    }
}