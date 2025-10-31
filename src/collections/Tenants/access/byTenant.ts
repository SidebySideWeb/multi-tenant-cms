import type { Access } from 'payload'

import { isSuperAdmin } from '../../../access/isSuperAdmin'

export const filterByTenantRead: Access = (args) => {
  // Allow public tenants to be read by anyone
  if (!args.req.user) {
    return {
      allowPublicRead: {
        equals: true,
      },
    }
  }

  return true
}

export const canMutateTenant: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  return {
    id: {
      in:
        req.user?.tenants
          ?.map(({ roles, tenant }) => {
            if (!roles?.includes('tenant-admin')) {
              return null
            }
            if (!tenant) {
              return null
            }
            return typeof tenant === 'string' || typeof tenant === 'number' 
              ? tenant 
              : tenant.id
          })
          .filter((id): id is number => typeof id === 'number') || [],
    },
  }
}
