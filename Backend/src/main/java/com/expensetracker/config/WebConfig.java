package com.expensetracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web configuration for serving static resources and CORS.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to Frontend folder
        String frontendPath = Paths.get("").toAbsolutePath().getParent().resolve("Frontend").toUri().toString();
        
        // Serve static files from Frontend folder
        registry.addResourceHandler("/**")
                .addResourceLocations(frontendPath, "classpath:/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect root to index.html
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Get allowed origins from environment variable or use default
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        String[] allowedOrigins;
        
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            // Production: Use specific origins from environment
            allowedOrigins = allowedOriginsEnv.split(",");
            System.out.println("🔒 CORS enabled for: " + allowedOriginsEnv);
        } else {
            // Local development: Allow all origins
            allowedOrigins = new String[]{"*"};
            System.out.println("⚠️  CORS enabled for all origins (Development mode)");
        }
        
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(allowedOriginsEnv != null)  // Only if specific origins
                .maxAge(3600);
    }
}
