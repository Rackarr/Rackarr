<!--
  LogoLockup Component
  Animated logo + title lockup for toolbar branding
  Static pink at rest, rainbow gradient on hover
-->
<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 36 }: Props = $props();

	// Calculate proportional title height (logo should be slightly taller)
	const titleHeight = $derived(size * 1.2);
</script>

<div class="logo-lockup">
	<!-- Hidden SVG for gradient definitions -->
	<svg width="0" height="0" style="position: absolute;" aria-hidden="true">
		<defs>
			<!-- Animated rainbow gradient (Dracula colors) -->
			<linearGradient id="lockup-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%">
					<animate
						attributeName="stop-color"
						values="#BD93F9;#FF79C6;#8BE9FD;#50FA7B;#BD93F9"
						dur="6s"
						repeatCount="indefinite"
					/>
				</stop>
				<stop offset="50%">
					<animate
						attributeName="stop-color"
						values="#FF79C6;#8BE9FD;#50FA7B;#BD93F9;#FF79C6"
						dur="6s"
						repeatCount="indefinite"
					/>
				</stop>
				<stop offset="100%">
					<animate
						attributeName="stop-color"
						values="#8BE9FD;#50FA7B;#BD93F9;#FF79C6;#8BE9FD"
						dur="6s"
						repeatCount="indefinite"
					/>
				</stop>
			</linearGradient>
		</defs>
	</svg>

	<!-- Logo mark (simple rack outline from rackarr-site) -->
	<svg
		class="logo-mark"
		viewBox="0 0 32 32"
		width={size}
		height={size}
		aria-hidden="true"
		fill-rule="evenodd"
	>
		<path d="M6 4 h20 v24 h-20 z M10 8 h12 v4 h-12 z M10 14 h12 v4 h-12 z M10 20 h12 v4 h-12 z" />
	</svg>

	<!-- Title (SVG text for gradient support) -->
	<svg class="logo-title" viewBox="0 0 200 50" height={titleHeight} role="img" aria-label="Rackarr">
		<text x="0" y="38">Rackarr</text>
	</svg>
</div>

<style>
	.logo-lockup {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.logo-mark,
	.logo-title text {
		fill: var(--dracula-pink);
		transition: fill 0.3s ease;
	}

	.logo-mark {
		filter: drop-shadow(0 0 8px rgba(255, 121, 198, 0.2));
		flex-shrink: 0;
	}

	.logo-title {
		width: auto;
		filter: drop-shadow(0 0 8px rgba(255, 121, 198, 0.2));
	}

	.logo-title text {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 38px;
		font-weight: 600;
	}

	/* Hover: activate rainbow gradient */
	.logo-lockup:hover .logo-mark,
	.logo-lockup:hover .logo-title text {
		fill: url(#lockup-rainbow);
	}

	.logo-lockup:hover .logo-mark,
	.logo-lockup:hover .logo-title {
		filter: drop-shadow(0 0 16px rgba(189, 147, 249, 0.3));
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.logo-lockup:hover .logo-mark,
		.logo-lockup:hover .logo-title text {
			/* Keep static pink instead of animated gradient */
			fill: var(--dracula-pink);
		}
	}

	/* Responsive: hide title on small screens */
	@media (max-width: 600px) {
		.logo-title {
			display: none;
		}
	}
</style>
