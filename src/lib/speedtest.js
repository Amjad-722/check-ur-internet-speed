
export class SpeedTest {
	constructor() {
		this.isRunning = false;
		this.abortController = null;
	}

	
	async testLatency() {
		const measurements = [];
		const testUrl = 'https://www.google.com/favicon.ico';
		
		for (let i = 0; i < 5; i++) {
			try {
				const start = performance.now();
				await fetch(testUrl, { 
					method: 'HEAD', 
					cache: 'no-cache',
					mode: 'no-cors'
				});
				const end = performance.now();
				measurements.push(end - start);
			} catch (error) {
				console.warn('Ping test failed:', error);
			}
		}
		
		if (measurements.length === 0) return 0;
		
		measurements.sort((a, b) => a - b);
		return Math.round(measurements[Math.floor(measurements.length / 2)]);
	}

	
	async testDownload(onProgress = () => {}, duration = 10000) {
		this.abortController = new AbortController();
		const signal = this.abortController.signal;
		
		const testUrls = [
			'https://speed.cloudflare.com/__down?bytes=10000000',  // 10MB
			'https://speed.cloudflare.com/__down?bytes=25000000',  // 25MB
			'https://speed.cloudflare.com/__down?bytes=50000000',  // 50MB
		];
		
		let totalBytes = 0;
		const startTime = performance.now();
		let lastUpdate = startTime;
		
		const timeout = setTimeout(() => {
			this.abortController?.abort();
		}, duration);
		
		try {
			const downloadPromises = testUrls.map(async (url) => {
				try {
					const response = await fetch(url, { 
						signal,
						cache: 'no-cache'
					});
					
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					
					const reader = response.body?.getReader();
					if (!reader) return;
					
					while (true) {
						const { done, value } = await reader.read();
						if (done || signal.aborted) break;
						
						totalBytes += value?.length || 0;
						
						const now = performance.now();
						if (now - lastUpdate > 100) { 
							const elapsed = now - startTime;
							const speedMbps = (totalBytes * 8) / (elapsed * 1000);
							onProgress(speedMbps);
							lastUpdate = now;
						}
					}
					
					reader.releaseLock();
				} catch (error) {
					if (!signal.aborted) {
						console.warn('Download stream error:', error);
					}
				}
			});
			
			await Promise.allSettled(downloadPromises);
		} finally {
			clearTimeout(timeout);
		}
		
		const totalTime = performance.now() - startTime;
		const finalSpeedMbps = (totalBytes * 8) / (totalTime * 1000);
		
		return Math.max(0, finalSpeedMbps);
	}

	
	async testUpload(onProgress = () => {}, duration = 10000) {
		this.abortController = new AbortController();
		const signal = this.abortController.signal;
		
		const chunkSize = 1024 * 1024; 
		const testData = new Uint8Array(chunkSize);
		
		crypto.getRandomValues(testData);
		
		let totalBytes = 0;
		const startTime = performance.now();
		let lastUpdate = startTime;
		
		const timeout = setTimeout(() => {
			this.abortController?.abort();
		}, duration);
		
		try {
			
			const uploadPromises = Array(3).fill(0).map(async () => {
				while (!signal.aborted) {
					try {
						const formData = new FormData();
						formData.append('data', new Blob([testData]));
						
						await fetch('https://httpbin.org/post', {
							method: 'POST',
							body: formData,
							signal,
							cache: 'no-cache'
						});
						
						totalBytes += chunkSize;
						
						const now = performance.now();
						if (now - lastUpdate > 100) {
							const elapsed = now - startTime;
							const speedMbps = (totalBytes * 8) / (elapsed * 1000);
							onProgress(speedMbps);
							lastUpdate = now;
						}
					} catch (error) {
						if (!signal.aborted) {
							console.warn('Upload error:', error);
						}
						break;
					}
				}
			});
			
			await Promise.allSettled(uploadPromises);
		} finally {
			clearTimeout(timeout);
		}
		
		const totalTime = performance.now() - startTime;
		const finalSpeedMbps = (totalBytes * 8) / (totalTime * 1000);
		
		return Math.max(0, finalSpeedMbps);
	}

	stop() {
		if (this.abortController) {
			this.abortController.abort();
		}
		this.isRunning = false;
	}

	
	
}