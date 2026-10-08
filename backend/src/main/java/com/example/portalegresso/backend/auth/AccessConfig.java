package com.example.portalegresso.backend.auth;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AccessConfig implements WebMvcConfigurer {
    private final AccessInterceptor access;
    @Override
    public void addInterceptors(InterceptorRegistry registry) { registry.addInterceptor(access); }
}
