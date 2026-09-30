CREATE TABLE IF NOT EXISTS scheduling.lessons_categories (
    lesson_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lesson_id, category_id),
    CONSTRAINT fk_lessons_categories_lesson_id
        FOREIGN KEY (lesson_id) REFERENCES scheduling.lessons(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lessons_categories_category_id
        FOREIGN KEY (category_id) REFERENCES shared.categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lessons_categories_category_id
    ON scheduling.lessons_categories (category_id);

CREATE INDEX IF NOT EXISTS idx_lessons_categories_lesson_id
    ON scheduling.lessons_categories (lesson_id);