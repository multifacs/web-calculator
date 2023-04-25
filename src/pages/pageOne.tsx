/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { AppBar, IconButton, Toolbar, Typography, Box, useTheme, useMediaQuery, TextField, Button, Select, MenuItem, InputLabel, FormControl, Slider, InputAdornment, Grid } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
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
    f: string,
    method: string,
    roundTo: number,
}

const defaultValues: IntegralParams = {
    a: "1",
    b: "10",
    n: "10",
    f: "Math.pow(x, 2)",
    method: "mid",
    roundTo: 3,
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
    method: Yup
        .string()
        .matches(/(mid|left|right|trapez)/)
        .required('Неправильный формат')
        .typeError('Неправильный формат'),
    roundTo: Yup
        .number()
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

const calculateIntegral = (f: any, a: number, b: number, n: number, method: string): RiemannResult | any => {
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
        } else if (method === 'trapez') {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            sum += (f(x) + f(x + dx)) / 2 * dx;
            vals.push({
                a: x,
                b: x + dx,
                valA: f(x),
                valB: f(x + dx)
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

const calculateReference = (f: any, a: number, b: number, n: number): number => {
    const dx = (b - a) / n;
    let sum = 0;
    let x;
    for (let i = 0; i < n; i++) {
        x = a + i * dx;
        sum += f(x + dx / 2) * dx;
    }
    return sum;
}

const roundTo = (num: number, n: number): number => Math.round(num * Math.pow(10, n)) / Math.pow(10, n)

const REF_MAX_N = 1000000

export const PageOne = (): JSX.Element => {
    const theme = useTheme();
    const { setDrawerOpen } = useDrawer();
    const md = useMediaQuery(theme.breakpoints.up('md'));

    const [data, setData] = useState<any[]>([])
    const [sum, setSum] = useState<number>(0)
    const [reference, setReference] = useState<number>(0)

    const { handleSubmit, reset, control, setValue, getValues } = useForm<IntegralParams>({
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    // eslint-disable-next-line no-console
    console.log(getValues().roundTo)

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
    const onMethodChange = useCallback((evt: SelectChangeEvent) => {
        setValue('method', evt.target.value)
    }, []);
    const onRoundToChange = useCallback((evt: Event, value: number | number[]) => {
        if (typeof value === 'number') {
            setValue('roundTo', value)
        }
    }, []);

    const onReset = (): void => {
        reset()
        while (data.length > 0) {
            data.pop();
        }
        setData(JSON.parse(JSON.stringify(data)))
        setSum(0)
        setReference(0)
    }

    const updateGraph = (funcBody: string, method: string, a: number, b: number, n: number): void => {
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
            val?: number | any,
            valA?: number,
            valB?: number,
        }> = []



        const updateArea = (): void => {
            const result = calculateIntegral(f, a, b, n, method);
            setSum(result.sum)
            vals = result.vals

            const ref = calculateReference(f, a, b, REF_MAX_N)
            setReference(ref)
        }

        updateArea()

        if (canProceedFlag) {
            const offset = (b - a) / n
            const beforeA = a - offset
            const afterB = b + offset
            const x = [];
            const y = [];
            for (let i = beforeA; i <= afterB + (0.000000001); i += offset) {
                let calcX = i
                let calcY = f(i)
                if (Number.isNaN(calcY)) {
                    calcX = 0
                    calcY = 0
                }
                x.push(calcX);
                y.push(calcY);
            }

            // eslint-disable-next-line no-console
            console.log(a, b, n, beforeA, afterB, offset)
            // eslint-disable-next-line no-console
            console.log(x)
            // eslint-disable-next-line no-console
            console.log(y)

            while (data.length > 0) {
                data.pop();
            }

            data.push(
                {
                    x: x,
                    y: y,
                    mode: 'lines',
                    name: 'f(x)',
                    line: {
                        color: 'blue',
                        shape: 'spline',
                        dash: 'dot',
                    },
                },
                {
                    x: x.slice(1, -1),
                    y: y.slice(1, -1),
                    mode: 'lines',
                    name: 'a-b interval',
                    line: {
                        color: 'red',
                        shape: 'spline',
                    },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(0, 100, 255, 0.2)',
                }
            )

            if (method !== "trapez") {
                vals.forEach((val, idx) => {
                    data.push({
                        x: [val.a, val.b, val.b, val.a, val.a],
                        y: [0, 0, val.val, val.val, 0],
                        fill: 'toself',
                        fillcolor: 'rgba(100, 255, 0, 0.8)',
                        name: `Rect #${idx}`,
                        mode: 'lines',
                    })
                })
            } else {
                vals.forEach((val, idx) => {
                    data.push({
                        x: [val.a, val.b, val.b, val.a, val.a],
                        y: [0, 0, val.valB, val.valA, 0],
                        fill: 'toself',
                        fillcolor: 'rgba(100, 255, 0, 0.8)',
                        name: `Rect #${idx}`,
                        mode: 'lines',
                    })
                })
            }

            setData(JSON.parse(JSON.stringify(data)))
        }
    }

    const onSubmit = ({ a, b, n, f, method }: IntegralParams): void => {
        const params = {
            a: parseInt(a),
            b: parseInt(b),
            n: parseInt(n),
            f,
            method,
        }
        updateGraph(
            params.f,
            params.method,
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
                            <h3>Приближенное вычисление определенных интегралов</h3>
                        </Box>
                        <Grid container spacing={1} sx={{ width: '40%' }}>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="f"
                                    render={({ field, fieldState: { error } }): any => (
                                        <FormControl sx={{ width: "100%" }}>
                                            <TextField id="outlined-basic"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">f(x) = </InputAdornment>,
                                                    sx: { width: "100% " }
                                                }}
                                                variant="outlined"
                                                onChange={onFChange}
                                                value={field.value}
                                                type="text"
                                                error={error?.message ? true : false}
                                                helperText={error?.message}
                                            />
                                        </FormControl>
                                    )}
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="method"
                                    render={({ field, fieldState: { error } }): any => (
                                        <FormControl sx={{ width: "100%" }}>
                                            <InputLabel id="demo-simple-select-standard-label">Метод</InputLabel>
                                            <Select
                                                value={field.value}
                                                labelId="demo-simple-select-standard-label"
                                                label="Метод"
                                                onChange={onMethodChange}
                                                error={error?.message ? true : false}
                                                variant="outlined"
                                            >
                                                <MenuItem value={"mid"}>Средних прямоугольников</MenuItem>
                                                <MenuItem value={"left"}>Левых прямоугольников</MenuItem>
                                                <MenuItem value={"right"}>Правых прямоугольников</MenuItem>
                                                <MenuItem value={"trapez"}>Трапеций</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="a"
                                    render={({ field, fieldState: { error } }): any => (
                                        <FormControl sx={{ width: "100%" }}>
                                            <TextField id="outlined-basic"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">a = </InputAdornment>,
                                                }}
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
                                        </FormControl>

                                    )}
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="b"
                                    render={({ field, fieldState: { error } }): any => (
                                        <FormControl sx={{ width: "100%" }}>
                                            <TextField id="outlined-basic"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">b = </InputAdornment>,
                                                    sx: { maxWidth: '300px' }
                                                }}
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
                                        </FormControl>

                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="n"
                                    render={({ field, fieldState: { error } }): any => (
                                        <FormControl sx={{ width: "100%" }}>
                                            <TextField id="outlined-basic"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">n = </InputAdornment>,
                                                    sx: { maxWidth: '300px' }
                                                }}
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
                                        </FormControl>

                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="roundTo"
                                    render={({ field }): any => (
                                        <FormControl sx={{ width: "80%", margin: "0 auto", display: "flex", justifyContent: "center" }}>
                                            <Typography gutterBottom>Знаков после запятой:</Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "20px", width: "100%" }}>
                                                <Slider
                                                    aria-label="Temperature"
                                                    valueLabelDisplay="off"
                                                    step={1}
                                                    marks
                                                    min={1}
                                                    max={10}
                                                    value={field.value}
                                                    onChange={onRoundToChange}
                                                />
                                                <span>
                                                    {getValues().roundTo}
                                                </span>
                                            </Box>
                                        </FormControl>

                                    )}
                                />

                            </Grid>
                        </Grid>
                        <p>Результат <Latex>{`$$ = ${roundTo(sum, getValues().roundTo)}$$`}</Latex>, контроль <Latex>{`$$ = ${roundTo(reference, getValues().roundTo)}$$`}</Latex>, ошибка <Latex>{`$$ = ${roundTo(sum - reference, getValues().roundTo)}$$`}</Latex></p>
                        <Plot
                            data={data}
                            layout={{ width: 800, height: 400 }}
                        />
                        <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: "10px" }}>
                            <Button type="submit" variant='contained'>
                                Решить
                            </Button>
                            <Button type="reset" onClick={(): void => onReset()} variant='outlined'>
                                Сброс
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};
