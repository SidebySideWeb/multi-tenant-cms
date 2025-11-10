import type { FieldHook, Where } from 'payload'

import { ValidationError } from 'payload'

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { extractID } from '@/utilities/extractID'

export const ensureUniqueSlug: FieldHook = async ({ data, originalDoc, req, value }) => {
  if (typeof value !== 'string' || value.length === 0) {
    return value
  }

  if (originalDoc?.slug === value) {
    return value
  }

  const tenantIDToMatch = extractID(data?.tenant) ?? extractID(originalDoc?.tenant)

  const constraints: Where[] = [
    {
      slug: {
        equals: value,
      },
    },
  ]

  if (tenantIDToMatch) {
    constraints.push({
      tenant: {
        equals: tenantIDToMatch,
      },
    })
  }

  const duplicates = await req.payload.find({
    collection: 'posts',
    where: {
      and: constraints,
    },
    depth: 0,
    limit: 1,
  })

  if (duplicates.docs.length > 0 && req.user) {
    const tenantIDs = getUserTenantIDs(req.user)

    if (req.user.roles?.includes('super-admin') || tenantIDs.length > 1) {
      const attemptedTenantChange = tenantIDToMatch
        ? await req.payload.findByID({
            id: tenantIDToMatch,
            collection: 'tenants',
            depth: 0,
          })
        : undefined

      throw new ValidationError({
        errors: [
          {
            message: attemptedTenantChange
              ? `The tenant "${attemptedTenantChange?.name ?? tenantIDToMatch}" already has a post with the slug "${value}". Slugs must be unique per tenant.`
              : `The slug "${value}" is already in use. Slugs must be unique per tenant.`,
            path: 'slug',
          },
        ],
      })
    }

    throw new ValidationError({
      errors: [
        {
          message: `A post with the slug "${value}" already exists for this tenant.`,
          path: 'slug',
        },
      ],
    })
  }

  return value
}

