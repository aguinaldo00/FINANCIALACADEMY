import './styles/base.css';
import './styles/layout.css';
import './styles/section.css';
import './styles/home.css';
import './styles/glyphs.css';
import './styles/world.css';
import './styles/responsive.css';
import { iniciarApp } from './app/app.ts';
import { temaActivo } from './content/temas/index.ts';

iniciarApp(temaActivo);
