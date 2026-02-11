export const ticketStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED"
] as const;

export const ticketPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT"
] as const;

export const ticketCategories = [
  "BILLING",
  "TECHNICAL",
  "FEATURE_REQUEST",
  "OTHER"
] as const;

export const membershipRoles = ["OWNER", "ADMIN", "MEMBER"] as const;
