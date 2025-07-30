<script>
	import Footer from '$lib/components/footer.svelte';
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
	const STABLE_SPEED_THRESHOLD = 3; 
	const SPEED_VARIANCE_THRESHOLD = 0.5; 

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
				
				speedHistory = [...speedHistory.slice(-10), speed]; 

				
				if (speed > peakSpeed) {
					peakSpeed = speed;
				}

			
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
						stableSpeedCount++;
						if (stableSpeedCount >= 3) {
							maxSpeedReached = true;
							stopTest();
							return;
						}
					} else {
						stableSpeedCount = 0;
					}
				}

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

			<div
				class="glass relative overflow-hidden rounded-3xl p-12 shadow-2xl backdrop-blur-sm pulse-glow "
			>
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
		</div>
	</div>
<Footer/>
</div>
