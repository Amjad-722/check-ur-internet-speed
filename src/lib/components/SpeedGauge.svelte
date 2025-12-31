<script>
	let { speed = 0, maxSpeed = 100, unit = 'Mbps' } = $props();

	// Gauge configuration
	const radius = 160;
	const strokeWidth = 20;
	const center = radius + strokeWidth;
	const circumference = 2 * Math.PI * radius;
	const startAngle = -230; // Starting angle in degrees (bottom-leftish)
	const endAngle = 40; // Ending angle in degrees (bottom-rightish)
	const totalAngle = endAngle - startAngle;

	let rotation = $derived(startAngle + (Math.min(speed, maxSpeed) / maxSpeed) * totalAngle);

	const arcLength = (totalAngle / 360) * circumference;

	const progress = $derived(Math.min(speed, maxSpeed) / maxSpeed);
	const dashOffset = $derived(arcLength * (1 - progress));

	// Create tick marks
	const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
	function getTickPosition(tickValue) {
		const angle = startAngle + (tickValue / 100) * totalAngle;
		const radian = (angle * Math.PI) / 180;
		// Inner radius for ticks
		const r = radius - 50;
		const x = center + r * Math.cos(radian);
		const y = center + r * Math.sin(radian);
		return { x, y, angle };
	}
</script>

<div class="relative flex scale-75 flex-col items-center justify-center md:scale-100">
	<!-- Gauge SVG -->
	<div class="relative">
		<!-- Purple Glow Background -->
		<div class="absolute inset-0 scale-90 rounded-full bg-purple-900/40 blur-2xl"></div>
		<div
			class="absolute inset-4 rounded-full bg-gradient-to-tr from-transparent via-purple-900/20 to-transparent"
		></div>

		<svg
			width={center * 2}
			height={center * 2}
			viewBox={`0 0 ${center * 2} ${center * 2}`}
			class="overflow-visible drop-shadow-2xl"
		>
			<!-- Defs for gradients -->
			<defs>
				<linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stop-color="#06b6d4" />
					<!-- Cyan (Start) -->
					<stop offset="50%" stop-color="#8b5cf6" />
					<!-- Violet (Middle) -->
					<stop offset="100%" stop-color="#eab308" />
					<!-- Yellow (End) -->
				</linearGradient>

				<radialGradient id="innerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
					<stop offset="0%" stop-color="#4c1d95" stop-opacity="0.6" />
					<stop offset="100%" stop-color="#4c1d95" stop-opacity="0" />
				</radialGradient>

				<!-- Needle Glow Filter -->
				<filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="2" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<!-- Inner Glow Circle -->
			<circle cx={center} cy={center} r={radius - 20} fill="url(#innerGlow)" opacity="0.5" />

			<!-- Background Track -->
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke="var(--color-surface)"
				stroke-width={strokeWidth}
				stroke-dasharray={`${arcLength} ${circumference}`}
				stroke-linecap="round"
				transform={`rotate(${startAngle} ${center} ${center})`}
				class="opacity-40"
			/>

			<!-- Progress Arc -->
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke="url(#gaugeGradient)"
				stroke-width={strokeWidth}
				pathLength="100"
				stroke-dasharray={`${(totalAngle / 360) * 100} 100`}
				stroke-dashoffset={(totalAngle / 360) * 100 * (1 - Math.min(speed, maxSpeed) / maxSpeed)}
				stroke-linecap="round"
				transform={`rotate(${startAngle} ${center} ${center})`}
				class="transition-[stroke-dashoffset] duration-300 ease-out"
				filter="drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))"
			/>

			<!-- Inner Tick Track (Thin) -->
			<circle
				cx={center}
				cy={center}
				r={radius - 25}
				fill="none"
				stroke="rgba(255,255,255,0.1)"
				stroke-width="1"
				stroke-dasharray={`${arcLength} ${circumference}`}
				stroke-linecap="round"
				transform={`rotate(${startAngle} ${center} ${center})`}
			/>
		</svg>

		<!-- Needle Container -->

		<div
			class="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center justify-center"
		>
			<div class="flex flex-col items-baseline justify-center">
				<span class="text-4xl font-bold tracking-tighter text-white drop-shadow-md">
					{speed.toFixed(2)}
				</span>
				<span class="text-sm font-bold tracking-widest text-gray-400 uppercase opacity-80">
					{unit}
				</span>
			</div>
		</div>

		<!-- Ticks -->
		{#each ticks as tick}
			{@const pos = getTickPosition(tick)}
			<div
				class="absolute text-[10px] font-semibold text-gray-400 select-none"
				style="left: {pos.x}px; top: {pos.y}px; transform: translate(-50%, -50%);"
			>
				{tick}
			</div>
		{/each}
	</div>

	<!-- Bottom Digital Readout (Moved from Center) -->
	<div class="mt-4 flex flex-col items-center justify-center">
		<div class="text-sm font-bold tracking-widest text-gray-400 uppercase opacity-80">
			{unit}
		</div>
		<div class="mt-2 text-xs font-medium tracking-[0.2em] text-gray-500 uppercase">
			Internet Speed Test
		</div>
	</div>
</div>
