export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Fixify API',
    version: '1.0.0',
    description: 'Maintenance Request System (ระบบแจ้งซ่อม) API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register new requester',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        responses: {
          200: { description: 'Current user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users': {
      get: {
        summary: 'List users (Admin only)',
        tags: ['Users'],
        responses: { 200: { description: 'List of users' } },
      },
      post: {
        summary: 'Create user (Admin only)',
        tags: ['Users'],
        responses: { 201: { description: 'User created' } },
      },
    },
    '/users/my-technicians': {
      get: {
        summary: 'Get technicians under logged-in manager',
        tags: ['Users'],
        responses: { 200: { description: 'List of technicians' } },
      },
    },
    '/locations': {
      get: { summary: 'Get all locations', tags: ['Locations'], responses: { 200: { description: 'List of locations' } } },
      post: { summary: 'Create location (Admin)', tags: ['Locations'], responses: { 201: { description: 'Location created' } } },
    },
    '/categories': {
      get: { summary: 'Get all categories', tags: ['Categories'], responses: { 200: { description: 'List of categories' } } },
      post: { summary: 'Create category (Admin)', tags: ['Categories'], responses: { 201: { description: 'Category created' } } },
    },
    '/assets': {
      get: { summary: 'Get all assets', tags: ['Assets'], responses: { 200: { description: 'List of assets' } } },
      post: { summary: 'Create asset (Admin)', tags: ['Assets'], responses: { 201: { description: 'Asset created' } } },
    },
    '/requests': {
      get: { summary: 'Get requests with scoping and filters', tags: ['Requests'], responses: { 200: { description: 'Filtered requests' } } },
      post: { summary: 'Create a maintenance request', tags: ['Requests'], responses: { 201: { description: 'Request created' } } },
    },
    '/requests/{id}': {
      get: { summary: 'Get request detail', tags: ['Requests'], responses: { 200: { description: 'Request detail' } } },
    },
    '/requests/{id}/accept': {
      post: { summary: 'Manager accepts request', tags: ['Requests Actions'], responses: { 200: { description: 'Accepted' } } },
    },
    '/requests/{id}/reject': {
      post: { summary: 'Manager rejects request', tags: ['Requests Actions'], responses: { 200: { description: 'Rejected' } } },
    },
    '/requests/{id}/assign': {
      post: { summary: 'Manager assigns technician', tags: ['Requests Actions'], responses: { 200: { description: 'Assigned' } } },
    },
    '/requests/{id}/start': {
      post: { summary: 'Technician starts request', tags: ['Requests Actions'], responses: { 200: { description: 'In Progress' } } },
    },
    '/requests/{id}/wait-parts': {
      post: { summary: 'Technician waits for parts', tags: ['Requests Actions'], responses: { 200: { description: 'Waiting parts' } } },
    },
    '/requests/{id}/resume': {
      post: { summary: 'Technician resumes work', tags: ['Requests Actions'], responses: { 200: { description: 'In Progress' } } },
    },
    '/requests/{id}/complete': {
      post: { summary: 'Technician completes work', tags: ['Requests Actions'], responses: { 200: { description: 'Completed' } } },
    },
    '/requests/{id}/close': {
      post: { summary: 'Requester closes and confirms work', tags: ['Requests Actions'], responses: { 200: { description: 'Closed' } } },
    },
    '/requests/{id}/reopen': {
      post: { summary: 'Requester reopens request', tags: ['Requests Actions'], responses: { 200: { description: 'Reopened' } } },
    },
    '/requests/{id}/cancel': {
      post: { summary: 'Requester cancels pending request', tags: ['Requests Actions'], responses: { 200: { description: 'Cancelled' } } },
    },
    '/requests/{id}/logs': {
      get: { summary: 'Get request timeline logs', tags: ['Logs'], responses: { 200: { description: 'Logs' } } },
    },
    '/dashboard/summary': {
      get: { summary: 'Get dashboard statistics summary', tags: ['Dashboard'], responses: { 200: { description: 'Summary stats' } } },
    },
  },
};
