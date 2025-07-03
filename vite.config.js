import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { threlteStudio } from '@threlte/studio/vite'

export default defineConfig({
	plugins: [
		threlteStudio(),
		tailwindcss(),
		sveltekit()
	],
	ssr: {
		noExternal: ['@dimforge/rapier3d-compat', '@threlte/rapier']
	},
	optimizeDeps: {
		exclude: ['@dimforge/rapier3d-compat']
	}
});
