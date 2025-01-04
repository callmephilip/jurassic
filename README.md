<div align="center">

<img width=200 src="./docs/public/jurassic.jpeg">

# Jurassic

**Build and ship software in Jupyter notebooks using Deno**

[Docs](https://callmephilip.com/jurassic) • [Getting started](#getting-started)

</div>

Jurassic lets you write and ship software in Jupyter notebooks using Deno. It's
inspired by [nbdev](https://nbdev.fast.ai/) and is made possible by
[Deno Jupyter kernel](https://docs.deno.com/runtime/reference/cli/jupyter/).

# Get started

Make sure you have
[Deno installed](https://docs.deno.com/runtime/getting_started/installation/) on
your machine. You will also need
[Deno jupyter runtime](https://docs.deno.com/runtime/reference/cli/jupyter/#quickstart).

Run the following command to bootstrap a project (feel free to change
`hellojurassic` to something more appropriate)

```bash
deno run --reload -R -W -N --allow-run jsr:@jurassic/jurassic/init hellojurassic
```

Head to your newly created project directory and let's take a look around

```bash
cd hellojurassic
```

Your project should look something like this:

```
.
├── app.test.ts
├── mod.ts
├── nbs
│   └── app.ipynb
├── hellojurassic
│   └── app.ts
├── _docs
│   ├── .vitepress
│   │   └── config.mts
│   ├── public
│   │   └── logo.png
│   ├── app.md
│   ├── package.json
│   ├── index.md
│   └── get-started.md
├── docs
│   ├── public
│   │   └── logo.png
│   ├── package.json
│   ├── index.md
│   └── get-started.md
├── deno.json
├── deno.lock
├── jurassic.json
├── .gitignore
└── .github
    └── workflows
        ├── publish.yml
        └── pr.yml
```

Here's a quick overview of different parts of the project

| Entry              | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| .github/workflows/ | GH actions for building, testing and documenting your project                      |
| docs               | Additional content and static files for documentation                              |
| hellojurassic/     | Project typescript module - these files are automatically generated from notebooks |
| nbs                | Notebooks containing application code and documentation                            |
| app.test.ts        | Application unit tests                                                             |
| jurassic.json      | Jurassic project configuration file                                                |
| mod.ts             | Main module entry point for your application                                       |

Head to `mod.ts` and let's replace `export * from "./hellojurassic/app.ts";`
with the following

```ts
import { app } from "./hellojurassic/app.ts";

app();
```

You can now run your app using

```bash
deno run ./mod.ts
```

Let's modify the app and rerun it:

- open `nbs/app.ipynb` notebook using your preferred notebook editor
- make sure `deno` kernel is selected
- locate application code cell

```ts
//| export

export const app = () => {
  console.log("Hello, World!");
};
```

- let's change this to be

```ts
//| export

export const app = () => {
  console.log("Hey!");
};
```

- save your notebook and rebuild your app

```bash
deno task build
```

- and rerun it using

```bash
deno run ./mod.ts
```

# Moving beyond Hello world

There are 2 apps that are built using Jurassic that you can look at for
inspiration:

- [Jurassic](https://github.com/callmephilip/jurassic) itself is built using
  Jurassic
- [bsky2md](https://github.com/callmephilip/bsky2md) is a Hono based web app
  integrating with Bluesky API, it converts Bluesky threads into markdown files;
  you can see it in action [here](https://bsky2md.deno.dev)
