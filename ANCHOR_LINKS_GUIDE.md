# Anchor Links in Payload CMS Navigation

This guide explains how to add anchor links to navigation menu items in Payload CMS admin.

## Available Anchor Links

The following sections have anchor IDs and can be linked to:

- **`hero`** - Hero section at the top of the page
- **`features`** - Features/benefits section
- **`process`** - Process/steps section  
- **`contact`** - Contact form section

## How to Add Anchor Links

### In Payload CMS Admin

1. Navigate to **Pages** → Edit your landing page
2. Expand the **Header** section
3. In the **Menu** array, add menu items:
   - **Label**: e.g., "Λειτουργίες", "Διαδικασία", "Επικοινωνία"
   - **Link**: Use the anchor ID (e.g., `features`, `process`, `contact`)
     - ✅ **Correct**: `features`, `process`, `contact`, `hero`
     - ✅ **Also works**: `#features`, `#process` (with or without #)
     - ❌ **Wrong**: `/features`, `/process` (these will navigate to pages)

4. For the **CTA button**:
   - **Label**: e.g., "Φτιάξε το site σου"
   - **Link**: Use anchor ID (e.g., `contact`)

### Examples

**Menu Items:**
```
Label: "Λειτουργίες"
Link: features

Label: "Διαδικασία"  
Link: process

Label: "Επικοινωνία"
Link: contact
```

**CTA Button:**
```
Label: "Φτιάξε το site σου"
Link: contact
```

## How It Works

- **Anchor links** (without `/`) scroll smoothly to the section on the same page
- **Page links** (starting with `/`) navigate to other pages
- The Header component automatically detects anchor links and uses smooth scrolling
- Anchor links work with or without the `#` prefix

## Technical Details

### Header Component Behavior

The `Header` component's `scrollToSection` function:
1. Removes leading `#` if present
2. Checks if it's an anchor link (doesn't start with `/`)
3. Finds the element by ID and scrolls smoothly
4. Falls back to navigation if it's a page URL

### Section IDs

- **Hero**: `id="hero"` 
- **Features**: `id="features"`
- **Process**: `id="process"`
- **Contact**: `id="contact"`

## Troubleshooting

### Links Not Working

1. **Check the section ID exists** in the component
2. **Verify link format** - should be `features`, not `/features`
3. **Check browser console** for JavaScript errors
4. **Ensure sections are rendered** on the page

### Smooth Scroll Not Working

- Check browser support (modern browsers support `scrollIntoView` with `behavior: "smooth"`)
- Verify JavaScript is enabled
- Check for CSS conflicts that might prevent scrolling

## Best Practices

1. **Use descriptive labels** in Greek or English
2. **Keep anchor IDs simple** (lowercase, no spaces)
3. **Test links** after adding them
4. **Use consistent naming** for anchor IDs across pages

## Adding New Anchor Links

To add a new anchor link:

1. **Add ID to component**:
   ```tsx
   <section id="my-section" className="...">
   ```

2. **Update Payload CMS description** (optional):
   - Add the new anchor ID to the description in `Pages/index.ts`

3. **Add to menu** in Payload CMS admin:
   - Label: Your menu label
   - Link: `my-section` (the ID you added)

---

**Ready to use!** Just add anchor links in the Payload CMS admin and they'll work automatically! 🎯

