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
                    const isStable = recentSpeeds.every(s => Math.abs(s - avgSpeed) <= SPEED_VARIANCE_THRESHOLD);
                    
                    if (isStable && avgSpeed > 1) { // Only consider stable if speed is reasonable
                        stableSpeedCount++;
                        if (stableSpeedCount >= 3) { // 3 consecutive stable readings
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

<div class="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
	<Navbar onRefresh={refreshTest}/>
    <div class="flex flex-2 items-center justify-center p-8">
        <div class="relative items-center justify-center flex flex-col">
            {#if maxSpeedReached}
                    <div class="mb-4">
                        <h1 class="text-white text-3xl font-bold ">Your Internet speed is</h1>
                    </div>
                    {/if}
            <div class="rounded-3xl border border-gray-700 bg-black/50 p-12 shadow-2xl shadow-green-500/20 backdrop-blur-sm">
                <div class="text-center">
                    
                    <div class="text-8xl font-light {maxSpeedReached ? 'text-white' : 'text-green-400'} mb-4 tracking-tight">
                        {currentSpeed.toFixed(1)}
                    </div>
                    <!-- Speed Unit -->
                    <div class="text-3xl font-light text-gray-300">{speedUnit}</div>
                    
                    
                        
                        
                    {#if isTestRunning}
                        <div class="mt-6 flex justify-center">
                            <div class="flex animate-pulse space-x-1">
                                <div class="h-2 w-2 animate-bounce rounded-full bg-green-400"></div>
                                <div class="h-2 w-2 animate-bounce rounded-full bg-green-400" style="animation-delay: 0.1s"></div>
                                <div class="h-2 w-2 animate-bounce rounded-full bg-green-400" style="animation-delay: 0.2s"></div>
                            </div>
                        </div>
                       
                    
                    {/if}
                </div>
            </div>
            
            <div class="absolute inset-0 -z-10 rounded-3xl bg-green-400/10 blur-xl"></div>
            
            <!-- Router/Modem Visual -->
            <div class="relative flex items-center justify-center bg-gray-700 w-20 rounded-t-2xl drop-shadow-2xl h-56 shadow-2xl shadow-green-500/20 backdrop-blur-sm">
                <div class="absolute -ml-2 -left-28 top-12 h-6 w-30 translate-y-1/2 transform rounded-l-full bg-gray-600 shadow-lg shadow-green-500/20"></div>
                <div class="absolute -right-30 top-12 h-6 w-30 translate-y-1/2 transform rounded-r-full bg-gray-600 shadow-lg shadow-green-500/20"></div>
                <div class="absolute left-2 bottom-0 h-16 w-6 translate-y-16 transform rounded-b-full bg-gray-600 shadow-lg shadow-green-500/20"></div>
                <div class="absolute right-2 bottom-0 h-16 w-6 translate-y-16 transform rounded-b-full bg-gray-600 shadow-lg shadow-green-500/20"></div>
                
                <!-- Status indicator -->
                <div class="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div class="w-3 h-3 rounded-full {isTestRunning ? 'bg-green-400 animate-pulse' : maxSpeedReached ? 'bg-gray-500' : 'bg-blue-400'}"></div>
                </div>
            </div>
        </div>
    </div>

    <footer class="border-t border-gray-800 p-8">
        <div class="mx-auto max-w-4xl">
            <div class="flex justify-center space-x-8">
                <a href="https://github.com/Amjad-722" target="_blank" rel="noopener noreferrer" class="group flex items-center space-x-2 text-gray-400 transition-colors hover:text-white">
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span class="group-hover:underline">GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/amjadali72/" target="_blank" rel="noopener noreferrer" class="group flex items-center space-x-2 text-gray-400 transition-colors hover:text-blue-400">
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span class="group-hover:underline">LinkedIn</span>
                </a>
                <a href="https://www.upwork.com/freelancers/~01c4136c175ff03b3a" target="_blank" rel="noopener noreferrer" class="group flex items-center space-x-2 text-gray-400 transition-colors hover:text-green-400">
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3.012-2.439-5.463-5.439-5.463z"/>
                    </svg>
                    <span class="group-hover:underline">Upwork</span>
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" class="group flex items-center space-x-2 text-gray-400 transition-colors hover:text-indigo-400">
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    <span class="group-hover:underline">Discord</span>
                </a>
            </div>
            <div class="mt-6 text-center text-sm text-gray-500">
                © 2025 Speed Test. Built with SvelteKit & Tailwind CSS
            </div>
        </div>
    </footer>
</div>
