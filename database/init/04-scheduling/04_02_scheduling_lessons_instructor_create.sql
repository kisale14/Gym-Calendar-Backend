CREATE TABLE IF NOT EXISTS scheduling.lessons_instructors (
    lesson_id UUID NOT NULL,
    instructor_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lesson_id, instructor_id),
    CONSTRAINT fk_lessons_instructors_lesson_id
        FOREIGN KEY (lesson_id) REFERENCES scheduling.lessons(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lessons_instructors_instructor_id
        FOREIGN KEY (instructor_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lessons_instructors_instructor_id
    ON scheduling.lessons_instructors (instructor_id);

CREATE INDEX IF NOT EXISTS idx_lessons_instructors_lesson_id
    ON scheduling.lessons_instructors (lesson_id);