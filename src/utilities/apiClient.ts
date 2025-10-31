/**
 * API Client utilities for Next.js frontend integration
 * 
 * This file provides helper functions to fetch content from the Payload CMS
 * for use in client Next.js websites.
 */

export interface ApiClientOptions {
  baseUrl: string
  tenantSlug?: string
  tenantDomain?: string
  headers?: HeadersInit
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Creates an API client instance for fetching content
 */
export class PayloadApiClient {
  private baseUrl: string
  private tenantSlug?: string
  private tenantDomain?: string
  private defaultHeaders: HeadersInit

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.tenantSlug = options.tenantSlug
    this.tenantDomain = options.tenantDomain
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  }

  /**
   * Builds the API URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}/api${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  /**
   * Makes a request to the Payload API
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const headers = new Headers(this.defaultHeaders)
    
    // Add tenant context if provided
    if (this.tenantSlug) {
      headers.set('X-Tenant-Slug', this.tenantSlug)
    }
    if (this.tenantDomain) {
      headers.set('X-Tenant-Domain', this.tenantDomain)
    }

    // Merge custom headers
    if (fetchOptions.headers) {
      const customHeaders = new Headers(fetchOptions.headers)
      customHeaders.forEach((value, key) => {
        headers.set(key, value)
      })
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Fetches a single page by slug
   */
  async getPage(slug: string, options: FetchOptions = {}) {
    return this.request(
      '/pages',
      {
        ...options,
        params: {
          ...options.params,
          where: JSON.stringify({
            slug: { equals: slug },
            ...(this.tenantSlug && {
              'tenant.slug': { equals: this.tenantSlug },
            }),
            ...(this.tenantDomain && {
              'tenant.domain': { equals: this.tenantDomain },
            }),
          }),
          limit: 1,
          depth: 2, // Include relations
        },
      }
    )
  }

  /**
   * Fetches all pages for the tenant
   */
  async getPages(options: FetchOptions = {}) {
    return this.request(
      '/pages',
      {
        ...options,
        params: {
          ...options.params,
          where: JSON.stringify({
            ...(this.tenantSlug && {
              'tenant.slug': { equals: this.tenantSlug },
            }),
            ...(this.tenantDomain && {
              'tenant.domain': { equals: this.tenantDomain },
            }),
          }),
          depth: 2,
        },
      }
    )
  }

  /**
   * Fetches a single media file by ID
   */
  async getMedia(id: string | number, options: FetchOptions = {}) {
    return this.request(`/media/${id}`, {
      ...options,
      params: {
        ...options.params,
        depth: 1,
      },
    })
  }

  /**
   * Fetches media files for the tenant
   */
  async getMediaFiles(options: FetchOptions = {}) {
    return this.request(
      '/media',
      {
        ...options,
        params: {
          ...options.params,
          where: JSON.stringify({
            ...(this.tenantSlug && {
              'tenant.slug': { equals: this.tenantSlug },
            }),
            ...(this.tenantDomain && {
              'tenant.domain': { equals: this.tenantDomain },
            }),
          }),
          depth: 1,
        },
      }
    )
  }

  /**
   * Fetches tenant information
   */
  async getTenant(options: FetchOptions = {}) {
    const where: Record<string, any> = {}
    
    if (this.tenantSlug) {
      where.slug = { equals: this.tenantSlug }
    } else if (this.tenantDomain) {
      where.domain = { equals: this.tenantDomain }
    }

    return this.request(
      '/tenants',
      {
        ...options,
        params: {
          ...options.params,
          where: JSON.stringify(where),
          limit: 1,
          depth: 1,
        },
      }
    )
  }

  /**
   * Generic GET request
   */
  async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Generic POST request
   */
  async post<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

/**
 * Creates a Payload API client instance
 * 
 * @example
 * ```ts
 * // For domain-based tenant (e.g., client1.com)
 * const client = createPayloadClient({
 *   baseUrl: 'https://cms.yourdomain.com',
 *   tenantDomain: 'client1.com'
 * })
 * 
 * // For slug-based tenant
 * const client = createPayloadClient({
 *   baseUrl: 'https://cms.yourdomain.com',
 *   tenantSlug: 'client1'
 * })
 * 
 * // Fetch a page
 * const page = await client.getPage('about')
 * ```
 */
export function createPayloadClient(options: ApiClientOptions): PayloadApiClient {
  return new PayloadApiClient(options)
}

/**
 * Helper function to get the base URL from environment variables
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL or env var
    return process.env.NEXT_PUBLIC_PAYLOAD_URL || ''
  }
  // Server-side: use absolute URL
  return process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || ''
}

/**
 * Helper function to detect tenant from hostname (for domain-based routing)
 */
export function getTenantFromHostname(hostname: string): string | null {
  // Extract tenant domain from hostname
  // This assumes your tenant domains are subdomains or exact matches
  return hostname || null
}

/**
 * Helper function to create a client with automatic tenant detection
 * Use this in Next.js server components or API routes
 */
export function createClientWithTenant(hostname?: string): PayloadApiClient {
  const baseUrl = getBaseUrl()
  const tenantDomain = hostname ? getTenantFromHostname(hostname) : undefined

  return createPayloadClient({
    baseUrl,
    tenantDomain: tenantDomain || undefined,
  })
}

