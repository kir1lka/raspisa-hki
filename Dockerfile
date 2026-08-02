# ---- Этап 1: сборка (нужны JDK + Node, т.к. Gradle сам собирает React) ----
FROM node:20-bookworm AS build
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
# bootJar кладёт в build/libs единственный jar, имя которого зависит от version
# из build.gradle.kts. Сразу переименовываем его в app.jar, чтобы второй этап
# не приходилось править при смене версии проекта.
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test \
    && mv build/libs/*.jar app.jar

# ---- Этап 2: запуск (только JRE + готовый jar — лёгкий образ) ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
