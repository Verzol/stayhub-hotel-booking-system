package com.verzol.stayhub.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().toUri().toString();
        if (!path.endsWith("/")) {
            path += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(path)
                .setCachePeriod(31536000) // 1 year in seconds
                .resourceChain(true);
    }
}
