import { hashPassword } from "@/lib/password.js";
import type { UserRole } from "@/db/schema/users.js";
import { insertUser } from "@/modules/auth/repository.js";

type UserSeed = {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
};

/** Creates a user directly in the test database (bypasses the API on purpose). */
export async function seedUser(seed: UserSeed) {
  const passwordHash = await hashPassword(seed.password);
  const [user] = await insertUser({
    email: seed.email,
    passwordHash,
    name: seed.name ?? "Seeded User",
    role: seed.role ?? "customer",
    isActive: seed.isActive ?? true,
  });
  if (!user) throw new Error("could not seed user");
  return user;
}
