package com.pfetrack.backendpfe.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDate(LocalDate date);
    List<Schedule> findByType(ScheduleType type);
    List<Schedule> findByStudentTopic_Id(Long studentTopicId);
}
