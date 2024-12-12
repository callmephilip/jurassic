import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jurassic",
  description: "Jurassic docs",
  base: "/jurassic/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
    ],

    search: {
      provider: "local",
    },

    sidebar: [{
      text: "Docs",
      items: [
        { "text": "docs.ipynb", "link": "/docs" },
        { "text": "utils.ipynb", "link": "/utils" },
        { "text": "config.ipynb", "link": "/config" },
        { "text": "export.ipynb", "link": "/export" },
        { "text": "notebooks.ipynb", "link": "/notebooks" },
        { "text": "submodule/hello.ipynb", "link": "/submodule/hello" },
      ],
    }],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
