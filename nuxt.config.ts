// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	extends: ['@nuxt/ui-pro'],

	modules: [
		'@nuxt/eslint',
		'@nuxt/content',
		'@nuxt/ui',
		'@nuxtjs/tailwindcss',
		'@nuxt/scripts',
		'@nuxtjs/seo',
		'@vueuse/nuxt',
		'nuxt-posthog',
	],

	devtools: {
		enabled: true,
	},

	app: {
		baseURL: '/docs/',
	},

	site: {
		url: 'https://directus.io',
		name: 'Directus Docs',
		description: 'Explore our resources and powerful data engine to build your projects confidently.',
		defaultLocale: 'en',
	},

	content: {
		highlight: {
			theme: {
				default: 'github-light',
				light: 'github-light',
				dark: 'github-dark',
			},
			langs: [
				'bash',
				'cpp',
				'css',
				'dart',
				'diff',
				'dockerfile',
				'graphql',
				'groovy',
				'html',
				'http',
				'ini',
				'java',
				'jinja',
				'js',
				'json',
				'jsx',
				'kotlin',
				'liquid',
				'liquid',
				'md',
				'mdc',
				'nginx',
				'php',
				'python',
				'scss',
				'shell',
				'svelte',
				'swift',
				'ts',
				'tsx',
				'vue',
				'xml',
				'yaml',
			],
		},
		markdown: {
			toc: {
				depth: 1,
			},
		},
	},

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-01',

	nitro: {
		// Nitro will detect the environment and be "smart" about how to change the output settings to
		// make deploying "seamless". That being said, it will fail dramatically on Netlify if you're
		// using a non-root baseURL. See https://github.com/nitrojs/nitro/issues/1484 The workaround
		// is to enforce the same 'preset' to be used everywhere. Nitro's default preset is
		// `node_server`.
		preset: 'node_server',
		output: {
			publicDir: '.output/public/docs',
		},
		prerender: {
			routes: [
				'/',
			],
			crawlLinks: true,

			// TODO
			// This is a dirty hack to get around a build blocking error..
			// I can't for the life of me figure out where this magic </span link comes from
			// ~ Rijk 12/19/2024
			ignore: ['/docs/api/</span'],
		},
	},

	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
			},
		},
	},

	icon: {
		customCollections: [
			{
				prefix: 'directus',
				dir: './app/assets/icons/products',
			},
		],
		clientBundle: {
			scan: true,
			includeCustomCollections: true,
		},
	},

	robots: {
		robotsTxt: false,
	},
});
