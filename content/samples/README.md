# Shared code samples

Every code block that appears in more than one place lives here as a real file,
and is pulled into MDX with fumadocs' include tag:

```mdx
<include cwd lang="bash">content/samples/verify-credentials.sh</include>
```

`cwd` resolves the path from the repository root, so the same line works from
`content/docs/`, `content/guides/` or anywhere else. The include is expanded at
build time into an ordinary fenced code block, which means it is syntax
highlighted on the page *and* present in the `.md` and `llms.txt` views — unlike
a React component, which would leave the code out of them.

Add `meta` to give the block a filename tab:

```mdx
<include cwd lang="json" meta='title="send-invoice.json"'>content/samples/send-invoice.json</include>
```

`bun run lint:guides` fails on a sample nothing includes, so this directory
cannot quietly accumulate dead files.
