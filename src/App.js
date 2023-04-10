import Plot from 'react-plotly.js';
import './App.css';
import { pow } from 'mathjs';
import { useState } from 'react';

function riemannSum(f, a, b, n, method) {
  const vals = []
  let dx = (b - a) / n;
  console.log("a b n dx", a, b, n, dx, (b - a) / n)
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

const roundTo = (num, n) => {
  return Math.round(num * pow(10, n)) / pow(10, n)
}

function App() {
  // Display the graph

  const [funcBody, setFuncBody] = useState('Math.pow(x, 2)')
  const [paramA, setParamA] = useState(0)
  const [paramB, setParamB] = useState(5)
  const [paramN, setParamN] = useState(5)
  const [data, setData] = useState([])
  const [sum, setSum] = useState(0)

  const handleChangeA = (e) => {
    setParamA(parseInt(e.target.value))
  }

  const handleChangeB = (e) => {
    setParamB(parseInt(e.target.value))
  }

  const handleChangeN = (e) => {
    setParamN(parseInt(e.target.value))
  }

  const handleChangeFuncBody = (e) => {
    setFuncBody(e.target.value)
  }

  const updateGraph = () => {
    let canProceedFlag = true
    // Define the function to integrate
    const f = x => {
      try {
        const result = eval(funcBody)
        canProceedFlag = true
        return result
      } catch (e) {
        canProceedFlag = false
        console.log(e, canProceedFlag)
      }
    };

    let vals = []

    const updateArea = () => {
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
      const xSlice = x[1];

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
          y: y.slice(1,-1),
          mode: 'lines',
          name: 'f(x)',
          line: {
            color: 'red'
          },
        }
      )

      vals.forEach(x => {
        data.push({
          x: [x.a, x.b, x.b, x.a],
          y: [0, 0, x.val, x.val],
          fill: 'toself',
          fillcolor: 'rgba(0, 255, 0, 0.5)',
          name: `Area`
        })
      })

      setData(JSON.parse(JSON.stringify(data)))
      console.log(data)
    }
  }

  return (
    <div className='container'>
      <h1>Считаем интеграл суммой Римана</h1>
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
    </div>
  );
}

export default App;
