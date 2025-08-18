<script>
	let { onRefresh = () => {} } = $props();
	let currentLanguage = $state('EN');
	let isLanguageDropdownOpen = $state(false);

	const languages = [
		{ code: 'EN', name: 'English', flag: '🇺🇸' },
		{ code: 'ES', name: 'Español', flag: '🇪🇸' },
		{ code: 'FR', name: 'Français', flag: '🇫🇷' },
		{ code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
		{ code: 'AR', name: 'العربية', flag: '🇸🇦' }
	];

	function selectLanguage(lang) {
		currentLanguage = lang.code;
		isLanguageDropdownOpen = false;
		console.log('Language changed to:', lang.name);
	}

	function toggleLanguageDropdown() {
		isLanguageDropdownOpen = !isLanguageDropdownOpen;
	}

	function refreshTest() {
		onRefresh();
	}
</script>


<nav class="glass fixed left-0 right-0 top-0 z-50 border-b border-white/10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="h-16 flex items-center justify-between">
			<!-- Enhanced Logo Section -->
			<div class="group flex cursor-pointer items-center space-x-4">
				<div class="relative">
					<!-- Logo background with glow effect -->
					<div
						class="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 opacity-75 blur-sm transition-opacity group-hover:opacity-100"
					></div>
					<div
						class="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-105"
					>
						<!-- Speed/Lightning icon -->
						<svg
							class="h-7 w-7 text-white drop-shadow-sm"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							></path>
						</svg>
						<!-- Pulse ring animation -->
						<div
							class="absolute inset-0 animate-ping rounded-xl bg-gradient-to-br from-green-400 to-blue-500 opacity-20"
						></div>
					</div>
				</div>
				<div class="flex flex-col">
					<div class="gradient-text text-xl font-bold tracking-tight">SpeedTest</div>
				</div>
			</div>

			<!-- Enhanced Right Section -->
			<div class="flex items-center space-x-3">
				<!-- Modern Refresh Button -->
				<button
					onclick={refreshTest}
					class="glass group relative flex items-center space-x-2 overflow-hidden rounded-xl border border-green-500/30 px-5 py-2.5 transition-all duration-300 hover:border-green-400/50 hover:bg-white/10"
				>
					<!-- Button background gradient -->
					<div
						class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>

					<div class="relative flex items-center space-x-2">
						<div
							class="rounded-lg bg-gradient-to-br from-green-400 to-green-600 p-1 transition-transform duration-200 group-hover:scale-110"
						>
							<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								></path>
							</svg>
						</div>
						<span
							class="hidden font-medium text-white transition-colors group-hover:text-green-300 sm:inline"
							>Test Again</span
						>
					</div>
				</button>

				<!-- Enhanced Language Selector -->
				<div class="relative">
					<button
						onclick={toggleLanguageDropdown}
						class="glass group flex items-center space-x-3 rounded-xl border border-white/20 px-4 py-2.5 transition-all duration-300 hover:border-white/30 hover:bg-white/10"
					>
						<div class="flex items-center space-x-2">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 transition-transform group-hover:scale-105"
							>
								<span class="text-lg"
									>{languages.find((lang) => lang.code === currentLanguage)?.flag}</span
								>
							</div>
							<div class="hidden flex-col items-start sm:flex">
								<span class="text-sm font-medium text-white">{currentLanguage}</span>
								<span class="text-xs text-gray-400">Language</span>
							</div>
						</div>
						<svg
							class="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-white {isLanguageDropdownOpen
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</button>

					<!-- Enhanced Language Dropdown -->
					{#if isLanguageDropdownOpen}
						<div
							class="glass absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-white/20 py-3 shadow-2xl transform transition-all duration-200 opacity-100 scale-100"
						>
							<div class="mb-2 border-b border-white/10 px-4 py-2">
								<h3 class="text-sm font-semibold text-white">Select Language</h3>
								<p class="text-xs text-gray-400">Choose your preferred language</p>
							</div>

							{#each languages as lang}
								<button
									onclick={() => selectLanguage(lang)}
									class="group flex w-full items-center space-x-3 px-4 py-2 text-left transition-all duration-200 hover:bg-white/10 {currentLanguage ===
									lang.code
										? 'border-l-2 border-green-400 bg-white/5'
										: ''}"
								>
									<div
										class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 transition-transform group-hover:scale-105"
									>
										<span class="text-xl">{lang.flag}</span>
									</div>
									<div class="flex flex-1 flex-col">
										<span
											class="text-sm font-medium text-white transition-colors group-hover:text-green-300"
											>{lang.name}</span
										>
										<span class="text-xs text-gray-400">{lang.code}</span>
									</div>
									{#if currentLanguage === lang.code}
										<div class="h-2 w-2 rounded-full bg-green-400"></div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</nav>

<!-- Click outside to close dropdown -->
{#if isLanguageDropdownOpen}
	<div 
		class="fixed inset-0 z-40" 
		role="button"
		tabindex="0"
		aria-label="Close language dropdown"
		onclick={() => (isLanguageDropdownOpen = false)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				isLanguageDropdownOpen = false;
			}
		}}
	></div>
{/if}
