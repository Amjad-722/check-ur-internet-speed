# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
```<!-- <div class="relative flex flex-col items-center justify-center">
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
		</div> -->