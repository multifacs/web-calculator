import React, { useState } from 'react';
import Plot from 'react-plotly.js';
// import { pow } from 'mathjs';
import { AppBar, IconButton, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
// import { EmptyState } from '@brightlayer-ui/react-components';
import Menu from '@mui/icons-material/Menu';
// import Event from '@mui/icons-material/Event';
import { useDrawer } from '../contexts/drawerContextProvider';

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

    const [funcBody, setFuncBody] = useState('Math.pow(x, 2)')
    const [paramA, setParamA] = useState(0)
    const [paramB, setParamB] = useState(5)
    const [paramN, setParamN] = useState(5)
    const [data, setData] = useState<any[]>([])
    const [sum, setSum] = useState(0)

    const handleChangeA = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setParamA(parseInt(e.target.value))
    }

    const handleChangeB = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setParamB(parseInt(e.target.value))
    }

    const handleChangeN = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setParamN(parseInt(e.target.value))
    }

    const handleChangeFuncBody = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFuncBody(e.target.value)
    }

    const updateGraph = (): void => {
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
            const result = riemannSum(f, paramA, paramB, paramN, "mid");
            setSum(result.sum)
            vals = result.vals
        }

        updateArea()

        if (canProceedFlag) {
            const x = [];
            const y = [];
            for (let i = paramA - 1; i <= paramB + 1; i += (paramB - paramA) / paramN) {
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
                        Считаем интеграл суммой Римана
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: '1 1 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <input type='text' placeholder='func' value={funcBody} onChange={handleChangeFuncBody}></input>
                <h3>f(x) = {funcBody}</h3>
                <h3>Площадь = {roundTo(sum, 3)}</h3>
                <div className='inputs'>
                    <input type='text' placeholder='a' value={paramA} onChange={handleChangeA}></input>
                    <input type='text' placeholder='b' value={paramB} onChange={handleChangeB}></input>
                    <input type='text' placeholder='n' value={paramN} onChange={handleChangeN}></input>
                </div>
                <button onClick={updateGraph}>Посчитать</button>
                <Plot
                    data={data}
                    layout={{ width: 600, height: 400 }}
                />
            </Box>
        </Box>
    );
};
