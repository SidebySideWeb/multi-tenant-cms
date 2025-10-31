# Rich Text Fields in Payload CMS

This guide explains how to use rich text formatting in Payload CMS admin fields.

## What Changed

The following fields now support rich text formatting:

### Hero Section
- **Subheadline** - Can use bold, italic, links, etc.

### Features Section
- **Subtitle** - Section subtitle with rich text
- **Feature Descriptions** - Each feature item description supports rich text

### Process Section
- **Subtitle** - Section subtitle with rich text
- **Step Descriptions** - Each step description supports rich text

### Contact Section
- **Subtitle** - Section subtitle with rich text

## How to Use Rich Text

### In Payload CMS Admin

1. Navigate to **Pages** → Edit your landing page
2. Expand the section you want to edit (e.g., Hero, Features, Process, Contact)
3. In fields marked with rich text:
   - Click to open the rich text editor
   - Use the toolbar to format text:
     - **Bold** (B)
     - **Italic** (I)
     - **Underline** (U)
     - **Links** - Add hyperlinks
     - **Headings** - Use H1, H2, H3
     - **Lists** - Bulleted or numbered lists
     - **Blockquotes** - For quotes

### Example Usage

**Before (plain text):**
```
Με τη δύναμη της Τεχνητής Νοημοσύνης, δημιουργούμε γρήγορα, οικονομικά και επαγγελματικά websites.
```

**After (rich text):**
```
Με τη δύναμη της **Τεχνητής Νοημοσύνης**, δημιουργούμε γρήγορα, οικονομικά και επαγγελματικά websites.
```

Or with links:
```
Με τη δύναμη της Τεχνητής Νοημοσύνης, δημιουργούμε [γρήγορα](https://example.com), οικονομικά και επαγγελματικά websites.
```

## Frontend Rendering

The frontend automatically handles rich text content:
- Converts Lexical JSON format to HTML
- Renders formatting correctly
- Supports links, bold, italic, and other formatting
- Falls back to plain text if rich text is not used

## Technical Details

### Storage Format

Rich text fields store data in **Lexical JSON format**:
```json
{
  "root": {
    "children": [
      {
        "type": "paragraph",
        "children": [
          {
            "text": "Your formatted text",
            "format": 1  // 1 = bold, 2 = italic, etc.
          }
        ]
      }
    ]
  }
}
```

### Frontend Processing

The `richTextToHTML()` utility function:
- Converts Lexical JSON to HTML
- Handles formatting (bold, italic, links, etc.)
- Falls back to plain text if needed
- Used automatically in all components

## Best Practices

1. **Use sparingly** - Rich text is great for emphasis, but don't overuse formatting
2. **Keep it simple** - Too much formatting can be distracting
3. **Test rendering** - Preview your content to ensure it displays correctly
4. **Mobile-friendly** - Rich text renders well on all devices

## Available Formatting Options

- ✅ **Bold** - For emphasis
- ✅ **Italic** - For subtle emphasis
- ✅ **Underline** - For links (usually automatic)
- ✅ **Links** - Add hyperlinks to external/internal pages
- ✅ **Headings** - H1, H2, H3 for structure
- ✅ **Lists** - Bulleted or numbered lists
- ✅ **Blockquotes** - For quotes or callouts

## Migrating Existing Content

Existing plain text content will continue to work:
- Plain text strings are automatically handled
- No need to migrate existing content
- Rich text is optional - use it when you need formatting

## Troubleshooting

### Rich Text Not Showing

1. **Check field type** - Ensure field is set to `richText` in CMS
2. **Clear cache** - Refresh browser cache
3. **Check frontend** - Verify `richTextToHTML` is imported

### Formatting Not Rendering

1. **Check HTML output** - Use browser dev tools to inspect HTML
2. **Verify CSS** - Ensure styles are applied correctly
3. **Test formatting** - Try simple formatting first (bold, italic)

### Links Not Working

1. **Check URL format** - Use full URLs (https://example.com)
2. **Verify href** - Links should have proper `href` attributes
3. **Test in browser** - Click links to verify they work

---

**Ready to use!** Just edit your content in Payload CMS admin and use the rich text editor toolbar! ✨

