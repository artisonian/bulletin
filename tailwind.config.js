const production = !process.env.ROLLUP_WATCH;

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    content: ["./src/**/*.svelte", "./public/index.html"],
    enabled: production,
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
