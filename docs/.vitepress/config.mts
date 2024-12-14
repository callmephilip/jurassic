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
        { "text": "Helpers", "link": "/utils" },
        { "text": "Hello", "link": "/submodule/hello" },
        { "text": "Docs", "link": "/docs" },
        { "text": "Locate and Parse notebooks", "link": "/notebooks" },
        { "text": "Configuration", "link": "/config" },
        { "text": "Export", "link": "/export" },
      ],
    }],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
