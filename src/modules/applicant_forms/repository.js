const db = require('../../config/database');

const TABLE_NAME = 'applicant_forms';

/**
 * Repository Layer - Database Operations
 *
 * Layer ini menangani semua operasi database.
 * Tidak ada business logic di sini, hanya CRUD operations.
 */

/**
 * Find all items with pagination
 */
const findAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const data = await db(TABLE_NAME)
    .select('*')
    .where({ is_delete: false })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  const total = await db(TABLE_NAME)
    .where({ is_delete: false })
    .count('id as count')
    .first();

  return {
    items: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total.count),
      totalPages: Math.ceil(total.count / limit)
    }
  };
};

/**
 * Find single item by ID
 */
const findById = async (id) => {
  return await db(TABLE_NAME)
    .where({ id, is_delete: false })
    .first();
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  return await db(TABLE_NAME)
    .where({ ...conditions, is_delete: false })
    .first();
};

/**
 * Create new item
 */
const create = async (data) => {
  const [result] = await db(TABLE_NAME)
    .insert({
      ...data,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    })
    .returning('*');
  return result;
};

/**
 * Update existing item
 */
const update = async (id, data) => {
  const [result] = await db(TABLE_NAME)
    .where({ id, is_delete: false })
    .update({
      ...data,
      updated_at: db.fn.now()
    })
    .returning('*');
  return result;
};

/**
 * Soft delete item
 */
const remove = async (id, deletedBy = null) => {
  const [result] = await db(TABLE_NAME)
    .where({ id, is_delete: false })
    .update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy,
      is_delete: true
    })
    .returning('*');
  return result;
};

/**
 * Restore soft deleted item
 */
const restore = async (id) => {
  const [result] = await db(TABLE_NAME)
    .where({ id })
    .where({ is_delete: true })
    .update({
      deleted_at: null,
      deleted_by: null,
      is_delete: false,
      updated_at: db.fn.now()
    })
    .returning('*');
  return result;
};

/**
 * Hard delete item (permanent)
 */
const hardDelete = async (id) => {
  return await db(TABLE_NAME)
    .where({ id })
    .del();
};

module.exports = {
  findAll,
  findById,
  findOne,
  create,
  update,
  remove,
  restore,
  hardDelete
};
