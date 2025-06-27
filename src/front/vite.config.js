import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],

	server: {
		host: '0.0.0.0', // Necesario para Render
		port: Number(process.env.PORT) || 5173,
		fs: {
			allow: [
				path.resolve(__dirname, '.'),
				path.resolve(__dirname, '../..')
			]
		}
	},

	build: {
		// ✅ Reduce el uso de memoria
		sourcemap: false,
		minify: 'esbuild', // más rápido y ligero que terser
		manifest: false,
		// ✅ Limita el tamaño de chunks para evitar cuellos de botella
		rollupOptions: {
			output: {
				inlineDynamicImports: true,
				manualChunks: undefined
			}
		},
		// Reduce trabajo de Vite
		emptyOutDir: true
	},

	optimizeDeps: {
		// ✅ Mejora precálculo de dependencias (ajústalo según tus libs)
		exclude: ['highcharts']
	}
});