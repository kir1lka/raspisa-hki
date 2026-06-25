plugins {
    // Плагин Java: добавляет компиляцию, задачи build/test/jar
    java
    // Плагин Spring Boot: добавляет bootRun (запуск сервера) и сборку исполняемого jar
    id("org.springframework.boot") version "4.0.6"
    // Управляет версиями spring-зависимостей за нас (можно не указывать версии у starter'ов)
    id("io.spring.dependency-management") version "1.1.7"
    // JaCoCo: отчёт о покрытии кода тестами
    jacoco
}


group = "ru.raspisa"
version = "0.0.1-SNAPSHOT"


java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

// Откуда качать библиотеки — центральный репозиторий Maven
repositories {
    mavenCentral()
}

dependencies {
    // "starter-web" — всё для REST/веб: Spring MVC + встроенный Tomcat + JSON (Jackson)
    implementation("org.springframework.boot:spring-boot-starter-web")
    // "starter-data-jpa" — JPA + Hibernate + Spring Data (работа с БД через объекты)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    // "starter-validation" — проверка входных данных (@NotNull, @Min и т.п.)
    implementation("org.springframework.boot:spring-boot-starter-validation")
    // spring-security-crypto — ТОЛЬКО кодировщик паролей (BCrypt), без полного
    // Spring Security: не закрывает /api/* и не включает дефолтную форму логина.
    // Версией управляет Spring Boot BOM, поэтому номер не указываем.
    implementation("org.springframework.security:spring-security-crypto")
    // web-push — отправка Web Push уведомлений (VAPID). Версией не управляет
    // Boot BOM — указываем явно.
    implementation("nl.martijndwars:web-push:5.1.1")
    // BouncyCastle — криптопровайдер, нужен web-push (транзитивно НЕ подтягивается).
    implementation("org.bouncycastle:bcprov-jdk18on:1.78.1")
    implementation("org.bouncycastle:bcpkix-jdk18on:1.78.1")
    // H2 — лёгкая файловая база данных (локальная разработка).
    runtimeOnly("com.h2database:h2")
    // PostgreSQL — «боевая» БД (в Docker/на сервере). Драйвер выбирается по URL.
    runtimeOnly("org.postgresql:postgresql")
    // spring-dotenv — подгружает файл .env в настройки Spring (Boot сам .env не читает).
    // BOM задаёт версию, springboot4-dotenv — модуль под Spring Boot 4.
    implementation(platform("me.paulschwarz:spring-dotenv-bom:5.1.0"))
    implementation("me.paulschwarz:springboot4-dotenv")
    // Инструменты для тестов (JUnit 5, Mockito, MockMvc)
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}


jacoco {
    toolVersion = "0.8.12"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
    // После тестов автоматически строим отчёт о покрытии
    finalizedBy(tasks.named("jacocoTestReport"))
}

tasks.named<JacocoReport>("jacocoTestReport") {
    dependsOn(tasks.named("test"))
    reports {
        xml.required.set(false)
        csv.required.set(false)
        html.required.set(true)
        // HTML-отчёт: build/reports/jacoco/index.html
        html.outputLocation.set(layout.buildDirectory.dir("reports/jacoco"))
    }
}

// --- Сборка фронтенда (React) и упаковка внутрь jar (Модуль 9) ---
val npmCommand = if (System.getProperty("os.name").lowercase().contains("win")) "npm.cmd" else "npm"
val frontendDir = layout.projectDirectory.dir("frontend")

// npm install — ставит зависимости (не стирает node_modules, поэтому не конфликтует
// с запущенным dev-сервером; на чистом сервере тоже корректно установит всё)
val npmInstall by tasks.registering(Exec::class) {
    workingDir = frontendDir.asFile
    commandLine(npmCommand, "install")
    inputs.file(frontendDir.file("package-lock.json"))
    outputs.dir(frontendDir.dir("node_modules"))
}

// npm run build — собирает React в frontend/dist
val npmBuild by tasks.registering(Exec::class) {
    dependsOn(npmInstall)
    workingDir = frontendDir.asFile
    commandLine(npmCommand, "run", "build")
    inputs.dir(frontendDir.dir("src"))
    inputs.file(frontendDir.file("package.json"))
    inputs.file(frontendDir.file("vite.config.js"))
    inputs.file(frontendDir.file("index.html"))
    outputs.dir(frontendDir.dir("dist"))
}

// Кладём собранный фронт в ресурсы бэкенда → попадёт в static/ внутри jar
tasks.processResources {
    dependsOn(npmBuild)
    from(frontendDir.dir("dist")) {
        into("static")
    }
}
