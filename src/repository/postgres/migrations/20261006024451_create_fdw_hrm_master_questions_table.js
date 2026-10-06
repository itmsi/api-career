/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  ///
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  ///
};

/**
 CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER IF NOT EXISTS db_hrm_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'localhost', port '5432', dbname 'db_hrm');


CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
    SERVER db_hrm_server
    OPTIONS (user 'msiserver', password 'Rubysa179596!');


CREATE FOREIGN TABLE IF NOT EXISTS db_hrm_master_questions (
      id uuid,
      question_id text,
      question_en text,
      question_cn text,
      focus_assessment varchar(255),
      created_at timestamptz,
      created_by uuid,
      updated_at timestamptz,
      updated_by uuid,
      deleted_at timestamptz,
      deleted_by uuid
    )
    SERVER db_hrm_server
    OPTIONS (schema_name 'public', table_name 'master_questions');
 */
