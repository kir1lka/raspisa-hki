package ru.raspisa.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.raspisa.entity.Lesson;
import ru.raspisa.repository.LessonRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Напоминание о мероприятиях в день их проведения.
 * <p>
 * При создании мероприятия push уходит сразу (см. {@link LessonService#create}),
 * но между созданием и самим событием могут пройти недели. Этот сервис раз в сутки
 * находит мероприятия, назначенные на сегодня, и рассылает по ним второе уведомление.
 */
@Service
public class EventReminderService {

    private static final Logger log = LoggerFactory.getLogger(EventReminderService.class);

    private static final DateTimeFormatter PUSH_TIME = DateTimeFormatter.ofPattern("HH:mm");

    /** Ограничение на длину текста уведомления — иначе телефон обрежет его сам, посередине слова. */
    private static final int MAX_BODY_LENGTH = 120;

    private final LessonRepository lessonRepository;
    private final PushService pushService;
    private final ZoneId zone;

    // Часовой пояс школы. Тот же самый указан в zone у @Scheduled ниже: иначе в контейнере
    // (там время обычно UTC) задача сработает не в тот час и посчитает «сегодня» другим днём.
    public EventReminderService(LessonRepository lessonRepository,
                                PushService pushService,
                                @Value("${push.reminder.zone:Europe/Moscow}") String zone) {
        this.lessonRepository = lessonRepository;
        this.pushService = pushService;
        this.zone = ZoneId.of(zone);
    }

    /**
     * Запускается каждый день в час, заданный push.reminder.cron (по умолчанию 08:00 по школьному времени).
     */
    @Scheduled(cron = "${push.reminder.cron:0 0 8 * * *}", zone = "${push.reminder.zone:Europe/Moscow}")
    @Transactional(readOnly = true)
    public void remindAboutTodayEvents() {
        if (!pushService.isEnabled()) {
            log.debug("Напоминание о мероприятиях пропущено: push отключён (нет VAPID-ключей).");
            return;
        }

        LocalDate today = LocalDate.now(zone);
        List<Lesson> events = lessonRepository.findBySpecialTrueAndDate(today);
        if (events.isEmpty()) {
            log.debug("На {} мероприятий нет — напоминание не отправляем.", today);
            return;
        }

        for (Lesson event : events) {
            pushService.sendToAll("📣 Сегодня: " + title(event), reminderBody(event), "/");
        }
        log.info("Отправлено напоминаний о мероприятиях на {}: {}", today, events.size());
    }

    private static String title(Lesson event) {
        String title = event.getTitle();
        return (title != null && !title.isBlank()) ? title : "мероприятие";
    }

    private static String reminderBody(Lesson event) {
        StringBuilder sb = new StringBuilder();
        if (event.getTime() != null) {
            sb.append("Начало в ").append(event.getTime().format(PUSH_TIME));
        }

        String description = event.getDescription();
        if (description != null && !description.isBlank()) {
            // Описание хранится как HTML из редактора — для уведомления оставляем чистый текст.
            String text = description.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
            if (!text.isEmpty()) {
                if (sb.length() > 0) sb.append(" – ");
                sb.append(text);
            }
        }
        if (sb.length() == 0) {
            sb.append("Мероприятие сегодня");
        }

        String result = sb.toString();
        // Многоточие занимает один символ, поэтому обрезаем на один раньше лимита.
        return result.length() > MAX_BODY_LENGTH
                ? result.substring(0, MAX_BODY_LENGTH - 1) + "…"
                : result;
    }
}
