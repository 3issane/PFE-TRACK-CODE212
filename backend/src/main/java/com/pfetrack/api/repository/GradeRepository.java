package com.pfetrack.api.repository;

import com.pfetrack.api.model.Grade;
import com.pfetrack.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    
    List<Grade> findByStudent(User student);
    
    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findByStudentAndSemester(User student, String semester);
    
    List<Grade> findByStudentAndAcademicYear(User student, String academicYear);
    
    List<Grade> findByStudentAndEvaluationType(User student, String evaluationType);
    
    List<Grade> findByStudentAndIsPublished(User student, Boolean isPublished);
    
    List<Grade> findByStudentAndIsPublishedOrderByEvaluationDateDesc(User student, Boolean isPublished);
    
    List<Grade> findByStudentAndSemesterAndIsPublishedOrderByEvaluationDateDesc(User student, String semester, Boolean isPublished);
    
    List<Grade> findByStudentAndAcademicYearAndIsPublishedOrderByEvaluationDateDesc(User student, String academicYear, Boolean isPublished);
    
    List<Grade> findByStudentOrderByEvaluationDateDesc(User student);
    
    List<Grade> findBySemesterOrderByEvaluationDateDesc(String semester);
    
    List<Grade> findBySubjectNameOrderByEvaluationDateDesc(String subjectName);
    
    List<Grade> findBySubjectCode(String subjectCode);
    
    List<Grade> findByProfessor(String professor);
    
    @Query("SELECT g FROM Grade g WHERE g.student = :student AND " +
           "(:semester IS NULL OR g.semester = :semester) AND " +
           "(:academicYear IS NULL OR g.academicYear = :academicYear) AND " +
           "(:evaluationType IS NULL OR g.evaluationType = :evaluationType) AND " +
           "(:isPublished IS NULL OR g.isPublished = :isPublished)")
    List<Grade> findGradesWithFilters(@Param("student") User student,
                                     @Param("semester") String semester,
                                     @Param("academicYear") String academicYear,
                                     @Param("evaluationType") String evaluationType,
                                     @Param("isPublished") Boolean isPublished);
    
    @Query("SELECT AVG(g.gradeValue) FROM Grade g WHERE g.student = :student AND g.isPublished = true")
    Double getAverageGradeByStudent(@Param("student") User student);
    
    @Query("SELECT AVG(g.gradeValue) FROM Grade g WHERE g.student = :student AND g.semester = :semester AND g.isPublished = true")
    Double getAverageGradeBySemester(@Param("student") User student, @Param("semester") String semester);
    
    @Query("SELECT SUM(g.credits) FROM Grade g WHERE g.student = :student AND g.gradeValue >= 10.0 AND g.isPublished = true")
    Integer getTotalCreditsEarned(@Param("student") User student);
    
    @Query("SELECT COUNT(g) FROM Grade g WHERE g.student = :student AND g.gradeValue >= 10.0 AND g.isPublished = true")
    Long getPassedSubjectsCount(@Param("student") User student);
    
    @Query("SELECT COUNT(g) FROM Grade g WHERE g.student = :student AND g.gradeValue < 10.0 AND g.isPublished = true")
    Long getFailedSubjectsCount(@Param("student") User student);
    
    @Query("SELECT g FROM Grade g WHERE g.student = :student AND g.evaluationDate BETWEEN :startDate AND :endDate")
    List<Grade> findByStudentAndDateRange(@Param("student") User student,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT g FROM Grade g WHERE g.student = :student AND g.isPublished = true ORDER BY g.evaluationDate DESC")
    List<Grade> findRecentGradesByStudent(@Param("student") User student);
    
    @Query("SELECT DISTINCT g.semester FROM Grade g WHERE g.student = :student ORDER BY g.semester")
    List<String> findSemestersByStudent(@Param("student") User student);
    
    @Query("SELECT DISTINCT g.academicYear FROM Grade g WHERE g.student = :student ORDER BY g.academicYear DESC")
    List<String> findAcademicYearsByStudent(@Param("student") User student);
    
    @Query("SELECT g FROM Grade g WHERE " +
           "g.subjectName LIKE %:keyword% OR " +
           "g.subjectCode LIKE %:keyword% OR " +
           "g.professor LIKE %:keyword%")
    List<Grade> searchGrades(@Param("keyword") String keyword);
    
    @Query("SELECT AVG(g.gradeValue) FROM Grade g WHERE g.student = :student AND g.isPublished = true")
    Double calculateGPAByStudent(@Param("student") User student);
}