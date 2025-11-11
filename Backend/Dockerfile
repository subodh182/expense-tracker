# Multi-stage build for Spring Boot with Maven
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

    # Copy pom.xml and download dependencies (cached layer)
    COPY Backend/pom.xml .
    # Download dependencies with retry logic for network resilience
    RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:resolve -B

    # Copy source code
    COPY Backend/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage - Use Debian-based image for glibc compatibility with Firebase/gRPC native libraries
FROM eclipse-temurin:17-jre

# Set working directory
WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/expense-tracker-*.jar app.jar

# Expose port (Railway will override with $PORT)
EXPOSE 8080

# Set environment for production
ENV SPRING_PROFILES_ACTIVE=production

# Run the application with Railway's PORT
# Use shell form to allow environment variable expansion
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
