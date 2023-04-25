/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { AppBar, IconButton, Toolbar, Typography, Box, useTheme, useMediaQuery, TextField, Button } from '@mui/material';
import Menu from '@mui/icons-material/Menu';
import { useDrawer } from '../contexts/drawerContextProvider';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Latex from 'react-latex'

type IntegralParams = {
    a: string,
    b: string,
    n: string,
    f: string
}

const defaultValues: IntegralParams = {
    a: "1",
    b: "10",
    n: "10",
    f: "Math.pow(x, 2)",
};

const validationSchema = Yup.object().shape({
    a: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    b: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    n: Yup
        .number()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    f: Yup
        .string()
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
});

type RiemannResult = {
    sum: number,
    vals: Array<{
        a: number,
        b: number,
        val: number | any
    }>,
}

const riemannSum = (f: any, a: number, b: number, n: number, method: string): RiemannResult | any => {
    const vals = []
    const dx = (b - a) / n;
    let sum = 0;
    let x;
    for (let i = 0; i < n; i++) {
        x = a + i * dx;
        if (method === 'left') {
            sum += f(x) * dx;
            vals.push({
                a: x,
                b: x + dx,
                val: f(x)
            })
        } else if (method === 'right') {
            sum += f(x + dx) * dx;
            vals.push({
                a: x,
                b: x + dx,
                val: f(x + dx)
            })
        } else if (method === 'mid') {
            sum += f(x + dx / 2) * dx;
            vals.push({
                a: x,
                b: x + dx,
                val: f(x + dx / 2)
            })
        } else {
            return null; // invalid method
        }
    }
    return {
        sum,
        vals
    };
}

const roundTo = (num: number, n: number): number => Math.round(num * Math.pow(10, n)) / Math.pow(10, n)

export const PageOne = (): JSX.Element => {
    const theme = useTheme();
    const { setDrawerOpen } = useDrawer();
    const md = useMediaQuery(theme.breakpoints.up('md'));

    const [data, setData] = useState<any[]>([])
    const [sum, setSum] = useState<number>(0)

    const { handleSubmit, reset, control, setValue } = useForm<IntegralParams>({
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    const onAChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('a', evt.target.value)
    }, []);
    const onBChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('b', evt.target.value)
    }, []);
    const onNChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('n', evt.target.value)
    }, []);
    const onFChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setValue('f', evt.target.value)
    }, []);

    const onReset = (): void => {
        reset()
        while (data.length > 0) {
            data.pop();
        }
        setData(JSON.parse(JSON.stringify(data)))
        setSum(0)
    }

    const updateGraph = (funcBody: string, a: number, b: number, n: number): void => {
        let canProceedFlag = true
        // Define the function to integrate
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const f = (x: number): number => {
            try {
                // eslint-disable-next-line no-eval
                const result = eval(funcBody)
                canProceedFlag = true
                return result
            } catch (e) {
                canProceedFlag = false
            }
            return 0
        };

        let vals: Array<{
            a: number,
            b: number,
            val: number | any
        }> = []

        const updateArea = (): void => {
            const result = riemannSum(f, a, b, n, "mid");
            setSum(result.sum)
            vals = result.vals
        }

        updateArea()

        if (canProceedFlag) {
            const x = [];
            const y = [];
            for (let i = a - 1; i <= b + 1; i += (b - a) / n) {
                x.push(i);
                y.push(f(i));
            }

            while (data.length > 0) {
                data.pop();
            }

            data.push(
                {
                    x: x,
                    y: y,
                    mode: 'lines',
                    line: {
                        color: 'blue'
                    },
                },
                {
                    x: x.slice(1, -1),
                    y: y.slice(1, -1),
                    mode: 'lines',
                    name: 'f(x)',
                    line: {
                        color: 'red'
                    },
                }
            )

            vals.forEach((val) => {
                data.push({
                    x: [val.a, val.b, val.b, val.a],
                    y: [0, 0, val.val, val.val],
                    fill: 'toself',
                    fillcolor: 'rgba(0, 255, 0, 0.5)',
                    name: `Area`
                })
            })

            setData(JSON.parse(JSON.stringify(data)))
        }
    }

    const onSubmit = ({ a, b, n, f }: IntegralParams): void => {
        const params = {
            a: parseInt(a),
            b: parseInt(b),
            n: parseInt(n),
            f,
        }
        updateGraph(
            params.f,
            params.a,
            params.b,
            params.n,
        )
    };

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
                        Интегралы
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '5px' }}>
                        <Box sx={{ width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <h3>Считаем интеграл суммой Римана</h3>
                            <p style={{ textAlign: 'justify' }}>
                                Введите функцию в синтаксисе JavaScript и параметры интегрирования:
                            </p>
                            <Controller
                                control={control}
                                name="f"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="f(x)"
                                        variant="outlined"
                                        onChange={onFChange}
                                        value={field.value}
                                        type="text"
                                        error={error?.message ? true : false}
                                        helperText={error?.message}
                                    />
                                )}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <Controller
                                control={control}
                                name="a"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="a"
                                        variant="outlined"
                                        onChange={onAChange}
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
                            <Controller
                                control={control}
                                name="b"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="b"
                                        variant="outlined"
                                        onChange={onBChange}
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
                            <Controller
                                control={control}
                                name="n"
                                render={({ field, fieldState: { error } }): any => (
                                    <TextField id="outlined-basic"
                                        label="n"
                                        variant="outlined"
                                        onChange={onNChange}
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
                        </Box>
                        <p>Площадь <Latex>{`$$ = ${roundTo(sum, 3)}$$`}</Latex></p>
                        <Plot
                            data={data}
                            layout={{ width: 600, height: 400 }}
                        />
                        <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button type="submit">
                                Решить
                            </Button>
                            <Button type="reset" onClick={(): void => onReset()}>
                                Сброс
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};
