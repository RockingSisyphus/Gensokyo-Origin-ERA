Configuring Codex   
Learn how to configure your local Codex client   

Codex CLI  
Codex IDE Extension  
Codex should work out of the box for most users. But sometimes you want to configure Codex to your own liking to better suit your needs. For this there is a wide range of configuration options.  

Codex configuration file  

The configuration file for Codex is located at ~/.codex/config.toml.  

To access the configuration file when you are using the Codex IDE extension, you can click the gear icon in the top right corner of the extension and then clicking Codex Settings > Open config.toml.  

This configuration file is shared between the CLI and the IDE extension and can be used to configure things like the default model, approval policies, sandbox settings or MCP servers that Codex should have access to.  

High level configuration options  

Codex provides a wide range of configuration options. Some of the most commonly changed settings are:  

Default model  

Pick which model Codex uses by default in both the CLI and IDE.  

Using config.toml:  使用 config.toml ：

model = "gpt-5"
Using CLI arguments:  使用 CLI 参数：

codex --model gpt-5
Model provider  模型提供商

Select the backend provider referenced by the active model. Be sure to define the provider in your config first.
选择活动模型引用的后端提供程序。请务必先在配置中定义提供程序。

Using config.toml:  正在使用 config.toml :

model_provider = "ollama"
Using CLI arguments:  使用 CLI 参数：

codex --config model_provider="ollama"
Approval prompts  审批提示

Control when Codex pauses to ask before running generated commands.  

Using config.toml:  

approval_policy = "on-request"
Using CLI arguments:  

codex --ask-for-approval on-request
Sandbox level  

Adjust how much filesystem and network access Codex has while executing commands.  

Using config.toml:  使用 config.toml ：

sandbox_mode = "workspace-write"
Using CLI arguments:  使用 CLI 参数：

codex --sandbox workspace-write
Reasoning depth  

Tune how much reasoning effort the model applies when supported.  

Using config.toml:  正在使用 config.toml :

model_reasoning_effort = "high"
Using CLI arguments:  使用 CLI 参数：

codex --config model_reasoning_effort="high"
Command environment  

Restrict or expand which environment variables are forwarded to spawned commands.  

Using config.toml:  正在使用 config.toml :

[shell_environment_policy]
include_only = ["PATH", "HOME"]
Using CLI arguments:  使用 CLI 参数：

codex --config shell_environment_policy.include_only='["PATH","HOME"]'
You can also use profiles to switch between different configurations on the fly. Profiles currently apply to the Codex CLI: you can define multiple [profiles.<name>] blocks in config.toml, then launch with codex --profile my-profile to switch between completely different model, approval, or sandbox setups.  

Personalizing the Codex IDE extension  

Additionally to configuring the underlying Codex agent through your config.toml file, you can also configure the way you use the Codex IDE extension.  

To see the list of available configuration options, click the gear icon in the top right corner of the extension and then click IDE settings.  

To define your own keyboard shortcuts to trigger Codex or add something to the Codex context, you can click the gear icon in the top right corner of the extension and then click Keyboard shortcuts.  

Configuration options  
Filter by key, type, or details
Key  	Type / Values  	Details  
model	string	Model to use (e.g., `gpt-5-codex`).  
model_provider	string	Provider id from `model_providers` (default: `openai`).  
model_context_window	number	Context window tokens available to the active model.  
model_max_output_tokens	number	Maximum number of tokens Codex may request from the model.  
approval_policy	untrusted | on-failure | on-request | never	Controls when Codex pauses for approval before executing commands.  
sandbox_mode	read-only | workspace-write | danger-full-access	Sandbox policy for filesystem and network access during command execution.  
sandbox_workspace_write.writable_roots	array<string>	Additional writable roots when `sandbox_mode = "workspace-write"`.  
sandbox_workspace_write.network_access	boolean	Allow outbound network access inside the workspace-write sandbox.  
sandbox_workspace_write.exclude_tmpdir_env_var	boolean	Exclude `$TMPDIR` from writable roots in workspace-write mode.  
sandbox_workspace_write.exclude_slash_tmp	boolean	Exclude `/tmp` from writable roots in workspace-write mode.  
notify	array<string>	Command invoked for notifications; receives a JSON payload from Codex.  
instructions	string	Reserved for future use; prefer `experimental_instructions_file` or `AGENTS.md`.  
mcp_servers.<id>.command	string	Launcher command for an MCP stdio server.  
mcp_servers.<id>.args	array<string>	Arguments passed to the MCP stdio server command.  
mcp_servers.<id>.env	map<string,string>	Environment variables forwarded to the MCP stdio server.  
mcp_servers.<id>.env_vars	array<string>	Additional environment variables to whitelist for an MCP stdio server.  
mcp_servers.<id>.cwd	string	Working directory for the MCP stdio server process.  
mcp_servers.<id>.url	string	Endpoint for an MCP streamable HTTP server.  
mcp_servers.<id>.bearer_token_env_var	string	Environment variable sourcing the bearer token for an MCP HTTP server.  
mcp_servers.<id>.http_headers	map<string,string>	Static HTTP headers included with each MCP HTTP request.  
mcp_servers.<id>.env_http_headers	map<string,string>	HTTP headers populated from environment variables for an MCP HTTP server.  
mcp_servers.<id>.enabled	boolean	Disable an MCP server without removing its configuration.  
mcp_servers.<id>.startup_timeout_sec	number	Override the default 10s startup timeout for an MCP server.  
mcp_servers.<id>.tool_timeout_sec	number	Override the default 60s per-tool timeout for an MCP server.  
mcp_servers.<id>.enabled_tools	array<string>	Allow list of tool names exposed by the MCP server.  
mcp_servers.<id>.disabled_tools	array<string>	Deny list applied after `enabled_tools` for the MCP server.  
experimental_use_rmcp_client	boolean	Enable the experimental Rust MCP client (required for OAuth with HTTP servers).  
model_providers.<id>.name	string	Display name for a custom model provider.  
model_providers.<id>.base_url	string	API base URL for the model provider.  
model_providers.<id>.env_key	string	Environment variable supplying the provider API key.  
model_providers.<id>.wire_api	chat | responses	Protocol used by the provider (defaults to `chat` if omitted).  
model_providers.<id>.query_params	map<string,string>	Extra query parameters appended to provider requests.  
model_providers.<id>.http_headers	map<string,string>	Static HTTP headers added to provider requests.  
model_providers.<id>.env_http_headers	map<string,string>	HTTP headers populated from environment variables when present.  
model_providers.<id>.request_max_retries	number	Retry count for HTTP requests to the provider (default: 4).  
model_providers.<id>.stream_max_retries	number	Retry count for SSE streaming interruptions (default: 5).  
model_providers.<id>.stream_idle_timeout_ms	number	Idle timeout for SSE streams in milliseconds (default: 300000).  
model_reasoning_effort	minimal | low | medium | high	Adjust reasoning effort for supported models (Responses API only).  
model_reasoning_summary	auto | concise | detailed | none	Select reasoning summary detail or disable summaries entirely.  
model_verbosity	low | medium | high	Control GPT-5 Responses API verbosity (defaults to `medium`).  
model_supports_reasoning_summaries	boolean	Force Codex to send reasoning metadata even for unknown models.  
model_reasoning_summary_format	none | experimental	Override the format of reasoning summaries (experimental).  
shell_environment_policy.inherit	all | core | none	Baseline environment inheritance when spawning subprocesses.  
shell_environment_policy.ignore_default_excludes	boolean	Keep variables containing KEY/SECRET/TOKEN before other filters run.  
shell_environment_policy.exclude	array<string>	Glob patterns for removing environment variables after the defaults.  
shell_environment_policy.include_only	array<string>	Whitelist of patterns; when set only matching variables are kept.  
shell_environment_policy.set	map<string,string>	Explicit environment overrides injected into every subprocess.  
project_doc_max_bytes	number	Maximum bytes read from `AGENTS.md` when building project instructions.  
project_doc_fallback_filenames	array<string>	Additional filenames to try when `AGENTS.md` is missing.  
profile	string	Default profile applied at startup (equivalent to `--profile`).  
profiles.<name>.*	various	Profile-scoped overrides for any of the supported configuration keys.  
history.persistence	save-all | none	Control whether Codex saves session transcripts to history.jsonl.  
history.max_bytes	number	Reserved for future use; currently not enforced.  
file_opener	vscode | vscode-insiders | windsurf | cursor | none	URI scheme used to open citations from Codex output (default: `vscode`).  
otel.environment	string	Environment tag applied to emitted OpenTelemetry events (default: `dev`).  
otel.exporter	none | otlp-http | otlp-grpc	Select the OpenTelemetry exporter and provide any endpoint metadata.  
otel.log_user_prompt	boolean	Opt in to exporting raw user prompts with OpenTelemetry logs.  
tui	table	TUI-specific options such as enabling inline desktop notifications.  
tui.notifications	boolean | array<string>	Enable TUI notifications; optionally restrict to specific event types.  
hide_agent_reasoning	boolean	Suppress reasoning events in both the TUI and `codex exec` output.  
show_raw_agent_reasoning	boolean	Surface raw reasoning content when the active model emits it.  
chatgpt_base_url	string	Override the base URL used during the ChatGPT login flow.  
experimental_instructions_file	string (path)	Experimental replacement for built-in instructions instead of `AGENTS.md`.  
experimental_use_exec_command_tool	boolean	Opt in to the experimental exec command tool integration.  
projects.<path>.trust_level	string	Mark a project or worktree as trusted (only `"trusted"` is recognized).  
tools.web_search	boolean	Enable the built-in web search tool (alias: `web_search_request`).  
tools.view_image	boolean	Allow Codex to attach local image files from the workspace to messages.  
forced_login_method	chatgpt | api	Restrict Codex to a specific authentication method.  
forced_chatgpt_workspace_id	string (uuid)	Limit ChatGPT logins to a specific workspace identifier.  
