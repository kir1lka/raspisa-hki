package ru.raspisa.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.raspisa.dto.GroupDto;
import ru.raspisa.dto.GroupRequest;
import ru.raspisa.entity.Group;
import ru.raspisa.entity.Shift;
import ru.raspisa.repository.GroupRepository;

import java.util.Comparator;
import java.util.List;

@Service
public class GroupService {

    private final GroupRepository repo;

    public GroupService(GroupRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<GroupDto> list() {
        return repo.findAll().stream()
                .sorted(Comparator.comparing(g -> g.getNumber() == null ? 0 : g.getNumber()))
                .map(GroupDto::from)
                .toList();
    }

    @Transactional
    public GroupDto create(GroupRequest req) {
        if (repo.findByNumber(req.number()) != null) {
            throw new IllegalArgumentException("Группа " + req.number() + " уже существует");
        }
        Group g = new Group();
        g.setNumber(req.number());
        g.setShift(parseShift(req.shift()));
        return GroupDto.from(repo.save(g));
    }

    @Transactional
    public GroupDto update(Long id, GroupRequest req) {
        Group g = repo.findById(id).orElseThrow();
        Group other = repo.findByNumber(req.number());
        if (other != null && !other.getId().equals(id)) {
            throw new IllegalArgumentException("Группа " + req.number() + " уже существует");
        }
        g.setNumber(req.number());
        g.setShift(parseShift(req.shift()));
        return GroupDto.from(repo.save(g));
    }

    @Transactional
    public void delete(Long id) {
        Group g = repo.findById(id).orElseThrow();
        if (g.getLessons() != null && !g.getLessons().isEmpty()) {
            throw new IllegalArgumentException(
                    "Нельзя удалить группу с занятиями (" + g.getLessons().size() + " шт.). Сначала уберите её занятия.");
        }
        repo.delete(g);
    }

    private Shift parseShift(String s) {
        try {
            return Shift.valueOf(s);
        } catch (Exception e) {
            return Shift.MORNING;
        }
    }
}
