<script>
	import { Camera, Github, Linkedin, MessageCircleHeart ,} from '@lucide/svelte';
	const socialLinks = [
		{
			name: 'Github',
			url: 'https://github.com/Amjad-722',
			icon: Github
		},
		{
			name: 'LinkedIn',
			url: 'https://www.linkedin.com/in/amjadali72/',
			icon: Linkedin
		},{
			name: 'Upwork',
			url: 'https://www.upwork.com/freelancers/~01c4136c175ff03b3a',
			icon: MessageCircleHeart
		}
	];
</script>

<footer class="relative z-10 mt-2">
	<div class="glass mx-4 mb-4 rounded-2xl p-8">
		<div class="mx-auto flex max-w-4xl flex-row items-center justify-between space-x-2">
			{#each socialLinks as item}
				<a
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					class="glass group flex items-center space-x-3 rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 transition-transform group-hover:scale-110"
					>
						<svelte:component this={item.icon} size={24} class="text-white" />
					</div>

					<div class="font-medium gradient-text group-hover:text-gray-200">{item.name}</div>
				</a>
			{/each}
		</div>
	</div>
</footer>
