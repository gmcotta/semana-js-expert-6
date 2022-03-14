import { join, dirname} from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../');
const audioDirectory = join(root, 'audio');
const publicDirectory = join(root, 'public');

export default {
  dir: {
    root,
    audioDirectory,
    publicDirectory,
    songsDirectory: join(audioDirectory, 'songs'),
    fxDirectory: join(audioDirectory, 'fx'),
  },
  port: process.env.PORT || 3000,
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html'
  },
  location: {
    home: '/home'
  }
}