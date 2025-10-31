async function HomePage({ params: paramsPromise }: { params: Promise<{ slug: string[] }> }) {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Multi-Tenant CMS</h1>
      <p>
        Welcome to your Payload CMS multi-tenant system. This CMS manages content for multiple client websites.
      </p>

      <h2>Getting Started</h2>
      <p>
        <a href="/admin" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Access the Admin Panel
        </a>{' '}
        to start managing tenants, pages, and media.
      </p>

      <h2>Multi-Tenancy</h2>
      <p>This CMS supports two tenant routing methods:</p>
      
      <h3>Domain-Based Routing</h3>
      <p>
        When a tenant has a custom domain configured, visiting that domain will automatically serve content for that tenant.
      </p>

      <h3>Slug-Based Routing</h3>
      <p>
        Tenants can also be accessed via their slug in the URL path. This is useful for development and testing.
      </p>

      <h2>Admin Features</h2>
      <ul>
        <li>Manage multiple tenants (client websites)</li>
        <li>Create and edit pages with flexible content structures</li>
        <li>Upload and manage media files</li>
        <li>Control user access per tenant</li>
      </ul>
    </div>
  )
}

HomePage.displayName = 'HomePage'

export default HomePage
