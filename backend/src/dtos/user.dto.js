/**
 * USER DTO
 * --------
 * Sanitizes user data before sending to client
 * Removes sensitive fields like password
 */

class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  // Convert single user
  static toDTO(user) {
    if (!user) return null;
    return new UserDTO(user);
  }

  // Convert array of users
  static toDTOArray(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => new UserDTO(user));
  }

  // For auth responses (includes token)
  static toAuthDTO(user, token) {
    return {
      user: new UserDTO(user),
      token
    };
  }
}

module.exports = UserDTO;
