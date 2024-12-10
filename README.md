# jurassic

🦕 🔭 Shameless nbdev clone for Deno. WIP

## Limitations 

- cannot get `jupyter execute --kernel_name=deno ./nbs/export.ipynb` to run; it does work for a simple hello module that does not have any visual stuff. is the issue with `Jupyter.display`? 

```
[NbClientApp] Executing ./nbs/export.ipynb
Warning "deno jupyter" is unstable and might change in the future.
[NbClientApp] Executing notebook with kernel: deno
Traceback (most recent call last):
  File "/Users/philip/Library/Application Support/pypoetry/venv/bin/jupyter-execute", line 10, in <module>
    sys.exit(main())
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/jupyter_core/application.py", line 283, in launch_instance
    super().launch_instance(argv=argv, **kwargs)
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/traitlets/config/application.py", line 1074, in launch_instance
    app.initialize(argv)
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/traitlets/config/application.py", line 118, in inner
    return method(app, *args, **kwargs)
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/cli.py", line 161, in initialize
    self.run_notebook(path)
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/cli.py", line 215, in run_notebook
    client.execute()
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/jupyter_core/utils/__init__.py", line 165, in wrapped
    return loop.run_until_complete(inner)
  File "/Users/philip/miniforge3/lib/python3.10/asyncio/base_events.py", line 649, in run_until_complete
    return future.result()
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/client.py", line 709, in async_execute
    await self.async_execute_cell(
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/client.py", line 1005, in async_execute_cell
    exec_reply = await self.task_poll_for_reply
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/client.py", line 787, in _async_poll_for_reply
    await asyncio.wait_for(task_poll_output_msg, self.iopub_timeout)
  File "/Users/philip/miniforge3/lib/python3.10/asyncio/tasks.py", line 445, in wait_for
    return fut.result()
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/client.py", line 817, in _async_poll_output_msg
    self.process_message(msg, cell, cell_index)
  File "/Users/philip/Library/Application Support/pypoetry/venv/lib/python3.10/site-packages/nbclient/client.py", line 1103, in process_message
    display_id = content.get("transient", {}).get("display_id", None)
AttributeError: 'NoneType' object has no attribute 'get'
```

- failing tests in cells do not generate errors

```ts
import { assertEquals } from "jsr:@std/assert/equals";

Deno.test("foo", () => {
  assertEquals(1, 2)
})
```