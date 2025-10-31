/**
 * Example Next.js Client Site Integration
 * 
 * This file shows how to integrate a client Next.js website with the multi-tenant CMS.
 * Copy these patterns into your client website project.
 */

// ============================================================================
// 1. API Client Setup (lib/payload-client.ts)
// ============================================================================

import { createPayloadClient, getBaseUrl } from '@/utilities/apiClient'

/**
 * Get Payload client with automatic tenant detection from domain
 */
export function getPayloadClient(hostname?: string) {
  return createPayloadClient({
    baseUrl: getBaseUrl(),
    tenantDomain: hostname,
  })
}

// ============================================================================
// 2. Server Component Example (app/page.tsx)
// ============================================================================

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload-client'
import { notFound } from 'next/navigation'
import type { Page as PageType } from '@/types/payload-types'

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = getPayloadClient(hostname)
  
  try {
    const result = await client.getPage('home')
    const page = result.docs[0] as PageType | undefined
    
    if (!page) {
      notFound()
    }
    
    return (
      <main>
        <h1>{page.title}</h1>
        {page.description && <p className="description">{page.description}</p>}
        {page.featuredImage && (
          <img 
            src={typeof page.featuredImage === 'string' 
              ? page.featuredImage 
              : page.featuredImage.url} 
            alt={page.title}
            className="featured-image"
          />
        )}
        {/* Render rich text content here */}
      </main>
    )
  } catch (error) {
    console.error('Failed to load page:', error)
    notFound()
  }
}

// ============================================================================
// 3. Dynamic Route Example (app/[slug]/page.tsx)
// ============================================================================

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload-client'
import { notFound } from 'next/navigation'

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = getPayloadClient(hostname)
  
  try {
    const result = await client.getPage(slug)
    const page = result.docs[0]
    
    if (!page) {
      notFound()
    }
    
    return (
      <article>
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
        {/* Render content */}
      </article>
    )
  } catch (error) {
    console.error('Failed to load page:', error)
    notFound()
  }
}

// ============================================================================
// 4. API Route Example (app/api/pages/route.ts)
// ============================================================================

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'

export async function GET() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = getPayloadClient(hostname)
  
  try {
    const result = await client.getPages()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// ============================================================================
// 5. Client Component Example (components/PageList.tsx)
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import { createPayloadClient } from '@/lib/payload-client'
import type { Page } from '@/types/payload-types'

export function PageList() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const client = createPayloadClient({
      baseUrl: process.env.NEXT_PUBLIC_PAYLOAD_URL!,
      tenantDomain: window.location.hostname,
    })
    
    client.getPages()
      .then((result) => {
        setPages(result.docs as Page[])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch pages:', error)
        setLoading(false)
      })
  }, [])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <nav>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            <a href={`/${page.slug}`}>{page.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ============================================================================
// 6. Static Generation Example (app/[slug]/page.tsx with generateStaticParams)
// ============================================================================

import { getPayloadClient } from '@/lib/payload-client'

export async function generateStaticParams() {
  const client = createPayloadClient({
    baseUrl: process.env.PAYLOAD_URL!,
    tenantSlug: process.env.TENANT_SLUG!, // Set per deployment
  })
  
  try {
    const result = await client.getPages()
    return result.docs.map((page) => ({
      slug: page.slug,
    }))
  } catch (error) {
    console.error('Failed to generate static params:', error)
    return []
  }
}

// ============================================================================
// 7. Metadata Example (app/[slug]/page.tsx with generateMetadata)
// ============================================================================

import { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = getPayloadClient(hostname)
  
  try {
    const result = await client.getPage(slug)
    const page = result.docs[0]
    
    if (!page) {
      return {}
    }
    
    return {
      title: page.meta?.title || page.title,
      description: page.meta?.description || page.description,
      openGraph: {
        title: page.meta?.title || page.title,
        description: page.meta?.description || page.description,
        images: page.meta?.ogImage 
          ? [typeof page.meta.ogImage === 'string' 
              ? page.meta.ogImage 
              : page.meta.ogImage.url]
          : [],
      },
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error)
    return {}
  }
}

