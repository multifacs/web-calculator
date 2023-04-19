/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useCallback, useState } from 'react';
import { AppBar, IconButton, Toolbar, Typography, Box, useTheme, useMediaQuery, Button } from '@mui/material';
// import { EmptyState } from '@brightlayer-ui/react-components';
import Menu from '@mui/icons-material/Menu';
// import Event from '@mui/icons-material/Event';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDrawer } from '../contexts/drawerContextProvider';

type Equation = {
    s: number,
    p: number,
    q: number
}

const defaultValues: Equation = {
    s: 1,
    p: 1,
    q: 1,
};

const validationSchema = Yup.object().shape({
    s: Yup.number().required('Second order param is required'),
    p: Yup.number().required('p is required'),
    q: Yup.number().required('q is required'),
});

type RootsType = {
    root1: {
        wholePart: number,
        imaginaryPart?: number
    }, root2: {
        wholePart: number,
        imaginaryPart?: number
    }, negativeSum: boolean
}

const getRoots = (a: number, b: number, c: number): RootsType => {
    const d = b * b - 4 * a * c;
    const negativeSum = d < 0;
    const D = Math.sqrt(Math.abs(d));
    let root1;
    let root2;
    if (negativeSum) {
        const dDiv2A = D / (2 * a);
        root1 = {
            wholePart: -b / 2 * a,
            imaginaryPart: dDiv2A
        }
        root2 = {
            wholePart: -b / 2 * a,
            imaginaryPart: dDiv2A
        }
    } else {
        root1 = {
            wholePart: (-b + D) / (2 * a)
        }
        root2 = {
            wholePart: (-b - D) / (2 * a)
        }
    }
    return { root1, root2, negativeSum }
}

const getSolution = (root1: any, root2: any, negativeSum: boolean): string => {
    if (negativeSum) {
        return `y0 = C1${root1.wholePart ? ` * e^${root1.wholePart}x` : ""} * cos(${root1.imaginaryPart}x) + C2${root2.wholePart ? `* e^${root2.wholePart}x` : ""} * sin(${root2.imaginaryPart}x)`
    } 
        return `y0 = C1${root1.wholePart ? ` * e` + `^${ 
            root1.wholePart  }x` : ""} + C2${root2.wholePart ? ` * e` + `^${
                 root2.wholePart  }x` : ""}`
}

export const PageTwo = (): JSX.Element => {
    const theme = useTheme();
    const { setDrawerOpen } = useDrawer();
    const md = useMediaQuery(theme.breakpoints.up('md'));

    const { handleSubmit, reset, control, setValue } = useForm<Equation>({
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    const [resultString, setResultString] = useState("")

    const onSubmit = ({s, p, q}: Equation): void => {
        // eslint-disable-next-line no-console
        const roots = getRoots(s, p, q)
        setResultString(getSolution(roots.root1, roots.root2, roots.negativeSum))
    };

    const onSChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => setValue('s', parseInt(evt.target.value)), []);
    const onPChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => setValue('p', parseInt(evt.target.value)), []);
    const onQChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => setValue('q', parseInt(evt.target.value)), []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                            <Menu />
                        </IconButton>
                    )}
                    <Typography variant={'h6'} color={'inherit'}>
                        Дифференциальные уравнения
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <div className="form-group">
                            <Controller
                                control={control}
                                name="s"
                                render={({ field, fieldState: { error } }): any => (
                                    <div>
                                        <input
                                            value={field.value}
                                            onChange={onSChange}
                                            type="text"
                                            className={`form-control ${error?.message ? 'is-invalid' : ''}`}
                                        />
                                        <div className="invalid-feedback">{error?.message}</div>
                                    </div>
                                )}
                            />
                        </div>
                        <p>y&quot; + </p>
                        <div className="form-group">
                            <Controller
                                control={control}
                                name="p"
                                render={({ field, fieldState: { error } }): any => (
                                    <div>
                                        <input
                                            value={field.value}
                                            onChange={onPChange}
                                            type="text"
                                            className={`form-control ${error?.message ? 'is-invalid' : ''}`}
                                        />
                                        <div className="invalid-feedback">{error?.message}</div>
                                    </div>
                                )}
                            />
                        </div>
                        <p> y&apos;+ </p>
                        <div className="form-group">
                            <Controller
                                control={control}
                                name="q"
                                render={({ field, fieldState: { error } }): any => (
                                    <div>
                                        <input
                                            value={field.value}
                                            onChange={onQChange}
                                            type="text"
                                            className={`form-control ${error?.message ? 'is-invalid' : ''}`}
                                        />
                                        <div className="invalid-feedback">{error?.message}</div>
                                    </div>
                                )}
                            />
                        </div>
                        <p> = 0</p>
                    </Box>
                    <h1>{resultString}</h1>
                    <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button type="reset" onClick={(): void => reset()}>
                            Сброс
                        </Button>
                        <Button type="submit">
                            Решить
                        </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};
