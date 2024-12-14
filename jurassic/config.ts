// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: config.ipynb

import { z } from "zod";
import path from "node:path";
const configSchema: z.Schema = z.object({
  configPath: z.string(),
  nbsPath: z.string().default("."),
  outputPath: z.string().default("."),
  docsInputPath: z.string().default("."),
  docsOutputPath: z.string().default("."),
  vitepress: z.object({
    title: z.string(),
    description: z.string(),
    base: z.string(),
    themeConfig: z.object({
      nav: z.array(
        z.object({
          text: z.string(),
          link: z.string(),
        }),
      ),
      search: z.object({
        provider: z.string(),
      }),
      sidebar: z.array(
        z.object({
          text: z.string(),
          items: z.array(
            z.object({
              text: z.string(),
              link: z.string(),
            }),
          ),
        }),
      ),
      socialLinks: z.array(
        z.object({
          icon: z.string(),
          link: z.string(),
        }),
      ),
    }),
  }),
});

export type Config = z.infer<typeof configSchema>;
const findConfig = async (
  dir: string = Deno.cwd(),
  d = 0,
  config = "jurassic.json",
  maxD = 10,
): Promise<string> => {
  if (d >= maxD) throw new Error("max depth reached");

  try {
    const f = path.join(dir, config);
    await Deno.lstat(f);
    return f;
  } catch {
    return findConfig(path.join(dir, "../"), d + 1);
  }
};
export const getTestConfig = (baseDir: string): Config =>
  configSchema.parse({
    configPath: path.resolve(baseDir, "jurassic.json"),
    nbsPath: path.resolve(baseDir, "nbs"),
    outputPath: path.resolve(baseDir, "jurassic"),
    docsInputPath: path.resolve(baseDir, "docs"),
    docsOutputPath: path.resolve(baseDir, "_docs"),
    vitepress: {
      title: "Jurassic",
      description: "Jurassic docs",
      base: "/jurassic/",
      themeConfig: {
        nav: [{ text: "Home", link: "/" }],
        search: {
          provider: "local",
        },
        sidebar: [],
        socialLinks: [
          { icon: "github", link: "https://github.com/callmephilip/jurassic" },
        ],
      },
    },
  });
export const getConfig = async (): Promise<Config> => {
  const cf = await findConfig();
  const dcf = path.dirname(cf);
  const c = configSchema.parse(
    Object.assign({ configPath: cf }, JSON.parse(await Deno.readTextFile(cf))),
  );
  c.nbsPath = path.join(dcf, c.nbsPath);
  c.outputPath = path.join(dcf, c.outputPath);
  c.docsInputPath = path.join(dcf, c.docsInputPath);
  c.docsOutputPath = path.join(dcf, c.docsOutputPath);
  return c;
};
