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
		// Here you would implement actual language switching logic
		console.log('Language changed to:', lang.name);
	}

	function toggleLanguageDropdown() {
		isLanguageDropdownOpen = !isLanguageDropdownOpen;
	}

	function refreshTest() {
		onRefresh();
	}
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-gray-800/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo Section -->
			<div class="flex items-center space-x-3">
				<div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
					</svg>
				</div>
				<div class="text-white font-semibold text-lg">SpeedTest</div>
			</div>

			<!-- Right Section -->
			<div class="flex items-center space-x-4">
				<!-- Refresh Button -->
				<button 
					onclick={refreshTest}
					class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
					</svg>
					<span class="hidden sm:inline">Test Again</span>
				</button>

				<!-- Language Selector -->
				<div class="relative">
					<button
						onclick={toggleLanguageDropdown}
						class="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 border border-gray-700/50"
					>
						<span class="text-lg">{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
						<span class="hidden sm:inline">{currentLanguage}</span>
						<svg class="w-4 h-4 transition-transform duration-200 {isLanguageDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					<!-- Language Dropdown -->
					{#if isLanguageDropdownOpen}
						<div class="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/50 py-2 z-50">
							{#each languages as lang}
								<button
									onclick={() => selectLanguage(lang)}
									class="w-full px-4 py-2 text-left hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors duration-150 flex items-center space-x-3"
								>
									<span class="text-lg">{lang.flag}</span>
									<div class="flex flex-col">
										<span class="text-sm font-medium">{lang.name}</span>
										<span class="text-xs text-gray-500">{lang.code}</span>
									</div>
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
		onclick={() => isLanguageDropdownOpen = false}
	></div>
{/if}