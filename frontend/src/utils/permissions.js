/**
 * SAHAYOG — Role-Based Access Control (RBAC) Permission Utilities.
 * 
 * Evaluates authenticated user permissions based on canonical backend roles:
 *   - SUPER_ADMIN
 *   - STATE_OPERATOR
 *   - AGENCY_ADMIN
 *   - AGENCY_STAFF
 * 
 * Uses user.agency_id for agency ownership scoping.
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STATE_OPERATOR: 'STATE_OPERATOR',
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  AGENCY_STAFF: 'AGENCY_STAFF',
};

/**
 * Check if user can authorize allocation proposals.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canAuthorizeAllocation = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.SUPER_ADMIN || user.role === ROLES.STATE_OPERATOR;
};

/**
 * Check if user can reject allocation proposals.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canRejectAllocation = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.SUPER_ADMIN || user.role === ROLES.STATE_OPERATOR;
};

/**
 * Check if user can view audit log operational trail.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canViewAuditLogs = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.SUPER_ADMIN || user.role === ROLES.STATE_OPERATOR;
};

/**
 * Check if user can create new resource inventory.
 * Allowed: All authenticated roles (agency staff create under their own agency)
 */
export const canCreateResource = (user) => {
  return !!user && !!user.role;
};

/**
 * Check if user can edit/update a specific resource.
 * Allowed:
 *   - SUPER_ADMIN & STATE_OPERATOR (all resources)
 *   - AGENCY_ADMIN & AGENCY_STAFF (only resources matching user.agency_id)
 */
export const canEditResource = (user, resource) => {
  if (!user || !user.role || !resource) return false;
  
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.STATE_OPERATOR) {
    return true;
  }
  
  if (user.role === ROLES.AGENCY_ADMIN || user.role === ROLES.AGENCY_STAFF) {
    if (!user.agency_id || !resource.agency_id) return false;
    return String(user.agency_id) === String(resource.agency_id);
  }
  
  return false;
};

/**
 * Get human-readable formatted role display string.
 */
export const getRoleDisplayName = (user) => {
  if (!user || !user.role) return 'USER';
  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return 'SUPER ADMIN';
    case ROLES.STATE_OPERATOR:
      return 'STATE OPERATOR';
    case ROLES.AGENCY_ADMIN:
      return 'AGENCY ADMIN';
    case ROLES.AGENCY_STAFF:
      return 'AGENCY STAFF';
    default:
      return user.role || 'USER';
  }
};
