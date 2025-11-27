<!--
  Load/Upload/Folder icon
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
>
	<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
	<line x1="12" y1="11" x2="12" y2="17" />
	<polyline points="9 14 12 11 15 14" />
</svg>
