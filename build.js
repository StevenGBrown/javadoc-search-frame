import esMain from 'es-main';
import fs from 'node:fs';
import path from 'node:path';
import zipLib from 'zip-lib';

const textFileExtensions = ['.js', '.json', '.html'];
const binaryFileExtensions = ['.png'];

/**
 * Package the sources into a user script and a Google Chrome extension.
 */
async function main() {
  fs.rmSync('dist', { recursive: true, force: true });

  const distFileName = `javadoc_search_frame_${version().replaceAll('.', '_')}`;

  // Greasemonkey user script
  copyFile(
    'src/greasemonkey/javadoc_search_frame.js',
    `dist/greasemonkey/${distFileName}.user.js`,
    {
      append: [
        'src/common/_locales/en/messages.json',
        'src/greasemonkey/lib/Messages.js',
        'src/greasemonkey/lib/Storage.js',
        'src/common/lib/Option.js',
        'src/common/lib/Frames.js',
        'src/greasemonkey/lib/OptionsPage.js',
        'src/common/lib/HttpRequest.js',
        'src/common/lib/OptionsPageGenerator.js',
        'src/common/lib/common.js',
      ],
    }
  );
  console.log(`Built dist/greasemonkey/${distFileName}.user.js`);

  // Google Chrome extension
  copyDir('src/googlechrome', 'dist/googlechrome');
  copyDir('src/common', 'dist/googlechrome');
  zipLib.archiveFolder(
    'dist/googlechrome',
    `dist/googlechrome/${distFileName}.zip`
  );
  console.log(`Built dist/googlechrome/${distFileName}.zip`);
}

/**
 * Get the version from package.json.
 */
function version() {
  if (
    !Object.keys(process.env).some((name) => name.startsWith('npm_package_'))
  ) {
    // Must run this script via npm which provides the npm_package_*
    // environment variables.
    throw new Error('Usage: npm run build');
  }
  const version = process.env['npm_package_version'];
  if (!version) {
    throw new Error('Version not found in package.json');
  }
  return version;
}

/**
 * Copy a single file, replacing #VERSION# placeholders in text files and
 * optionally appending other files to the copy.
 *
 * @param {string} from
 * @param {string} to
 * @param {{append?: string[]}} [options]
 */
function copyFile(from, to, options) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const extension = path.extname(from);

  if (binaryFileExtensions.includes(extension)) {
    if (options?.append?.length) {
      throw new Error('Cannot append to binary file: ' + from);
    }
    fs.copyFileSync(from, to);
    return;
  }

  if (textFileExtensions.includes(extension)) {
    let fileContents =
      fs.readFileSync(from, { encoding: 'utf-8' }).trim() + '\n';

    // Append files to the end.
    for (const appendPath of options?.append || []) {
      fileContents +=
        '\n\n' +
        fs.readFileSync(appendPath, { encoding: 'utf-8' }).trim() +
        '\n';
    }

    // Replace #VERSION# placeholders.
    fileContents = fileContents.replaceAll('#VERSION#', version());

    fs.writeFileSync(to, fileContents);
    return;
  }

  throw new Error(`Unrecognized file extension: ${from}`);
}

/**
 * Copy a directory, replacing #VERSION# placeholders in text files.
 *
 * @param {string} from
 * @param {string} to
 */
function copyDir(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to);
  }
  const dirEntries = fs.readdirSync(from).map((entry) => ({
    from: path.join(from, entry),
    to: path.join(to, entry),
  }));
  for (const entry of dirEntries) {
    if (fs.lstatSync(entry.from).isFile()) {
      copyFile(entry.from, entry.to);
    } else {
      copyDir(entry.from, entry.to);
    }
  }
}

// @ts-ignore
if (esMain(import.meta)) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
