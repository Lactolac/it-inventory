const fetch = require('node-fetch');
const { generateToken } = require('../middleware/auth');
const { UnauthorizedError } = require('../middleware/errorHandler');

const EXTERNAL_AUTH_URL = process.env.EXTERNAL_AUTH_URL;

class AuthController {
  // External authentication - proxy to AD auth service
  static async login(req, res, next) {
    try {
      const { username, password, country } = req.body;

      if (!username || !password) {
        throw new UnauthorizedError('Usuario y contraseña son requeridos');
      }

      console.log(`Attempting login for user: ${username}`);

      // Call external AD auth service
      const response = await fetch(EXTERNAL_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password,
          country: country || 'sv' // Default to El Salvador
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Auth service error:', responseData);
        throw new UnauthorizedError(responseData.message || responseData.error || 'Credenciales inválidas');
      }

      console.log('Auth service response:', responseData);

      // Extract user data from AD response
      const userData = responseData.user_data || {};
      const groups = responseData.groups || [];

      // Generate JWT token with user data from AD
      const token = generateToken({
        id: userData.Username || username,
        username: username,
        nombre: `${userData.Nombre || ''} ${userData.Apellido || ''}`.trim(),
        correo: userData.Email || '',
        departamento: userData.Departamento || '',
        groups: groups,
        rol: groups.includes('AdminInv') || groups.includes('it') ? 'admin' : 'user'
      });

      res.json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          token,
          user: {
            id: userData.Username || username,
            username: username,
            nombre: `${userData.Nombre || ''} ${userData.Apellido || ''}`.trim(),
            correo: userData.Email || '',
            departamento: userData.Departamento || '',
            groups: groups,
            rol: groups.includes('AdminInv') || groups.includes('it') ? 'admin' : 'user'
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }

  // Verify token validity
  static async verify(req, res, next) {
    try {
      // If we reach here, the token is valid (authenticate middleware passed)
      res.json({
        success: true,
        message: 'Token válido',
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
