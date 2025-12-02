<!--
  Label/Text icon (for label display mode)
-->
<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 20 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	data-icon="label"
>
	<!-- Text/Tag icon -->
	<path d="M4 7V4h16v3" />
	<path d="M9 20h6" />
	<path d="M12 4v16" />
</svg>
