import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import { getColor } from './utils';

const Token = ({ token, setCurrentStep, index }) => {
    const hasStrongAlternatives = token.alternatives.some(alt => alt.probability > token.probability * 0.8);

    const tooltipContent = (
        <div className="token-tooltip">
            <div><strong>Token:</strong> {token.token}</div>
            <div><strong>Probability:</strong> {(token.probability * 100).toFixed(1)}%</div>
            {token.alternatives.length > 0 && (
                <div className="alternatives">
                    <strong>Alternatives:</strong>
                    {token.alternatives.map((alt, i) => (
                        <div key={i} style={{
                            color: alt.probability > token.probability * 0.8 ? '#ff6b6b' : 'inherit'
                        }}>
                            {alt.token}: {(alt.probability * 100).toFixed(1)}%
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Tippy content={tooltipContent} placement="top">
            <span
                className={`token ${hasStrongAlternatives ? 'has-alternatives' : ''}`}
                style={{
                    backgroundColor: getColor(token.probability),
                    borderBottom: hasStrongAlternatives ? '2px dashed #ff6b6b' : 'none',
                    padding: '2px 0',
                    margin: '0 1px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    display: 'inline-block'
                }}
                onClick={() => setCurrentStep && setCurrentStep(index)}
            >
                {token.token.replace('Ġ', ' ')}
                {hasStrongAlternatives &&
                    <span style={{
                        fontSize: '0.7em',
                        verticalAlign: 'super',
                        color: '#ff6b6b',
                        marginLeft: '2px'
                    }}>*</span>
                }
            </span>
        </Tippy>
    );
};

export default Token;
