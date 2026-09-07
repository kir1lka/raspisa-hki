package ru.raspisa.entity;

import jakarta.persistence.*;

@Entity
public class MapAudio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    // Hibernate maps byte[] to bytea on PostgreSQL and varbinary on H2.
    @Column(length = 20971520, nullable = false)
    public byte[] content;
}
