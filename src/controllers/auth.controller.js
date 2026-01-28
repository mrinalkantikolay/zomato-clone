const authService = require("../services/auth.service");
const UserDTO = require("../dtos/user.dto");
const asyncHandler = require("../utils/asyncHandler");

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  // Use DTO to sanitize response
  const response = UserDTO.toAuthDTO(result.user, result.token);

  res.status(201).json({
    success: true,
    message: "Signup successful",
    data: response,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  // Use DTO to sanitize response
  const response = UserDTO.toAuthDTO(result.user, result.token);

  res.status(200).json({
    success: true,
    message: "Login successfull",
    data: response,
  });
});

module.exports = {
  signup,
  login,
};