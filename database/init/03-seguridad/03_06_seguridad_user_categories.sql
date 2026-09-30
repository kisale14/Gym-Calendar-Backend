CREATE TABLE IF NOT EXISTS seguridad.user_categories (
    user_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id),
    CONSTRAINT fk_user_categories_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_categories_category_id
        FOREIGN KEY (category_id) REFERENCES shared.categories(id) ON DELETE RESTRICT
);