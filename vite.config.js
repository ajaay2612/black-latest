import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { threlteStudio } from '@threlte/studio/vite'

export default defineConfig({
	plugins: [
		threlteStudio(),
		tailwindcss(),
		sveltekit()
	]
});
