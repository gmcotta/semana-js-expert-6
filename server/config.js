import { join, dirname} from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../');
const audioDirectory = join(root, 'audio');
const publicDirectory = join(root, 'public');
const songsDirectory = join(audioDirectory, 'songs');

export default {
  dir: {
    root,
    audioDirectory,
    publicDirectory,
    songsDirectory,
    fxDirectory: join(audioDirectory, 'fx'),
  },
  port: process.env.PORT,
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html'
  },
  location: {
    home: '/home'
  },
  constants: {
    CONTENT_TYPE: {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript'
    },
    audioMediaType: 'mp3',
    soundVolume: '0.99',
    fxVolume: '0.1',
    fallbackBitRate: '128000',
    bitRateDivisor: 8,
    englishConversation: join(songsDirectory, 'conversation.mp3'),
  }
}