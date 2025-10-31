/**
 * Remote Payload Client for Scripts
 * 
 * Connects to deployed Payload CMS via REST API instead of direct database access.
 * Use this when running scripts locally but connecting to deployed CMS.
 */

import type { Payload } from 'payload'

export interface RemotePayloadClient {
  find: (args: {
    collection: string
    where?: any
    limit?: number
    depth?: number
  }) => Promise<{ docs: any[]; totalDocs: number }>
  
  create: (args: {
    collection: string
    data: any
  }) => Promise<any>
  
  update: (args: {
    collection: string
    id: string | number
    data: any
  }) => Promise<any>
  
  delete: (args: {
    collection: string
    id: string | number
  }) => Promise<any>
  
  logger: {
    info: (message: string, ...args: any[]) => void
    error: (message: string, ...args: any[]) => void
    warn: (message: string, ...args: any[]) => void
  }
}

/**
 * Creates a remote Payload client that connects via REST API
 */
export async function createRemotePayloadClient(
  apiUrl: string,
  apiKey?: string,
): Promise<RemotePayloadClient> {
  const baseUrl = apiUrl.replace(/\/$/, '') // Remove trailing slash
  
  // Helper to make API requests
  const request = async <T>(
    method: string,
    endpoint: string,
    data?: any,
  ): Promise<T> => {
    const url = `${baseUrl}/api${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    find: async (args) => {
      const params = new URLSearchParams()
      
      if (args.where) {
        params.append('where', JSON.stringify(args.where))
      }
      if (args.limit) {
        params.append('limit', String(args.limit))
      }
      if (args.depth) {
        params.append('depth', String(args.depth))
      }

      const query = params.toString()
      const endpoint = query ? `/${args.collection}?${query}` : `/${args.collection}`
      
      return request('GET', endpoint)
    },

    create: async (args) => {
      return request('POST', `/${args.collection}`, args.data)
    },

    update: async (args) => {
      return request('PATCH', `/${args.collection}/${args.id}`, args.data)
    },

    delete: async (args) => {
      return request('DELETE', `/${args.collection}/${args.id}`)
    },

    logger: {
      info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${message}`, ...args)
      },
      error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args)
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args)
      },
    },
  }
}

/**
 * Gets Payload client - either remote (if PAYLOAD_API_URL is set) or local
 */
export async function getPayloadClient(): Promise<RemotePayloadClient | Payload> {
  const apiUrl = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL
  
  if (apiUrl) {
    // Use remote API client
    const apiKey = process.env.PAYLOAD_API_KEY // Optional API key for authentication
    return createRemotePayloadClient(apiUrl, apiKey)
  } else {
    // Use local Payload instance (direct database access)
    const { getPayload } = await import('payload')
    const config = await import('../payload.config')
    return getPayload({ config: config.default })
  }
}

