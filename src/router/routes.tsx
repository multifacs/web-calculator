import { HomePage, PageOne, PageTwo } from '../pages';
import Home from '@mui/icons-material/Home';
import LooksOne from '@mui/icons-material/LooksOne';
import LooksTwo from '@mui/icons-material/LooksTwo';

export const PAGES = [
    {
        title: 'Домашнаяя страница',
        route: 'web-calculator',
        component: HomePage,
        icon: Home,
    },
    {
        title: 'Калькулятор интегралов',
        route: 'web-calculator/page-one',
        component: PageOne,
        icon: LooksOne,
    },
    {
        title: 'Калькулятор ДУ',
        route: 'web-calculator/page-two',
        component: PageTwo,
        icon: LooksTwo,
    },
];
