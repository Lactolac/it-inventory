const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT Inventory Management API',
      version: '1.0.0',
      description: 'API para gestión de inventario de TI, licencias, usuarios, departamentos y puestos',
      contact: {
        name: 'IT Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Departamento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Departamento de TI' },
            total_usuarios: { type: 'integer', example: 10 },
            total_licencias: { type: 'integer', example: 5 },
            total_puestos: { type: 'integer', example: 3 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Puesto: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Desarrollador' },
            iddepartamento: { type: 'integer', example: 1 },
            departamento_nombre: { type: 'string', example: 'Departamento de TI' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Juan Pérez' },
            area: { type: 'string', example: 'Tecnología' },
            correo: { type: 'string', format: 'email', example: 'juan.perez@empresa.com' },
            idinventario: { type: 'integer', nullable: true },
            idlicencia: { type: 'integer', nullable: true },
            iddepartamento: { type: 'integer', nullable: true },
            idpuesto: { type: 'integer', nullable: true },
            departamento_nombre: { type: 'string', nullable: true },
            puesto_nombre: { type: 'string', nullable: true }
          }
        },
        Licencia: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Microsoft Office 365' },
            fexpiraciones: { type: 'string', format: 'date', example: '2025-12-31' },
            fcompra: { type: 'string', format: 'date', example: '2024-01-01' },
            cantidad: { type: 'integer', example: 50 },
            iddepartamento: { type: 'integer', nullable: true },
            departamento_nombre: { type: 'string', nullable: true }
          }
        },
        Inventario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nserie: { type: 'string', example: 'SN-123456' },
            marca: { type: 'string', example: 'Dell' },
            modelo: { type: 'string', example: 'Latitude 5520' },
            nactivofijo: { type: 'string', example: 'AF-001' },
            cantidad: { type: 'integer', example: 1 },
            fechaingreso: { type: 'string', format: 'date', example: '2024-01-15' },
            fechaentrega: { type: 'string', format: 'date', nullable: true },
            fotoid: { type: 'string', description: 'Photo identifier', nullable: true },
            fecha_revision: { type: 'string', format: 'date', nullable: true },
            tipo_dispositivo: { type: 'string', example: 'Laptop' },
            id_usuario_registro: { type: 'integer', nullable: true },
            idauditoria: { type: 'integer', nullable: true },
            idusuario_asignado: { type: 'integer', nullable: true }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticación' },
      { name: 'Inventario', description: 'Gestión de inventario' },
      { name: 'Licencias', description: 'Gestión de licencias' },
      { name: 'Departamentos', description: 'Gestión de departamentos' },
      { name: 'Puestos', description: 'Gestión de puestos' },
      { name: 'Usuarios', description: 'Gestión de usuarios' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
