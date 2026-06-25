# ---- Этап 1: сборка (нужны JDK + Node, т.к. Gradle сам собирает React) ----
FROM node:20-bookworm AS build
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# ---- Этап 2: запуск (только JRE + готовый jar — лёгкий образ) ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/RaspisaHKI-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
