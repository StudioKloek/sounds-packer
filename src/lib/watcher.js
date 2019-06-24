import path from 'path';
import { pack } from './packer';
import { sane } from 'sane';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import { debounce } from 'throttle-debounce';

export async function watch(directories, settings) {
  for (const directory of directories) {
    await watchDirectory(directory, settings);
  }
}

async function watchDirectory(directory, settings) {
  return new Promise((_resolver) => {

    let itemPath, itemOptions = {};

    if (Array.isArray(directory)) {
      itemPath = directory[0];
      itemOptions = directory[1];
    } else {
      itemPath = directory;
    }

    if ((settings.watch !== true && itemOptions.watch !== true) || itemOptions.watch === false) {
      _resolver();
      return;
    }

    const delayedCallback = debounce(settings.watchDelay, () => {
      pack(directory, settings);
    });
    const watcher = sane(`${path.join(settings.sourceDirectory, itemPath)}`, {
      glob: ['**/*.png', '**/*.jpg']
    });

    watcher.on('ready', () => {
      console.log(logSymbols.info, chalk.blue(`Started watching ${itemPath} with a delay of ${settings.watchDelay / 1000}s`));
      _resolver()
    });
    watcher.on('change', delayedCallback);
    watcher.on('add', delayedCallback);
    watcher.on('delete', delayedCallback);
  });
}
