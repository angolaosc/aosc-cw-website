import { TablesUpdate } from "@/infrastructure/api/types";

/**
 * User role data for updating an existing role assignment
 */
export type UserRoleUpdate = TablesUpdate<"user_roles">;
