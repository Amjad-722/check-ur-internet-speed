<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { SpeedTest } from '$lib/speedtest.js';
	import { onMount } from 'svelte';

	let currentSpeed = $state(0);
	let speedUnit = $state('Mbps');
	let maxSpeedReached = $state(false);
	let isTestRunning = $state(false);
	let testCompleted = $state(false);
	let peakSpeed = $state(0);
	let speedHistory = $state([]);
	let stableSpeedCount = $state(0);

	const speedTest = new SpeedTest();
	const MAX_SPEED_LIMIT = 100;
	const STABLE_SPEED_THRESHOLD = 3; // Number of similar readings to consider stable
	const SPEED_VARIANCE_THRESHOLD = 0.5; // Mbps variance to consider stable

	onMount(() => {
		runSpeedTest();
	});

	async function runSpeedTest() {
		isTestRunning = true;
		testCompleted = false;
		maxSpeedReached = false;
		currentSpeed = 0;
		peakSpeed = 0;
		speedHistory = [];
		stableSpeedCount = 0;

		try {
			await speedTest.testDownload((speed) => {
				// Track speed history for stability detection
				speedHistory = [...speedHistory.slice(-10), speed]; // Keep last 10 readings

				// Update peak speed
				if (speed > peakSpeed) {
					peakSpeed = speed;
				}

				// Check if we've hit the artificial limit
				if (speed >= MAX_SPEED_LIMIT) {
					currentSpeed = MAX_SPEED_LIMIT;
					speedUnit = 'Mbps';
					maxSpeedReached = true;
					stopTest();
					return;
				}

				// Check for stable maximum speed (real maximum detection)
				if (speedHistory.length >= STABLE_SPEED_THRESHOLD) {
					const recentSpeeds = speedHistory.slice(-STABLE_SPEED_THRESHOLD);
					const avgSpeed = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length;
					const isStable = recentSpeeds.every(
						(s) => Math.abs(s - avgSpeed) <= SPEED_VARIANCE_THRESHOLD
					);

					if (isStable && avgSpeed > 1) {
						// Only consider stable if speed is reasonable
						stableSpeedCount++;
						if (stableSpeedCount >= 3) {
							// 3 consecutive stable readings
							maxSpeedReached = true;
							stopTest();
							return;
						}
					} else {
						stableSpeedCount = 0;
					}
				}

				// Update display
				if (speed >= 1) {
					currentSpeed = Math.round(speed * 10) / 10;
					speedUnit = 'Mbps';
				} else {
					currentSpeed = Math.round((speed * 1000 * 8) / 10) / 10;
					speedUnit = 'KBps';
				}
			});
		} catch (error) {
			console.error('Speed test failed:', error);
			stopTest();
		}
	}

	function stopTest() {
		speedTest.stop();
		isTestRunning = false;
		testCompleted = true;
	}

	function refreshTest() {
		speedTest.stop();
		runSpeedTest();
	}
</script>

<div
	class="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
>
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter"
		></div>
		<div
			class="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-green-500 opacity-20 mix-blend-multiply blur-xl filter"
			style="animation-delay: 1s"
		></div>
		<div
			class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-blue-500 opacity-10 mix-blend-multiply blur-xl filter"
			style="animation-delay: 2s"
		></div>
	</div>

	<Navbar onRefresh={refreshTest} />

	<div class="relative z-10 flex flex-1 items-center justify-center p-8">
		<div class="relative flex flex-col items-center justify-center">
			{#if maxSpeedReached}
				<div class="mb-8 text-center">
					<h1 class="gradient-text mb-2 text-4xl font-bold md:text-5xl">Your Internet Speed</h1>
					<p class="text-lg text-gray-400">Connection test completed</p>
				</div>
			{:else}
				<div class="mt-8 text-center">
					<h1 class="mb-2 text-4xl font-bold text-white md:text-5xl">Testing Speed</h1>
					<p class="text-lg text-gray-400">Measuring your connection...</p>
				</div>
			{/if}

			<!-- Main speed display card -->
			<div
				class="glass relative overflow-hidden rounded-3xl p-12 shadow-2xl backdrop-blur-sm {maxSpeedReached
					? 'pulse-glow'
					: ''}"
			>
				<!-- Gradient overlay -->
				<div
					class="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/10 via-transparent to-purple-500/10"
				></div>

				<div class="relative z-10 text-center">
					<div
						class="text-8xl font-thin md:text-9xl {maxSpeedReached
							? 'gradient-text'
							: 'text-green-400'} float mb-4 tracking-tight"
					>
						{currentSpeed.toFixed(1)}
					</div>

					<div class="mb-6 text-3xl font-light text-gray-300">{speedUnit}</div>

					{#if isTestRunning}
						<div class="mt-8 flex justify-center">
							<div class="flex space-x-2">
								<div
									class="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-green-400 to-blue-400"
								></div>
								<div
									class="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
									style="animation-delay: 0.1s"
								></div>
								<div
									class="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-purple-400 to-green-400"
									style="animation-delay: 0.2s"
								></div>
							</div>
						</div>
						<p class="mt-4 text-sm text-gray-400">Analyzing connection quality...</p>
					{:else if maxSpeedReached}
						<div class="mt-6 flex justify-center space-x-4">
							<div class="glass rounded-full px-4 py-2">
								<span class="text-sm font-medium text-green-400">✓ Test Complete</span>
							</div>
							<div class="glass rounded-full px-4 py-2">
								<span class="text-sm font-medium text-blue-400"
									>Peak: {peakSpeed.toFixed(1)} Mbps</span
								>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Modern Router/Modem Visual -->
			<div class="relative mt-12 flex items-center justify-center">
				<div class="glass relative h-16 w-24 overflow-hidden rounded-2xl">
					<!-- Router body gradient -->
					<div
						class="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
					></div>

					<!-- Connection cables -->
					<div
						class="absolute -left-8 top-1/2 h-2 w-8 -translate-y-1/2 transform rounded-l-full bg-gradient-to-r from-slate-500 to-slate-600"
					></div>
					<div
						class="absolute -right-8 top-1/2 h-2 w-8 -translate-y-1/2 transform rounded-r-full bg-gradient-to-l from-slate-500 to-slate-600"
					></div>

					<!-- Antennas -->
					<div
						class="absolute -top-8 left-3 h-8 w-1 rounded-t-full bg-gradient-to-t from-slate-600 to-slate-400"
					></div>
					<div
						class="absolute -top-10 right-3 h-10 w-1 rounded-t-full bg-gradient-to-t from-slate-600 to-slate-400"
					></div>

					<!-- Status lights -->
					<div class="absolute left-1/2 top-2 flex -translate-x-1/2 transform space-x-1">
						<div
							class="h-2 w-2 rounded-full {isTestRunning
								? 'animate-pulse bg-green-400'
								: maxSpeedReached
									? 'bg-blue-400'
									: 'bg-yellow-400'}"
						></div>
						<div
							class="h-2 w-2 rounded-full {maxSpeedReached ? 'bg-green-400' : 'bg-gray-500'}"
						></div>
					</div>

					<!-- Signal waves animation -->
					{#if isTestRunning}
						<div class="absolute -top-4 left-1/2 -translate-x-1/2 transform">
							<div
								class="h-8 w-8 animate-ping rounded-full border-2 border-green-400 opacity-30"
							></div>
							<div
								class="absolute left-1 top-1 h-6 w-6 animate-ping rounded-full border-2 border-blue-400 opacity-50"
								style="animation-delay: 0.5s"
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Modern Footer -->
	<footer class="relative z-10 mt-2">
		<div class="glass mx-4 mb-4 rounded-2xl p-8">
			<div class="mx-auto max-w-4xl">
				<!-- Social Links -->
				<div class="mb-8 flex flex-wrap justify-center gap-6">
					<a
						href="https://github.com/Amjad-722"
						target="_blank"
						rel="noopener noreferrer"
						class="glass group flex items-center space-x-3 rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 transition-transform group-hover:scale-110"
						>
							<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
								/>
							</svg>
						</div>
						<div class="text-left">
							<div class="font-medium text-white group-hover:text-gray-200">GitHub</div>
							<div class="text-sm text-gray-400">View Source Code</div>
						</div>
					</a>

					<a
						href="https://www.linkedin.com/in/amjadali72/"
						target="_blank"
						rel="noopener noreferrer"
						class="glass group flex items-center space-x-3 rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 transition-transform group-hover:scale-110"
						>
							<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
								/>
							</svg>
						</div>
						<div class="text-left">
							<div class="font-medium text-white group-hover:text-blue-300">LinkedIn</div>
							<div class="text-sm text-gray-400">Professional Profile</div>
						</div>
					</a>

					<a
						href="https://www.upwork.com/freelancers/~01c4136c175ff03b3a"
						target="_blank"
						rel="noopener noreferrer"
						class="glass group flex items-center space-x-3 rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-800 transition-transform group-hover:scale-110"
						>
							<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3.012-2.439-5.463-5.439-5.463z"
								/>
							</svg>
						</div>
						<div class="text-left">
							<div class="font-medium text-white group-hover:text-green-300">Upwork</div>
							<div class="text-sm text-gray-400">Freelance Services</div>
						</div>
					</a>

					
				</div>

				<!-- Copyright -->
				<div class="border-t border-white/10 pt-6 text-center">
					<p class="text-sm text-gray-400">
						© 2025 <span class="gradient-text font-semibold">SpeedTest Pro</span>
					</p>
					<p class="mt-1 text-xs text-gray-500">Built with ❤️ using SvelteKit & Tailwind CSS</p>
				</div>
			</div>
		</div>
	</footer>
</div>
