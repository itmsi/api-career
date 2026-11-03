/**
 * Migration: kolom hasil penilaian AI di applicant_form_contents
 *
 * Diisi otomatis dari JSON di summary_update (lihat modules/applicant_form_contents/summary_score.js).
 * summary_score & summary_rating sudah ada (20261102000001).
 * - summary_answer_relevance: relevant, partially_relevant, off_topic
 * - summary_for_hr: ringkasan 3-4 kalimat untuk HR
 * - summary_assessment_focus: ["Communication", ...]
 * - summary_star: {situation, task, action, result} (boolean)
 * - summary_dimensions: [{name, score, confidence, evidence[], reasoning}]
 * - summary_strengths / summary_development_areas / summary_red_flags /
 *   summary_follow_up_questions: array teks
 */

exports.up = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.string("summary_answer_relevance", 30).nullable();
    table.text("summary_for_hr").nullable();
    table.jsonb("summary_assessment_focus").nullable();
    table.jsonb("summary_star").nullable();
    table.jsonb("summary_dimensions").nullable();
    table.jsonb("summary_strengths").nullable();
    table.jsonb("summary_development_areas").nullable();
    table.jsonb("summary_red_flags").nullable();
    table.jsonb("summary_follow_up_questions").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("applicant_form_contents", (table) => {
    table.dropColumn("summary_follow_up_questions");
    table.dropColumn("summary_red_flags");
    table.dropColumn("summary_development_areas");
    table.dropColumn("summary_strengths");
    table.dropColumn("summary_dimensions");
    table.dropColumn("summary_star");
    table.dropColumn("summary_assessment_focus");
    table.dropColumn("summary_for_hr");
    table.dropColumn("summary_answer_relevance");
  });
};
