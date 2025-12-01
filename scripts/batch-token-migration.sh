#!/bin/bash
# Batch Token Migration Script
# Migrates common hardcoded values to design tokens across all Svelte components

set -e

echo "Starting batch token migration..."

find src/lib/components -name "*.svelte" -not -name "*.bak" -type f | while read file; do
  echo "Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Hex colors - white and black
  sed -i 's/#ffffff\b/var(--neutral-50)/gi' "$file"
  sed -i 's/#000000\b/var(--neutral-950)/gi' "$file"
  sed -i 's/color: white\b/color: var(--neutral-50)/g' "$file"
  sed -i 's/background: white\b/background: var(--neutral-50)/g' "$file"

  # Spacing tokens (4px base)
  sed -i 's/: 4px\b/: var(--space-1)/g' "$file"
  sed -i 's/: 8px\b/: var(--space-2)/g' "$file"
  sed -i 's/: 12px\b/: var(--space-3)/g' "$file"
  sed -i 's/: 16px\b/: var(--space-4)/g' "$file"
  sed -i 's/: 20px\b/: var(--space-5)/g' "$file"
  sed -i 's/: 24px\b/: var(--space-6)/g' "$file"
  sed -i 's/: 32px\b/: var(--space-8)/g' "$file"
  sed -i 's/: 48px\b/: var(--space-12)/g' "$file"

  # Border radius
  sed -i 's/border-radius: 4px\b/border-radius: var(--radius-sm)/g' "$file"
  sed -i 's/border-radius: 6px\b/border-radius: var(--radius-md)/g' "$file"
  sed -i 's/border-radius: 8px\b/border-radius: var(--radius-lg)/g' "$file"
  sed -i 's/border-radius: 12px\b/border-radius: var(--radius-xl)/g' "$file"
  sed -i 's/border-radius: 9999px\b/border-radius: var(--radius-full)/g' "$file"

  # Font sizes
  sed -i 's/font-size: 11px\b/font-size: var(--font-size-xs)/g' "$file"
  sed -i 's/font-size: 13px\b/font-size: var(--font-size-sm)/g' "$file"
  sed -i 's/font-size: 14px\b/font-size: var(--font-size-base)/g' "$file"
  sed -i 's/font-size: 16px\b/font-size: var(--font-size-md)/g' "$file"
  sed -i 's/font-size: 18px\b/font-size: var(--font-size-lg)/g' "$file"
  sed -i 's/font-size: 20px\b/font-size: var(--font-size-xl)/g' "$file"

  # Font weights
  sed -i 's/font-weight: 400\b/font-weight: var(--font-weight-normal)/g' "$file"
  sed -i 's/font-weight: 500\b/font-weight: var(--font-weight-medium)/g' "$file"
  sed -i 's/font-weight: 600\b/font-weight: var(--font-weight-semibold)/g' "$file"
  sed -i 's/font-weight: 700\b/font-weight: var(--font-weight-bold)/g' "$file"

  # Transition durations
  sed -i 's/\b100ms\b/var(--duration-fast)/g' "$file"
  sed -i 's/\b200ms\b/var(--duration-normal)/g' "$file"
  sed -i 's/\b300ms\b/var(--duration-slow)/g' "$file"

  echo "  ✓ Migrated"
done

echo ""
echo "✓ Batch migration complete!"
echo "Backup files created with .bak extension"
echo "Please review changes and run tests"
