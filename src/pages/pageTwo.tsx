/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useCallback, useState } from 'react';
import { AppBar, IconButton, Toolbar, Typography, Box, useTheme, useMediaQuery, Button, TextField } from '@mui/material';
import Menu from '@mui/icons-material/Menu';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDrawer } from '../contexts/drawerContextProvider';
import Latex from 'react-latex'

type Equation = {
    s: string,
    p: string,
    q: string
}

const defaultValues: Equation = {
    s: "1",
    p: "1",
    q: "1",
};

const validationSchema = Yup.object().shape({
    s: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    p: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    q: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
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

const roundTo = (x: number, n: number): number => Math.round(x * 10 ** n) / 10 ** n

const getRoots = (a: number, b: number, c: number): RootsType => {
    const n = 3;

    const d = b * b - 4 * a * c;
    const negativeSum = d < 0;
    const D = Math.sqrt(Math.abs(d));
    let root1;
    let root2;

    if (negativeSum) {
        const dDiv2A = D / (2 * a);
        root1 = {
            wholePart: roundTo(-b / 2 * a, n),
            imaginaryPart: roundTo(dDiv2A, n)
        }
        root2 = {
            wholePart: roundTo(-b / 2 * a, n),
            imaginaryPart: roundTo(dDiv2A, n)
        }
    } else {
        root1 = {
            wholePart: roundTo((-b + D) / (2 * a), n)
        }
        root2 = {
            wholePart: roundTo((-b - D) / (2 * a), n)
        }
    }
    return { root1, root2, negativeSum }
}

const getSolution = (root1: any, root2: any, negativeSum: boolean): string => {
    if (negativeSum) {
        return `$$y_0 = C_1${root1.wholePart ? ` \\cdot e^{${root1.wholePart}x` : ""}} \\cdot \\cos(${root1.imaginaryPart}x) + C_2${root2.wholePart ? `\\cdot e^{${root2.wholePart}x` : ""}} \\cdot \\sin(${root2.imaginaryPart}x)$$`
    }
    return `$$y_0 = C_1${root1.wholePart ? ` \\cdot e` + `^{${root1.wholePart}x` : ""}} + C_2${root2.wholePart ? ` \\cdot e` + `^{${root2.wholePart}}x$$` : ""}`
}

export const PageTwo = (): JSX.Element => {
    const theme = useTheme();
    const { setDrawerOpen } = useDrawer();
    const md = useMediaQuery(theme.breakpoints.up('md'));

    const { handleSubmit, reset, control, setValue } = useForm<Equation>({
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    const [resultString, setResultString] = useState(" ")

    const onSubmit = ({ s, p, q }: Equation): void => {
        const roots = getRoots(parseInt(s), parseInt(p), parseInt(q))
        setResultString(getSolution(roots.root1, roots.root2, roots.negativeSum))
    };

    const onSChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('s', evt.target.value)
    }, []);
    const onPChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('p', evt.target.value)
    }, []);
    const onQChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('q', evt.target.value)
    }, []);

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
                    <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
                        <Box sx={{ width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <h3 style={{ textAlign: 'justify' }}>
                                Линейное однородное дифференциальное уравнение второго порядка
                            </h3>
                            <Latex>$$y&apos;&apos; + py&apos; + qy = 0$$</Latex>
                            <p style={{ textAlign: 'justify' }}> где <Latex>$$p, q$$</Latex> — постоянные числа.
                            </p>
                        </Box>
                        <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <Controller
                                control={control}
                                name="s"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="Коэффициент второго порядка"
                                        variant="outlined"
                                        onChange={onSChange}
                                        value={field.value}
                                        type="text"
                                        error={error?.message ? true : false}
                                        helperText={error?.message}
                                        FormHelperTextProps={{
                                            sx: {
                                                position: "absolute",
                                                top: '60px'
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Latex>$$y&apos;&apos; +$$ </Latex>
                            <Controller
                                control={control}
                                name="p"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="Коэффициент первого порядка"
                                        variant="outlined"
                                        onChange={onPChange}
                                        value={field.value}
                                        type="text"
                                        error={error?.message ? true : false}
                                        helperText={error?.message}
                                        FormHelperTextProps={{
                                            sx: {
                                                position: "absolute",
                                                top: '60px'
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Latex> $$y&apos;+$$ </Latex>
                            <Controller
                                control={control}
                                name="q"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="Коэффициент y"
                                        variant="outlined"
                                        onChange={onQChange}
                                        value={field.value}
                                        type="text"
                                        error={error?.message ? true : false}
                                        helperText={error?.message}
                                        FormHelperTextProps={{
                                            sx: {
                                                position: "absolute",
                                                top: '60px'
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Latex>$$y = 0$$</Latex>
                        </Box>
                        <div className="result-latex">
                            <Latex>{resultString}</Latex>
                        </div>
                        <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button type="submit">
                                Решить
                            </Button>
                            <Button type="reset" onClick={(): void => reset()}>
                                Сброс
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};
