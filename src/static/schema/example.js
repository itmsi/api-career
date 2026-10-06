/**
 * Swagger Schema Definitions for Example Module
 */

const exampleSchemas = {
  Example: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: 'Name of the example',
        example: 'Example Item 1'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Description of the example',
        example: 'This is an example description'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        description: 'Status of the example',
        example: 'active'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-01T00:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-01T00:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      }
    }
  },
  ExampleInput: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        description: 'Name of the example',
        example: 'Example Item 1'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Description of the example',
        example: 'This is an example description'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        description: 'Status of the example',
        example: 'active'
      }
    }
  }
};

module.exports = exampleSchemas;

