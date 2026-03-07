import type { User } from "../generated/prisma/client.js";

export function sanitizeUser(user: User) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
