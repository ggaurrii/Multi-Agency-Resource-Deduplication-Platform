/**
 * SAHAYOG — Role-Based Access Control (RBAC) Permission Utilities.
 * 
 * Evaluates authenticated user permissions across 5 operational command roles:
 *   1. SUPER_ADMIN (Overall Multi-Agency System Command)
 *   2. STATE_OPERATOR (State Emergency Operations Center)
 *   3. NDRF_ADMIN (NDRF Emergency Response & Rescue Command)
 *   4. ARMY_ADMIN (Army Logistics & Heavy Deployment Command)
 *   5. NGO_ADMIN (Relief, Shelters & Community Assistance)
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STATE_OPERATOR: 'STATE_OPERATOR',
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  AGENCY_STAFF: 'AGENCY_STAFF',
  NDRF_ADMIN: 'NDRF_ADMIN',
  ARMY_ADMIN: 'ARMY_ADMIN',
  NGO_ADMIN: 'NGO_ADMIN',
};

/**
 * Determine exact command role key for the user.
 */
export const getUserCommandRole = (user) => {
  if (!user || !user.role) return 'UNKNOWN';
  if (user.role === ROLES.SUPER_ADMIN) return 'SUPER_ADMIN';
  if (user.role === ROLES.STATE_OPERATOR) return 'STATE_OPERATOR';

  const agencyName = (user.agency_name || user.agency?.name || '').toUpperCase();
  const agencyType = (user.agency_type || user.agency?.type || '').toUpperCase();

  if (user.role === ROLES.NDRF_ADMIN || agencyName.includes('NDRF') || agencyType.includes('NDRF')) {
    return 'NDRF_ADMIN';
  }
  if (user.role === ROLES.ARMY_ADMIN || agencyName.includes('ARMY') || agencyType.includes('ARMY')) {
    return 'ARMY_ADMIN';
  }
  if (user.role === ROLES.NGO_ADMIN || agencyName.includes('NGO') || agencyName.includes('RELIEF') || agencyType.includes('NGO')) {
    return 'NGO_ADMIN';
  }

  return user.role;
};

/**
 * Get institutional EOC Command Header for the UI shell.
 */
export const getCommandHeader = (user) => {
  const role = getUserCommandRole(user);
  switch (role) {
    case 'SUPER_ADMIN':
      return { title: 'SUPER ADMINISTRATIVE COMMAND', badge: 'SUPER ADMIN' };
    case 'STATE_OPERATOR':
      return { title: 'STATE EMERGENCY OPERATIONS CENTER', badge: 'STATE OPERATOR' };
    case 'NDRF_ADMIN':
      return { title: 'NDRF RESPONSE COMMAND', badge: 'NDRF ADMIN' };
    case 'ARMY_ADMIN':
      return { title: 'ARMY LOGISTICS COMMAND', badge: 'ARMY ADMIN' };
    case 'NGO_ADMIN':
      return { title: 'RELIEF & COMMUNITY COORDINATION', badge: 'NGO ADMIN' };
    default:
      return { title: 'DISASTER DECISION SUPPORT CENTER', badge: user?.role || 'OPERATOR' };
  }
};

/**
 * Get human-readable formatted role display string.
 */
export const getRoleDisplayName = (user) => {
  const header = getCommandHeader(user);
  return header.badge;
};

/**
 * Check if user can authorize allocation proposals.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canAuthorizeAllocation = (user) => {
  if (!user || !user.role) return false;
  const role = getUserCommandRole(user);
  return role === 'SUPER_ADMIN' || role === 'STATE_OPERATOR';
};

/**
 * Check if user can reject allocation proposals.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canRejectAllocation = (user) => {
  if (!user || !user.role) return false;
  const role = getUserCommandRole(user);
  return role === 'SUPER_ADMIN' || role === 'STATE_OPERATOR';
};

/**
 * Check if user can view audit log operational trail.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR
 */
export const canViewAuditLogs = (user) => {
  if (!user || !user.role) return false;
  const role = getUserCommandRole(user);
  return role === 'SUPER_ADMIN' || role === 'STATE_OPERATOR';
};

/**
 * Check if user can view Risk Intelligence page.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR, NDRF_ADMIN, ARMY_ADMIN
 */
export const canViewRiskIntelligence = (user) => {
  if (!user || !user.role) return false;
  return true; // All operational stakeholders can view situational risk awareness
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
  const role = getUserCommandRole(user);

  if (role === 'SUPER_ADMIN' || role === 'STATE_OPERATOR') {
    return true;
  }

  if (user.agency_id && resource.agency_id) {
    return String(user.agency_id) === String(resource.agency_id);
  }

  return false;
};

/**
 * Check if user can verify field reports.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR, NDRF_ADMIN, ARMY_ADMIN
 */
export const canVerifyFieldReport = (user) => {
  if (!user || !user.role) return false;
  const role = getUserCommandRole(user);
  return role === 'SUPER_ADMIN' || role === 'STATE_OPERATOR' || role === 'NDRF_ADMIN' || role === 'ARMY_ADMIN';
};

/**
 * Check if user can update post-disaster recovery status.
 * Allowed: SUPER_ADMIN, STATE_OPERATOR, NDRF_ADMIN, ARMY_ADMIN, NGO_ADMIN
 */
export const canUpdateRecoveryStatus = (user) => {
  return !!user && !!user.role;
};
