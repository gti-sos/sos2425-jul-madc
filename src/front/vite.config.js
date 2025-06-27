import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

console.log("SE esta ejecutando o no el vite!!!!!!!!");
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0', // Requerido por Render
		port: Number(process.env.PORT) || 5173, // Usa el puerto dinámico asignado por Render
		fs: {
			allow: [
				path.resolve(__dirname, '.'),
				path.resolve(__dirname, '../..')
			]
		}
	}
});
