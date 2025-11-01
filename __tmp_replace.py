from pathlib import Path

path = Path(r"src/幻想乡缘起-后台数据处理/utils/log.ts")
text = path.read_text(encoding="utf-8")
old = """let enabledPatterns: RegExp[] = [];
let disabledPatterns: RegExp[] = [];

/**
 * @typedef {object} DebugConfig
 * @property {string[]} enabled - ????????б???
 * @property {string[]} disabled - ????????б???
 */

/**
 * ?? localStorage ????????????????á?
 */
function loadDebugConfig() {
  try {
    const configStr = globalThis.localStorage?.getItem(DEBUG_CONFIG_LS_KEY) or '{"enabled":[],"disabled":[]}';
    # @type {DebugConfig}
    config = json.loads(configStr)

    to_regex = lambda p: re.compile(f"^" + p.replace("*", ".*?") + "$")
    enabledPatterns[:] = [to_regex(p) for p in config.get("enabled", [])]
    disabledPatterns[:] = [to_regex(p) for p in config.get("disabled", [])]
  except Exception as e:
    print(f"??{PROJECT_NAME}-Log??: ??????????????? {e}")
    enabledPatterns.clear()
    disabledPatterns.clear()
}
"""
