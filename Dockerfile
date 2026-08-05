# ---- Готовый Gradle нужной версии ----
# Берём его из образа, а не качаем через ./gradlew: wrapper тянет дистрибутив
# с services.gradle.org, и если сервер до этого адреса не достучится, сборка
# падает с «Connection timed out». Версия та же, что в gradle-wrapper.properties.
FROM gradle:8.14.5-jdk17 AS gradle

# ---- Этап 1: сборка (нужны JDK + Node, т.к. Gradle сам собирает React) ----
# slim-вариант вместо полного: тот же Node, но образ меньше почти на гигабайт —
# на VPS с небольшим диском сборка иначе падает с «No space left on device».
FROM node:20-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*
COPY --from=gradle /opt/gradle /opt/gradle
ENV PATH="/opt/gradle/bin:${PATH}"
WORKDIR /app
COPY . .
# bootJar кладёт в build/libs единственный jar, имя которого зависит от version
# из build.gradle.kts. Сразу переименовываем его в app.jar, чтобы второй этап
# не приходилось править при смене версии проекта.
# Кеши Gradle/npm и node_modules чистим в ТОМ ЖЕ слое — иначе они остались бы
# в истории образа и занимали место на диске даже после сборки.
RUN gradle bootJar --no-daemon -x test \
    && mv build/libs/*.jar app.jar \
    && rm -rf /root/.gradle /root/.npm frontend/node_modules build

# ---- Этап 2: запуск (только JRE + готовый jar — лёгкий образ) ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
