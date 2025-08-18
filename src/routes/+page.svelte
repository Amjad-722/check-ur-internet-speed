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

				if (speedHistory.length >= STABLE_SPEED_THRESHOLD) {				// Check for stable maximum speed (real maximum detection)

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


	<Navbar onRefresh={refreshTest} />

	<div class="relative z-10 flex flex-1 items-center justify-center w-full">
		<div class="flex flex-1 items-center justify-center w-full">
    <div
      class={`mb-4 font-serif font-extrabold tracking-tight 
        text-[300vw] md:text-[15vw] 
        ${maxSpeedReached ? 'gradient-text' : 'text-green-400'}`}
    >
      {currentSpeed.toFixed(1)}
    </div>
  </div>

		
	</div>
	<Footer />
</div>
