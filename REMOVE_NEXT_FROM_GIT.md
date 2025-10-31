# Remove .next from Git Tracking

The `.next` directory is being tracked. Remove it with these commands:

## Quick Fix

```bash
cd C:\Users\dgero\Documents\ai-projects-new\multi-tenant\multi-tenant

# Remove .next from Git tracking (but keep files locally)
git rm -r --cached .next

# Verify .gitignore has .next/
# (Already updated)

# Add the updated .gitignore
git add .gitignore

# Re-add everything (respecting .gitignore)
git add .

# Check status - should NOT see .next
git status

# Commit
git commit -m "Remove .next build files from Git tracking"
```

## Verify

After running above commands:

```bash
git status
```

You should **NOT** see any `.next` files listed.

---

**Run these commands now!** 🚀

