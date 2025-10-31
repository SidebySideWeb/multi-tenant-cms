# Supabase Database Setup

Your Payload CMS is configured to use Supabase PostgreSQL database.

## Current Configuration

The database adapter is already configured in `payload.config.ts` to use PostgreSQL with Supabase:

```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.POSTGRES_URL,
  },
}),
```

## Environment Variable

Add this to your `.env` file:

```env
# Supabase PostgreSQL Database Connection
# Using pooled connection (port 6543) for better performance
POSTGRES_URL=postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

## Connection Details

- **Host**: `aws-1-eu-west-1.pooler.supabase.com`
- **Port**: `6543` (pooled connection - recommended for serverless/Next.js)
- **Database**: `postgres`
- **User**: `postgres.fesjvdynrrarrljwbqdh`
- **Password**: `P0pb5gBTfgByzplq`

## Connection Types

### Pooled Connection (Current - Recommended)
- **Port**: `6543`
- **Use case**: Serverless environments, Next.js, production
- **Benefits**: Better connection management, works with serverless functions
- **Connection String**: `postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`

### Direct Connection (Alternative)
- **Port**: `5432`
- **Use case**: Long-running processes, migrations
- **Note**: May have connection limits in serverless environments
- **Connection String**: `postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to version control
- The password `P0pb5gBTfgByzplq` is sensitive - keep it secure
- Consider rotating passwords periodically
- Use environment variables in production (not hardcoded values)

## Testing the Connection

After setting up your `.env` file:

1. **Start the server:**
   ```bash
   pnpm dev
   ```

2. **Check for connection errors:**
   - If connection fails, verify the password is correct
   - Check that your Supabase project is active
   - Verify the connection string format

3. **Run migrations:**
   ```bash
   pnpm payload migrate
   ```

4. **Verify in admin panel:**
   - Go to `/admin`
   - Check that collections load correctly
   - Try creating a test document

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in Supabase (if IP restrictions are enabled)
- Verify the connection string is correct
- Try the direct connection (port 5432) if pooled fails

### Authentication Failed
- Verify the password is correct
- Check that the username includes the project reference
- Ensure the database exists in Supabase

### Too Many Connections
- The pooled connection (6543) helps manage this
- Consider connection pooling settings
- Check Supabase connection limits

## Production Deployment

For production:
1. Use environment variables in your hosting platform
2. Set `POSTGRES_URL` as a secret/environment variable
3. Never expose credentials in code or logs
4. Consider using connection pooling (already configured)

## Next Steps

1. ✅ Database connection string is configured
2. ✅ Storage is configured (see `SUPABASE_STORAGE_SETUP.md`)
3. ⏭️ Create your `.env` file with both database and storage credentials
4. ⏭️ Run `pnpm dev` to start the server
5. ⏭️ Access `/admin` to verify everything works

