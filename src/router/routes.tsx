import { HomePage, PageOne, PageTwo } from '../pages';
import Home from '@mui/icons-material/Home';
import LooksOne from '@mui/icons-material/LooksOne';
import LooksTwo from '@mui/icons-material/LooksTwo';

export const PAGES = [
    {
        title: 'Домашнаяя страница',
        route: '',
        component: HomePage,
        icon: Home,
    },
    {
        title: 'Калькулятор интегралов',
        route: 'page-one',
        component: PageOne,
        icon: LooksOne,
    },
    {
        title: 'Калькулятор СЛАУ',
        route: 'page-two',
        component: PageTwo,
        icon: LooksTwo,
    },
];
