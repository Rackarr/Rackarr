#!/bin/bash
# Token Migration Script for v0.2.1
# Migrates hardcoded values to design tokens

set -e

echo "Starting token migration..."

# Find all Svelte component files
COMPONENTS=$(find src/lib/components -name "*.svelte" -type f)

for file in $COMPONENTS; do
  echo "Migrating: $file"

  # Backup original
  cp "$file" "$file.bak"

  # Common spacing replacements (in style blocks only)
  # Using perl for better multiline handling
  perl -i -pe '
    # Only process within <style> blocks
    our $in_style;
    $in_style = 1 if /<style/;
    $in_style = 0 if /<\/style>/;

    if ($in_style) {
      # Spacing tokens
      s/:\s*4px\b/: var(--space-1)/g;
      s/:\s*8px\b/: var(--space-2)/g;
      s/:\s*12px\b/: var(--space-3)/g;
      s/:\s*16px\b/: var(--space-4)/g;
      s/:\s*20px\b/: var(--space-5)/g;
      s/:\s*24px\b/: var(--space-6)/g;
      s/:\s*32px\b/: var(--space-8)/g;
      s/:\s*48px\b/: var(--space-12)/g;

      # Border radius tokens
      s/border-radius:\s*4px\b/border-radius: var(--radius-sm)/g;
      s/border-radius:\s*6px\b/border-radius: var(--radius-md)/g;
      s/border-radius:\s*8px\b/border-radius: var(--radius-lg)/g;
      s/border-radius:\s*12px\b/border-radius: var(--radius-xl)/g;
      s/border-radius:\s*9999px\b/border-radius: var(--radius-full)/g;

      # Common hardcoded colors
      s/#ffffff\b/var(--neutral-50)/gi;
      s/#000000\b/var(--neutral-950)/gi;
      s/color:\s*white\b/color: var(--neutral-50)/g;
      s/color:\s*black\b/color: var(--neutral-950)/g;
      s/background:\s*white\b/background: var(--neutral-50)/g;
      s/background:\s*black\b/background: var(--neutral-950)/g;

      # Font sizes
      s/font-size:\s*11px\b/font-size: var(--font-size-xs)/g;
      s/font-size:\s*13px\b/font-size: var(--font-size-sm)/g;
      s/font-size:\s*14px\b/font-size: var(--font-size-base)/g;
      s/font-size:\s*16px\b/font-size: var(--font-size-md)/g;
      s/font-size:\s*18px\b/font-size: var(--font-size-lg)/g;
      s/font-size:\s*20px\b/font-size: var(--font-size-xl)/g;

      # Font weights
      s/font-weight:\s*400\b/font-weight: var(--font-weight-normal)/g;
      s/font-weight:\s*500\b/font-weight: var(--font-weight-medium)/g;
      s/font-weight:\s*600\b/font-weight: var(--font-weight-semibold)/g;
      s/font-weight:\s*700\b/font-weight: var(--font-weight-bold)/g;

      # Transition durations
      s/transition:\s*all\s+100ms\b/transition: all var(--duration-fast)/g;
      s/transition:\s*all\s+200ms\b/transition: all var(--duration-normal)/g;
      s/transition:\s*all\s+300ms\b/transition: all var(--duration-slow)/g;
      s/100ms\b/var(--duration-fast)/g;
      s/200ms\b/var(--duration-normal)/g;
      s/300ms\b/var(--duration-slow)/g;

      # Easing functions
      s/ease-out\b/var(--ease-out)/g unless /--ease-out/;
      s/ease-in-out\b/var(--ease-in-out)/g unless /--ease-in-out/;
      s/ease-in\b(?!-out)/var(--ease-in)/g unless /--ease-in/;
    }
  ' "$file"

  echo "  ✓ Migrated $file"
done

echo ""
echo "Migration complete! Created .bak files for all modified files."
echo "Please review the changes and run tests."
echo ""
echo "To remove backup files after review: find src -name '*.bak' -delete"
