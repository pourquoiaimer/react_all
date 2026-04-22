import React, { useState } from 'react';
import '../assets/scss/Calculator.scss';

const Calculator = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handleButtonClick = (value) => {
        if (value === '=') {
            try {
                let expression = input;
                if (expression.includes('%')) {
                    const parts = expression.split(/([+\-*\/])/);
                    const lastPart = parts[parts.length - 1];
                    if (lastPart.includes('%')) {
                        const number = parseFloat(lastPart.replace('%', ''));
                        if (!isNaN(number)) {
                            const prevNumber = eval(parts.slice(0, -2).join(''));
                            const operator = parts[parts.length - 2];
                            if (operator === '+' || operator === '-') {
                                expression = `${prevNumber} ${operator} ${prevNumber * (number / 100)}`;
                            } else if (operator === '*') {
                                expression = `${prevNumber} * (${number / 100})`;
                            }
                        }
                    }
                }
                // eslint-disable-next-line no-eval
                setResult(eval(expression));
            } catch (error) {
                setResult('Error');
            }
        } else if (value === 'C') {
            setInput('');
            setResult('');
        } else if (value === 'CE') {
            setInput(input.slice(0, -1));
        } else if (value === '%') {
            if (input === '') {
                setInput('0%');
            } else {
                setInput(input + '%');
            }
        } else {
            setInput(input + value);
        }
    };

    return (
        <div className="calculator">
            <div className="display">
                <div className="input">{input}</div>
                <div className="result">{result}</div>
            </div>
            <div className="buttons">
                <button onClick={() => handleButtonClick('C')}>C</button>
                <button onClick={() => handleButtonClick('CE')}>CE</button>
                <button onClick={() => handleButtonClick('%')}>%</button>
                <button onClick={() => handleButtonClick('/')}>/</button>
                <button onClick={() => handleButtonClick('7')}>7</button>
                <button onClick={() => handleButtonClick('8')}>8</button>
                <button onClick={() => handleButtonClick('9')}>9</button>
                <button onClick={() => handleButtonClick('*')}>*</button>
                <button onClick={() => handleButtonClick('4')}>4</button>
                <button onClick={() => handleButtonClick('5')}>5</button>
                <button onClick={() => handleButtonClick('6')}>6</button>
                <button onClick={() => handleButtonClick('-')}>-</button>
                <button onClick={() => handleButtonClick('1')}>1</button>
                <button onClick={() => handleButtonClick('2')}>2</button>
                <button onClick={() => handleButtonClick('3')}>3</button>
                <button onClick={() => handleButtonClick('+')}>+</button>
                <button onClick={() => handleButtonClick('0')}>0</button>
                <button onClick={() => handleButtonClick('.')}>.</button>
                <button onClick={() => handleButtonClick('(')}>(</button>
                <button onClick={() => handleButtonClick(')')}>)</button>
                <button onClick={() => handleButtonClick('=')}>=</button>
            </div>
        </div>
    );
};

export default Calculator;
