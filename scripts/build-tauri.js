import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const runCmd = 'bun';

function run(cwd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(runCmd, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0)
        resolve();
      else reject(new Error(`${args.join(' ')} 失败，退出码 ${code}`));
    });
  });
}

/**
 * 从 package.json 同步版本号到 Cargo.toml
 */
async function syncVersionToCargo() {
  const pkgPath = path.join(rootDir, 'package.json');
  const cargoPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');

  const pkgJson = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  const version = pkgJson.version;

  let cargoContent = await fs.readFile(cargoPath, 'utf-8');
  cargoContent = cargoContent.replace(
    /^version\s*=\s*"[^"]*"/m,
    `version = "${version}"`,
  );

  await fs.writeFile(cargoPath, cargoContent, 'utf-8');
  console.log(`✓ 已同步版本号到 Cargo.toml: ${version}`);
}

async function linkScreenshotSource() {
  const screenshotPluginSrc = path.join(
    rootDir,
    'src-tauri',
    'plugins',
    'screenshot-suite',
    'web',
    'windows',
    'screenshot',
  );
  const mainProjectScreenshot = path.join(
    rootDir,
    'src',
    'windows',
    'screenshot',
  );

  if (!existsSync(screenshotPluginSrc)) {
    throw new Error(`未找到截图插件源码: ${screenshotPluginSrc}`);
  }

  if (existsSync(mainProjectScreenshot)) {
    await fs.rm(mainProjectScreenshot, { recursive: true, force: true });
  }

  await fs.cp(screenshotPluginSrc, mainProjectScreenshot, { recursive: true });
}

async function unlinkScreenshotSource() {
  const mainProjectScreenshot = path.join(
    rootDir,
    'src',
    'windows',
    'screenshot',
  );

  if (existsSync(mainProjectScreenshot)) {
    await fs.rm(mainProjectScreenshot, { recursive: true, force: true });
  }
}

async function main() {
  const isCommunity = process.env.QC_COMMUNITY === '1';
  const hasScreenshotPlugin
    = !isCommunity
      && existsSync(
        path.join(
          rootDir,
          'src-tauri',
          'plugins',
          'screenshot-suite',
          'web',
          'package.json',
        ),
      );

  try {
    // 同步版本号到 Cargo.toml
    // await syncVersionToCargo()

    if (hasScreenshotPlugin) {
      await linkScreenshotSource();
    }

    await run(rootDir, ['run', 'build']);
  }
  finally {
    if (hasScreenshotPlugin) {
      await unlinkScreenshotSource();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
