import React from 'react';
import {
    AppBar,
    Button,
    Divider,
    Grid,
    IconButton,
    Toolbar,
    Typography,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { BluiSVG } from '../components/Logo';
import { useDrawer } from '../contexts/drawerContextProvider';
import { styled } from '@mui/material/styles';

const BluiSVGStyled = styled(BluiSVG)({
    '@keyframes spin': {
        '100%': {
            transform: 'rotate(360deg)',
        },
    },
    animation: '2500ms spin linear infinite',
});

export const HomePage = (): JSX.Element => {
    const theme = useTheme();
    const { setDrawerOpen } = useDrawer();
    const sm = useMediaQuery(theme.breakpoints.down('sm'));
    const md = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                minHeight: '100vh',
                position: 'relative',
            }}
        >
            <AppBar position={'sticky'}>
                <Toolbar sx={{ px: 2 }}>
                    {md ? null : (
                        <IconButton
                            color={'inherit'}
                            onClick={(): void => {
                                setDrawerOpen(true);
                            }}
                            edge={'start'}
                            sx={{ mr: 3 }}
                            size="large"
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant={'h6'} color={'inherit'}>
                        Домашний экран
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    minHeight: `calc(100vh - ${theme.spacing(8)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    [theme.breakpoints.down('sm')]: {
                        minHeight: `calc(100vh - ${theme.spacing(7)})`,
                    },
                }}
            >
                <Box sx={{ maxWidth: 600, m: '0 auto' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <BluiSVGStyled size={sm ? 100 : 160} color={theme.palette.primary.main} />
                        <Typography variant={sm ? 'h4' : 'h2'} paragraph>
                            Добро пожаловать в{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: theme.palette.primary.main,
                                }}
                            >
                                Калькулятор
                            </Box>
                            .
                        </Typography>
                        <Typography variant={'body1'}>
                            Данная работа представляет из себя коллекцию <strong>калькуляторов</strong> для различных математических задач.
                        </Typography>
                    </Box>
                    {sm ? null : (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Button target={'_blank'} href={'https://brightlayer-ui.github.io/'}>
                                        Материалы 1
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        target={'_blank'}
                                        href={'https://brightlayer-ui.github.io/development/frameworks-web/react'}
                                    >
                                        Материалы 2
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};