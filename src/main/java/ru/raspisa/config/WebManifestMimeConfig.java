package ru.raspisa.config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.server.servlet.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Отдаём manifest.webmanifest с правильным типом содержимого.
 *
 * Расширения .webmanifest нет в таблице типов ни у Tomcat, ни у Spring,
 * поэтому файл уходил как application/octet-stream. Браузеры такой манифест
 * всё же разбирают, но в консоли ругаются, а часть инструментов проверки PWA
 * считает его отсутствующим.
 *
 * Настраиваем через общий ConfigurableServletWebServerFactory, а не через
 * тип конкретного сервера: так конфигурация не сломается, если встроенный
 * Tomcat когда-нибудь заменят.
 */
@Configuration
public class WebManifestMimeConfig {

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> webManifestMimeCustomizer() {
        return factory -> {
            MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
            mappings.add("webmanifest", "application/manifest+json");
            factory.setMimeMappings(mappings);
        };
    }
}
